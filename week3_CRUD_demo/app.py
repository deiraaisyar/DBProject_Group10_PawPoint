from flask import Flask, request, jsonify
from flask_jwt_extended import (
    JWTManager, create_access_token,
    jwt_required, get_jwt, verify_jwt_in_request
)
from werkzeug.security import generate_password_hash, check_password_hash
from db import get_connection
import os
from dotenv import load_dotenv
from functools import wraps

load_dotenv()

app = Flask(__name__)

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

            conn.commit()

    return jsonify({"message": "User registered"}), 201


@app.post("/login")
def login():
    data = request.json

    conn = get_connection()
    with conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT u.user_id, u.password_hash, r.role
                FROM user u
                JOIN user_role ur ON u.user_id = ur.user_id
                JOIN role r ON ur.role_id = r.role_id
                WHERE u.email=%s
            """, (data["email"],))
            user = cur.fetchone()

    if not user or not check_password_hash(
        user["password_hash"], data["password"]
    ):
        return jsonify({"message": "Invalid credentials"}), 401

    # JWT subject ('sub') must be a string for jwt library; cast id to str
    token = create_access_token(
        identity=str(user["user_id"]),
        additional_claims={"role": user["role"]}
    )

    return jsonify({
        "access_token": token,
        "role": user["role"]
    })


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

    conn = get_connection()
    with conn:
        with conn.cursor() as cur:
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
            conn.commit()

    return jsonify({"message": "Pet created"}), 201


@app.get("/pets")
@role_required("pet_owner", "admin")
def get_pets():
    conn = get_connection()
    with conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM pet")
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
    conn = get_connection()
    with conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT 
                    a.appointment_id,
                    a.datetime,
                    a.status,
                    p.name AS pet_name,
                    c.name AS clinic_name
                FROM appointment a
                JOIN pet p ON a.pet_id = p.pet_id
                JOIN clinic c ON a.clinic_id = c.clinic_id
            """)
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
                    t.appointment_id
                FROM treatment_record t
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
# VETERINARIAN SCHEDULE (VET)
# =========================
@app.post("/veterinarian-schedules")
@role_required("veterinarian", "admin")
def create_schedule():
    data = request.json

    conn = get_connection()
    with conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO veterinarian_schedule
                (day,time_start,time_end,veterinarian_id)
                VALUES (%s,%s,%s,%s)
            """, (
                data["day"],
                data["time_start"],
                data["time_end"],
                data["veterinarian_id"]
            ))
            conn.commit()

    return jsonify({"message": "Schedule created"}), 201


@app.get("/veterinarians/<int:vet_id>/schedules")
@jwt_required()
def get_schedules(vet_id):
    conn = get_connection()
    with conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT day,time_start,time_end
                FROM veterinarian_schedule
                WHERE veterinarian_id=%s
            """, (vet_id,))
            return jsonify(cur.fetchall())


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
                    t.diagnosis
                FROM treatment_record t
                JOIN appointment a ON t.appointment_id = a.appointment_id
                JOIN pet p ON a.pet_id = p.pet_id
            """)
            return jsonify(cur.fetchall())


# =========================
# RUN
# =========================
if __name__ == "__main__":
    app.run(debug=True)
