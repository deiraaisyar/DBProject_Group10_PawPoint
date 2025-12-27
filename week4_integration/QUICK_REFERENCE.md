# 🐾 PawPoint - Database Setup Quick Reference

## PostgreSQL Credentials
```
Host: localhost
Port: 5432
User: postgres
Password: pawpoint123
Database: pawpoint
```

## Test User Credentials

### Admin Account
- Email: `admin@pawpoint.com`
- Password: `admin123`
- Role: `admin`

### Pet Owner Account
- Email: `owner@pawpoint.com`
- Password: `owner123`
- Role: `pet_owner`

### Veterinarian Account
- Email: `vet@pawpoint.com`
- Password: `vet123`
- Role: `veterinarian`

## Quick Start Commands

### 1. Start Backend
```bash
cd week4_integration/backend
python app.py
# Server runs on http://localhost:5000
```

### 2. Start Frontend
```bash
cd week4_integration/frontend
npm install  # Only first time
npm run dev
# Server runs on http://localhost:5173
```

### 3. Test Login (Backend Running)
```bash
curl -X POST http://localhost:5000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@pawpoint.com",
    "password": "admin123"
  }'
```

### 4. Database Queries
```bash
# Connect to database
psql -h localhost -U postgres -d pawpoint

# List all users
SELECT * FROM "user";

# List all appointments
SELECT * FROM appointment;

# Check vet schedule
SELECT * FROM veterinarian_schedule;
```

## Folder Structure
```
week4_integration/
├── frontend/           # React + Vite
├── backend/           # Flask + PostgreSQL
├── node_modules/      # Frontend deps (auto-generated)
├── README.md          # Setup instructions
└── DB_SETUP_COMPLETE.md  # Database details
```

## Common Issues & Solutions

### Backend can't connect to database
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL if needed
sudo systemctl start postgresql

# Verify credentials in backend/.env
cat backend/.env
```

### Port 5000 already in use
```bash
# Find what's using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

### Port 5173 already in use
```bash
# Find what's using port 5173
lsof -i :5173

# Kill the process
kill -9 <PID>
```

### Reset database (if needed)
```bash
sudo -u postgres dropdb pawpoint
sudo -u postgres createdb pawpoint
sudo -u postgres psql -d pawpoint -f /tmp/pawpoint_schema.sql
```

## API Endpoints (Backend)

### Auth
- `POST /register` - Register new user
- `POST /login` - Login & get JWT token
- `GET /profile` - Get logged-in user profile

### Pets
- `GET /pets` - List pets
- `POST /pets` - Create pet
- `GET /pets/<id>` - Get pet detail
- `PUT /pets/<id>` - Update pet
- `DELETE /pets/<id>` - Delete pet

### Appointments
- `GET /appointments` - List appointments
- `POST /appointments` - Create appointment
- `GET /appointments/<id>` - Get appointment detail
- `PUT /appointments/<id>` - Update appointment

### Clinics
- `GET /clinics` - List clinics
- `POST /clinics` - Create clinic (admin only)

### Veterinarians
- `GET /veterinarians` - List vets
- `GET /veterinarians/<id>/schedules` - Get vet schedule

## Notes
- All endpoints except `/register` and `/login` require JWT token in header
- Token format: `Authorization: Bearer <token>`
- Database uses PostgreSQL (not MySQL!)
- Frontend has CORS proxy to backend at `/api`
