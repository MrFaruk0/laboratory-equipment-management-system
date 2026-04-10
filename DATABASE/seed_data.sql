-- ============================================================
-- seed_data.sql
-- Test / örnek verilerini veritabanına yükler.
-- ÖNCE schema.sql çalıştırılmış olmalıdır.
-- ============================================================

USE lems_db;

-- Roller
INSERT INTO roles (role_name) VALUES
    ('student'),
    ('assistant'),
    ('technician'),
    ('admin');

-- Laboratuvarlar
INSERT INTO laboratories (lab_name, building, room_no) VALUES
    ('Elektronik Lab',  'Mühendislik Binası', 'B-201'),
    ('Bilgisayar Lab',  'Mühendislik Binası', 'B-105');

-- Ekipmanlar (aynı türden birden fazla unit desteklenir — equipment_code unique ID'dir)
INSERT INTO equipment (lab_id, equipment_name, equipment_code, status) VALUES
    (1, 'Osiloskop',        'OSC-001',  'available'),
    (1, 'Osiloskop',        'OSC-002',  'available'),
    (1, 'Multimetre',       'MULT-001', 'available'),
    (2, 'Raspberry Pi Kit', 'RPI-001',  'available'),
    (2, 'Arduino Kit',      'ARD-001',  'available'),
    (2, 'Arduino Kit',      'ARD-002',  'maintenance');

-- Kullanıcılar (password_hash gerçek uygulamada bcrypt hash olacak)
INSERT INTO users (role_id, username, email, password_hash, full_name) VALUES
    (1, 'ofaruk',  'ofaruk@uni.edu',  'test_hash_1', 'Ömer Faruk Akdağ'),
    (1, 'akg',     'akg@uni.edu',     'test_hash_2', 'Abdullah Kerem Göktaş'),
    (4, 'admin',   'admin@uni.edu',   'test_hash_3', 'Sistem Admin');

-- Engellenen zaman dilimleri (ders saatleri vb.)
INSERT INTO blocked_time_slots (equipment_id, start_time, end_time, reason) VALUES
    (1, '2025-04-14 09:00:00', '2025-04-14 11:00:00', 'EE301 Ders Saati'),
    (2, '2025-04-14 09:00:00', '2025-04-14 11:00:00', 'EE301 Ders Saati');