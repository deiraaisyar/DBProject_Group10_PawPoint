CREATE TABLE User (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(300) NOT NULL,
    role ENUM('admin', 'vet', 'pet_owner') NOT NULL,
    email VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE PetOwner (
    owner_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address VARCHAR(300),
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE RESTRICT,
    CHECK (phone REGEXP '^[0-9+-]{8,15}$')
);

CREATE TABLE Veterinarian (
    vet_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    specialization VARCHAR(100),
    phone VARCHAR(20),
    schedule VARCHAR(300),
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE RESTRICT,
    CHECK (phone REGEXP '^[0-9+-]{8,15}$')
);


CREATE TABLE Clinic (
    clinic_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(300) NOT NULL,
    phone VARCHAR(20),
    CHECK (phone REGEXP '^[0-9+-]{8,15}$')
);


CREATE TABLE Pet (
    pet_id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    species VARCHAR(50),
    breed VARCHAR(50),
    age INT,
    gender ENUM('Male', 'Female', 'Unknown') DEFAULT 'Unknown',
    FOREIGN KEY (owner_id) REFERENCES PetOwner(owner_id) ON DELETE CASCADE
);


CREATE TABLE Appointment (
    appointment_id INT AUTO_INCREMENT PRIMARY KEY,
    pet_id INT NOT NULL,
    vet_id INT NOT NULL,
    clinic_id INT NOT NULL,
    appointment_date DATETIME NOT NULL,
    notes TEXT,
    status ENUM('Scheduled', 'Completed', 'Cancelled', 'Follow-up Needed') DEFAULT 'Scheduled',
    FOREIGN KEY (pet_id) REFERENCES Pet(pet_id) ON DELETE CASCADE,
    FOREIGN KEY (vet_id) REFERENCES Veterinarian(vet_id) ON DELETE CASCADE,
    FOREIGN KEY (clinic_id) REFERENCES Clinic(clinic_id) ON DELETE CASCADE
);


CREATE TABLE TreatmentRecord (
    record_id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_id INT NOT NULL,
    diagnosis TEXT,
    treatment TEXT,
    prescription TEXT,
    treatment_date DATE NOT NULL DEFAULT (CURRENT_DATE),
    FOREIGN KEY (appointment_id) REFERENCES Appointment(appointment_id) ON DELETE CASCADE
);
