from flask import Flask, request, jsonify
from flask_jwt_extended import (
    JWTManager, create_access_token,
    jwt_required, get_jwt, verify_jwt_in_request
)
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from db import get_db_conn, get_connection as _get_connection, release_connection
import os
from dotenv import load_dotenv
from functools import wraps

load_dotenv()

app = Flask(__name__)
CORS(app)

# =========================
# CONNECTION WRAPPER (Anti pool exhausted!)
# =========================
class ConnectionWrapper:
    """Wrapper class that proxies all connection methods but overrides close()"""
    def __init__(self, conn):
        self._conn = conn
        self._closed = False
    
    def close(self):
        """Return connection to pool instead of closing it"""
        if not self._closed:
            release_connection(self._conn)
            self._closed = True
    
    def __getattr__(self, name):
        """Proxy all other methods to the real connection"""
        return getattr(self._conn, name)
    
    def __enter__(self):
        return self._conn.__enter__()
    
    def __exit__(self, *args):
        return self._conn.__exit__(*args)

def get_connection():
    """
    Get connection from pool and wrap it to ensure proper cleanup.
    When conn.close() is called, connection is returned to pool.
    """
    conn = _get_connection()
    return ConnectionWrapper(conn)

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


def current_user_id():
    """Return JWT subject as int when possible, otherwise raw value."""
    claims = get_jwt()
    sub = claims.get("sub")
    try:
        return int(sub)
    except (TypeError, ValueError):
        return sub


