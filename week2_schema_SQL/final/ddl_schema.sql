DROP DATABASE IF EXISTS pawpoint;
CREATE DATABASE pawpoint;
USE pawpoint;

-- Core user and role tables
CREATE TABLE user (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone_no VARCHAR(20),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE role (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role ENUM('pet_owner', 'veterinarian', 'admin') NOT NULL
);

CREATE TABLE user_role (
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES role(role_id) ON DELETE CASCADE
);

-- Clinics
CREATE TABLE clinic (
    clinic_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    phone_no VARCHAR(20),
    address TEXT NOT NULL
);

-- Veterinarians (no direct clinic column; mapped via veterinarian_clinic)
CREATE TABLE veterinarian (
    veterinarian_id INT AUTO_INCREMENT PRIMARY KEY,
    license_no VARCHAR(100) NOT NULL UNIQUE,
    user_id INT UNIQUE,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE SET NULL
);

-- Mapping veterinarians to clinics (aligns with ERD)
CREATE TABLE veterinarian_clinic (
    vetclinic_id INT AUTO_INCREMENT PRIMARY KEY,
    veterinarian_id INT NOT NULL,
    clinic_id INT NOT NULL,
    UNIQUE KEY uq_vet_clinic (veterinarian_id, clinic_id),
    FOREIGN KEY (veterinarian_id) REFERENCES veterinarian(veterinarian_id) ON DELETE CASCADE,
    FOREIGN KEY (clinic_id) REFERENCES clinic(clinic_id) ON DELETE CASCADE
);

-- Pets and ownership
CREATE TABLE pet (
    pet_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    species VARCHAR(50) NOT NULL,
    breed VARCHAR(50),
    gender ENUM('male', 'female', 'unknown') DEFAULT 'unknown',
    birth_date DATE,
    age INT
);

CREATE TABLE pet_owner (
    owner_id INT AUTO_INCREMENT PRIMARY KEY,
    address TEXT,
    user_id INT NOT NULL,
    pet_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
    FOREIGN KEY (pet_id) REFERENCES pet(pet_id) ON DELETE CASCADE
);

-- Appointments tied to both clinic and veterinarian (checked via mapping)
CREATE TABLE appointment (
    appointment_id INT AUTO_INCREMENT PRIMARY KEY,
    datetime DATETIME NOT NULL,
    status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
    pet_id INT NOT NULL,
    clinic_id INT NOT NULL,
    veterinarian_id INT NOT NULL,
    FOREIGN KEY (pet_id) REFERENCES pet(pet_id) ON DELETE CASCADE,
    FOREIGN KEY (clinic_id) REFERENCES clinic(clinic_id) ON DELETE CASCADE,
    FOREIGN KEY (veterinarian_id) REFERENCES veterinarian(veterinarian_id) ON DELETE CASCADE
);

-- Treatment records (one per appointment)
CREATE TABLE treatment_record (
    record_id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE,
    diagnosis TEXT,
    note TEXT,
    appointment_id INT UNIQUE,
    FOREIGN KEY (appointment_id) REFERENCES appointment(appointment_id) ON DELETE SET NULL
);

-- Veterinarian weekly schedules (unique day per veterinarian)
CREATE TABLE veterinarian_schedule (
    schedule_id INT AUTO_INCREMENT PRIMARY KEY,
    day ENUM('monday','tuesday','wednesday','thursday','friday','saturday','sunday') NOT NULL,
    time_start TIME NOT NULL,
    time_end TIME NOT NULL,
    veterinarian_id INT NOT NULL,
    UNIQUE KEY uq_vet_day (veterinarian_id, day),
    FOREIGN KEY (veterinarian_id) REFERENCES veterinarian(veterinarian_id) ON DELETE CASCADE
);

-- Guardrails: ensure appointment clinic matches a veterinarian assignment in veterinarian_clinic
DELIMITER //
CREATE TRIGGER trg_appointment_clinic_match_insert
BEFORE INSERT ON appointment
FOR EACH ROW
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM veterinarian_clinic vc
        WHERE vc.veterinarian_id = NEW.veterinarian_id
          AND vc.clinic_id = NEW.clinic_id
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Veterinarian must be assigned to the selected clinic';
    END IF;
END //

CREATE TRIGGER trg_appointment_clinic_match_update
BEFORE UPDATE ON appointment
FOR EACH ROW
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM veterinarian_clinic vc
        WHERE vc.veterinarian_id = NEW.veterinarian_id
          AND vc.clinic_id = NEW.clinic_id
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Veterinarian must be assigned to the selected clinic';
    END IF;
END //
DELIMITER ;
