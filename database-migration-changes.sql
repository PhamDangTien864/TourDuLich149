-- =====================================================
-- DATABASE MIGRATION CHANGES
-- File này chứa tất cả các thay đổi cần thêm vào viettravelluxury.sql
-- để đồng bộ với Prisma schema và codebase hiện tại
-- 
-- Lưu ý: Chạy file này SAU KHI đã import file viettravelluxury.sql gốc
-- =====================================================

USE travel_booking_db;

-- =====================================================
-- 1. CREATE ENUM TABLES
-- 
-- Prisma schema sử dụng ENUM cho các trường sau:
-- - BookingStatus: PENDING, AWAITING_PAYMENT, DEPOSIT_PAID, CONFIRMED, COMPLETED, CANCELLED, REFUNDED
-- - PaymentStatus: PENDING, COMPLETED, FAILED, REFUNDED
-- - PaymentType: FULL, DEPOSIT, REMAINING
-- - ActorType: ADMIN, CUSTOMER, SYSTEM
-- 
-- MySQL không hỗ trợ ENUM như Prisma, nên chúng ta tạo bảng lookup
-- =====================================================

-- Booking Status Enum
CREATE TABLE IF NOT EXISTS booking_status_enum (
    status VARCHAR(50) PRIMARY KEY
);
INSERT IGNORE INTO booking_status_enum (status) VALUES 
('PENDING'), ('AWAITING_PAYMENT'), ('DEPOSIT_PAID'), 
('CONFIRMED'), ('COMPLETED'), ('CANCELLED'), ('REFUNDED');

-- Payment Status Enum
CREATE TABLE IF NOT EXISTS payment_status_enum (
    status VARCHAR(50) PRIMARY KEY
);
INSERT IGNORE INTO payment_status_enum (status) VALUES 
('PENDING'), ('COMPLETED'), ('FAILED'), ('REFUNDED');

-- Payment Type Enum
CREATE TABLE IF NOT EXISTS payment_type_enum (
    type VARCHAR(50) PRIMARY KEY
);
INSERT IGNORE INTO payment_type_enum (type) VALUES 
('FULL'), ('DEPOSIT'), ('REMAINING');

-- Actor Type Enum
CREATE TABLE IF NOT EXISTS actor_type_enum (
    type VARCHAR(50) PRIMARY KEY
);
INSERT IGNORE INTO actor_type_enum (type) VALUES 
('ADMIN'), ('CUSTOMER'), ('SYSTEM');

-- =====================================================
-- 2. CREATE NEW TABLES
-- 
-- Các bảng này được thêm vào để hỗ trợ booking flow mới
-- =====================================================

-- =====================================================
-- BOOKING PASSENGERS
-- Lưu thông tin hành khách cho mỗi booking
-- Được sử dụng trong multi-step booking flow
-- =====================================================
CREATE TABLE IF NOT EXISTS booking_passengers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    gender VARCHAR(10) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    is_child BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    INDEX idx_booking_passengers_booking (booking_id)
);

-- =====================================================
-- BOOKING PAYMENTS
-- Lưu lịch sử thanh toán cho booking
-- Hỗ trợ tracking các khoản thanh toán (deposit, remaining)
-- =====================================================
CREATE TABLE IF NOT EXISTS booking_payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    amount BIGINT NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'PENDING',
    payment_type VARCHAR(50) DEFAULT 'FULL',
    transaction_id VARCHAR(255),
    paid_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    INDEX idx_booking_payments_booking (booking_id),
    INDEX idx_booking_payments_status (payment_status),
    INDEX idx_booking_payments_booking_status (booking_id, payment_status),
    INDEX idx_booking_payments_transaction (transaction_id),
    INDEX idx_booking_payments_created (created_at),
    INDEX idx_booking_payments_paid (paid_at)
);

-- =====================================================
-- BOOKING LOGS
-- Lưu lịch sử thay đổi trạng thái booking
-- Hỗ trợ audit trail và debugging
-- =====================================================
CREATE TABLE IF NOT EXISTS booking_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    status_from VARCHAR(50),
    status_to VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    actor_id INT,
    actor_type VARCHAR(50),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    INDEX idx_booking_logs_booking (booking_id),
    INDEX idx_booking_logs_action (action),
    INDEX idx_booking_logs_actor_type (actor_type),
    INDEX idx_booking_logs_created_at (created_at),
    INDEX idx_booking_logs_booking_created (booking_id, created_at),
    INDEX idx_booking_logs_actor_created (actor_type, created_at)
);

-- =====================================================
-- TOUR ITINERARY
-- Lịch trình chi tiết theo ngày cho tour
-- =====================================================
CREATE TABLE IF NOT EXISTS tour_itinerary (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tour_id INT NOT NULL,
    day_number INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    activities TEXT,
    meals VARCHAR(100),
    accommodation VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE,
    INDEX idx_tour_itinerary_tour (tour_id)
);