def ensure_vet_and_clinic(cur, veterinarian_id, clinic_id):
    """Validate that veterinarian exists and is assigned to the target clinic via veterinarian_clinic."""
    cur.execute(
        "SELECT 1 FROM veterinarian WHERE veterinarian_id=%s",
        (veterinarian_id,)
    )
    vet = cur.fetchone()
    if not vet:
        return False, "Veterinarian not found"

    cur.execute(
        """
            SELECT 1 FROM veterinarian_clinic
            WHERE veterinarian_id=%s AND clinic_id=%s
        """,
        (veterinarian_id, clinic_id)
    )
    if not cur.fetchone():
        return False, "Veterinarian must be assigned to the selected clinic"
    return True, None


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
    try:
        with conn:
            with conn.cursor() as cur:
                # insert user (let DB set created_at via DEFAULT CURRENT_TIMESTAMP)
                cur.execute("""
                    INSERT INTO "user"
                    (first_name, last_name, email, password_hash, phone_no)
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING user_id
                """, (
                    data["first_name"],
                    data["last_name"],
                    data["email"],
                    hashed_pw,
                    data.get("phone_no")
                ))
                user_id = cur.fetchone()[0]

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
                    VALUES (%s, %s)
                """, (user_id, role[0]))

                # If registering as veterinarian, ensure clinic mapping + license uniqueness
                if role_name == "veterinarian":
                    license_no = data.get("license_no")
                    clinic_id = data.get("clinic_id")

                    if not license_no or not clinic_id:
                        return jsonify({"message": "license_no and clinic_id are required for veterinarians"}), 400

                    # Clinic must exist
                    cur.execute("SELECT clinic_id FROM clinic WHERE clinic_id=%s", (clinic_id,))
                    clinic = cur.fetchone()
                    if not clinic:
                        return jsonify({"message": "Clinic not found"}), 404

                    # Check license uniqueness; clinic linkage is handled via mapping table
                    cur.execute(
                        "SELECT veterinarian_id, user_id FROM veterinarian WHERE license_no=%s",
                        (license_no,)
                    )
                    existing_vet = cur.fetchone()

                    if existing_vet:
                        if existing_vet[1]:  # user_id
                            return jsonify({"message": "This license is already registered to another user."}), 400
                        vet_id = existing_vet[0]
                        cur.execute(
                            "UPDATE veterinarian SET user_id=%s WHERE veterinarian_id=%s",
                            (user_id, vet_id)
                        )
                    else:
                        # create new veterinarian record bound to clinic
                        cur.execute(
                            "INSERT INTO veterinarian (license_no, user_id) VALUES (%s, %s) RETURNING veterinarian_id",
                            (license_no, user_id)
                        )
                        vet_id = cur.fetchone()[0]

                    # Map veterinarian to clinic via junction table (avoid duplicates)
                    cur.execute(
                        """
                            INSERT INTO veterinarian_clinic (veterinarian_id, clinic_id)
                            VALUES (%s, %s)
                            ON CONFLICT (veterinarian_id, clinic_id) DO NOTHING
                        """,
                        (existing_vet[0] if existing_vet else vet_id, clinic_id)
                    )

                conn.commit()
    except Exception as e:
        conn.rollback()
        print(f"Register error: {str(e)}")
        return jsonify({"message": f"Registration failed: {str(e)}"}), 500

    return jsonify({"message": "User registered successfully"}), 201


@app.post("/login")
def login():
    try:
        data = request.json
        
        if not data.get("email") or not data.get("password"):
            return jsonify({"message": "Email and password required"}), 400

        conn = get_connection()
        try:
            with conn:
                with conn.cursor() as cur:
                    cur.execute("""
                        SELECT u.user_id, u.password_hash, r.role, u.first_name, u.last_name
                        FROM "user" u
                        JOIN user_role ur ON u.user_id = ur.user_id
                        JOIN role r ON ur.role_id = r.role_id
                        WHERE u.email=%s
                        LIMIT 1
                    """, (data["email"],))
                    user = cur.fetchone()
        finally:
            conn.close()

        if not user:
            return jsonify({"message": "User not found"}), 401
        
        if not check_password_hash(user[2] if isinstance(user, tuple) else user["password_hash"], data["password"]):
            return jsonify({"message": "Invalid password"}), 401

        # Extract user data - handle both tuple and dict responses
        user_id = user[0]
        password_hash = user[1]
        role = user[2]
        first_name = user[3]
        last_name = user[4]

        # JWT subject ('sub') must be a string for jwt library; cast id to str
        token = create_access_token(
            identity=str(user_id),
            additional_claims={"role": role}
        )

        return jsonify({
            "access_token": token,
            "role": role,
            "user_id": user_id,
            "first_name": first_name,
            "last_name": last_name
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
    user_id = current_user_id()

    conn = get_connection()
    try:
        with conn:
            with conn.cursor() as cur:
                # Insert pet
                cur.execute("""
                    INSERT INTO pet
                    (name, species, breed, gender, birth_date, age)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING pet_id
                """, (
                    data["name"],
                    data["species"],
                    data["breed"],
                    data["gender"],
                    data["birth_date"],
                    data["age"]
                ))
                pet_id = cur.fetchone()[0]

                # Auto-create pet_owner record linking user to pet
                cur.execute("""
                    INSERT INTO pet_owner (address, user_id, pet_id)
                    VALUES (%s, %s, %s)
                """, (data.get("address", ""), user_id, pet_id))
                
                conn.commit()
    except Exception as e:
        conn.rollback()
        print(f"Create pet error: {str(e)}")
        return jsonify({"message": f"Failed to create pet: {str(e)}"}), 500
    finally:
        conn.close()

    return jsonify({"message": "Pet created", "pet_id": pet_id}), 201


@app.get("/pets")
@role_required("pet_owner", "admin")
def get_pets():
    claims = get_jwt()
    user_id = claims.get("sub")
    role = claims.get("role")

    conn = get_connection()
    try:
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
                pets = cur.fetchall()
                return jsonify([dict(pet) for pet in pets])
    except Exception as e:
        print(f"Get pets error: {str(e)}")
        return jsonify({"message": f"Failed to get pets: {str(e)}"}), 500
    finally:
        conn.close()


# =========================
# APPOINTMENT (OWNER / ADMIN)
# =========================
@app.post("/appointments")
@role_required("pet_owner", "admin")
def create_appointment():
    data = request.json
    claims = get_jwt()
    user_id = current_user_id()
    role = claims.get("role")

    conn = get_connection()
    try:
        with conn:
            with conn.cursor() as cur:
                # Pet owners can only book for their own pets
                if role == "pet_owner":
                    cur.execute(
                        "SELECT 1 FROM pet_owner WHERE pet_id=%s AND user_id=%s",
                        (data["pet_id"], user_id)
                    )
                    if not cur.fetchone():
                        return jsonify({"message": "You can only book appointments for your own pets"}), 403

                # Validate veterinarian/clinic pairing via mapping
                is_valid, err = ensure_vet_and_clinic(cur, data["veterinarian_id"], data["clinic_id"])
                if not is_valid:
                    return jsonify({"message": err}), 400

                cur.execute("""
                    INSERT INTO appointment
                    (datetime, status, pet_id, clinic_id, veterinarian_id)
                    VALUES (%s, %s, %s, %s, %s)
                """, (
                    data["datetime"],
                    data.get("status", "scheduled"),
                    data["pet_id"],
                    data["clinic_id"],
                    data["veterinarian_id"]
                ))
                conn.commit()
    except Exception as e:
        conn.rollback()
        print(f"Create appointment error: {str(e)}")
        return jsonify({"message": f"Failed to create appointment: {str(e)}"}), 500
    finally:
        conn.close()

    return jsonify({"message": "Appointment created"}), 201


@app.get("/appointments")
@jwt_required()
def get_appointments():
    claims = get_jwt()
    user_id = current_user_id()
    role = claims.get("role")

    conn = get_connection()
    try:
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
                            CONCAT(owner_u.first_name, ' ', owner_u.last_name) AS owner_name,
                            v.veterinarian_id,
                            v.license_no,
                            CONCAT(vu.first_name, ' ', vu.last_name) AS vet_name
                        FROM appointment a
                        JOIN pet p ON a.pet_id = p.pet_id
                        JOIN clinic c ON a.clinic_id = c.clinic_id
                        JOIN veterinarian v ON a.veterinarian_id = v.veterinarian_id
                        LEFT JOIN veterinarian_clinic vc ON vc.veterinarian_id = v.veterinarian_id AND vc.clinic_id = a.clinic_id
                        LEFT JOIN "user" vu ON v.user_id = vu.user_id
                        LEFT JOIN pet_owner po ON p.pet_id = po.pet_id
                        LEFT JOIN "user" owner_u ON po.user_id = owner_u.user_id
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
                            CONCAT(owner_u.first_name, ' ', owner_u.last_name) AS owner_name,
                            v.veterinarian_id,
                            v.license_no,
                            CONCAT(vu.first_name, ' ', vu.last_name) AS vet_name
                        FROM appointment a
                        JOIN pet p ON a.pet_id = p.pet_id
                        JOIN clinic c ON a.clinic_id = c.clinic_id
                        JOIN veterinarian v ON a.veterinarian_id = v.veterinarian_id
                        LEFT JOIN veterinarian_clinic vc ON vc.veterinarian_id = v.veterinarian_id AND vc.clinic_id = a.clinic_id
                        LEFT JOIN "user" vu ON v.user_id = vu.user_id
                        LEFT JOIN pet_owner po ON p.pet_id = po.pet_id
                        LEFT JOIN "user" owner_u ON po.user_id = owner_u.user_id
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
                            CONCAT(owner_u.first_name, ' ', owner_u.last_name) AS owner_name,
                            v.veterinarian_id,
                            v.license_no,
                            CONCAT(vu.first_name, ' ', vu.last_name) AS vet_name
                        FROM appointment a
                        JOIN pet p ON a.pet_id = p.pet_id
                        JOIN clinic c ON a.clinic_id = c.clinic_id
                        JOIN pet_owner po ON p.pet_id = po.pet_id
                        LEFT JOIN "user" owner_u ON po.user_id = owner_u.user_id
                        JOIN veterinarian v ON a.veterinarian_id = v.veterinarian_id
                        LEFT JOIN veterinarian_clinic vc ON vc.veterinarian_id = v.veterinarian_id AND vc.clinic_id = a.clinic_id
                        LEFT JOIN "user" vu ON v.user_id = vu.user_id
                        WHERE po.user_id = %s
                    """, (user_id,))
                
                appointments = cur.fetchall()
                return jsonify([dict(apt) for apt in appointments])
    except Exception as e:
        print(f"Get appointments error: {str(e)}")
        return jsonify({"message": f"Failed to get appointments: {str(e)}"}), 500
    finally:
        conn.close()


