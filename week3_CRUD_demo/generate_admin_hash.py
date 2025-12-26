from werkzeug.security import generate_password_hash

# Generate password hash untuk admin
admin_password = "admin123"  # Password untuk admin
hashed = generate_password_hash(admin_password)

print(f"Password: {admin_password}")
print(f"Hash: {hashed}")
print("\n=== SQL INSERT Statement ===")
print(f"""
-- Tambahkan admin user
INSERT INTO user (first_name, last_name, email, password_hash, phone_no) 
VALUES ('Admin', 'System', 'admin@pawpoint.com', '{hashed}', '0800000000');

-- Dapatkan user_id admin yang baru dibuat
SET @admin_user_id = LAST_INSERT_ID();

-- Assign role admin (role_id = 3 untuk 'admin')
INSERT INTO user_role (user_id, role_id) 
VALUES (@admin_user_id, 3);
""")

print("\n=== Login Credentials ===")
print(f"Email: admin@pawpoint.com")
print(f"Password: {admin_password}")
