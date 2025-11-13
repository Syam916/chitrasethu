-- ============================================================================
-- CHITRASETHU POSTGRESQL SEED DATA
-- Version: 1.0.0
-- Date: 2025-11-12
-- Description: Sample data for development and testing
-- ============================================================================

-- Connect to the database
-- \c chitrasethu

-- ============================================================================
-- 1. USER ROLES
-- ============================================================================

INSERT INTO user_roles (role_name, display_name, description, permissions)
VALUES
    ('customer', 'Customer', 'Regular customer who can book photographers', '{"can_book": true, "can_review": true, "can_post": true, "can_message": true}'::jsonb),
    ('photographer', 'Photographer', 'Professional photographer providing services', '{"can_book": false, "can_review": true, "can_post": true, "can_message": true, "can_manage_portfolio": true, "can_manage_availability": true}'::jsonb),
    ('admin', 'Administrator', 'Platform administrator with full access', '{"can_book": true, "can_review": true, "can_post": true, "can_message": true, "can_manage_users": true, "can_manage_content": true, "can_view_analytics": true}'::jsonb),
    ('moderator', 'Moderator', 'Content moderator', '{"can_moderate_posts": true, "can_moderate_reviews": true, "can_manage_reports": true}'::jsonb);

-- ============================================================================
-- 2. USERS & PROFILES
-- ============================================================================

-- Password hash corresponds to "Password123!"
INSERT INTO users (email, password_hash, user_type, is_verified, is_active)
VALUES
    -- Customers
    ('customer1@example.com', '$2a$10$Ikxb/lz5C.EbcexlQNcc2.KZV5Xj5Rj/uvHdw26XfSe4vLexSmuKq', 'customer', TRUE, TRUE),
    ('customer2@example.com', '$2a$10$Ikxb/lz5C.EbcexlQNcc2.KZV5Xj5Rj/uvHdw26XfSe4vLexSmuKq', 'customer', TRUE, TRUE),
    ('customer3@example.com', '$2a$10$Ikxb/lz5C.EbcexlQNcc2.KZV5Xj5Rj/uvHdw26XfSe4vLexSmuKq', 'customer', TRUE, TRUE),
    -- Photographers
    ('arjun.kapoor@example.com', '$2a$10$Ikxb/lz5C.EbcexlQNcc2.KZV5Xj5Rj/uvHdw26XfSe4vLexSmuKq', 'photographer', TRUE, TRUE),
    ('priya.sharma@example.com', '$2a$10$Ikxb/lz5C.EbcexlQNcc2.KZV5Xj5Rj/uvHdw26XfSe4vLexSmuKq', 'photographer', TRUE, TRUE),
    ('vikram.singh@example.com', '$2a$10$Ikxb/lz5C.EbcexlQNcc2.KZV5Xj5Rj/uvHdw26XfSe4vLexSmuKq', 'photographer', TRUE, TRUE),
    ('ananya.mehta@example.com', '$2a$10$Ikxb/lz5C.EbcexlQNcc2.KZV5Xj5Rj/uvHdw26XfSe4vLexSmuKq', 'photographer', TRUE, TRUE),
    -- Admin
    ('admin@chitrasethu.com', '$2a$10$Ikxb/lz5C.EbcexlQNcc2.KZV5Xj5Rj/uvHdw26XfSe4vLexSmuKq', 'admin', TRUE, TRUE);

