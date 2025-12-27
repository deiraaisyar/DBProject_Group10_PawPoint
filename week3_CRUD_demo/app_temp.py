from flask import Flask, request, jsonify
from flask_jwt_extended import (
    JWTManager, create_access_token,
    jwt_required, get_jwt, verify_jwt_in_request
)
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from db import get_connection
import os
from dotenv import load_dotenv
from functools import wraps

load_dotenv()

app = Flask(__name__)
CORS(app)

# =========================
# JWT CONFIG
# =========================
app.config["JWT_SECRET_KEY"] = os.environ.get(
    "JWT_SECRET_KEY", "fallback-secret-key"
)
jwt = JWTManager(app)

# =========================
# ROLE DECORATOR
# =========================
def role_required(*roles):
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()

            if claims.get("role") not in roles:
                return jsonify({"message": "Forbidden"}), 403

            return fn(*args, **kwargs)
        return decorator
    return wrapper


# =========================
# AUTH & USER
# =========================
@app.post("/register")
def register():
    data = request.json
    hashed_pw = generate_password_hash(data["password"])
    role_name = data.get("role", "pet_owner")

    # normalize common role aliases to DB enum values
    role_map = {
        "owner": "pet_owner",
        "pet_owner": "pet_owner",
        "vet": "veterinarian",
        "veterinarian": "veterinarian",
        "admin": "admin"
    }
    role_name = role_map.get(role_name, role_name)

    conn = get_connection()
    with conn:
        with conn.cursor() as cur:
            # insert user (let DB set created_at via DEFAULT CURRENT_TIMESTAMP)
            cur.execute("""
                INSERT INTO user
                (first_name,last_name,email,password_hash,phone_no)
                VALUES (%s,%s,%s,%s,%s)
            """, (
                data["first_name"],
                data["last_name"],
                data["email"],
                hashed_pw,
                data.get("phone_no")
            ))
            user_id = cur.lastrowid

            # get role_id
            cur.execute(
                "SELECT role_id FROM role WHERE role=%s",
                (role_name,)
            )
            role = cur.fetchone()

            if not role:
                return jsonify({"message": f"Invalid role: {role_name}"}), 400

            # link user_role
            cur.execute("""
                INSERT INTO user_role (user_id, role_id)
                VALUES (%s,%s)
            """, (user_id, role["role_id"]))

            # If registering as veterinarian, handle license_no validation
            if role_name == "veterinarian":
                license_no = data.get("license_no")
                if not license_no:
                    return jsonify({"message": "License number is required for veterinarians"}), 400
                
                # Check if license exists and is not already used
                cur.execute("""
                    SELECT veterinarian_id, user_id 
                    FROM veterinarian 
                    WHERE license_no = %s
                """, (license_no,))
                existing_vet = cur.fetchone()
                
                if not existing_vet:
                    # License doesn't exist in system
                    return jsonify({"message": "Invalid license number. Please contact admin."}), 400
                
                if existing_vet["user_id"] is not None:
                    # License already associated with another user
                    return jsonify({"message": "This license is already registered to another user."}), 400
                
                # Update veterinarian record with new user_id
                cur.execute("""
                    UPDATE veterinarian 
                    SET user_id = %s 
                    WHERE license_no = %s
                """, (user_id, license_no))

            conn.commit()

    return jsonify({"message": "User registered successfully"}), 201


