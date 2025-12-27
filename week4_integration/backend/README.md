# PawPoint Backend (PostgreSQL)

## Overview
Backend API untuk aplikasi PawPoint yang membantu mengelola appointment, perawatan hewan peliharaan, dan data klinik hewan.

Backend ini dibangun dengan Flask dan menggunakan PostgreSQL sebagai database.

## Prerequisites
- Python 3.8+
- PostgreSQL 12+
- pip (Python package manager)

## Setup

### 1. Clone atau setup environment
```bash
cd backend
```

### 2. Create virtual environment
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

### 4. Setup .env file
Copy `.env.example` ke `.env` dan konfigurasi:
```bash
cp .env.example .env
```

Edit `.env` dan sesuaikan:
```
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=pawpoint
DB_PORT=5432
JWT_SECRET_KEY=your-secret-key
```

### 5. Setup Database
Pastikan PostgreSQL sudah running, kemudian:

```bash
# Create database
createdb pawpoint

# Run schema dari week2
psql -U postgres -d pawpoint -f ../week2_schema_SQL/final/ddl_schema.sql
psql -U postgres -d pawpoint -f ../week2_schema_SQL/final/insert_admin.sql
psql -U postgres -d pawpoint -f ../week2_schema_SQL/final/insert_data.sql
psql -U postgres -d pawpoint -f ../week2_schema_SQL/final/insert_veterinarian.sql
psql -U postgres -d pawpoint -f ../week2_schema_SQL/final/triggers.sql
```

### 6. Run Backend
```bash
python app.py
```

Backend akan berjalan di `http://localhost:5000`

## API Documentation

### Authentication
- **POST** `/register` - Daftar user baru
- **POST** `/login` - Login dan dapatkan JWT token
- **GET** `/profile` - Lihat profil user (memerlukan auth)

### Pets
- **POST** `/pets` - Buat pet baru (owner/admin)
- **GET** `/pets` - Lihat daftar pet (owner/admin)
- **GET** `/pets/<id>` - Lihat detail pet
- **PUT** `/pets/<id>` - Update pet
- **DELETE** `/pets/<id>` - Hapus pet

### Appointments
- **POST** `/appointments` - Buat appointment (owner/admin)
- **GET** `/appointments` - Lihat daftar appointment
- **GET** `/appointments/<id>` - Lihat detail appointment
- **PUT** `/appointments/<id>` - Update appointment (vet/admin)
- **PUT** `/appointments/<id>/status` - Update status appointment

### Clinics
- **GET** `/clinics` - Lihat daftar klinik
- **GET** `/clinics/<id>` - Lihat detail klinik
- **POST** `/clinics` - Buat klinik baru (admin)
- **PUT** `/clinics/<id>` - Update klinik (admin)

### Veterinarians
- **GET** `/veterinarians` - Lihat daftar dokter hewan
- **GET** `/veterinarians/<id>` - Lihat detail dokter hewan
- **GET** `/veterinarians/clinic/<clinic_id>` - Lihat dokter hewan di klinik tertentu
- **POST** `/veterinarians` - Buat dokter hewan baru (admin)
- **GET** `/veterinarians/<id>/schedules` - Lihat jadwal dokter hewan
- **POST** `/veterinarian-schedules` - Buat jadwal dokter hewan

### Treatments
- **GET** `/treatments` - Lihat daftar treatment (vet/admin)
- **GET** `/treatments/<id>` - Lihat detail treatment (vet/admin)
- **POST** `/treatments` - Buat treatment record (vet/admin)
- **PUT** `/treatments/<id>` - Update treatment record (vet/admin)

### Reports (Admin Only)
- **GET** `/reports/appointments/status` - Report appointment by status
- **GET** `/reports/appointments/clinic` - Report appointment by clinic
- **GET** `/reports/treatments` - Report treatments

## Development Notes
- Semua endpoint terenkripsi dengan JWT authentication kecuali `/register` dan `/login`
- Role-based access control: `pet_owner`, `veterinarian`, `admin`
- Database menggunakan PostgreSQL dengan relasi yang sudah didefinisikan di week2

## Common Issues

### Connection Error
```
connection error: (2003, "Can't connect to MySQL server...")
```
Solusi: Pastikan PostgreSQL sudah running dan credentials di `.env` benar

### Database Error
Pastikan semua migration SQL sudah dijalankan dengan benar.

## License
MIT
