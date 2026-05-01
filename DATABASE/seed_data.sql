USE lems_db;

INSERT INTO roles (role_name) VALUES
    ('student'),
    ('assistant'),
    ('technician'),
    ('admin');

-- Laboratuvarlar
INSERT INTO laboratories (lab_name, building, room_no) VALUES
    ('Elektronik Lab',  'Mühendislik Binası', 'B-201'),
    ('Bilgisayar Lab',  'Mühendislik Binası', 'B-105');

-- Ekipmanlar (quantity ile birden fazla unit desteklenir)
INSERT INTO equipment (lab_id, equipment_name, equipment_code, status, quantity, faulty_count) VALUES
    (1, 'Osiloskop',        'OSC-001',  'available', 2, 0),
    (1, 'Multimetre',       'MULT-001', 'available', 5, 1),
    (2, 'Raspberry Pi Kit', 'RPI-001',  'available', 3, 0),
    (2, 'Arduino Kit',      'ARD-001',  'available', 4, 1);

-- Kullanıcılar (password_hash gerçek uygulamada bcrypt hash olacak)
INSERT INTO users (role_id, username, email, password_hash, full_name) VALUES
    (1, 'ofaruk',  'ofaruk@uni.edu',  'test_hash_1', 'Ömer Faruk Akdağ'),
    (1, 'akg',     'akg@uni.edu',     'test_hash_2', 'Abdullah Kerem Göktaş'),
    (4, 'admin',   'admin@uni.edu',   'test_hash_3', 'Sistem Admin');

-- Engellenen zaman dilimleri (ders saatleri vb.)
INSERT INTO blocked_time_slots (equipment_id, start_time, end_time, reason) VALUES
    (1, '2025-04-14 09:00:00', '2025-04-14 11:00:00', 'EE301 Ders Saati'),
    (2, '2025-04-14 09:00:00', '2025-04-14 11:00:00', 'EE301 Ders Saati');

SHOW TABLES;
