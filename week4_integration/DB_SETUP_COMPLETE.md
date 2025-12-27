# PostgreSQL Database Setup Summary

## Database Created ✅
- **Database Name**: `pawpoint`
- **Database User**: `postgres`
- **Database Password**: `pawpoint123`
- **Host**: `localhost`
- **Port**: `5432`

## Tables Created ✅
- `user` - User accounts
- `role` - User roles (pet_owner, veterinarian, admin)
- `user_role` - User to role mapping
- `clinic` - Veterinary clinics
- `veterinarian` - Veterinarian records
- `veterinarian_clinic` - Veterinarian to clinic mapping
- `pet` - Pet records
- `pet_owner` - Pet owner records
- `appointment` - Appointment records
- `veterinarian_schedule` - Veterinarian schedules
- `treatment_record` - Treatment records

## Test Data Inserted ✅

### Users
| Email | Password | Role |
|-------|----------|------|
| admin@pawpoint.com | admin123 | admin |
| owner@pawpoint.com | owner123 | pet_owner |
| vet@pawpoint.com | vet123 | veterinarian |

### Clinics
- Happy Paws Clinic (081234567890)
- Pet Care Center (082345678901)

### Sample Data
- Veterinarian: Dr Smith (License: VET-001-2024)
- Pets: Buddy (Golden Retriever), Whiskers (Persian Cat)
- Schedules: Monday-Friday, 9:00 AM - 5:00 PM

## Backend Configuration ✅

File `.env` di `backend/` sudah dikonfigurasi dengan:
```
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=pawpoint123
DB_NAME=pawpoint
DB_PORT=5432
JWT_SECRET_KEY=pawpoint-secret-key-2024-change-in-production
```

## How to Run

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
python app.py
```
Backend akan running di `http://localhost:5000`

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend akan running di `http://localhost:5173`

## Test Login API

```bash
curl -X POST http://localhost:5000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@pawpoint.com",
    "password": "admin123"
  }'
```

Expected response:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "role": "admin",
  "user_id": 1,
  "first_name": "Admin",
  "last_name": "User"
}
```

## Database Connection Test

```bash
# Test connection
psql -h localhost -U postgres -d pawpoint -c "SELECT 1 as connection_test;"

# Query users
psql -h localhost -U postgres -d pawpoint -c "SELECT user_id, first_name, email FROM \"user\";"
```

## Next Steps

1. ✅ Database setup complete
2. ✅ Backend configured
3. 🔜 Start backend: `python app.py`
4. 🔜 Install frontend: `npm install`
5. 🔜 Start frontend: `npm run dev`
6. 🔜 Login dengan test accounts
