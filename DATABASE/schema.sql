CREATE DATABASE IF NOT EXISTS lems_db;
USE lems_db;

DROP TABLE IF EXISTS blocked_time_slots, reservations, equipment, users, laboratories, roles;

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
    quantity       INT          DEFAULT 1,
    faulty_count   INT          DEFAULT 0,
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

SHOW TABLES;