-- =====================================================
-- TOUR INCLUSIONS
-- Dịch vụ bao gồm trong tour
-- =====================================================
CREATE TABLE IF NOT EXISTS tour_inclusions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tour_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE,
    INDEX idx_tour_inclusions_tour (tour_id)
);

-- =====================================================
-- TOUR EXCLUSIONS
-- Dịch vụ không bao gồm trong tour
-- =====================================================
CREATE TABLE IF NOT EXISTS tour_exclusions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tour_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE,
    INDEX idx_tour_exclusions_tour (tour_id)
);

-- =====================================================
-- DEPARTURE SCHEDULES
-- Lịch khởi hành cho tour
-- Hỗ trợ booking theo ngày cụ thể
-- =====================================================
CREATE TABLE IF NOT EXISTS departure_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tour_id INT NOT NULL,
    departure_date DATETIME NOT NULL,
    available_slots INT DEFAULT 20,
    total_slots INT DEFAULT 20,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE,
    INDEX idx_departure_schedules_tour (tour_id),
    INDEX idx_departure_schedules_date (departure_date),
    INDEX idx_departure_schedules_tour_date (tour_id, departure_date),
    INDEX idx_departure_schedules_active (is_active),
    INDEX idx_departure_schedules_slots (available_slots),
    INDEX idx_departure_schedules_date_active (departure_date, is_active)
);

-- =====================================================
-- CANCELLATION POLICIES
-- Chính sách hủy tour
-- =====================================================
CREATE TABLE IF NOT EXISTS cancellation_policies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tour_id INT,
    days_before INT NOT NULL,
    refund_percent INT NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE,
    INDEX idx_cancellation_policies_tour (tour_id)
);

-- =====================================================
-- AUDIT LOGS
-- Log hệ thống cho audit trail
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT,
    old_values TEXT,
    new_values TEXT,
    ip_address VARCHAR(50),
    user_agent VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_logs_user (user_id),
    INDEX idx_audit_logs_entity (entity_type, entity_id),
    INDEX idx_audit_logs_created (created_at),
    INDEX idx_audit_logs_action_created (action, created_at),
    INDEX idx_audit_logs_entity_created (entity_type, created_at)
);

-- =====================================================
-- 3. ALTER EXISTING TABLES
-- 
-- Cập nhật các bảng hiện có để đồng bộ với Prisma schema
-- =====================================================

-- =====================================================
-- UPDATE BOOKINGS TABLE
-- Thêm các cột mới cho booking flow cải tiến
-- =====================================================
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS cancellation_policy_id INT AFTER departure_schedule_id,
ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(255) UNIQUE AFTER version,
ADD COLUMN IF NOT EXISTS version INT DEFAULT 0 AFTER is_deleted,
ADD COLUMN IF NOT EXISTS total_passengers INT DEFAULT 1 AFTER version,
ADD COLUMN IF NOT EXISTS adults_count INT DEFAULT 1 AFTER total_passengers,
ADD COLUMN IF NOT EXISTS children_count INT DEFAULT 0 AFTER adults_count,
ADD COLUMN IF NOT EXISTS special_requests TEXT AFTER children_count,
ADD COLUMN IF NOT EXISTS pickup_location VARCHAR(255) AFTER special_requests,
ADD COLUMN IF NOT EXISTS dropoff_location VARCHAR(255) AFTER pickup_location;

-- Thêm indexes cho bookings
ALTER TABLE bookings
ADD INDEX IF NOT EXISTS idx_bookings_account_status (account_id, status),
ADD INDEX IF NOT EXISTS idx_bookings_tour_status (tour_id, status),
ADD INDEX IF NOT EXISTS idx_bookings_date_range (start_date, end_date),
ADD INDEX IF NOT EXISTS idx_bookings_created_at (created_at),
ADD INDEX IF NOT EXISTS idx_bookings_customer_status (customer_id, status),
ADD INDEX IF NOT EXISTS idx_bookings_created_status (created_at, status),
ADD INDEX IF NOT EXISTS idx_bookings_deleted (is_deleted);

-- Thêm foreign keys cho bookings
ALTER TABLE bookings
ADD CONSTRAINT IF NOT EXISTS fk_bookings_cancellation_policy 
    FOREIGN KEY (cancellation_policy_id) REFERENCES cancellation_policies(id) ON DELETE SET NULL;

-- =====================================================
-- UPDATE ACCOUNTS TABLE
-- Thêm các cột cho 2FA và social login
-- =====================================================
ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) AFTER facebook_id,
ADD COLUMN IF NOT EXISTS facebook_id VARCHAR(255) AFTER avatar_url,
ADD COLUMN IF NOT EXISTS avatar_url TEXT AFTER backup_codes,
ADD COLUMN IF NOT EXISTS otp_secret VARCHAR(255) AFTER otp_enabled,
ADD COLUMN IF NOT EXISTS otp_enabled BOOLEAN DEFAULT FALSE AFTER is_verified,
ADD COLUMN IF NOT EXISTS backup_codes TEXT AFTER otp_secret;

