CREATE DATABASE IF NOT EXISTS pawpoint;
USE pawpoint;

CREATE TABLE user (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
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
    FOREIGN KEY (user_id) REFERENCES user(user_id)
        ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES role(role_id)
        ON DELETE CASCADE
);

CREATE TABLE pet (
    pet_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    species VARCHAR(50),
    breed VARCHAR(50),
    gender ENUM('male', 'female', 'unknown'),
    birth_date DATE,
    age INT
);

CREATE TABLE pet_owner (
    owner_id INT AUTO_INCREMENT PRIMARY KEY,
    address TEXT,
    user_id INT NOT NULL,
    pet_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(user_id)
        ON DELETE CASCADE,
    FOREIGN KEY (pet_id) REFERENCES pet(pet_id)
        ON DELETE CASCADE
);

CREATE TABLE veterinarian (
    veterinarian_id INT AUTO_INCREMENT PRIMARY KEY,
    license_no VARCHAR(100) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(user_id)
        ON DELETE CASCADE
);

CREATE TABLE clinic (
    clinic_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    phone_no VARCHAR(20),
    address TEXT
);

CREATE TABLE appointment (
    appointment_id INT AUTO_INCREMENT PRIMARY KEY,
    datetime DATETIME NOT NULL,
    status ENUM('scheduled', 'completed', 'cancelled'),
    pet_id INT NOT NULL,
    clinic_id INT NOT NULL,
    veterinarian_id INT NOT NULL,
    FOREIGN KEY (pet_id) REFERENCES pet(pet_id)
        ON DELETE CASCADE,
    FOREIGN KEY (clinic_id) REFERENCES clinic(clinic_id)
        ON DELETE CASCADE,
    FOREIGN KEY (veterinarian_id) REFERENCES veterinarian(veterinarian_id)
        ON DELETE CASCADE
);

CREATE TABLE treatment_record (
    record_id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE,
    diagnosis TEXT,
    note TEXT,
    appointment_id INT NULL,
    UNIQUE (appointment_id),
    FOREIGN KEY (appointment_id) REFERENCES appointment(appointment_id)
        ON DELETE SET NULL
);

CREATE TABLE veterinarian_schedule (
    schedule_id INT AUTO_INCREMENT PRIMARY KEY,
    day ENUM(
        'monday', 'tuesday', 'wednesday',
        'thursday', 'friday', 'saturday', 'sunday'
    ),
    time_start TIME,
    time_end TIME,
    veterinarian_id INT NOT NULL,
    FOREIGN KEY (veterinarian_id) REFERENCES veterinarian(veterinarian_id)
        ON DELETE CASCADE
);
