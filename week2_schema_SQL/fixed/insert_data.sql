-- ROLE (3)
INSERT INTO role (role) VALUES
('pet_owner'), ('veterinarian'), ('admin');

-- USER (10)
INSERT INTO user (first_name,last_name,email,password_hash,phone_no) VALUES
('Alya','Putri','alya@mail.com','h1','0811111111'),
('Bima','Santoso','bima@mail.com','h2','0811111112'),
('Citra','Dewi','citra@mail.com','h3','0811111113'),
('Dimas','Pratama','dimas@mail.com','h4','0811111114'),
('Eka','Lestari','eka@mail.com','h5','0811111115'),
('Fajar','Utomo','fajar@mail.com','h6','0811111116'),
('Gita','Rahma','gita@mail.com','h7','0811111117'),
('Hadi','Saputra','hadi@mail.com','h8','0811111118'),
('Intan','Permata','intan@mail.com','h9','0811111119'),
('Admin','System','admin@mail.com','h10','0800000000');

-- USER_ROLE
INSERT INTO user_role VALUES
(1,1),(2,1),(3,1),(4,1),(5,1),   -- pet_owner
(6,2),(7,2),(8,2),              -- veterinarian
(10,3);                         -- admin

-- PET (10)
INSERT INTO pet (name,species,breed,gender,birth_date,age) VALUES
('Milo','Dog','Golden','male','2021-01-01',4),
('Luna','Cat','Persian','female','2022-02-02',3),
('Buddy','Dog','Beagle','male','2020-03-03',5),
('Kitty','Cat','Angora','female','2021-04-04',4),
('Rocky','Dog','Bulldog','male','2019-05-05',6),
('Nala','Cat','Siamese','female','2020-06-06',5),
('Oscar','Dog','Poodle','male','2021-07-07',4),
('Bella','Cat','Maine Coon','female','2019-08-08',6),
('Max','Dog','Husky','male','2022-09-09',3),
('Chloe','Cat','Bengal','female','2021-10-10',4);

-- PET_OWNER (hubungkan owner & pet)
INSERT INTO pet_owner (address,user_id,pet_id) VALUES
('Jl Mawar 1',1,1),
('Jl Mawar 1',1,2),
('Jl Melati 2',2,3),
('Jl Melati 2',2,4),
('Jl Kenanga 3',3,5),
('Jl Kenanga 3',3,6),
('Jl Anggrek 4',4,7),
('Jl Anggrek 4',4,8),
('Jl Dahlia 5',5,9),
('Jl Dahlia 5',5,10);

-- VETERINARIAN (3)
INSERT INTO veterinarian (license_no,user_id) VALUES
('VET-001',6),
('VET-002',7),
('VET-003',8);

-- CLINIC (2)
INSERT INTO clinic (name,phone_no,address) VALUES
('Happy Paws','0274-111111','Jl Sehat 1'),
('Animal Care','0274-222222','Jl Sehat 2');

-- APPOINTMENT (10)
INSERT INTO appointment (datetime,status,pet_id,clinic_id,veterinarian_id) VALUES
('2025-06-01 09:00','completed',1,1,1),
('2025-06-01 10:00','completed',2,1,1),
('2025-06-02 09:00','scheduled',3,1,2),
('2025-06-02 10:00','scheduled',4,1,2),
('2025-06-03 09:00','completed',5,2,3),
('2025-06-03 10:00','completed',6,2,3),
('2025-06-04 09:00','scheduled',7,2,1),
('2025-06-04 10:00','cancelled',8,2,1),
('2025-06-05 09:00','scheduled',9,1,2),
('2025-06-05 10:00','scheduled',10,1,3);

-- TREATMENT_RECORD 
INSERT INTO treatment_record (date, diagnosis, note, appointment_id) VALUES
('2025-06-01','Fever','Medication given',11),
('2025-06-01','Skin Allergy','Ointment prescribed',12),
('2025-06-03','Dental Issue','Teeth cleaned',15),
('2025-06-03','Eye Infection','Eye drops',16);

-- VETERINARIAN_SCHEDULE
INSERT INTO veterinarian_schedule (day,time_start,time_end,veterinarian_id) VALUES
('monday','09:00','15:00',1),
('tuesday','09:00','15:00',1),
('wednesday','10:00','16:00',2),
('thursday','10:00','16:00',2),
('friday','09:00','14:00',3);