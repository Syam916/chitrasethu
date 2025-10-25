-- ============================================================================
-- CHITRASETHU DATABASE SCHEMA
-- Version: 1.0.0
-- Date: 2024-10-25
-- Description: Complete database schema for Chitrasethu Photography Platform
-- ============================================================================

-- Drop database if exists (CAUTION: Use only in development)
-- DROP DATABASE IF EXISTS chitrasethu_db;

-- Create database
CREATE DATABASE IF NOT EXISTS chitrasethu_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE chitrasethu_db;

-- ============================================================================
-- 1. USER MANAGEMENT TABLES
-- ============================================================================

-- Table: users
-- Purpose: Core user authentication and basic information
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    user_type ENUM('customer', 'photographer', 'admin') NOT NULL DEFAULT 'customer',
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    verification_token VARCHAR(255),
    reset_password_token VARCHAR(255),
    reset_password_expires DATETIME,
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_user_type (user_type),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: user_profiles
-- Purpose: Extended user profile information
CREATE TABLE user_profiles (
    profile_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    bio TEXT,
    phone VARCHAR(20),
    location VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    pincode VARCHAR(10),
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other', 'prefer_not_to_say'),
    social_links JSON,
    preferences JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_location (city, state),
    INDEX idx_full_name (full_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: user_roles
-- Purpose: Define user roles and permissions
CREATE TABLE user_roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role_name (role_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: user_sessions
-- Purpose: Track active user sessions
CREATE TABLE user_sessions (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(500) NOT NULL UNIQUE,
    device_info VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_token (token),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 2. PHOTOGRAPHER MANAGEMENT TABLES
-- ============================================================================

-- Table: photographers
-- Purpose: Professional photographer profiles and business information
CREATE TABLE photographers (
    photographer_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    business_name VARCHAR(255),
    specialties JSON NOT NULL,
    experience_years INT DEFAULT 0,
    base_price DECIMAL(10, 2),
    currency VARCHAR(10) DEFAULT 'INR',
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    total_bookings INT DEFAULT 0,
    equipment JSON,
    languages JSON,
    services_offered JSON,
    work_radius INT DEFAULT 50,
    is_verified BOOLEAN DEFAULT FALSE,
    is_premium BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    verification_date DATETIME,
    premium_until DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_rating (rating),
    INDEX idx_is_verified (is_verified),
    INDEX idx_is_premium (is_premium),
    INDEX idx_base_price (base_price)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: photographer_portfolios
-- Purpose: Store photographer portfolio items
CREATE TABLE photographer_portfolios (
    portfolio_id INT AUTO_INCREMENT PRIMARY KEY,
    photographer_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    title VARCHAR(255),
    description TEXT,
    category VARCHAR(100),
    tags JSON,
    display_order INT DEFAULT 0,
    likes_count INT DEFAULT 0,
    views_count INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (photographer_id) REFERENCES photographers(photographer_id) ON DELETE CASCADE,
    INDEX idx_photographer_id (photographer_id),
    INDEX idx_category (category),
    INDEX idx_display_order (display_order),
    INDEX idx_is_featured (is_featured)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: photographer_availability
-- Purpose: Manage photographer calendar availability
CREATE TABLE photographer_availability (
    availability_id INT AUTO_INCREMENT PRIMARY KEY,
    photographer_id INT NOT NULL,
    date DATE NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    booking_id INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (photographer_id) REFERENCES photographers(photographer_id) ON DELETE CASCADE,
    INDEX idx_photographer_date (photographer_id, date),
    INDEX idx_date (date),
    INDEX idx_is_available (is_available),
    UNIQUE KEY unique_slot (photographer_id, date, time_slot)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 3. EVENT & BOOKING MANAGEMENT TABLES
-- ============================================================================

-- Table: event_categories
-- Purpose: Define event types and categories
CREATE TABLE event_categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(100),
    color_code VARCHAR(20),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: events
-- Purpose: Store event listings and details
CREATE TABLE events (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    creator_id INT NOT NULL,
    category_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_time TIME,
    end_date DATE,
    location VARCHAR(255),
    venue_name VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    expected_attendees INT,
    budget_range VARCHAR(100),
    min_budget DECIMAL(10, 2),
    max_budget DECIMAL(10, 2),
    requirements TEXT,
    status ENUM('open', 'in_progress', 'completed', 'cancelled') DEFAULT 'open',
    visibility ENUM('public', 'private') DEFAULT 'public',
    images JSON,
    tags JSON,
    views_count INT DEFAULT 0,
    interested_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES event_categories(category_id),
    INDEX idx_creator_id (creator_id),
    INDEX idx_category_id (category_id),
    INDEX idx_event_date (event_date),
    INDEX idx_status (status),
    INDEX idx_city (city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: bookings
-- Purpose: Manage booking requests and confirmations
CREATE TABLE bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    photographer_id INT NOT NULL,
    event_id INT,
    booking_date DATE NOT NULL,
    booking_time TIME,
    end_date DATE,
    duration_hours DECIMAL(5, 2),
    location VARCHAR(255),
    venue_name VARCHAR(255),
    event_type VARCHAR(100),
    total_amount DECIMAL(10, 2) NOT NULL,
    advance_amount DECIMAL(10, 2),
    pending_amount DECIMAL(10, 2),
    currency VARCHAR(10) DEFAULT 'INR',
    status ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refunded') DEFAULT 'pending',
    payment_status ENUM('unpaid', 'partial', 'paid', 'refunded') DEFAULT 'unpaid',
    special_requirements TEXT,
    cancellation_reason TEXT,
    cancelled_by INT,
    cancelled_at DATETIME,
    confirmed_at DATETIME,
    completed_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(user_id),
    FOREIGN KEY (photographer_id) REFERENCES photographers(photographer_id),
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE SET NULL,
    INDEX idx_customer_id (customer_id),
    INDEX idx_photographer_id (photographer_id),
    INDEX idx_booking_date (booking_date),
    INDEX idx_status (status),
    INDEX idx_payment_status (payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: booking_payments
-- Purpose: Track payment transactions
CREATE TABLE booking_payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    payment_type ENUM('advance', 'partial', 'full', 'refund') NOT NULL,
    payment_method VARCHAR(50),
    payment_status ENUM('pending', 'processing', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    transaction_id VARCHAR(255) UNIQUE,
    payment_gateway VARCHAR(50),
    gateway_response JSON,
    payment_date DATETIME,
    refund_amount DECIMAL(10, 2),
    refund_date DATETIME,
    refund_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    INDEX idx_booking_id (booking_id),
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_payment_status (payment_status),
    INDEX idx_payment_date (payment_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: booking_reviews
-- Purpose: Store booking reviews and ratings
CREATE TABLE booking_reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL UNIQUE,
    photographer_id INT NOT NULL,
    customer_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    review_images JSON,
    response_text TEXT,
    response_date DATETIME,
    is_verified BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    helpful_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (photographer_id) REFERENCES photographers(photographer_id),
    FOREIGN KEY (customer_id) REFERENCES users(user_id),
    INDEX idx_photographer_id (photographer_id),
    INDEX idx_rating (rating),
    INDEX idx_is_featured (is_featured)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 4. SOCIAL FEATURES TABLES
-- ============================================================================

-- Table: posts
-- Purpose: Social media posts and content
CREATE TABLE posts (
    post_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    content_type ENUM('image', 'video', 'text', 'gallery') NOT NULL DEFAULT 'image',
    caption TEXT,
    media_urls JSON,
    thumbnail_url VARCHAR(500),
    location VARCHAR(255),
    tags JSON,
    mentions JSON,
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    shares_count INT DEFAULT 0,
    views_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    visibility ENUM('public', 'followers', 'private') DEFAULT 'public',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_is_featured (is_featured),
    FULLTEXT idx_caption (caption)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: post_likes
-- Purpose: Track post likes
CREATE TABLE post_likes (
    like_id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_like (post_id, user_id),
    INDEX idx_post_id (post_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: post_comments
-- Purpose: Store post comments
CREATE TABLE post_comments (
    comment_id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    parent_comment_id INT,
    comment_text TEXT NOT NULL,
    likes_count INT DEFAULT 0,
    is_edited BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES post_comments(comment_id) ON DELETE CASCADE,
    INDEX idx_post_id (post_id),
    INDEX idx_user_id (user_id),
    INDEX idx_parent_comment_id (parent_comment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: collections
-- Purpose: Curated photo collections and moodboards
CREATE TABLE collections (
    collection_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url VARCHAR(500),
    images JSON,
    category VARCHAR(100),
    tags JSON,
    is_public BOOLEAN DEFAULT TRUE,
    likes_count INT DEFAULT 0,
    saves_count INT DEFAULT 0,
    views_count INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_category (category),
    INDEX idx_is_public (is_public),
    INDEX idx_is_featured (is_featured)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 5. COMMUNICATION TABLES
-- ============================================================================

-- Table: messages
-- Purpose: Direct messaging between users
CREATE TABLE messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    message_text TEXT NOT NULL,
    message_type ENUM('text', 'image', 'file') DEFAULT 'text',
    attachment_url VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    read_at DATETIME,
    is_deleted_by_sender BOOLEAN DEFAULT FALSE,
    is_deleted_by_receiver BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_sender_id (sender_id),
    INDEX idx_receiver_id (receiver_id),
    INDEX idx_conversation (sender_id, receiver_id, created_at),
    INDEX idx_is_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: notifications
-- Purpose: User notifications and alerts
CREATE TABLE notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('booking', 'message', 'like', 'comment', 'review', 'payment', 'system') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(500),
    data JSON,
    is_read BOOLEAN DEFAULT FALSE,
    read_at DATETIME,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger: Update photographer rating after review
DELIMITER $$
CREATE TRIGGER update_photographer_rating_after_review
AFTER INSERT ON booking_reviews
FOR EACH ROW
BEGIN
    UPDATE photographers
    SET rating = (
        SELECT AVG(rating)
        FROM booking_reviews
        WHERE photographer_id = NEW.photographer_id
    ),
    total_reviews = (
        SELECT COUNT(*)
        FROM booking_reviews
        WHERE photographer_id = NEW.photographer_id
    )
    WHERE photographer_id = NEW.photographer_id;
END$$
DELIMITER ;

-- Trigger: Update post likes count
DELIMITER $$
CREATE TRIGGER update_post_likes_count_insert
AFTER INSERT ON post_likes
FOR EACH ROW
BEGIN
    UPDATE posts
    SET likes_count = likes_count + 1
    WHERE post_id = NEW.post_id;
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER update_post_likes_count_delete
AFTER DELETE ON post_likes
FOR EACH ROW
BEGIN
    UPDATE posts
    SET likes_count = likes_count - 1
    WHERE post_id = OLD.post_id;
END$$
DELIMITER ;

-- Trigger: Update post comments count
DELIMITER $$
CREATE TRIGGER update_post_comments_count_insert
AFTER INSERT ON post_comments
FOR EACH ROW
BEGIN
    UPDATE posts
    SET comments_count = comments_count + 1
    WHERE post_id = NEW.post_id;
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER update_post_comments_count_delete
AFTER DELETE ON post_comments
FOR EACH ROW
BEGIN
    UPDATE posts
    SET comments_count = comments_count - 1
    WHERE post_id = OLD.post_id;
END$$
DELIMITER ;

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View: Complete user information
CREATE OR REPLACE VIEW view_users_complete AS
SELECT 
    u.user_id,
    u.email,
    u.user_type,
    u.is_verified,
    u.is_active,
    u.last_login,
    u.created_at as user_created_at,
    up.full_name,
    up.avatar_url,
    up.bio,
    up.phone,
    up.location,
    up.city,
    up.state,
    up.country
FROM users u
LEFT JOIN user_profiles up ON u.user_id = up.user_id;

-- View: Photographer complete profile
CREATE OR REPLACE VIEW view_photographers_complete AS
SELECT 
    p.*,
    u.email,
    u.is_verified as user_verified,
    u.is_active as user_active,
    up.full_name,
    up.avatar_url,
    up.bio,
    up.phone,
    up.location,
    up.city,
    up.state
FROM photographers p
JOIN users u ON p.user_id = u.user_id
JOIN user_profiles up ON u.user_id = up.user_id;

-- View: Active bookings with details
CREATE OR REPLACE VIEW view_bookings_active AS
SELECT 
    b.*,
    up_customer.full_name as customer_name,
    up_customer.phone as customer_phone,
    p.business_name as photographer_business,
    up_photographer.full_name as photographer_name,
    up_photographer.phone as photographer_phone,
    e.title as event_title,
    ec.category_name as event_category
FROM bookings b
JOIN user_profiles up_customer ON b.customer_id = up_customer.user_id
JOIN photographers p ON b.photographer_id = p.photographer_id
JOIN user_profiles up_photographer ON p.user_id = up_photographer.user_id
LEFT JOIN events e ON b.event_id = e.event_id
LEFT JOIN event_categories ec ON e.category_id = ec.category_id
WHERE b.status IN ('pending', 'confirmed', 'in_progress');

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================

