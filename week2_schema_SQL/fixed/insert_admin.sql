-- Insert Admin User for PawPoint
-- Login Credentials:
--   Email: admin@pawpoint.com
--   Password: admin123

USE pawpoint;

-- Insert admin user
INSERT INTO user (first_name, last_name, email, password_hash, phone_no) 
VALUES ('Admin', 'System', 'admin@pawpoint.com', 'scrypt:32768:8:1$IaX7QcOgYNzJlKYi$601ddb659bdcc5624668a2032b7b63066d4177e9aa6db658578125facf86bbccf32cb53fd16fbdcd75f66dd0daf29583fe056f22fb92aa7f799dbe073599eca6', '0800000000');

-- Get the admin user_id that was just created
SET @admin_user_id = LAST_INSERT_ID();

-- Assign admin role (role_id = 3 for 'admin')
INSERT INTO user_role (user_id, role_id) 
VALUES (@admin_user_id, 3);

-- Verify insertion
SELECT u.user_id, u.first_name, u.last_name, u.email, r.role
FROM user u
JOIN user_role ur ON u.user_id = ur.user_id
JOIN role r ON ur.role_id = r.role_id
WHERE u.email = 'admin@pawpoint.com';
