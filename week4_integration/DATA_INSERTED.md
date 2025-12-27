# ✅ Sample Data Insert Completed

## Data Inserted Successfully

### Summary
- ✅ 7 Users (1 admin, 2 pet owners, 2 veterinarians, 2 original)
- ✅ 4 Pets (Milo, Luna, Buddy, Kitty)
- ✅ 2 Clinics (Happy Paws Veterinary, Animal Care Center)
- ✅ 3 Veterinarians (linked to clinics)
- ✅ 4 Pet Owners (relationships)
- ✅ 4 Appointments (scheduled, completed, cancelled)
- ✅ 1 Treatment Record (for completed appointment)
- ✅ 3 Veterinarian Schedules (Mon, Wed, Fri)

## Test Accounts

### Existing Accounts
| Email | Password | Role |
|-------|----------|------|
| admin@pawpoint.com | admin123 | Admin |
| owner@pawpoint.com | owner123 | Pet Owner |
| vet@pawpoint.com | vet123 | Veterinarian |

### New Demo Accounts (from insert_data.sql)
| Email | Password | Role |
|-------|----------|------|
| olivia@pawpoint.com | owner123 | Pet Owner |
| peter@pawpoint.com | owner456 | Pet Owner |
| victor@pawpoint.com | vet123 | Veterinarian |
| wendy@pawpoint.com | vet123 | Veterinarian |

## Pets in Database
1. **Milo** - Golden Retriever (owned by Olivia)
2. **Luna** - Persian Cat (owned by Olivia)
3. **Buddy** - Beagle (owned by Peter)
4. **Kitty** - Angora Cat (owned by Peter)

## Appointments
1. Milo at Happy Paws with VET-001 - SCHEDULED (Jun 1)
2. Luna at Happy Paws with VET-001 - COMPLETED (Jun 2) ← Has treatment record
3. Buddy at Animal Care with VET-002 - SCHEDULED (Jun 3)
4. Kitty at Animal Care with VET-002 - CANCELLED (Jun 4)

## Veterinarian Schedules
- **VET-001 (Victor)**: Monday 9-15, Friday 9-13 @ Happy Paws
- **VET-002 (Wendy)**: Wednesday 10-16 @ Animal Care

## How to Test

### 1. Login with existing accounts (all work)
```bash
curl -X POST http://localhost:5000/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@pawpoint.com", "password": "admin123"}'
```

### 2. Try new demo accounts
```bash
curl -X POST http://localhost:5000/login \
  -H "Content-Type: application/json" \
  -d '{"email": "olivia@pawpoint.com", "password": "owner123"}'
```

### 3. Get appointments for a pet owner (Olivia)
```bash
# First login to get token, then use it
TOKEN="<jwt_token_from_login>"
curl -X GET http://localhost:5000/appointments \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Get pets
```bash
curl -X GET http://localhost:5000/pets \
  -H "Authorization: Bearer $TOKEN"
```

## Database Verification

### Check all data
```bash
# Connect to database
psql -h localhost -U postgres -d pawpoint

# List users
SELECT user_id, first_name, email FROM "user";

# List appointments with details
SELECT a.appointment_id, p.name, c.name, a.status 
FROM appointment a
JOIN pet p ON a.pet_id = p.pet_id
JOIN clinic c ON a.clinic_id = c.clinic_id;

# List treatments
SELECT * FROM treatment_record;
```

## Notes
- All password hashes are scrypt format
- Appointment status: 'scheduled', 'completed', 'cancelled'
- Veterinarian schedules are in 24-hour format
- Clinic and Pet data use auto-incrementing IDs
- Foreign key relationships are maintained

## Ready for Testing! 🚀
The backend can now be started with `python app.py` and test accounts can be used to verify all functionality.
