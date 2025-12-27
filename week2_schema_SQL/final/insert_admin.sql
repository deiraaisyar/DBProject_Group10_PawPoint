-- Insert admin user for PawPoint
-- Login credentials: admin@pawpoint.com / admin123

USE pawpoint;

-- Resolve admin role id dynamically
SET @admin_role_id = (SELECT role_id FROM role WHERE role = 'admin');

INSERT INTO user (first_name, last_name, email, password_hash, phone_no) 
VALUES (
	'Admin',
	'System',
	'admin@pawpoint.com',
	'scrypt:32768:8:1$8JvWZAbXXVulFFsJ$77c258b859d34fb7fe6dc19d1e60c0d5082a8227a26ab7d94cddd557a4ced0dca1ba800cab8e5736a3da0dceb06aba41c67a7584f88f62e7687c0b61ab95b21c',
	'0800000000'
);
SET @admin_user_id = LAST_INSERT_ID();

INSERT INTO user_role (user_id, role_id) 
VALUES (@admin_user_id, @admin_role_id);

-- Quick verification
SELECT u.user_id, u.first_name, u.last_name, u.email, r.role
FROM user u
JOIN user_role ur ON u.user_id = ur.user_id
JOIN role r ON ur.role_id = r.role_id
WHERE u.email = 'admin@pawpoint.com';