@app.get("/appointments/<int:appointment_id>")
@jwt_required()
def get_appointment_detail(appointment_id):
    claims = get_jwt()
    role = claims.get("role")
    user_id = current_user_id()

    base_select = """
        SELECT 
            a.appointment_id,
            a.datetime,
            a.status,
            p.name AS pet_name,
            c.name AS clinic_name,
            CONCAT(owner_u.first_name, ' ', owner_u.last_name) AS owner_name,
            v.veterinarian_id,
            v.license_no,
            CONCAT(vu.first_name, ' ', vu.last_name) AS vet_name
        FROM appointment a
        JOIN pet p ON a.pet_id = p.pet_id
        JOIN clinic c ON a.clinic_id = c.clinic_id
        JOIN veterinarian v ON a.veterinarian_id = v.veterinarian_id
        LEFT JOIN veterinarian_clinic vc ON vc.veterinarian_id = v.veterinarian_id AND vc.clinic_id = a.clinic_id
        LEFT JOIN "user" vu ON v.user_id = vu.user_id
        LEFT JOIN pet_owner po ON p.pet_id = po.pet_id
        LEFT JOIN "user" owner_u ON po.user_id = owner_u.user_id
        WHERE a.appointment_id = %s
    """

    conn = get_connection()
    try:
        with conn:
            with conn.cursor() as cur:
                if role == "admin":
                    cur.execute(base_select, (appointment_id,))
                elif role == "veterinarian":
                    cur.execute(base_select + " AND v.user_id = %s", (appointment_id, user_id))
                else:
                    cur.execute(base_select + " AND po.user_id = %s", (appointment_id, user_id))

                record = cur.fetchone()
                if not record:
                    return jsonify({"message": "Not found"}), 404
                return jsonify(dict(record) if hasattr(record, 'keys') else record)
    except Exception as e:
        print(f"Get appointment detail error: {str(e)}")
        return jsonify({"message": f"Failed to get appointment: {str(e)}"}), 500
    finally:
        conn.close()


