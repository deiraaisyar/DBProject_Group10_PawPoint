from flask import Flask, request, jsonify
from db import get_connection

app = Flask(__name__)

# ------------------------------
# USER CRUD
# ------------------------------
@app.post("/users")
def create_user():
    data = request.json
    query = """
        INSERT INTO User (username, password, role, email)
        VALUES (%s, %s, %s, %s)
    """
    conn = get_connection()
    with conn:
        with conn.cursor() as cur:
            cur.execute(query, (data["username"], data["password"], data["role"], data.get("email")))
            conn.commit()
            return jsonify({"message": "User created"}), 201


@app.get("/users")
def get_users():
    conn = get_connection()
    with conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM User")
            return jsonify(cur.fetchall())


@app.get("/users/<int:user_id>")
def get_user(user_id):
    conn = get_connection()
    with conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM User WHERE user_id=%s", (user_id,))
            return jsonify(cur.fetchone())


@app.put("/users/<int:user_id>")
def update_user(user_id):
    data = request.json
    query = """
        UPDATE User SET username=%s, email=%s, role=%s
        WHERE user_id=%s
    """
    conn = get_connection()
    with conn:
        with conn.cursor() as cur:
            cur.execute(query, (data["username"], data.get("email"), data["role"], user_id))
            conn.commit()
            return jsonify({"message": "User updated"})


@app.delete("/users/<int:user_id>")
def delete_user(user_id):
    conn = get_connection()
    with conn:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM User WHERE user_id=%s", (user_id,))
            conn.commit()
            return jsonify({"message": "User deleted"})


# ------------------------------
# PET OWNER CRUD
# ------------------------------
@app.post("/owners")
def create_owner():
    data = request.json
    query = """
        INSERT INTO PetOwner (user_id, name, phone, address)
        VALUES (%s, %s, %s, %s)
    """

    conn = get_connection()
    with conn:
        with conn.cursor() as cur:
            cur.execute(query, (data["user_id"], data["name"], data.get("phone"), data.get("address")))
            conn.commit()
            return jsonify({"message": "Owner created"}), 201


@app.get("/owners")
def get_owners():
    conn = get_connection()
    with conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM PetOwner")
            return jsonify(cur.fetchall())


# ------------------------------
# PET CRUD
# ------------------------------
@app.post("/pets")
def create_pet():
    data = request.json
    query = """
        INSERT INTO Pet (owner_id, name, species, breed, age, gender)
        VALUES (%s, %s, %s, %s, %s, %s)
    """

    conn = get_connection()
    with conn:
        with conn.cursor() as cur:
            cur.execute(query, (
                data["owner_id"],
                data["name"],
                data.get("species"),
                data.get("breed"),
                data.get("age"),
                data.get("gender", "Unknown")
            ))
            conn.commit()
            return jsonify({"message": "Pet created"}), 201


@app.get("/pets/<int:pet_id>")
def get_pet(pet_id):
    conn = get_connection()
    with conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM Pet WHERE pet_id=%s", (pet_id,))
            return jsonify(cur.fetchone())


# ------------------------------
# VETERINARIAN CRUD
# ------------------------------
@app.post("/vets")
def create_vet():
    data = request.json
    query = """
        INSERT INTO Veterinarian (user_id, name, specialization, phone, schedule)
        VALUES (%s, %s, %s, %s, %s)
    """
    conn = get_connection()
    with conn:
        with conn.cursor() as cur:
            cur.execute(query, (
                data["user_id"], data["name"], data.get("specialization"),
                data.get("phone"), data.get("schedule")
            ))
            conn.commit()
            return jsonify({"message": "Vet created"}), 201


@app.get("/vets")
def get_vets():
    conn = get_connection()
    with conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM Veterinarian")
            return jsonify(cur.fetchall())


# ------------------------------
# CLINIC CRUD
# ------------------------------
@app.post("/clinics")
def create_clinic():
    data = request.json
    query = """
        INSERT INTO Clinic (name, address, phone)
        VALUES (%s, %s, %s)
    """
    conn = get_connection()
    with conn:
        with conn.cursor() as cur:
            cur.execute(query, (data["name"], data["address"], data.get("phone")))
            conn.commit()
            return jsonify({"message": "Clinic created"}), 201


@app.get("/clinics")
def get_clinics():
    conn = get_connection()
    with conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM Clinic")
            return jsonify(cur.fetchall())


# ------------------------------
# APPOINTMENTS CRUD
# ------------------------------
@app.post("/appointments")
def create_appointment():
    data = request.json
    query = """
        INSERT INTO Appointment (pet_id, vet_id, clinic_id, appointment_date, notes, status)
        VALUES (%s, %s, %s, %s, %s, %s)
    """
    conn = get_connection()
    with conn:
        with conn.cursor() as cur:
            cur.execute(query, (
                data["pet_id"], data["vet_id"], data["clinic_id"],
                data["appointment_date"], data.get("notes"), data.get("status", "Scheduled")
            ))
            conn.commit()
            return jsonify({"message": "Appointment created"}), 201


@app.get("/appointments")
def get_appointments():
    conn = get_connection()
    with conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM Appointment")
            return jsonify(cur.fetchall())


# ------------------------------
# TREATMENT RECORD CRUD
# ------------------------------
@app.post("/treatment")
def create_treatment_record():
    data = request.json
    query = """
        INSERT INTO TreatmentRecord (appointment_id, diagnosis, treatment, prescription)
        VALUES (%s, %s, %s, %s)
    """
    conn = get_connection()
    with conn:
        with conn.cursor() as cur:
            cur.execute(query, (
                data["appointment_id"], data.get("diagnosis"),
                data.get("treatment"), data.get("prescription")
            ))
            conn.commit()
            return jsonify({"message": "Treatment record created"}), 201


@app.get("/treatment/<int:record_id>")
def get_treatment_record(record_id):
    conn = get_connection()
    with conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM TreatmentRecord WHERE record_id=%s", (record_id,))
            return jsonify(cur.fetchone())


if __name__ == "__main__":
    app.run(debug=True)
