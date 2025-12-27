USE pawpoint;

-- Roles
INSERT INTO role (role) VALUES ('pet_owner'), ('veterinarian'), ('admin');

-- Demo users
--   Olivia: owner123
--   Peter: owner456
--   Victor: vet123
--   Wendy: vet123
INSERT INTO user (first_name, last_name, email, password_hash, phone_no) VALUES
('Olivia', 'Owens', 'olivia@pawpoint.com', 'scrypt:32768:8:1$igTrq2BTFavrUKdN$a15a9f75a3f0e08a7626aac7e8ef39abd6c645b363b494a62c4ba3f66e0eaed48674201eb1b99fc5af77624b93b563c202c9ef1f5414d6a03057303912cb256d', '0811111111'),
('Peter', 'Paws', 'peter@pawpoint.com', 'scrypt:32768:8:1$BTmRHiLH5rIirNJb$828c43b499eea6dd2216c735d88430eda4f5e2193d9d78f0781e267f05def7112348fd90c50a001ae804fcb548c834e98e442564c9f6b6e42b19ae8b1527ef92', '0811111112'),
('Victor', 'Vet', 'victor@pawpoint.com', 'scrypt:32768:8:1$Hlqv5oBDVHP5EXvD$f0bcd04a71bdaa8241e05ea9e21106c1e671cdb5926b912843e9da5a2fbc9d402add580f7f6bd495752e8570b982a8e78fdd16b70db749c4005a6dc29ef6a2c1', '0812222222'),
('Wendy', 'Vet', 'wendy@pawpoint.com', 'scrypt:32768:8:1$Hlqv5oBDVHP5EXvD$f0bcd04a71bdaa8241e05ea9e21106c1e671cdb5926b912843e9da5a2fbc9d402add580f7f6bd495752e8570b982a8e78fdd16b70db749c4005a6dc29ef6a2c1', '0813333333');

-- Map roles to users
SET @role_owner := (SELECT role_id FROM role WHERE role = 'pet_owner');
SET @role_vet   := (SELECT role_id FROM role WHERE role = 'veterinarian');

INSERT INTO user_role (user_id, role_id) VALUES
(1, @role_owner),
(2, @role_owner),
(3, @role_vet),
(4, @role_vet);

-- Clinics
INSERT INTO clinic (name, phone_no, address) VALUES
('Happy Paws Veterinary', '0274-111111', 'Jl Sehat 1'),
('Animal Care Center', '0274-222222', 'Jl Sehat 2');

-- Veterinarians (no clinic column)
INSERT INTO veterinarian (license_no, user_id) VALUES
('VET-001', 3),
('VET-002', 4),
('VET-003', NULL);

-- Veterinarian-to-clinic mapping
INSERT INTO veterinarian_clinic (veterinarian_id, clinic_id) VALUES
(1, 1),
(2, 2),
(3, 1);

-- Pets
INSERT INTO pet (name, species, breed, gender, birth_date, age) VALUES
('Milo', 'Dog', 'Golden Retriever', 'male', '2021-01-01', 4),
('Luna', 'Cat', 'Persian', 'female', '2022-02-02', 3),
('Buddy', 'Dog', 'Beagle', 'male', '2020-03-03', 5),
('Kitty', 'Cat', 'Angora', 'female', '2021-04-04', 4);

-- Pet ownership
INSERT INTO pet_owner (address, user_id, pet_id) VALUES
('Jl Mawar 1', 1, 1),
('Jl Mawar 1', 1, 2),
('Jl Melati 2', 2, 3),
('Jl Melati 2', 2, 4);

-- Appointments (clinic must match veterinarian assignment via mapping)
INSERT INTO appointment (datetime, status, pet_id, clinic_id, veterinarian_id) VALUES
('2025-06-01 09:00', 'scheduled', 1, 1, 1),
('2025-06-02 10:00', 'completed', 2, 1, 1),
('2025-06-03 11:00', 'scheduled', 3, 2, 2),
('2025-06-04 12:00', 'cancelled', 4, 2, 2);

-- Treatment records for completed visits
INSERT INTO treatment_record (date, diagnosis, note, appointment_id) VALUES
('2025-06-02', 'Skin allergy', 'Ointment prescribed', 2);

-- Veterinarian schedules
INSERT INTO veterinarian_schedule (day, time_start, time_end, veterinarian_id) VALUES
('monday', '09:00', '15:00', 1),
('wednesday', '10:00', '16:00', 2),
('friday', '09:00', '13:00', 1);