@app.put("/appointments/<int:appointment_id>/status")
@role_required("veterinarian", "admin")
def update_status(appointment_id):
    data = request.json
    claims = get_jwt()
    role = claims.get("role")
    user_id = current_user_id()

    conn = get_connection()
    try:
        with conn:
            with conn.cursor() as cur:
                if role == "veterinarian":
                    cur.execute(
                        """
                            SELECT 1
                            FROM appointment a
                            JOIN veterinarian v ON a.veterinarian_id = v.veterinarian_id
                            WHERE a.appointment_id=%s AND v.user_id=%s
                        """,
                        (appointment_id, user_id)
                    )
                    if not cur.fetchone():
                        return jsonify({"message": "You can only update your own appointments"}), 403

                cur.execute("""
                    UPDATE appointment
                    SET status=%s
                    WHERE appointment_id=%s
                """, (data["status"], appointment_id))
                conn.commit()
    except Exception as e:
        conn.rollback()
        print(f"Update status error: {str(e)}")
        return jsonify({"message": f"Failed to update status: {str(e)}"}), 500
    finally:
        conn.close()

    return jsonify({"message": "Status updated"})


# additional endpoints expected by frontend
@app.get("/pets/<int:pet_id>")
@jwt_required()
def get_pet(pet_id):
    claims = get_jwt()
    role = claims.get("role")
    user_id = current_user_id()

    conn = get_connection()
    try:
        with conn:
            with conn.cursor() as cur:
                if role == "admin":
                    cur.execute("SELECT * FROM pet WHERE pet_id=%s", (pet_id,))
                else:
                    # Pet owners may only see their own pets; vets are blocked here for privacy
                    cur.execute(
                        """
                            SELECT p.*
                            FROM pet p
                            JOIN pet_owner po ON p.pet_id = po.pet_id
                            WHERE p.pet_id=%s AND po.user_id=%s
                        """,
                        (pet_id, user_id)
                    )
                pet = cur.fetchone()
                if not pet:
                    return jsonify({"message": "Not found"}), 404
                return jsonify(dict(pet) if hasattr(pet, 'keys') else pet)
    except Exception as e:
        print(f"Get pet error: {str(e)}")
        return jsonify({"message": f"Failed to get pet: {str(e)}"}), 500
    finally:
        conn.close()


@app.put("/pets/<int:pet_id>")
@role_required("pet_owner", "admin")
def update_pet(pet_id):
    data = request.json
    claims = get_jwt()
    role = claims.get("role")
    user_id = current_user_id()

    allowed = ["name", "species", "breed", "gender", "birth_date", "age"]
    fields = []
    values = []
    for k in allowed:
        if k in data:
            fields.append(f"{k}=%s")
            values.append(data[k])
    if not fields:
        return jsonify({"message": "No fields to update"}), 400

    conn = get_connection()
    try:
        with conn:
            with conn.cursor() as cur:
                if role == "pet_owner":
                    cur.execute(
                        "SELECT 1 FROM pet_owner WHERE pet_id=%s AND user_id=%s",
                        (pet_id, user_id)
                    )
                    if not cur.fetchone():
                        return jsonify({"message": "You can only update your own pets"}), 403

                values.append(pet_id)
                cur.execute(f"UPDATE pet SET {', '.join(fields)} WHERE pet_id=%s", tuple(values))
                conn.commit()
    except Exception as e:
        conn.rollback()
        print(f"Update pet error: {str(e)}")
        return jsonify({"message": f"Failed to update pet: {str(e)}"}), 500
    finally:
        conn.close()

    return jsonify({"message": "Pet updated"})


@app.delete("/pets/<int:pet_id>")
@role_required("pet_owner", "admin")
def delete_pet(pet_id):
    claims = get_jwt()
    role = claims.get("role")
    user_id = current_user_id()

    conn = get_connection()
    try:
        with conn:
            with conn.cursor() as cur:
                if role == "pet_owner":
                    cur.execute(
                        "SELECT 1 FROM pet_owner WHERE pet_id=%s AND user_id=%s",
                        (pet_id, user_id)
                    )
                    if not cur.fetchone():
                        return jsonify({"message": "You can only delete your own pets"}), 403

                cur.execute("DELETE FROM pet WHERE pet_id=%s", (pet_id,))
                conn.commit()
    except Exception as e:
        conn.rollback()
        print(f"Delete pet error: {str(e)}")
        return jsonify({"message": f"Failed to delete pet: {str(e)}"}), 500
    finally:
        conn.close()

    return jsonify({"message": "Pet deleted"})