@app.post("/login")
def login():
    try:
        data = request.json
        
        if not data.get("email") or not data.get("password"):
            return jsonify({"message": "Email and password required"}), 400

        conn = get_connection()
        with conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT u.user_id, u.password_hash, r.role, u.first_name, u.last_name
                    FROM user u
                    JOIN user_role ur ON u.user_id = ur.user_id
                    JOIN role r ON ur.role_id = r.role_id
                    WHERE u.email=%s
                    LIMIT 1
                """, (data["email"],))
                user = cur.fetchone()

        if not user:
            return jsonify({"message": "User not found"}), 401
        
        if not check_password_hash(user["password_hash"], data["password"]):
            return jsonify({"message": "Invalid password"}), 401

        # JWT subject ('sub') must be a string for jwt library; cast id to str
        token = create_access_token(
            identity=str(user["user_id"]),
            additional_claims={"role": user["role"]}
        )

        return jsonify({
            "access_token": token,
            "role": user["role"],
            "user_id": user["user_id"],
            "first_name": user["first_name"],
            "last_name": user["last_name"]
        }), 200
    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({"message": f"Server error: {str(e)}"}), 500


@app.get("/profile")
@jwt_required()
def profile():
    return jsonify(get_jwt())


# =========================
# PET (OWNER / ADMIN)
# =========================
@app.post("/pets")
@role_required("pet_owner", "admin")
def create_pet():
    data = request.json
    claims = get_jwt()
    user_id = claims.get("sub")  # JWT identity is stored in 'sub'

    conn = get_connection()
    with conn:
        with conn.cursor() as cur:
            # Insert pet
            cur.execute("""
                INSERT INTO pet
                (name,species,breed,gender,birth_date,age)
                VALUES (%s,%s,%s,%s,%s,%s)
            """, (
                data["name"],
                data["species"],
                data["breed"],
                data["gender"],
                data["birth_date"],
                data["age"]
            ))
            pet_id = cur.lastrowid

            # Auto-create pet_owner record linking user to pet
            cur.execute("""
                INSERT INTO pet_owner (address, user_id, pet_id)
                VALUES (%s, %s, %s)
            """, (data.get("address", ""), user_id, pet_id))
            
            conn.commit()

    return jsonify({"message": "Pet created", "pet_id": pet_id}), 201


@app.get("/pets")
@role_required("pet_owner", "admin")
def get_pets():
    claims = get_jwt()
    user_id = claims.get("sub")
    role = claims.get("role")

    conn = get_connection()
    with conn:
        with conn.cursor() as cur:
            if role == "admin":
                # Admin can see all pets
                cur.execute("SELECT * FROM pet")
            else:
                # Pet owner sees only their pets
                cur.execute("""
                    SELECT p.* 
                    FROM pet p
                    JOIN pet_owner po ON p.pet_id = po.pet_id
                    WHERE po.user_id = %s
                """, (user_id,))
            return jsonify(cur.fetchall())


# =========================
# APPOINTMENT (OWNER / ADMIN)
# =========================
@app.post("/appointments")
@role_required("pet_owner", "admin")
def create_appointment():
    data = request.json

    conn = get_connection()
    with conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO appointment
                (datetime,status,pet_id,clinic_id,veterinarian_id)
                VALUES (%s,%s,%s,%s,%s)
            """, (
                data["datetime"],
                data["status"],
                data["pet_id"],
                data["clinic_id"],
                data["veterinarian_id"]
            ))
            conn.commit()

    return jsonify({"message": "Appointment created"}), 201


@app.get("/appointments")
@jwt_required()
def get_appointments():
    claims = get_jwt()
    user_id = claims.get("sub")
    role = claims.get("role")

    conn = get_connection()
    with conn:
        with conn.cursor() as cur:
            if role == "admin":
                # Admin sees all appointments
                cur.execute("""
                    SELECT 
                        a.appointment_id,
                        a.datetime,
                        a.status,
                        p.name AS pet_name,
                        c.name AS clinic_name,
                        CONCAT(u.first_name, ' ', u.last_name) AS owner_name
                    FROM appointment a
                    JOIN pet p ON a.pet_id = p.pet_id
                    JOIN clinic c ON a.clinic_id = c.clinic_id
                    LEFT JOIN pet_owner po ON p.pet_id = po.pet_id
                    LEFT JOIN user u ON po.user_id = u.user_id
                """)
            elif role == "veterinarian":
                # Vet sees appointments assigned to them
                cur.execute("""
                    SELECT 
                        a.appointment_id,
                        a.datetime,
                        a.status,
                        p.name AS pet_name,
                        c.name AS clinic_name,
                        CONCAT(u.first_name, ' ', u.last_name) AS owner_name
                    FROM appointment a
                    JOIN pet p ON a.pet_id = p.pet_id
                    JOIN clinic c ON a.clinic_id = c.clinic_id
                    JOIN veterinarian v ON a.veterinarian_id = v.veterinarian_id
                    LEFT JOIN pet_owner po ON p.pet_id = po.pet_id
                    LEFT JOIN user u ON po.user_id = u.user_id
                    WHERE v.user_id = %s
                """, (user_id,))
            else:
                # Pet owner sees appointments for their pets
                cur.execute("""
                    SELECT 
                        a.appointment_id,
                        a.datetime,
                        a.status,
                        p.name AS pet_name,
                        c.name AS clinic_name,
                        CONCAT(u.first_name, ' ', u.last_name) AS owner_name
                    FROM appointment a
                    JOIN pet p ON a.pet_id = p.pet_id
                    JOIN clinic c ON a.clinic_id = c.clinic_id
                    JOIN pet_owner po ON p.pet_id = po.pet_id
                    LEFT JOIN user u ON po.user_id = u.user_id
                    WHERE po.user_id = %s
                """, (user_id,))
            return jsonify(cur.fetchall())


