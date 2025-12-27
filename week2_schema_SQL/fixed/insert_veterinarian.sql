USE pawpoint;

-- Optional pool of pre-approved licenses (no clinic binding here; mapping handled in veterinarian_clinic)
INSERT IGNORE INTO veterinarian (license_no, user_id) VALUES
('VET-1001', NULL),
('VET-1002', NULL),
('VET-2001', NULL),
('VET-2002', NULL);

-- View currently unassigned licenses
SELECT veterinarian_id, license_no, user_id
FROM veterinarian
WHERE user_id IS NULL
ORDER BY license_no;