-- Wallistan Store Database Schema
-- Run: mysql -u root < database/schema.sql

CREATE DATABASE IF NOT EXISTS wallistan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE wallistan;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS order_notes;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS product_reviews;
DROP TABLE IF EXISTS product_variations;
DROP TABLE IF EXISTS product_options;
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS coupons;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE admins (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE categories (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    tagline TEXT,
    image VARCHAR(500) DEFAULT '/wallistan_logo.png',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE products (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    tagline TEXT,
    category_id INT UNSIGNED NOT NULL,
    product_type ENUM('simple', 'variable') NOT NULL DEFAULT 'simple',
    base_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
    compare_at_price DECIMAL(12, 2) DEFAULT NULL,
    description TEXT,
    bullets JSON DEFAULT NULL,
    faq JSON DEFAULT NULL,
    rating DECIMAL(3, 2) NOT NULL DEFAULT 0,
    review_count INT UNSIGNED NOT NULL DEFAULT 0,
    stock INT NOT NULL DEFAULT 0,
    featured TINYINT(1) NOT NULL DEFAULT 0,
    on_sale TINYINT(1) NOT NULL DEFAULT 0,
    status ENUM('publish', 'draft') NOT NULL DEFAULT 'publish',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    INDEX idx_category (category_id),
    INDEX idx_status (status)
) ENGINE=InnoDB;

CREATE TABLE product_images (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id INT UNSIGNED NOT NULL,
    url VARCHAR(500) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product (product_id)
) ENGINE=InnoDB;

CREATE TABLE product_options (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id INT UNSIGNED NOT NULL,
    option_key VARCHAR(100) NOT NULL,
    label VARCHAR(255) NOT NULL,
    option_type ENUM('select', 'radio', 'text', 'textarea', 'color', 'file', 'dimensions') NOT NULL DEFAULT 'select',
    required TINYINT(1) NOT NULL DEFAULT 0,
    options_json JSON DEFAULT NULL,
    price_delta DECIMAL(12, 2) DEFAULT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product (product_id)
) ENGINE=InnoDB;

CREATE TABLE product_variations (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id INT UNSIGNED NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    regular_price DECIMAL(12, 2) DEFAULT NULL,
    image VARCHAR(500) DEFAULT NULL,
    attributes JSON NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    in_stock TINYINT(1) NOT NULL DEFAULT 1,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product (product_id)
) ENGINE=InnoDB;

CREATE TABLE product_reviews (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id INT UNSIGNED NOT NULL,
    author VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL DEFAULT '',
    rating TINYINT UNSIGNED NOT NULL DEFAULT 5,
    review_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE coupons (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    label VARCHAR(255) NOT NULL,
    percent_off DECIMAL(5, 2) DEFAULT NULL,
    amount_off DECIMAL(12, 2) DEFAULT NULL,
    min_subtotal DECIMAL(12, 2) DEFAULT NULL,
    active TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB;

CREATE TABLE orders (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(20) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'processing',
    payment_method VARCHAR(50) NOT NULL,
    payment_method_title VARCHAR(100) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    billing_first_name VARCHAR(100) NOT NULL,
    billing_last_name VARCHAR(100) NOT NULL DEFAULT '-',
    billing_address TEXT NOT NULL,
    billing_city VARCHAR(100) NOT NULL,
    shipping_address TEXT NOT NULL,
    shipping_city VARCHAR(100) NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
    discount_total DECIMAL(12, 2) NOT NULL DEFAULT 0,
    shipping_total DECIMAL(12, 2) NOT NULL DEFAULT 0,
    total DECIMAL(12, 2) NOT NULL DEFAULT 0,
    coupon_code VARCHAR(50) DEFAULT NULL,
    customer_note TEXT,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (customer_email),
    INDEX idx_number (order_number)
) ENGINE=InnoDB;

CREATE TABLE order_items (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    variation_id INT UNSIGNED DEFAULT NULL,
    name VARCHAR(255) NOT NULL,
    quantity INT UNSIGNED NOT NULL DEFAULT 1,
    unit_price DECIMAL(12, 2) NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    total DECIMAL(12, 2) NOT NULL,
    selected_options JSON DEFAULT NULL,
    image_url VARCHAR(500) DEFAULT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order (order_id)
) ENGINE=InnoDB;

CREATE TABLE order_notes (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id INT UNSIGNED NOT NULL,
    note TEXT NOT NULL,
    is_customer_note TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB;