INSERT INTO user_profiles (user_id, full_name, avatar_url, bio, phone, city, state, country)
VALUES
    -- Customers
    (1, 'Rajesh Kumar', 'https://i.pravatar.cc/300?img=1', 'Looking for the perfect photographer for my wedding', '+91-9876543210', 'Mumbai', 'Maharashtra', 'India'),
    (2, 'Sneha Patel', 'https://i.pravatar.cc/300?img=2', 'Event planner and photography enthusiast', '+91-9876543211', 'Delhi', 'Delhi', 'India'),
    (3, 'Amit Verma', 'https://i.pravatar.cc/300?img=3', 'Corporate event organizer', '+91-9876543212', 'Bangalore', 'Karnataka', 'India'),
    -- Photographers
    (4, 'Arjun Kapoor', 'https://i.pravatar.cc/300?img=11', 'Passionate wedding photographer specializing in capturing emotions and candid moments. Featured in top wedding magazines.', '+91-9876543220', 'Mumbai', 'Maharashtra', 'India'),
    (5, 'Priya Sharma', 'https://i.pravatar.cc/300?img=12', 'Award-winning fashion photographer with international clients. Specialized in high-end fashion and commercial photography.', '+91-9876543221', 'Delhi', 'Delhi', 'India'),
    (6, 'Vikram Singh', 'https://i.pravatar.cc/300?img=13', 'Corporate photography specialist with expertise in events and business portraits. Trusted by Fortune 500 companies.', '+91-9876543222', 'Bangalore', 'Karnataka', 'India'),
    (7, 'Ananya Mehta', 'https://i.pravatar.cc/300?img=14', 'Creative photographer specializing in family portraits and children photography. Known for capturing natural expressions.', '+91-9876543223', 'Chennai', 'Tamil Nadu', 'India'),
    -- Admin
    (8, 'Admin User', 'https://i.pravatar.cc/300?img=50', 'Platform Administrator', '+91-9876543200', 'Mumbai', 'Maharashtra', 'India');

-- ============================================================================
-- 3. PHOTOGRAPHERS
-- ============================================================================

INSERT INTO photographers (user_id, business_name, specialties, experience_years, base_price, rating, total_reviews, equipment, languages, is_verified, is_premium)
VALUES
    (4, 'Arjun Kapoor Photography', '["Wedding", "Portrait", "Traditional", "Candid"]'::jsonb, 8, 15000.00, 4.8, 156, '["Canon EOS R5", "Sony A7 III", "Professional Lighting"]'::jsonb, '["Hindi", "English", "Marathi"]'::jsonb, TRUE, TRUE),
    (5, 'Priya Sharma Studios', '["Fashion", "Events", "Commercial", "Editorial"]'::jsonb, 10, 25000.00, 4.9, 203, '["Nikon D850", "Medium Format Camera", "Studio Lighting"]'::jsonb, '["Hindi", "English", "Punjabi"]'::jsonb, TRUE, TRUE),
    (6, 'Vikram Singh Photography', '["Corporate", "Wedding", "Events", "Business"]'::jsonb, 6, 18000.00, 4.7, 98, '["Canon EOS 5D", "Professional Flash", "Drone Camera"]'::jsonb, '["Hindi", "English", "Kannada"]'::jsonb, TRUE, FALSE),
    (7, 'Ananya Mehta Creations', '["Portrait", "Family", "Kids", "Maternity"]'::jsonb, 4, 12000.00, 4.6, 142, '["Sony A7R IV", "Portrait Lenses", "Natural Lighting"]'::jsonb, '["Tamil", "English", "Hindi"]'::jsonb, TRUE, FALSE);

-- ============================================================================
-- 4. PHOTOGRAPHER PORTFOLIOS
-- ============================================================================