@app.get("/owners")
@role_required("admin")
def get_owners():
    conn = get_connection()
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT o.owner_id, o.address, o.user_id, o.pet_id, u.first_name, u.last_name, p.name AS pet_name 
                    FROM pet_owner o 
                    JOIN "user" u ON o.user_id = u.user_id 
                    JOIN pet p ON o.pet_id = p.pet_id
                """)
                owners = cur.fetchall()
                return jsonify([dict(owner) for owner in owners])
    except Exception as e:
        print(f"Get owners error: {str(e)}")
        return jsonify({"message": f"Failed to get owners: {str(e)}"}), 500
    finally:
        conn.close()


@app.post("/owners")
@role_required("pet_owner", "admin")
def create_owner():
    data = request.json
    conn = get_connection()
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO pet_owner (address, user_id, pet_id) VALUES (%s, %s, %s)",
                    (data.get("address"), data.get("user_id"), data.get("pet_id"))
                )
                conn.commit()
    except Exception as e:
        conn.rollback()
        print(f"Create owner error: {str(e)}")
        return jsonify({"message": f"Failed to create owner: {str(e)}"}), 500
    finally:
        conn.close()

    return jsonify({"message": "Owner record created"}), 201


@app.get("/clinics")
@jwt_required()
def get_clinics():
    conn = get_connection()
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute("SELECT clinic_id, name, phone_no, address FROM clinic")
                clinics = cur.fetchall()
                return jsonify([dict(clinic) for clinic in clinics])
    except Exception as e:
        print(f"Get clinics error: {str(e)}")
        return jsonify({"message": f"Failed to get clinics: {str(e)}"}), 500
    finally:
        conn.close()


@app.get("/clinics/<int:clinic_id>")
@jwt_required()
def get_clinic(clinic_id):
    conn = get_connection()
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute("SELECT clinic_id, name, phone_no, address FROM clinic WHERE clinic_id=%s", (clinic_id,))
                clinic = cur.fetchone()
                if not clinic:
                    return jsonify({"message": "Not found"}), 404
                return jsonify(dict(clinic) if hasattr(clinic, 'keys') else clinic)
    except Exception as e:
        print(f"Get clinic error: {str(e)}")
        return jsonify({"message": f"Failed to get clinic: {str(e)}"}), 500
    finally:
        conn.close()


@app.post("/clinics")
@role_required("admin")
def create_clinic():
    data = request.json
    conn = get_connection()
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO clinic (name, phone_no, address) VALUES (%s, %s, %s)",
                    (data.get("name"), data.get("phone_no"), data.get("address"))
                )
                conn.commit()
    except Exception as e:
        conn.rollback()
        print(f"Create clinic error: {str(e)}")
        return jsonify({"message": f"Failed to create clinic: {str(e)}"}), 500
    finally:
        conn.close()

    return jsonify({"message": "Clinic created"}), 201


@app.put("/clinics/<int:clinic_id>")
@role_required("admin")
def update_clinic(clinic_id):
    data = request.json
    conn = get_connection()
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute(
                    "UPDATE clinic SET name=%s, phone_no=%s, address=%s WHERE clinic_id=%s",
                    (data.get("name"), data.get("phone_no"), data.get("address"), clinic_id)
                )
                conn.commit()
    except Exception as e:
        conn.rollback()
        print(f"Update clinic error: {str(e)}")
        return jsonify({"message": f"Failed to update clinic: {str(e)}"}), 500
    finally:
        conn.close()

    return jsonify({"message": "Clinic updated"}), 200


# =========================
# VETERINARIAN (VET ENDPOINTS)
# =========================
@app.get("/veterinarians")
@jwt_required()
def get_veterinarians():
    conn = get_connection()
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT 
                        v.veterinarian_id,
                        v.license_no,
                        v.user_id,
                        u.first_name,
                        u.last_name,
                        u.email,
                        u.phone_no
                    FROM veterinarian v
                    LEFT JOIN "user" u ON v.user_id = u.user_id
                """)
                vets = cur.fetchall()
                return jsonify([dict(vet) for vet in vets])
    except Exception as e:
        print(f"Get veterinarians error: {str(e)}")
        return jsonify({"message": f"Failed to get veterinarians: {str(e)}"}), 500
    finally:
        conn.close()