@app.put("/appointments/<int:appointment_id>/status")
@role_required("veterinarian", "admin")
def update_status(appointment_id):
    data = request.json

    conn = get_connection()
    with conn:
        with conn.cursor() as cur:
            cur.execute("""
                UPDATE appointment
                SET status=%s
                WHERE appointment_id=%s
            """, (data["status"], appointment_id))
            conn.commit()

    return jsonify({"message": "Status updated"})


# additional endpoints expected by frontend
@app.get("/pets/<int:pet_id>")
@jwt_required()
def get_pet(pet_id):
    conn = get_connection()
    with conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM pet WHERE pet_id=%s", (pet_id,))
            pet = cur.fetchone()
            if not pet:
                return jsonify({"message": "Not found"}), 404
            return jsonify(pet)


@app.get("/owners")
@jwt_required()
def get_owners():
    conn = get_connection()
    with conn:
        with conn.cursor() as cur:
            cur.execute("SELECT o.owner_id, o.address, o.user_id, o.pet_id, u.first_name, u.last_name, p.name AS pet_name FROM pet_owner o JOIN user u ON o.user_id = u.user_id JOIN pet p ON o.pet_id = p.pet_id")
            return jsonify(cur.fetchall())


@app.post("/owners")
@role_required("pet_owner", "admin")
def create_owner():
    data = request.json
    conn = get_connection()
    with conn:
        with conn.cursor() as cur:
            cur.execute("INSERT INTO pet_owner (address, user_id, pet_id) VALUES (%s,%s,%s)", (
                data.get("address"), data.get("user_id"), data.get("pet_id")
            ))
            conn.commit()
    return jsonify({"message": "Owner record created"}), 201


@app.get("/clinics")
@jwt_required()
def get_clinics():
    conn = get_connection()
    with conn:
        with conn.cursor() as cur:
            cur.execute("SELECT clinic_id, name, phone_no, address FROM clinic")
            return jsonify(cur.fetchall())


@app.post("/clinics")
@role_required("admin")
def create_clinic():
    data = request.json
    conn = get_connection()
    with conn:
        with conn.cursor() as cur:
            cur.execute("INSERT INTO clinic (name, phone_no, address) VALUES (%s,%s,%s)", (
                data.get("name"), data.get("phone_no"), data.get("address")
            ))
            conn.commit()
    return jsonify({"message": "Clinic created"}), 201


@app.put("/clinics/<int:clinic_id>")
@role_required("admin")
def update_clinic(clinic_id):
    data = request.json
    conn = get_connection()
    with conn:
        with conn.cursor() as cur:
            cur.execute("UPDATE clinic SET name=%s, phone_no=%s, address=%s WHERE clinic_id=%s", (
                data.get("name"), data.get("phone_no"), data.get("address"), clinic_id
            ))
            conn.commit()
    return jsonify({"message": "Clinic updated"}), 200


# =========================
# VETERINARIAN (VET ENDPOINTS)
# =========================
@app.get("/veterinarians")
@jwt_required()
def get_veterinarians():
    conn = get_connection()
    with conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT 
                    v.veterinarian_id,
                    v.license_no,
                    u.user_id,
                    u.first_name,
                    u.last_name,
                    u.email,
                    u.phone_no
                FROM veterinarian v
                JOIN user u ON v.user_id = u.user_id
            """)
            vets = cur.fetchall()
            return jsonify(vets)


@app.get("/veterinarians/<int:vet_id>/schedules")
@jwt_required()
def get_veterinarian_schedules(vet_id):
    conn = get_connection()
    with conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT 
                    schedule_id,
                    day,
                    time_start,
                    time_end,
                    veterinarian_id
                FROM veterinarian_schedule
                WHERE veterinarian_id = %s
                ORDER BY 
                    FIELD(day, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
                    time_start
            """, (vet_id,))
            schedules = cur.fetchall()
            return jsonify(schedules)


@app.post("/veterinarian-schedules")
@role_required("veterinarian", "admin")
def create_schedule():
    try:
        data = request.json
        
        # Validate required fields
        if not data.get("day") or not data.get("time_start") or not data.get("time_end") or not data.get("veterinarian_id"):
            return jsonify({"message": "Missing required fields: day, time_start, time_end, veterinarian_id"}), 400
        
        # Normalize day to lowercase
        day_lower = data["day"].lower()
        
        # Validate day value
        valid_days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        if day_lower not in valid_days:
            return jsonify({"message": f"Invalid day. Must be one of: {', '.join(valid_days)}"}), 400

        conn = get_connection()
        with conn:
            with conn.cursor() as cur:
                # Check if veterinarian exists
                cur.execute("SELECT veterinarian_id FROM veterinarian WHERE veterinarian_id=%s", (data["veterinarian_id"],))
                if not cur.fetchone():
                    return jsonify({"message": "Veterinarian not found"}), 404
                
                # Check if schedule already exists for this day
                cur.execute(
                    "SELECT schedule_id FROM veterinarian_schedule WHERE veterinarian_id=%s AND LOWER(day)=%s",
                    (data["veterinarian_id"], day_lower)
                )
                if cur.fetchone():
                    return jsonify({"message": "Schedule already exists for this day"}), 400
                
                # Insert schedule with normalized day
                cur.execute("""
                    INSERT INTO veterinarian_schedule
                    (day, time_start, time_end, veterinarian_id)
                    VALUES (%s, %s, %s, %s)
                """, (
                    day_lower,
                    data["time_start"],
                    data["time_end"],
                    data["veterinarian_id"]
                ))
                conn.commit()

        return jsonify({"message": "Schedule created successfully"}), 201
    
    except Exception as e:
        print(f"Error creating schedule: {str(e)}")
        return jsonify({"message": f"Failed to create schedule: {str(e)}"}), 500


