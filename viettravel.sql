-- =====================================================
-- 0. DỌN DẸP VÀ KHỞI TẠO DATABASE
-- =====================================================
SET FOREIGN_KEY_CHECKS = 0;
DROP DATABASE IF EXISTS travel_booking_db;
CREATE DATABASE travel_booking_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE travel_booking_db;
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 1. TẠO CÁC BẢNG (THỨ TỰ CHUẨN TRÁNH LỖI KHÓA NGOẠ)
-- =====================================================

-- Bảng Ảnh
CREATE TABLE images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image_url VARCHAR(500) NOT NULL,
    sort_order INT DEFAULT 0,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng Tỉnh thành
CREATE TABLE provinces (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image_id INT,
    province_code VARCHAR(50) NOT NULL UNIQUE,
    province_name VARCHAR(100) NOT NULL,
    note VARCHAR(100),
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE SET NULL
);

-- Bảng Danh mục Tour
CREATE TABLE tour_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    note VARCHAR(100),
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng Quyền (Roles)
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(200),
    permissions TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng Khách hàng (Dùng cho thông tin người đi tour)
CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    identity_card VARCHAR(50),
    is_male BOOLEAN DEFAULT TRUE,
    phone_number VARCHAR(50) NOT NULL,
    address VARCHAR(255),
    birth_date DATE,
    email VARCHAR(100),
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng Tài khoản (Dùng cho Đăng nhập)
CREATE TABLE accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    birth_date DATE,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role_id INT DEFAULT 2,
    is_deleted BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
);

-- Bảng Tours
CREATE TABLE tours (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    province_id INT,
    location_name VARCHAR(100),
    price BIGINT NOT NULL,
    category_id INT,
    description TEXT,
    sub_title VARCHAR(255),
    max_slots INT DEFAULT 20,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES tour_categories(id) ON DELETE SET NULL,
    FOREIGN KEY (province_id) REFERENCES provinces(id) ON DELETE SET NULL
);

-- Bảng Ảnh cho Tour
CREATE TABLE tour_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tour_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE
);

-- Bảng Đặt tour (Bookings)
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    tour_id INT NOT NULL,
    account_id INT NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    total_amount BIGINT NOT NULL,
    paid_amount BIGINT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending',
    is_confirmed BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE RESTRICT,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE RESTRICT
);

-- Bảng Khuyến mãi
CREATE TABLE promotions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(50),
    discount_value BIGINT NOT NULL,
    min_amount BIGINT DEFAULT 0,
    used_count INT DEFAULT 0,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng Giao dịch (Transactions)
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    account_id INT NOT NULL,
    promotion_id INT,
    amount BIGINT DEFAULT 0,
    transaction_type VARCHAR(50) DEFAULT 'payment',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (account_id) REFERENCES accounts(id),
    FOREIGN KEY (promotion_id) REFERENCES promotions(id)
);

-- Bảng Đánh giá (Reviews)
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tour_id INT NOT NULL,
    account_id INT NOT NULL,
    rating INT,
    comment TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

-- Bảng Wishlist
CREATE TABLE wishlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT NOT NULL,
    tour_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE
);

-- =====================================================
-- 2. NẠP DỮ LIỆU MẪU (THỨ TỰ CHA TRƯỚC CON SAU)
-- =====================================================

-- Roles
INSERT INTO roles (role_name, description, permissions) VALUES
('admin', 'Quản trị viên toàn quyền', '{"all": true}'),
('customer', 'Khách hàng', '{"bookings": ["read", "create"]}');

-- Accounts (Dùng account_id 2 làm customer chính để test)
INSERT INTO accounts (username, email, password, full_name, phone_number, role_id, is_verified) VALUES
('admin', 'admin@viettravel.vn', '$2a$10$abcdefgh...', 'Quản trị viên', '0862640720', 1, true),
('customer', 'customer@viettravel.vn', '$2a$10$abcdefgh...', 'Khách hàng mẫu', '0862640721', 2, true);