@app.get("/veterinarians/<int:vet_id>")
@jwt_required()
def get_veterinarian(vet_id):
    conn = get_connection()
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT 
                        v.veterinarian_id,
                        v.license_no,
                        v.user_id,
                        u.first_name,
                        u.last_name,
                        u.email,
                        u.phone_no
                    FROM veterinarian v
                    LEFT JOIN "user" u ON v.user_id = u.user_id
                    WHERE v.veterinarian_id = %s
                """, (vet_id,))
                vet = cur.fetchone()
                if not vet:
                    return jsonify({"message": "Not found"}), 404
                return jsonify(dict(vet) if hasattr(vet, 'keys') else vet)
    except Exception as e:
        print(f"Get veterinarian error: {str(e)}")
        return jsonify({"message": f"Failed to get veterinarian: {str(e)}"}), 500
    finally:
        conn.close()


@app.get("/veterinarians/clinic/<int:clinic_id>")
@jwt_required()
def get_veterinarians_by_clinic(clinic_id):
    conn = get_connection()
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT 
                        v.veterinarian_id,
                        v.license_no,
                        v.user_id,
                        u.first_name,
                        u.last_name,
                        u.email,
                        u.phone_no
                    FROM veterinarian v
                    JOIN veterinarian_clinic vc ON vc.veterinarian_id = v.veterinarian_id
                    JOIN clinic c ON vc.clinic_id = c.clinic_id
                    LEFT JOIN "user" u ON v.user_id = u.user_id
                    WHERE c.clinic_id = %s
                """, (clinic_id,))
                vets = cur.fetchall()
                return jsonify([dict(vet) for vet in vets])
    except Exception as e:
        print(f"Get veterinarians by clinic error: {str(e)}")
        return jsonify({"message": f"Failed to get veterinarians: {str(e)}"}), 500
    finally:
        conn.close()


@app.post("/veterinarians")
@role_required("admin")
def create_veterinarian():
    data = request.json
    license_no = data.get("license_no")
    user_id = data.get("user_id")
    clinic_id = data.get("clinic_id")

    if not license_no:
        return jsonify({"message": "license_no is required"}), 400

    conn = get_connection()
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1 FROM veterinarian WHERE license_no=%s", (license_no,))
                if cur.fetchone():
                    return jsonify({"message": "License already exists"}), 400

                if user_id:
                    cur.execute("SELECT 1 FROM \"user\" WHERE user_id=%s", (user_id,))
                    if not cur.fetchone():
                        return jsonify({"message": "User not found"}), 404

                cur.execute(
                    "INSERT INTO veterinarian (license_no, user_id) VALUES (%s, %s) RETURNING veterinarian_id",
                    (license_no, user_id)
                )
                vet_id = cur.fetchone()[0]

                if clinic_id:
                    cur.execute("SELECT 1 FROM clinic WHERE clinic_id=%s", (clinic_id,))
                    if not cur.fetchone():
                        return jsonify({"message": "Clinic not found"}), 404
                    cur.execute(
                        """
                            INSERT INTO veterinarian_clinic (veterinarian_id, clinic_id)
                            VALUES (%s, %s)
                            ON CONFLICT (veterinarian_id, clinic_id) DO NOTHING
                        """,
                        (vet_id, clinic_id)
                    )

                conn.commit()
    except Exception as e:
        conn.rollback()
        print(f"Create veterinarian error: {str(e)}")
        return jsonify({"message": f"Failed to create veterinarian: {str(e)}"}), 500
    finally:
        conn.close()

    return jsonify({"message": "Veterinarian created", "veterinarian_id": vet_id}), 201


