DROP TABLE IF EXISTS blocked_time_slots, reservations, equipment, users, laboratories, roles;
USE lems_db;

CREATE TABLE roles (
    role_id   INT         AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE laboratories (
    lab_id   INT          AUTO_INCREMENT PRIMARY KEY,
    lab_name VARCHAR(100) NOT NULL,
    building VARCHAR(100),
    room_no  VARCHAR(20)
);

CREATE TABLE users (
    user_id       INT          AUTO_INCREMENT PRIMARY KEY,
    role_id       INT          NOT NULL,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    email         VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name     VARCHAR(100),
    created_at    DATETIME     DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_role
        FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

CREATE TABLE equipment (
    equipment_id   INT          AUTO_INCREMENT PRIMARY KEY,
    lab_id         INT          NOT NULL,
    equipment_name VARCHAR(100) NOT NULL,
    equipment_code VARCHAR(50)  NOT NULL UNIQUE,
    status         ENUM('available','in_use','maintenance','faulty') DEFAULT 'available',
    description    TEXT,
    CONSTRAINT fk_equipment_lab
        FOREIGN KEY (lab_id) REFERENCES laboratories(lab_id)
);

CREATE TABLE reservations (
    reservation_id INT      AUTO_INCREMENT PRIMARY KEY,
    user_id        INT      NOT NULL,
    equipment_id   INT      NOT NULL,
    start_time     DATETIME NOT NULL,
    end_time       DATETIME NOT NULL,
    status         ENUM('active','cancelled','completed') DEFAULT 'active',
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_res_user
        FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_res_equipment
        FOREIGN KEY (equipment_id) REFERENCES equipment(equipment_id)
);

CREATE TABLE blocked_time_slots (
    block_id     INT          AUTO_INCREMENT PRIMARY KEY,
    equipment_id INT          NOT NULL,
    start_time   DATETIME     NOT NULL,
    end_time     DATETIME     NOT NULL,
    reason       VARCHAR(255),
    CONSTRAINT fk_block_equipment
        FOREIGN KEY (equipment_id) REFERENCES equipment(equipment_id)
);

INSERT INTO roles (role_name) VALUES
    ('student'), ('assistant'), ('technician'), ('admin');

INSERT INTO laboratories (lab_name, building, room_no) VALUES
    ('Elektronik Lab', 'Mühendislik Binası', 'B-201'),
    ('Bilgisayar Lab',  'Mühendislik Binası', 'B-105');

INSERT INTO equipment (lab_id, equipment_name, equipment_code, status) VALUES
    (1, 'Osiloskop',        'OSC-001',  'available'),
    (1, 'Osiloskop',        'OSC-002',  'available'),
    (1, 'Multimetre',       'MULT-001', 'available'),
    (2, 'Raspberry Pi Kit', 'RPI-001',  'available'),
    (2, 'Arduino Kit',      'ARD-001',  'available'),
    (2, 'Arduino Kit',      'ARD-002',  'maintenance');

INSERT INTO users (role_id, username, email, password_hash, full_name) VALUES
    (1, 'ofaruk',  'ofaruk@uni.edu',  'test_hash_1', 'Ömer Faruk Akdağ'),
    (1, 'akg',     'akg@uni.edu',     'test_hash_2', 'Abdullah Kerem Göktaş'),
    (4, 'admin',   'admin@uni.edu',   'test_hash_3', 'Sistem Admin');

INSERT INTO blocked_time_slots (equipment_id, start_time, end_time, reason) VALUES
    (1, '2025-04-14 09:00:00', '2025-04-14 11:00:00', 'EE301 Ders Saati'),
    (2, '2025-04-14 09:00:00', '2025-04-14 11:00:00', 'EE301 Ders Saati');

SHOW TABLES;