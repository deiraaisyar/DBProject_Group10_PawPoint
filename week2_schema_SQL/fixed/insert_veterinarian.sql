USE pawpoint;

-- Make user_id nullable (if not already)
ALTER TABLE veterinarian 
MODIFY COLUMN user_id INT NULL;

-- Update existing licenses to set user_id = NULL (make them available)
UPDATE veterinarian 
SET user_id = NULL 
WHERE license_no IN ('VET-2025-001', 'VET-2025-002', 'VET-2025-003', 'VET-2025-004', 'VET-2025-005');

-- Insert new licenses if they don't exist (IGNORE duplicates)
INSERT IGNORE INTO veterinarian (license_no, user_id) VALUES
('VET-2025-001', NULL),
('VET-2025-002', NULL),
('VET-2025-003', NULL),
('VET-2025-004', NULL),
('VET-2025-005', NULL),
('VET-2025-006', NULL),
('VET-2025-007', NULL),
('VET-2025-008', NULL),
('VET-2025-009', NULL),
('VET-2025-010', NULL);

-- Show available licenses
SELECT license_no, user_id FROM veterinarian WHERE user_id IS NULL ORDER BY license_no;