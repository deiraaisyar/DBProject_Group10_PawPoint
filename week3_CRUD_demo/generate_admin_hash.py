from werkzeug.security import generate_password_hash

# Generate password hash for admin user
admin_password = "admin123"  # Admin password
hashed = generate_password_hash(admin_password)

print(f"Password: {admin_password}")
print(f"Hash: {hashed}")
print("\n=== SQL INSERT Statement ===")
print(f"""
-- Insert admin user
INSERT INTO user (first_name, last_name, email, password_hash, phone_no) 
VALUES ('Admin', 'System', 'admin@pawpoint.com', '{hashed}', '0800000000');

-- Get the newly created admin user_id
SET @admin_user_id = LAST_INSERT_ID();

-- Assign admin role (role_id = 3 for 'admin')
INSERT INTO user_role (user_id, role_id) 
VALUES (@admin_user_id, 3);
""")

print("\n=== Login Credentials ===")
print("Email: admin@pawpoint.com")
print(f"Password: {admin_password}")