@app.get("/veterinarians/<int:vet_id>/schedules")
@jwt_required()
def get_veterinarian_schedules(vet_id):
    conn = get_connection()
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT 
                        schedule_id,
                        day,
                        TO_CHAR(time_start, 'HH24:MI') AS time_start,
                        TO_CHAR(time_end, 'HH24:MI') AS time_end,
                        veterinarian_id
                    FROM veterinarian_schedule
                    WHERE veterinarian_id = %s
                    ORDER BY 
                        CASE LOWER(day)
                            WHEN 'monday' THEN 1
                            WHEN 'tuesday' THEN 2
                            WHEN 'wednesday' THEN 3
                            WHEN 'thursday' THEN 4
                            WHEN 'friday' THEN 5
                            WHEN 'saturday' THEN 6
                            WHEN 'sunday' THEN 7
                            ELSE 8
                        END,
                        time_start
                """, (vet_id,))
                schedules = cur.fetchall()
                return jsonify([dict(schedule) for schedule in schedules])
    except Exception as e:
        print(f"Get schedules error: {str(e)}")
        return jsonify({"message": f"Failed to get schedules: {str(e)}"}), 500
    finally:
        conn.close()


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
        try:
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
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()

        return jsonify({"message": "Schedule created successfully"}), 201
    
    except Exception as e:
        print(f"Error creating schedule: {str(e)}")
        return jsonify({"message": f"Failed to create schedule: {str(e)}"}), 500


@app.put("/appointments/<int:appointment_id>")
@role_required("veterinarian", "admin")
def update_appointment(appointment_id):
    data = request.json
    claims = get_jwt()
    role = claims.get("role")
    user_id = current_user_id()
    allowed = ["datetime", "status", "pet_id", "clinic_id", "veterinarian_id"]
    fields = []
    values = []
    for k in allowed:
        if k in data:
            fields.append(f"{k}=%s")
            values.append(data[k])
    if not fields:
        return jsonify({"message": "No fields to update"}), 400
    
    # If clinic or veterinarian is changing, validate the pairing via mapping
    if "clinic_id" in data or "veterinarian_id" in data:
        conn = get_connection()
        try:
            with conn:
                with conn.cursor() as cur:
                    # Fetch current values to fill missing pieces
                    cur.execute(
                        "SELECT clinic_id, veterinarian_id FROM appointment WHERE appointment_id=%s",
                        (appointment_id,)
                    )
                    current_row = cur.fetchone()
                    if not current_row:
                        return jsonify({"message": "Appointment not found"}), 404
                    
                    target_clinic = data.get("clinic_id", current_row[0] if isinstance(current_row, tuple) else current_row['clinic_id'])
                    target_vet = data.get("veterinarian_id", current_row[1] if isinstance(current_row, tuple) else current_row['veterinarian_id'])
                    is_valid, err = ensure_vet_and_clinic(cur, target_vet, target_clinic)
                    if not is_valid:
                        return jsonify({"message": err}), 400
        finally:
            conn.close()
    
    # Restrict veterinarians to their own appointments
    if role == "veterinarian":
        conn = get_connection()
        try:
            with conn:
                with conn.cursor() as cur:
                    cur.execute(
                        """
                            SELECT 1
                            FROM appointment a
                            JOIN veterinarian v ON a.veterinarian_id = v.veterinarian_id
                            WHERE a.appointment_id=%s AND v.user_id=%s
                        """,
                        (appointment_id, user_id)
                    )
                    if not cur.fetchone():
                        return jsonify({"message": "You can only update your own appointments"}), 403
        finally:
            conn.close()
    
    values.append(appointment_id)
    conn = get_connection()
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute(f"UPDATE appointment SET {', '.join(fields)} WHERE appointment_id=%s", tuple(values))
                conn.commit()
    except Exception as e:
        conn.rollback()
        print(f"Update appointment error: {str(e)}")
        return jsonify({"message": f"Failed to update appointment: {str(e)}"}), 500
    finally:
        conn.close()
    
    return jsonify({"message": "Appointment updated"})


@app.get("/users")
@role_required("admin")
def get_users():
    conn = get_connection()
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute("SELECT user_id, first_name, last_name, email FROM \"user\"")
                users = cur.fetchall()
                return jsonify([dict(user) for user in users])
    except Exception as e:
        print(f"Get users error: {str(e)}")
        return jsonify({"message": f"Failed to get users: {str(e)}"}), 500
    finally:
        conn.close()


@app.get("/users/<int:user_id>")
@role_required("admin")
def get_user(user_id):
    conn = get_connection()
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT user_id, first_name, last_name, email, phone_no, created_at FROM \"user\" WHERE user_id=%s",
                    (user_id,)
                )
                user = cur.fetchone()
                if not user:
                    return jsonify({"message": "Not found"}), 404
                return jsonify(dict(user) if hasattr(user, 'keys') else user)
    except Exception as e:
        print(f"Get user error: {str(e)}")
        return jsonify({"message": f"Failed to get user: {str(e)}"}), 500
    finally:
        conn.close()


# =========================
# TREATMENT RECORD (VET)
# =========================
@app.get("/treatments")
@role_required("veterinarian", "admin")
def get_treatments():
    conn = get_connection()
    try:
        with conn:
            with conn.cursor() as cur:
                claims_role = get_jwt().get("role")
                if claims_role == "admin":
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
                        LEFT JOIN "user" u ON v.user_id = u.user_id
                    """)
                else:
                    # Veterinarian sees only treatments tied to their own appointments
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
                        LEFT JOIN "user" u ON v.user_id = u.user_id
                        WHERE v.user_id = %s
                    """, (current_user_id(),))
                
                treatments = cur.fetchall()
                return jsonify([dict(t) for t in treatments])
    except Exception as e:
        print(f"Get treatments error: {str(e)}")
        return jsonify({"message": f"Failed to get treatments: {str(e)}"}), 500
    finally:
        conn.close()


@app.get("/treatments/<int:record_id>")
@role_required("veterinarian", "admin")
def get_treatment(record_id):
    conn = get_connection()
    try:
        with conn:
            with conn.cursor() as cur:
                claims_role = get_jwt().get("role")
                if claims_role == "admin":
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
                        LEFT JOIN "user" u ON v.user_id = u.user_id
                        WHERE t.record_id = %s
                    """, (record_id,))
                else:
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
                        LEFT JOIN "user" u ON v.user_id = u.user_id
                        WHERE t.record_id = %s AND v.user_id = %s
                    """, (record_id, current_user_id()))
                
                row = cur.fetchone()
                if not row:
                    return jsonify({"message": "Not found"}), 404
                return jsonify(dict(row) if hasattr(row, 'keys') else row)
    except Exception as e:
        print(f"Get treatment error: {str(e)}")
        return jsonify({"message": f"Failed to get treatment: {str(e)}"}), 500
    finally:
        conn.close()


@app.post("/treatments")
@role_required("veterinarian", "admin")
def create_treatment():
    data = request.json
    appointment_id = data.get("appointment_id")
    if not appointment_id:
        return jsonify({"message": "appointment_id is required"}), 400

    claims = get_jwt()
    role = claims.get("role")
    user_id = current_user_id()

    conn = get_connection()
    try:
        with conn:
            with conn.cursor() as cur:
                # Ensure appointment exists and, for vets, is assigned to them
                if role == "veterinarian":
                    cur.execute(
                        """
                            SELECT a.appointment_id
                            FROM appointment a
                            JOIN veterinarian v ON a.veterinarian_id = v.veterinarian_id
                            WHERE a.appointment_id=%s AND v.user_id=%s
                        """,
                        (appointment_id, user_id)
                    )
                else:
                    cur.execute(
                        "SELECT appointment_id FROM appointment WHERE appointment_id=%s",
                        (appointment_id,)
                    )
                appt = cur.fetchone()
                if not appt:
                    return jsonify({"message": "Appointment not found or not authorized"}), 404

                cur.execute(
                    "SELECT 1 FROM treatment_record WHERE appointment_id=%s",
                    (appointment_id,)
                )
                if cur.fetchone():
                    return jsonify({"message": "Treatment record already exists for this appointment"}), 400

                cur.execute(
                    """
                        INSERT INTO treatment_record (date, diagnosis, note, appointment_id)
                        VALUES (%s, %s, %s, %s)
                        RETURNING record_id
                    """,
                    (
                        data.get("date"),
                        data.get("diagnosis", ""),
                        data.get("note", ""),
                        appointment_id
                    )
                )
                record_id = cur.fetchone()[0]
                conn.commit()
    except Exception as e:
        conn.rollback()
        print(f"Create treatment error: {str(e)}")
        return jsonify({"message": f"Failed to create treatment: {str(e)}"}), 500
    finally:
        conn.close()

    return jsonify({"message": "Treatment created", "record_id": record_id}), 201


@app.put("/treatments/<int:record_id>")
@role_required("veterinarian", "admin")
def update_treatment(record_id):
    data = request.json

    claims_role = get_jwt().get("role")
    user_id = current_user_id()

    conn = get_connection()
    try:
        with conn:
            with conn.cursor() as cur:
                if claims_role == "veterinarian":
                    cur.execute(
                        """
                            SELECT 1
                            FROM treatment_record t
                            JOIN appointment a ON t.appointment_id = a.appointment_id
                            JOIN veterinarian v ON a.veterinarian_id = v.veterinarian_id
                            WHERE t.record_id=%s AND v.user_id=%s
                        """,
                        (record_id, user_id)
                    )
                    if not cur.fetchone():
                        return jsonify({"message": "You can only update your own treatment records"}), 403

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
    except Exception as e:
        conn.rollback()
        print(f"Update treatment error: {str(e)}")
        return jsonify({"message": f"Failed to update treatment: {str(e)}"}), 500
    finally:
        conn.close()

    return jsonify({"message": "Treatment updated"})


# =========================
# REPORTS (ADMIN ONLY)
# =========================
@app.get("/reports/appointments/status")
@role_required("admin")
def report_by_status():
    conn = get_connection()
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT status, COUNT(*) AS total
                    FROM appointment
                    GROUP BY status
                """)
                reports = cur.fetchall()
                return jsonify([dict(r) for r in reports])
    except Exception as e:
        print(f"Report by status error: {str(e)}")
        return jsonify({"message": f"Failed to get report: {str(e)}"}), 500
    finally:
        conn.close()


@app.get("/reports/appointments/clinic")
@role_required("admin")
def report_by_clinic():
    conn = get_connection()
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT c.name AS clinic, COUNT(a.appointment_id) AS total
                    FROM appointment a
                    JOIN clinic c ON a.clinic_id = c.clinic_id
                    GROUP BY c.clinic_id, c.name
                """)
                reports = cur.fetchall()
                return jsonify([dict(r) for r in reports])
    except Exception as e:
        print(f"Report by clinic error: {str(e)}")
        return jsonify({"message": f"Failed to get report: {str(e)}"}), 500
    finally:
        conn.close()


@app.get("/reports/treatments")
@role_required("admin")
def report_treatments():
    conn = get_connection()
    try:
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
                    LEFT JOIN "user" u ON v.user_id = u.user_id
                """)
                reports = cur.fetchall()
                return jsonify([dict(r) for r in reports])
    except Exception as e:
        print(f"Report treatments error: {str(e)}")
        return jsonify({"message": f"Failed to get report: {str(e)}"}), 500
    finally:
        conn.close()


# =========================
# RUN
# =========================
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