@app.put("/appointments/<int:appointment_id>")
@role_required("veterinarian", "admin")
def update_appointment(appointment_id):
    data = request.json
    allowed = ["datetime", "status", "pet_id", "clinic_id", "veterinarian_id"]
    fields = []
    values = []
    for k in allowed:
        if k in data:
            fields.append(f"{k}=%s")
            values.append(data[k])
    if not fields:
        return jsonify({"message": "No fields to update"}), 400
    values.append(appointment_id)
    conn = get_connection()
    with conn:
        with conn.cursor() as cur:
            cur.execute(f"UPDATE appointment SET {', '.join(fields)} WHERE appointment_id=%s", tuple(values))
            conn.commit()
    return jsonify({"message": "Appointment updated"})


@app.get("/users")
@role_required("admin")
def get_users():
    conn = get_connection()
    with conn:
        with conn.cursor() as cur:
            cur.execute("SELECT user_id, first_name, last_name, email FROM user")
            return jsonify(cur.fetchall())


# =========================
# TREATMENT RECORD (VET)
# =========================
@app.get("/treatments")
@role_required("veterinarian", "admin")
def get_treatments():
    conn = get_connection()
    with conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT 
                    t.record_id,
                    t.date,
                    t.diagnosis,
                    t.note,
                    t.appointment_id,
                    p.name AS pet_name,
                    CONCAT(u.first_name, ' ', u.last_name) AS vet_name,
                    v.license_no
                FROM treatment_record t
                LEFT JOIN appointment a ON t.appointment_id = a.appointment_id
                LEFT JOIN pet p ON a.pet_id = p.pet_id
                LEFT JOIN veterinarian v ON a.veterinarian_id = v.veterinarian_id
                LEFT JOIN user u ON v.user_id = u.user_id
            """)
            return jsonify(cur.fetchall())


@app.put("/treatments/<int:record_id>")
@role_required("veterinarian", "admin")
def update_treatment(record_id):
    data = request.json

    conn = get_connection()
    with conn:
        with conn.cursor() as cur:
            cur.execute("""
                UPDATE treatment_record
                SET diagnosis=%s, note=%s
                WHERE record_id=%s
            """, (
                data["diagnosis"],
                data["note"],
                record_id
            ))
            conn.commit()

    return jsonify({"message": "Treatment updated"})


# =========================
# REPORTS (ADMIN ONLY)
# =========================
@app.get("/reports/appointments/status")
@role_required("admin")
def report_by_status():
    conn = get_connection()
    with conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT status, COUNT(*) AS total
                FROM appointment
                GROUP BY status
            """)
            return jsonify(cur.fetchall())


@app.get("/reports/appointments/clinic")
@role_required("admin")
def report_by_clinic():
    conn = get_connection()
    with conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT c.name AS clinic, COUNT(a.appointment_id) AS total
                FROM appointment a
                JOIN clinic c ON a.clinic_id = c.clinic_id
                GROUP BY c.clinic_id
            """)
            return jsonify(cur.fetchall())


@app.get("/reports/treatments")
@role_required("admin")
def report_treatments():
    conn = get_connection()
    with conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT 
                    a.appointment_id,
                    p.name AS pet_name,
                    t.diagnosis,
                    CONCAT(u.first_name, ' ', u.last_name) AS vet_name,
                    v.license_no
                FROM treatment_record t
                JOIN appointment a ON t.appointment_id = a.appointment_id
                JOIN pet p ON a.pet_id = p.pet_id
                LEFT JOIN veterinarian v ON a.veterinarian_id = v.veterinarian_id
                LEFT JOIN user u ON v.user_id = u.user_id
            """)
            return jsonify(cur.fetchall())


# =========================
# RUN
# =========================
if __name__ == "__main__":
    app.run(debug=True)