-- Provinces
INSERT INTO provinces (province_code, province_name) VALUES
('HN', 'Hà Nội'), ('HCM', 'Hồ Chí Minh'), ('DN', 'Đà Nẵng'), ('HP', 'Hải Phòng'), ('QN', 'Quảng Ninh');

-- Categories
INSERT INTO tour_categories (category_name) VALUES
('Domestic'), ('International'), ('Adventure'), ('Luxury');

-- Tours (Đã fix lỗi thiếu cột max_slots cho Hạ Long)
INSERT INTO tours (title, location_name, price, category_id, province_id, max_slots, sub_title, description) VALUES
('Hà Nội City Tour', 'Hà Nội', 1500000, 1, 1, 20, 'Khám phá thủ đô', 'Tour trong ngày...'),
('Sài Gòn Adventure', 'TP. Hồ Chí Minh', 1800000, 2, 2, 25, 'Sài Gòn không ngủ', 'Trải nghiệm phố thị...'),
('Hạ Long Bay Tour', 'TP. Hạ Long', 2000000, 4, 5, 30, 'Vịnh di sản', 'Du thuyền 5 sao...');

-- Customers (Tạo khách hàng để Bookings có cái mà tham chiếu)
INSERT INTO customers (full_name, phone_number, email) VALUES 
('Nguyễn Văn A', '0912345678', 'vanta@gmail.com'),
('Trần Thị B', '0987654321', 'thib@gmail.com');

-- Bookings (Dùng account_id = 2 là tài khoản customer đã tạo ở trên)
INSERT INTO bookings (customer_id, tour_id, account_id, start_date, end_date, total_amount, status) VALUES
(1, 1, 2, '2024-06-01', '2024-06-02', 1500000, 'confirmed'),
(2, 3, 2, '2024-07-10', '2024-07-12', 2000000, 'pending');

-- Reviews (Đã fix lỗi dư giá trị)
INSERT INTO reviews (tour_id, account_id, rating, comment) VALUES
(1, 2, 5, 'Tour rất tuyệt vời!'),
(3, 2, 4, 'Cảnh đẹp nhưng hơi đông khách.');

-- =====================================================
-- 3. LOGIC KỸ THUẬT (TRIGGER, VIEW, PROCEDURE)
-- =====================================================

-- Trigger cập nhật số lần dùng khuyến mãi
DELIMITER //
CREATE TRIGGER update_promotion_usage AFTER INSERT ON transactions FOR EACH ROW
BEGIN
    IF NEW.promotion_id IS NOT NULL THEN
        UPDATE promotions SET used_count = used_count + 1 WHERE id = NEW.promotion_id;
    END IF;
END//
DELIMITER ;

-- View xem danh sách Tour đang hoạt động
CREATE VIEW active_tours_view AS
SELECT t.id, t.title, t.price, tc.category_name, p.province_name
FROM tours t
LEFT JOIN tour_categories tc ON t.category_id = tc.id
LEFT JOIN provinces p ON t.province_id = p.id
WHERE t.is_active = TRUE AND t.is_deleted = FALSE;

-- View chi tiết Booking
CREATE VIEW booking_details_view AS
SELECT b.id, b.total_amount, b.status, c.full_name as customer_name, t.title as tour_title, a.username as booked_by
FROM bookings b
JOIN customers c ON b.customer_id = c.id
JOIN tours t ON b.tour_id = t.id
JOIN accounts a ON b.account_id = a.id
WHERE b.is_deleted = FALSE;

-- Procedure lấy top Tour doanh thu cao nhất
DELIMITER //
CREATE PROCEDURE GetTopTours(IN limit_count INT)
BEGIN
    SELECT t.title, SUM(b.total_amount) as revenue
    FROM tours t
    JOIN bookings b ON t.id = b.tour_id
    GROUP BY t.id ORDER BY revenue DESC LIMIT limit_count;
END//
DELIMITER ;

-- Thiết lập tiếng Việt
ALTER DATABASE travel_booking_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;