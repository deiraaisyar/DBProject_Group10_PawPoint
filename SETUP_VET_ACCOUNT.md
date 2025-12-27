# Setup Veterinarian Account - PawPoint

## Problem yang Diperbaiki
Error "Unable to determine your veterinarian ID" terjadi karena:
1. User register sebagai vet tapi tidak ada record di tabel `veterinarian`
2. License validation belum diimplementasikan di backend
3. Database veterinarian table butuh `user_id` nullable

## Solusi yang Sudah Diimplementasikan

### 1. Backend Registration Enhancement (`app_temp.py`)
✅ Menambahkan validasi license_no saat register sebagai veterinarian:
- Cek apakah license_no ada di database
- Cek apakah license sudah dipakai user lain
- Update veterinarian record dengan user_id baru

### 2. Database Schema Update (`insert_veterinarian.sql`)
✅ File SQL sudah dibuat untuk:
- Mengubah `user_id` di tabel veterinarian jadi nullable
- Insert sample license numbers yang siap dipakai

### 3. Frontend Error Handling (`Schedule.jsx`)
✅ Menambahkan:
- Console logging untuk debugging
- Alert message yang lebih informatif
- Handling saat veterinarian record tidak ditemukan

## Langkah Setup (Step by Step)

### Step 1: Update Database Schema
Jalankan SQL berikut di MySQL:

```bash
cd week2_schema_SQL/fixed
mysql -u root -p pawpoint < insert_veterinarian.sql
```

Atau manual di MySQL:
```sql
USE pawpoint;

-- Ubah user_id jadi nullable
ALTER TABLE veterinarian 
MODIFY COLUMN user_id INT NULL;

-- Insert sample licenses
INSERT INTO veterinarian (license_no, user_id) VALUES
('VET-2025-001', NULL),
('VET-2025-002', NULL),
('VET-2025-003', NULL),
('VET-2025-004', NULL),
('VET-2025-005', NULL);

-- Verify
SELECT * FROM veterinarian;
```

### Step 2: Restart Backend Server
```bash
cd week3_CRUD_demo
# Stop server jika sudah running (Ctrl+C)
python app_temp.py
# Atau
flask run
```

### Step 3: Restart Frontend Dev Server
```bash
cd week4_integration
# Stop jika running (Ctrl+C)
npm run dev
```

### Step 4: Test Register Veterinarian
1. Buka browser: http://localhost:5173
2. Klik "Register"
3. Isi form dengan data:
   - **First Name**: Test
   - **Last Name**: Veterinarian
   - **Email**: test.vet@mail.com
   - **Password**: password123
   - **Phone**: 08123456789
   - **Role**: Pilih "Veterinarian"
   - **License Number**: VET-2025-001 ⬅️ **PENTING!**
4. Klik Register

### Step 5: Login dan Test Schedule
1. Login dengan akun yang baru dibuat
2. Navigate ke "Schedule" menu
3. Tambah schedule baru
4. Seharusnya sudah tidak ada error lagi! ✅

## Troubleshooting

### Jika masih error "Unable to determine your veterinarian ID"

**Cek di MySQL:**
```sql
USE pawpoint;

-- Cek user yang baru dibuat
SELECT * FROM user WHERE email = 'test.vet@mail.com';

-- Cek veterinarian record (pastikan user_id sudah terisi)
SELECT * FROM veterinarian WHERE license_no = 'VET-2025-001';

-- Cek role (pastikan role_id = 2 untuk veterinarian)
SELECT u.*, ur.role_id, r.role 
FROM user u 
JOIN user_role ur ON u.user_id = ur.user_id
JOIN role r ON ur.role_id = r.role_id
WHERE u.email = 'test.vet@mail.com';
```

**Expected Result:**
- User ada dengan role_id = 2 (veterinarian)
- Veterinarian record dengan license_no terisi dan user_id sama dengan user.user_id

### Jika license number tidak valid

Error: "Invalid license number. Please contact admin."

**Solusi:**
1. Pastikan license sudah ada di database
2. Gunakan salah satu dari: VET-2025-001, VET-2025-002, VET-2025-003, VET-2025-004, VET-2025-005

### Jika license sudah dipakai

Error: "This license is already registered to another user."

**Solusi:**
1. Gunakan license number lain yang masih NULL
2. Atau hapus user_id dari license yang sudah dipakai:
```sql
UPDATE veterinarian 
SET user_id = NULL 
WHERE license_no = 'VET-2025-001';
```

## Database Verification Commands

```sql
-- Lihat semua veterinarian
SELECT 
    v.veterinarian_id,
    v.license_no,
    v.user_id,
    u.first_name,
    u.last_name,
    u.email
FROM veterinarian v
LEFT JOIN user u ON v.user_id = u.user_id;

-- Lihat license yang available (user_id = NULL)
SELECT * FROM veterinarian WHERE user_id IS NULL;

-- Lihat license yang sudah dipakai
SELECT * FROM veterinarian WHERE user_id IS NOT NULL;

-- Lihat schedule veterinarian tertentu
SELECT * FROM veterinarian_schedule WHERE veterinarian_id = 1;
```

## Additional License Numbers

Jika butuh lebih banyak license untuk testing:

```sql
INSERT INTO veterinarian (license_no, user_id) VALUES
('VET-2025-006', NULL),
('VET-2025-007', NULL),
('VET-2025-008', NULL),
('VET-2025-009', NULL),
('VET-2025-010', NULL);
```

## Summary Perubahan

✅ **Backend (app_temp.py)**:
- License validation saat register
- Auto-link veterinarian record dengan user_id

✅ **Database (insert_veterinarian.sql)**:
- Schema update (user_id nullable)
- Sample licenses siap pakai

✅ **Frontend (Schedule.jsx)**:
- Better error handling
- Console logging untuk debugging
- Informative error messages

---

**Status**: ✅ Ready to test
**Last Updated**: December 27, 2025
