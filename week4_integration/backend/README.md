# PawPoint Backend (PostgreSQL)

## Overview
Backend API for the PawPoint application that helps manage appointments, pet care, and veterinary clinic data.

This backend is built with Flask and uses PostgreSQL as the database.

## Prerequisites
- Python 3.8+
- PostgreSQL 12+
- pip (Python package manager)

## Setup

### 1. Change directory / set up environment
```bash
cd backend
```

### 2. Create a virtual environment
```bash
python -m venv venv

# Linux/Mac
source venv/bin/activate

# Windows
venv\Scripts\activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Set up the .env file
Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

Edit `.env` and adjust:
```
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=pawpoint
DB_PORT=5432
JWT_SECRET_KEY=your-secret-key
```

### 5. Set up the database
Ensure PostgreSQL is running, then:

```bash
# Create database
createdb pawpoint

# Run schema from week2
psql -U postgres -d pawpoint -f ../week2_schema_SQL/final/ddl_schema.sql
psql -U postgres -d pawpoint -f ../week2_schema_SQL/final/insert_admin.sql
psql -U postgres -d pawpoint -f ../week2_schema_SQL/final/insert_data.sql
psql -U postgres -d pawpoint -f ../week2_schema_SQL/final/insert_veterinarian.sql
psql -U postgres -d pawpoint -f ../week2_schema_SQL/final/triggers.sql
```

### 6. Run the backend
```bash
python app.py
```

The backend runs at http://localhost:5000

## API Documentation

### Authentication
- **POST** `/register` — Register a new user
- **POST** `/login` — Log in and receive a JWT token
- **GET** `/profile` — View user profile (requires auth)

### Pets
- **POST** `/pets` — Create a new pet (owner/admin)
- **GET** `/pets` — List pets (owner/admin)
- **GET** `/pets/<id>` — View pet details
- **PUT** `/pets/<id>` — Update a pet
- **DELETE** `/pets/<id>` — Delete a pet

### Appointments
- **POST** `/appointments` — Create an appointment (owner/admin)
- **GET** `/appointments` — List appointments
- **GET** `/appointments/<id>` — View appointment details
- **PUT** `/appointments/<id>` — Update an appointment (vet/admin)
- **PUT** `/appointments/<id>/status` — Update appointment status

### Clinics
- **GET** `/clinics` — List clinics
- **GET** `/clinics/<id>` — View clinic details
- **POST** `/clinics` — Create a new clinic (admin)
- **PUT** `/clinics/<id>` — Update a clinic (admin)

### Veterinarians
- **GET** `/veterinarians` — List veterinarians
- **GET** `/veterinarians/<id>` — View veterinarian details
- **GET** `/veterinarians/clinic/<clinic_id>` — View veterinarians in a specific clinic
- **POST** `/veterinarians` — Create a new veterinarian (admin)
- **GET** `/veterinarians/<id>/schedules` — View veterinarian schedules
- **POST** `/veterinarian-schedules` — Create veterinarian schedules

### Treatments
- **GET** `/treatments` — List treatments (vet/admin)
- **GET** `/treatments/<id>` — View treatment details (vet/admin)
- **POST** `/treatments` — Create a treatment record (vet/admin)
- **PUT** `/treatments/<id>` — Update a treatment record (vet/admin)

### Reports (Admin Only)
- **GET** `/reports/appointments/status` — Appointment report by status
- **GET** `/reports/appointments/clinic` — Appointment report by clinic
- **GET** `/reports/treatments` — Treatments report

## Development Notes
- All endpoints are protected with JWT authentication except `/register` and `/login`
- Role-based access control: `pet_owner`, `veterinarian`, `admin`
- The database uses PostgreSQL with relationships defined in week2

## Common Issues

### Connection Error
```
connection error: (2003, "Can't connect to MySQL server...")
```
Solution: Ensure PostgreSQL is running and the credentials in `.env` are correct

### Database Error
Ensure all SQL migrations have been executed correctly.

## License
MIT