-- Thêm indexes cho accounts
ALTER TABLE accounts
ADD INDEX IF NOT EXISTS idx_accounts_deleted (is_deleted),
ADD INDEX IF NOT EXISTS idx_accounts_verified (is_verified),
ADD INDEX IF NOT EXISTS idx_accounts_created (created_at);

-- =====================================================
-- UPDATE TOURS TABLE
-- Thêm các cột bổ sung cho tour
-- =====================================================
ALTER TABLE tours
ADD COLUMN IF NOT EXISTS pickup_location VARCHAR(255) AFTER dropoff_location,
ADD COLUMN IF NOT EXISTS dropoff_location VARCHAR(255) AFTER map_url,
ADD COLUMN IF NOT EXISTS difficulty_level VARCHAR(50) AFTER dropoff_location,
ADD COLUMN IF NOT EXISTS min_age INT DEFAULT 0 AFTER difficulty_level,
ADD COLUMN IF NOT EXISTS max_age INT AFTER min_age;

-- Thêm indexes cho tours
ALTER TABLE tours
ADD INDEX IF NOT EXISTS idx_tours_category_active (category_id, is_active),
ADD INDEX IF NOT EXISTS idx_tours_province_active (province_id, is_active),
ADD INDEX IF NOT EXISTS idx_tours_location (location_name),
ADD INDEX IF NOT EXISTS idx_tours_created (created_at),
ADD INDEX IF NOT EXISTS idx_tours_active_created (is_active, created_at);

-- =====================================================
-- UPDATE TRANSACTIONS TABLE
-- Thêm các cột VNPay
-- =====================================================
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS vnp_txn_ref VARCHAR(255) AFTER vnp_response_code,
ADD COLUMN IF NOT EXISTS vnp_transaction_no VARCHAR(255) AFTER vnp_txn_ref,
ADD COLUMN IF NOT EXISTS vnp_bank_code VARCHAR(50) AFTER vnp_transaction_no,
ADD COLUMN IF NOT EXISTS vnp_response_code VARCHAR(10) AFTER vnp_bank_code;

-- Thêm indexes cho transactions
ALTER TABLE transactions
ADD INDEX IF NOT EXISTS idx_transactions_status (payment_status),
ADD INDEX IF NOT EXISTS idx_transactions_created (created_at),
ADD INDEX IF NOT EXISTS idx_transactions_status_created (payment_status, created_at),
ADD INDEX IF NOT EXISTS idx_transactions_account_created (account_id, created_at);

-- =====================================================
-- 4. DATA MIGRATION (NẾU CẦN)
-- 
-- Nếu có dữ liệu cũ, có thể cần migrate sang cấu trúc mới
-- =====================================================

-- Ví dụ: Cập nhật status từ lowercase sang uppercase nếu cần
-- UPDATE bookings SET status = UPPER(status) WHERE status IN ('pending', 'confirmed', 'cancelled');

-- =====================================================
-- 5. VERIFICATION QUERIES
-- 
-- Run các query này để verify migration thành công
-- =====================================================

-- Check các bảng mới được tạo
SELECT 'booking_passengers' as table_name, COUNT(*) as row_count FROM booking_passengers
UNION ALL
SELECT 'booking_payments', COUNT(*) FROM booking_payments
UNION ALL
SELECT 'booking_logs', COUNT(*) FROM booking_logs
UNION ALL
SELECT 'tour_itinerary', COUNT(*) FROM tour_itinerary
UNION ALL
SELECT 'tour_inclusions', COUNT(*) FROM tour_inclusions
UNION ALL
SELECT 'tour_exclusions', COUNT(*) FROM tour_exclusions
UNION ALL
SELECT 'departure_schedules', COUNT(*) FROM departure_schedules
UNION ALL
SELECT 'cancellation_policies', COUNT(*) FROM cancellation_policies
UNION ALL
SELECT 'audit_logs', COUNT(*) FROM audit_logs;

-- Check các cột mới được thêm
SELECT COLUMN_NAME, DATA_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'travel_booking_db' 
AND TABLE_NAME IN ('bookings', 'accounts', 'tours', 'transactions')
AND COLUMN_NAME IN ('cancellation_policy_id', 'idempotency_key', 'version', 'total_passengers', 
                     'adults_count', 'children_count', 'special_requests', 'pickup_location', 
                     'dropoff_location', 'google_id', 'facebook_id', 'avatar_url', 'otp_secret', 
                     'otp_enabled', 'backup_codes', 'difficulty_level', 'min_age', 'max_age',
                     'vnp_txn_ref', 'vnp_transaction_no', 'vnp_bank_code', 'vnp_response_code')
ORDER BY TABLE_NAME, COLUMN_NAME;

-- =====================================================
-- END OF MIGRATION
-- =====================================================
