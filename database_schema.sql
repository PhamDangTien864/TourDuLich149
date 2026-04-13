-- VietTravel Database Schema
-- Generated from Prisma Schema
-- Compatible with MySQL

-- Drop existing tables (if needed)
-- DROP TABLE IF EXISTS images;
-- DROP TABLE IF EXISTS provinces;
-- DROP TABLE IF EXISTS tour_categories;
-- DROP TABLE IF EXISTS tours;
-- DROP TABLE IF EXISTS customers;
-- DROP TABLE IF EXISTS accounts;
-- DROP TABLE IF EXISTS bookings;
-- DROP TABLE IF EXISTS transactions;
-- DROP TABLE IF EXISTS chatbot_logs;
-- DROP TABLE IF EXISTS reviews;
-- DROP TABLE IF EXISTS tour_schedules;
-- DROP TABLE IF EXISTS tour_includes;
-- DROP TABLE IF EXISTS roles;
-- DROP TABLE IF EXISTS wishlist;
-- DROP TABLE IF EXISTS promotions;

-- Create images table
CREATE TABLE images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image_url VARCHAR(500) NOT NULL,
    sort_order INT,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Create provinces table
CREATE TABLE provinces (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image_id INT,
    province_code VARCHAR(50) NOT NULL,
    province_name VARCHAR(50) NOT NULL,
    note VARCHAR(50),
    is_deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (image_id) REFERENCES images(id)
);

-- Create tour_categories table
CREATE TABLE tour_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(50) NOT NULL,
    note VARCHAR(50)
);

-- Create tours table
CREATE TABLE tours (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    location_name VARCHAR(50) NOT NULL,
    price BIGINT NOT NULL,
    category_id INT,
    description TEXT,
    sub_title VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (category_id) REFERENCES tour_categories(id)
);

-- Create customers table
CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(50) NOT NULL,
    identity_card VARCHAR(50),
    is_male BOOLEAN DEFAULT TRUE,
    phone_number VARCHAR(50) NOT NULL,
    address VARCHAR(100),
    birth_date DATE,
    note VARCHAR(100),
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Create accounts table
CREATE TABLE accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(50) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    birth_date DATE,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    role INT DEFAULT 2 COMMENT '1=admin, 2=user',
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Create bookings table
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    tour_id INT NOT NULL,
    account_id INT NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    total_amount BIGINT NOT NULL,
    paid_amount BIGINT DEFAULT 0,
    is_confirmed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (tour_id) REFERENCES tours(id),
    FOREIGN KEY (account_id) REFERENCES accounts(id)
);

-- Create transactions table
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    account_id INT NOT NULL,
    service_id INT,
    quantity INT,
    transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    promotion_id INT,
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (account_id) REFERENCES accounts(id)
);

-- Create chatbot_logs table
CREATE TABLE chatbot_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT,
    user_query TEXT,
    bot_response TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(id)
);

-- Create reviews table
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tour_id INT NOT NULL,
    account_id INT NOT NULL,
    rating INT COMMENT '1-5 stars',
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (tour_id) REFERENCES tours(id),
    FOREIGN KEY (account_id) REFERENCES accounts(id)
);

-- Create tour_schedules table
CREATE TABLE tour_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tour_id INT NOT NULL,
    day_number INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    meal_included BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (tour_id) REFERENCES tours(id)
);

-- Create tour_includes table
CREATE TABLE tour_includes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tour_id INT NOT NULL,
    include_type VARCHAR(50) COMMENT 'transport', 'hotel', 'meal', 'guide', 'insurance',
    title VARCHAR(100) NOT NULL,
    description TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (tour_id) REFERENCES tours(id)
);

-- Create roles table
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(200)
);

-- Create wishlist table
CREATE TABLE wishlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT NOT NULL,
    tour_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(id),
    FOREIGN KEY (tour_id) REFERENCES tours(id),
    UNIQUE KEY (account_id, tour_id)
);

-- Create promotions table
CREATE TABLE promotions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    discount_type VARCHAR(50) COMMENT 'percentage', 'fixed',
    discount_value BIGINT NOT NULL,
    min_amount BIGINT,
    max_uses INT,
    used_count INT DEFAULT 0,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default roles
INSERT INTO roles (role_name, description) VALUES 
('admin', 'Quản trị viên toàn quyền'),
('user', 'Nhân viên');

-- Insert sample admin account (password: admin123)
INSERT INTO accounts (full_name, phone_number, username, password, role) VALUES 
('Admin VietTravel', '0862640720', 'admin', '$2b$12$K5L8v9X5Qz7t8x9D3b2W5L', 1);

-- Insert sample employee account (password: huyen123)
INSERT INTO accounts (full_name, phone_number, username, password, role) VALUES 
('Nhân viên Huyền', '0862640721', 'huyen', '$2b$12$K5L8v9X5Qz7t8x9D3b2W5L', 2);