INSERT INTO photographer_portfolios (photographer_id, image_url, title, description, category, display_order, is_featured)
VALUES
    -- Arjun Kapoor's Portfolio
    (1, 'https://images.unsplash.com/photo-1519741497674-611481863552', 'Royal Wedding Ceremony', 'Beautiful traditional wedding ceremony', 'Wedding', 1, TRUE),
    (1, 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92', 'Pre-Wedding Romance', 'Romantic pre-wedding photoshoot', 'Pre-Wedding', 2, TRUE),
    (1, 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc', 'Candid Moments', 'Capturing genuine emotions', 'Wedding', 3, FALSE),
    -- Priya Sharma's Portfolio
    (2, 'https://images.unsplash.com/photo-1469334031218-e382a71b716b', 'Fashion Week Finale', 'High-end fashion photography', 'Fashion', 1, TRUE),
    (2, 'https://images.unsplash.com/photo-1509631179647-0177331693ae', 'Editorial Shoot', 'Magazine editorial photography', 'Fashion', 2, TRUE),
    (2, 'https://images.unsplash.com/photo-1558769132-cb1aea3c9a0c', 'Commercial Campaign', 'Brand campaign photography', 'Commercial', 3, FALSE),
    -- Vikram Singh's Portfolio
    (3, 'https://images.unsplash.com/photo-1511578314322-379afb476865', 'Corporate Gala Night', 'Professional event coverage', 'Corporate', 1, TRUE),
    (3, 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678', 'Business Conference', 'Corporate conference photography', 'Corporate', 2, FALSE),
    (3, 'https://images.unsplash.com/photo-1540575467063-178a50c2df87', 'Team Building Event', 'Corporate team event', 'Events', 3, FALSE),
    -- Ananya Mehta's Portfolio
    (4, 'https://images.unsplash.com/photo-1578662996442-48f60103fc96', 'Birthday Celebration', 'Joyful birthday moments', 'Birthday', 1, TRUE),
    (4, 'https://images.unsplash.com/photo-1519340241574-2cec6aef0c01', 'Family Portrait', 'Beautiful family moments', 'Family', 2, TRUE),
    (4, 'https://images.unsplash.com/photo-1476703993599-0035a21b17a9', 'Kids Photography', 'Capturing childhood joy', 'Kids', 3, FALSE);

-- ============================================================================
-- 5. EVENT CATEGORIES
-- ============================================================================

INSERT INTO event_categories (category_name, slug, description, icon, color_code, display_order)
VALUES
    ('Wedding', 'wedding', 'Wedding ceremonies and celebrations', 'heart', '#FF6B6B', 1),
    ('Pre-Wedding', 'pre-wedding', 'Pre-wedding photoshoots', 'heart', '#FF8E9E', 2),
    ('Birthday', 'birthday', 'Birthday parties and celebrations', 'cake', '#FFD93D', 3),
    ('Corporate', 'corporate', 'Corporate events and conferences', 'briefcase', '#4ECDC4', 4),
    ('Fashion', 'fashion', 'Fashion shows and modeling', 'star', '#A8E6CF', 5),
    ('Events', 'events', 'General events and gatherings', 'users', '#95E1D3', 6),
    ('Portrait', 'portrait', 'Portrait photography sessions', 'camera', '#F38181', 7),
    ('Family', 'family', 'Family photography', 'users', '#AA96DA', 8);

-- ============================================================================
-- 6. EVENTS
-- ============================================================================

INSERT INTO events (creator_id, category_id, title, description, event_date, event_time, location, city, state, expected_attendees, min_budget, max_budget, status)
VALUES
    (1, 1, 'Royal Wedding Ceremony', 'Capture the magic of this royal wedding ceremony with traditional rituals and modern elegance.', '2024-12-15', '10:00:00', 'Grand Palace Hotel', 'Mumbai', 'Maharashtra', 250, 40000, 60000, 'open'),
    (2, 4, 'Corporate Gala Night', 'Professional event photography for corporate milestone celebration.', '2024-12-20', '18:30:00', 'Business Center', 'Bangalore', 'Karnataka', 300, 20000, 30000, 'open'),
    (1, 3, 'Birthday Bash Celebration', 'Fun and colorful birthday party photography with family moments.', '2024-12-25', '16:00:00', 'Rainbow Gardens', 'Chennai', 'Tamil Nadu', 80, 10000, 20000, 'open'),
    (3, 5, 'Fashion Week Finale', 'High-end fashion photography for the biggest fashion event of the season.', '2025-01-10', '19:00:00', 'Fashion Arena', 'Delhi', 'Delhi', 150, 30000, 40000, 'open'),
    (2, 2, 'Pre-Wedding Romance', 'Romantic pre-wedding photoshoot with sunset beach backdrop.', '2025-01-15', '17:30:00', 'Seaside Resort', 'Goa', 'Goa', 4, 25000, 35000, 'open');

-- ============================================================================
-- 7. BOOKINGS
-- ============================================================================

INSERT INTO bookings (customer_id, photographer_id, event_id, booking_date, booking_time, duration_hours, location, event_type, total_amount, advance_amount, pending_amount, status, payment_status)
VALUES
    (1, 1, 1, '2024-12-15', '10:00:00', 8.0, 'Grand Palace Hotel, Mumbai', 'Wedding', 50000.00, 15000.00, 35000.00, 'confirmed', 'partial'),
    (2, 3, 2, '2024-12-20', '18:30:00', 5.0, 'Business Center, Bangalore', 'Corporate', 25000.00, 10000.00, 15000.00, 'confirmed', 'partial'),
    (1, 4, 3, '2024-12-25', '16:00:00', 4.0, 'Rainbow Gardens, Chennai', 'Birthday', 15000.00, 5000.00, 10000.00, 'pending', 'partial'),
    (3, 2, NULL, '2025-01-05', '14:00:00', 3.0, 'Corporate Office, Mumbai', 'Corporate Headshots', 20000.00, 0.00, 20000.00, 'pending', 'unpaid');

-- ============================================================================
-- 8. BOOKING PAYMENTS
-- ============================================================================

INSERT INTO booking_payments (booking_id, amount, payment_type, payment_method, payment_status, transaction_id, payment_gateway, payment_date)
VALUES
    (1, 15000.00, 'advance', 'UPI', 'completed', 'TXN001234567890', 'Razorpay', '2024-11-01 14:30:00'),
    (2, 10000.00, 'advance', 'Credit Card', 'completed', 'TXN001234567891', 'Razorpay', '2024-11-05 16:45:00'),
    (3, 5000.00, 'advance', 'Debit Card', 'completed', 'TXN001234567892', 'Razorpay', '2024-11-10 10:20:00');

-- ============================================================================
-- 9. BOOKING REVIEWS
-- ============================================================================

INSERT INTO booking_reviews (booking_id, photographer_id, customer_id, rating, review_text)
VALUES
    (1, 1, 1, 5, 'Arjun did an amazing job capturing our wedding! The photos are absolutely stunning and we couldn''t be happier. Highly recommended!'),
    (2, 3, 2, 5, 'Vikram was very professional and captured all the important moments of our corporate event. Great work!');

-- ============================================================================
-- 10. POSTS
-- ============================================================================

INSERT INTO posts (user_id, content_type, caption, media_urls, location, tags, likes_count, comments_count)
VALUES
    (4, 'gallery', 'Captured this beautiful moment at yesterday''s wedding ceremony. The emotions, the colors, the pure joy - everything was perfect! 📸✨', '["https://images.unsplash.com/photo-1519741497674-611481863552", "https://images.unsplash.com/photo-1606216794074-735e91aa2c92"]'::jsonb, 'Grand Palace Hotel, Mumbai', '["Wedding", "Photography", "Mumbai", "Love"]'::jsonb, 1247, 89),
    (5, 'image', 'Behind the scenes of today''s fashion shoot! The magic happens when creativity meets passion. 🎬👗', '["https://images.unsplash.com/photo-1469334031218-e382a71b716b"]'::jsonb, 'Fashion Studio, Delhi', '["Fashion", "BTS", "Studio", "Photography"]'::jsonb, 892, 67),
    (6, 'image', 'Corporate headshots that tell a story. Professional photography isn''t just about the camera - it''s about connecting with your subject. 💼📷', '["https://images.unsplash.com/photo-1511285560929-80b456fea0bc"]'::jsonb, 'Business District, Bangalore', '["Corporate", "Portrait", "Professional"]'::jsonb, 634, 42),
    (7, 'image', 'Birthday celebrations are about capturing joy in its purest form! This little one''s smile made my day ✨🎂', '["https://images.unsplash.com/photo-1578662996442-48f60103fc96"]'::jsonb, 'Rainbow Gardens, Chennai', '["Birthday", "Kids", "Family", "Joy"]'::jsonb, 456, 34),
    (4, 'gallery', 'Pre-wedding magic at Goa beaches! Sometimes the best shots happen when couples forget about the camera and just be themselves 🌅💕', '["https://images.unsplash.com/photo-1606216794074-735e91aa2c92", "https://images.unsplash.com/photo-1519741497674-611481863552"]'::jsonb, 'Seaside Resort, Goa', '["PreWedding", "Beach", "Romance", "Goa"]'::jsonb, 978, 56);

-- ============================================================================
-- 11. POST LIKES
-- ============================================================================

INSERT INTO post_likes (post_id, user_id)
VALUES
    (1, 1), (1, 2), (1, 3),
    (2, 1), (2, 3),
    (3, 2), (3, 3),
    (4, 1), (4, 2),
    (5, 2), (5, 3);

-- ============================================================================
-- 12. POST COMMENTS
-- ============================================================================

INSERT INTO post_comments (post_id, user_id, comment_text)
VALUES
    (1, 1, 'Absolutely stunning work! Love the colors and emotions captured 😍'),
    (1, 2, 'This is beautiful! Can you share your camera settings?'),
    (2, 3, 'Amazing BTS! The lighting is perfect 👌'),
    (3, 1, 'Very professional work. Would love to book you for our next event!'),
    (4, 2, 'So cute! You really captured the joy perfectly 🎉'),
    (5, 1, 'Gorgeous shots! Goa is always magical for pre-wedding shoots 🌊');

-- ============================================================================
-- 13. COLLECTIONS
-- ============================================================================

INSERT INTO collections (user_id, title, description, thumbnail_url, images, category, is_public, likes_count)
VALUES
    (4, 'Best Wedding Shots 2024', 'Curated collection of the most beautiful wedding moments from this year', 'https://images.unsplash.com/photo-1519741497674-611481863552', '["https://images.unsplash.com/photo-1519741497674-611481863552", "https://images.unsplash.com/photo-1606216794074-735e91aa2c92", "https://images.unsplash.com/photo-1511285560929-80b456fea0bc"]'::jsonb, 'Wedding', TRUE, 234),
    (5, 'Fashion Portfolio 2024', 'High-end fashion photography showcase', 'https://images.unsplash.com/photo-1469334031218-e382a71b716b', '["https://images.unsplash.com/photo-1469334031218-e382a71b716b", "https://images.unsplash.com/photo-1509631179647-0177331693ae"]'::jsonb, 'Fashion', TRUE, 189),
    (6, 'Corporate Event Highlights', 'Professional event photography collection', 'https://images.unsplash.com/photo-1511578314322-379afb476865', '["https://images.unsplash.com/photo-1511578314322-379afb476865", "https://images.unsplash.com/photo-1505373877841-8d25f7d46678"]'::jsonb, 'Corporate', TRUE, 156),
    (7, 'Family Moments', 'Capturing beautiful family memories', 'https://images.unsplash.com/photo-1519340241574-2cec6aef0c01', '["https://images.unsplash.com/photo-1519340241574-2cec6aef0c01", "https://images.unsplash.com/photo-1578662996442-48f60103fc96"]'::jsonb, 'Family', TRUE, 198);

-- ============================================================================
-- 14. MESSAGES
-- ============================================================================

INSERT INTO messages (sender_id, receiver_id, message_text, is_read, read_at)
VALUES
    (1, 4, 'Hi Arjun, I would like to discuss my wedding photography requirements.', TRUE, '2024-10-20 10:30:00'),
    (4, 1, 'Hello! I would be happy to discuss your requirements. When is your wedding date?', TRUE, '2024-10-20 11:00:00'),
    (1, 4, 'It''s on December 15th. Can we schedule a call to discuss the details?', TRUE, '2024-10-20 11:15:00'),
    (2, 3, 'Hi Vikram, we need a photographer for our corporate event on December 20th.', TRUE, '2024-10-22 14:00:00'),
    (3, 2, 'Sure! I would love to cover your event. Let me know the details.', FALSE, NULL);

-- ============================================================================
-- 15. NOTIFICATIONS
-- ============================================================================

INSERT INTO notifications (user_id, type, title, message, link, is_read)
VALUES
    (1, 'booking', 'Booking Confirmed', 'Your booking with Arjun Kapoor Photography has been confirmed for December 15, 2024', '/bookings/1', TRUE),
    (4, 'booking', 'New Booking Request', 'You have a new booking request from Rajesh Kumar', '/photographer/bookings/1', TRUE),
    (1, 'payment', 'Payment Successful', 'Your advance payment of ₹15,000 has been processed successfully', '/payments/1', TRUE),
    (2, 'message', 'New Message', 'Vikram Singh sent you a message', '/messages/3', FALSE),
    (4, 'review', 'New Review', 'Rajesh Kumar left a 5-star review for your service', '/reviews/1', FALSE);

-- ============================================================================
-- 16. PHOTOGRAPHER AVAILABILITY
-- ============================================================================

INSERT INTO photographer_availability (photographer_id, date, time_slot, start_time, end_time, is_available)
VALUES
    -- Arjun Kapoor
    (1, '2024-11-25', 'Morning', '09:00:00', '12:00:00', TRUE),
    (1, '2024-11-25', 'Afternoon', '14:00:00', '17:00:00', TRUE),
    (1, '2024-11-26', 'Morning', '09:00:00', '12:00:00', TRUE),
    (1, '2024-11-26', 'Afternoon', '14:00:00', '17:00:00', TRUE),
    (1, '2024-11-27', 'Morning', '09:00:00', '12:00:00', TRUE),
    (1, '2024-12-15', 'Full Day', '09:00:00', '18:00:00', FALSE),
    -- Priya Sharma
    (2, '2024-11-25', 'Morning', '10:00:00', '13:00:00', TRUE),
    (2, '2024-11-25', 'Evening', '15:00:00', '19:00:00', TRUE),
    (2, '2024-11-26', 'Morning', '10:00:00', '13:00:00', TRUE),
    (2, '2024-11-26', 'Evening', '15:00:00', '19:00:00', TRUE),
    -- Vikram Singh
    (3, '2024-11-25', 'Afternoon', '13:00:00', '17:00:00', TRUE),
    (3, '2024-11-26', 'Afternoon', '13:00:00', '17:00:00', TRUE),
    (3, '2024-12-20', 'Evening', '18:00:00', '23:00:00', FALSE),
    -- Ananya Mehta
    (4, '2024-11-25', 'Morning', '09:00:00', '12:00:00', TRUE),
    (4, '2024-11-25', 'Afternoon', '14:00:00', '17:00:00', TRUE),
    (4, '2024-11-26', 'Morning', '09:00:00', '12:00:00', TRUE),
    (4, '2024-12-25', 'Afternoon', '14:00:00', '18:00:00', FALSE);

-- ============================================================================
-- VERIFICATION QUERIES (OPTIONAL)
-- ============================================================================

-- SELECT 'Users' AS table_name, COUNT(*) AS record_count FROM users
-- UNION ALL SELECT 'User Profiles', COUNT(*) FROM user_profiles
-- UNION ALL SELECT 'Photographers', COUNT(*) FROM photographers
-- UNION ALL SELECT 'Photographer Portfolios', COUNT(*) FROM photographer_portfolios
-- UNION ALL SELECT 'Event Categories', COUNT(*) FROM event_categories
-- UNION ALL SELECT 'Events', COUNT(*) FROM events
-- UNION ALL SELECT 'Bookings', COUNT(*) FROM bookings
-- UNION ALL SELECT 'Booking Payments', COUNT(*) FROM booking_payments
-- UNION ALL SELECT 'Booking Reviews', COUNT(*) FROM booking_reviews
-- UNION ALL SELECT 'Posts', COUNT(*) FROM posts
-- UNION ALL SELECT 'Post Likes', COUNT(*) FROM post_likes
-- UNION ALL SELECT 'Post Comments', COUNT(*) FROM post_comments
-- UNION ALL SELECT 'Collections', COUNT(*) FROM collections
-- UNION ALL SELECT 'Messages', COUNT(*) FROM messages
-- UNION ALL SELECT 'Notifications', COUNT(*) FROM notifications
-- UNION ALL SELECT 'Photographer Availability', COUNT(*) FROM photographer_availability;

-- ============================================================================
-- END OF SEED DATA
-- ============================================================================


