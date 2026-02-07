-- Seed data for Photographer Home Page (by photographer email)
-- Usage: Replace 'your-photographer@email.com' with the actual photographer email
-- This ensures data is inserted for the correct photographer account

DO $$
DECLARE
    photographer_email TEXT := 'loukyarao68@email.com'; -- CHANGE THIS to your photographer email
    photographer_user_id INT;
    photographer_id INT;
    customer_user_id_1 INT;
    customer_user_id_2 INT;
    customer_user_id_3 INT;
    customer_user_id_4 INT;
BEGIN
    -- Get photographer by email
    SELECT p.user_id, p.photographer_id INTO photographer_user_id, photographer_id
    FROM photographers p
    JOIN users u ON p.user_id = u.user_id
    WHERE u.email = photographer_email
    LIMIT 1;

    -- If photographer not found, use first photographer as fallback
    IF photographer_user_id IS NULL OR photographer_id IS NULL THEN
        SELECT p.user_id, p.photographer_id INTO photographer_user_id, photographer_id
        FROM photographers p
        LIMIT 1;
        
        RAISE NOTICE 'Photographer with email % not found. Using first photographer instead.', photographer_email;
    END IF;

    -- Get customer user_ids (create if they don't exist)
    -- Customer 1
    SELECT user_id INTO customer_user_id_1
    FROM users
    WHERE user_type = 'customer'
    LIMIT 1 OFFSET 0;

    IF customer_user_id_1 IS NULL THEN
        INSERT INTO users (email, password, user_type, status, created_at, updated_at)
        VALUES ('customer1@example.com', '$2a$10$YOUR_HASHED_PASSWORD', 'customer', 'active', NOW(), NOW())
        RETURNING user_id INTO customer_user_id_1;

        INSERT INTO user_profiles (user_id, full_name, avatar_url, phone_number, created_at, updated_at)
        VALUES (customer_user_id_1, 'Priya & Rahul', 'https://res.cloudinary.com/your_cloud_name/image/upload/v1678886400/customer-1.jpg', '+91 9876543210', NOW(), NOW());
    END IF;

    -- Customer 2
    SELECT user_id INTO customer_user_id_2
    FROM users
    WHERE user_type = 'customer'
    LIMIT 1 OFFSET 1;

    IF customer_user_id_2 IS NULL THEN
        INSERT INTO users (email, password, user_type, status, created_at, updated_at)
        VALUES ('customer2@example.com', '$2a$10$YOUR_HASHED_PASSWORD', 'customer', 'active', NOW(), NOW())
        RETURNING user_id INTO customer_user_id_2;

        INSERT INTO user_profiles (user_id, full_name, avatar_url, phone_number, created_at, updated_at)
        VALUES (customer_user_id_2, 'Amit Kumar', 'https://res.cloudinary.com/your_cloud_name/image/upload/v1678886400/customer-2.jpg', '+91 9876543211', NOW(), NOW());
    END IF;

    -- Customer 3
    SELECT user_id INTO customer_user_id_3
    FROM users
    WHERE user_type = 'customer'
    LIMIT 1 OFFSET 2;

    IF customer_user_id_3 IS NULL THEN
        INSERT INTO users (email, password, user_type, status, created_at, updated_at)
        VALUES ('customer3@example.com', '$2a$10$YOUR_HASHED_PASSWORD', 'customer', 'active', NOW(), NOW())
        RETURNING user_id INTO customer_user_id_3;

        INSERT INTO user_profiles (user_id, full_name, avatar_url, phone_number, created_at, updated_at)
        VALUES (customer_user_id_3, 'Sneha & Vikram', 'https://res.cloudinary.com/your_cloud_name/image/upload/v1678886400/customer-3.jpg', '+91 9876543212', NOW(), NOW());
    END IF;

    -- Customer 4
    SELECT user_id INTO customer_user_id_4
    FROM users
    WHERE user_type = 'customer'
    LIMIT 1 OFFSET 3;

    IF customer_user_id_4 IS NULL THEN
        INSERT INTO users (email, password, user_type, status, created_at, updated_at)
        VALUES ('customer4@example.com', '$2a$10$YOUR_HASHED_PASSWORD', 'customer', 'active', NOW(), NOW())
        RETURNING user_id INTO customer_user_id_4;

        INSERT INTO user_profiles (user_id, full_name, avatar_url, phone_number, created_at, updated_at)
        VALUES (customer_user_id_4, 'Riya Fashion Studio', 'https://res.cloudinary.com/your_cloud_name/image/upload/v1678886400/customer-4.jpg', '+91 9876543213', NOW(), NOW());
    END IF;

    -- Only proceed if we have a photographer
    IF photographer_user_id IS NOT NULL AND photographer_id IS NOT NULL THEN

        -- Insert PENDING booking requests (for "New Requests" sidebar)
        -- Using created_at in current month so they show up in stats
        INSERT INTO bookings (
            customer_id, photographer_id, booking_date, booking_time, duration_hours,
            location, venue_name, event_type, total_amount, advance_amount, pending_amount,
            currency, status, payment_status, special_requirements, created_at, updated_at
        ) VALUES
        -- Request 1: Priya & Rahul - Wedding (pending)
        (
            customer_user_id_1, photographer_id, CURRENT_DATE + INTERVAL '15 days', '10:00:00', 8,
            'Grand Palace, Mumbai, Maharashtra', 'Grand Palace Hotel', 'Wedding',
            45000.00, 0, 45000.00, 'INR', 'pending', 'unpaid',
            'Traditional ceremony coverage, candid shots, album included, drone photography for aerial shots',
            NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'
        ),
        -- Request 2: Amit Kumar - Corporate Event (pending)
        (
            customer_user_id_2, photographer_id, CURRENT_DATE + INTERVAL '20 days', '14:00:00', 6,
            'Tech Park Convention Center, Bangalore', 'Tech Park Convention Center', 'Corporate Event',
            30000.00, 0, 30000.00, 'INR', 'pending', 'unpaid',
            'Professional headshots, event coverage, stage photography, product photography',
            NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'
        ),
        -- Request 3: Sneha & Vikram - Pre-Wedding (pending)
        (
            customer_user_id_3, photographer_id, CURRENT_DATE + INTERVAL '10 days', '06:00:00', 4,
            'Goa Beaches', NULL, 'Pre-Wedding',
            25000.00, 0, 25000.00, 'INR', 'pending', 'unpaid',
            'Sunrise shoot, beach locations, multiple outfit changes, candid and posed shots',
            NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours'
        ),
        -- Request 4: Riya Fashion Studio - Fashion Shoot (pending)
        (
            customer_user_id_4, photographer_id, CURRENT_DATE + INTERVAL '12 days', '11:00:00', 5,
            'Studio 5, Delhi NCR', 'Studio 5', 'Fashion Shoot',
            35000.00, 0, 35000.00, 'INR', 'pending', 'unpaid',
            'Studio setup, 3 models, 5 outfit changes, retouching included, online gallery',
            NOW() - INTERVAL '5 hours', NOW() - INTERVAL '5 hours'
        )
        ON CONFLICT DO NOTHING;

        -- Insert UPCOMING bookings (for "Upcoming Events" sidebar)
        -- Using created_at in current month so they show up in stats
        INSERT INTO bookings (
            customer_id, photographer_id, booking_date, booking_time, duration_hours,
            location, venue_name, event_type, total_amount, advance_amount, pending_amount,
            currency, status, payment_status, special_requirements, confirmed_at, created_at, updated_at
        ) VALUES
        -- Booking 1: Meera & Arjun - Pre-Wedding (upcoming, confirmed)
        (
            customer_user_id_3, photographer_id, CURRENT_DATE + INTERVAL '5 days', '06:00:00', 8,
            'Jaipur, Rajasthan', NULL, 'Pre-Wedding',
            35000.00, 10000.00, 25000.00, 'INR', 'confirmed', 'partial',
            'Romantic pre-wedding shoot with multiple locations',
            NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'
        ),
        -- Booking 2: Divya Birthday Party (upcoming, confirmed)
        (
            customer_user_id_1, photographer_id, CURRENT_DATE + INTERVAL '8 days', '17:00:00', 4,
            'Home Garden, Mumbai', 'Home Garden', 'Birthday',
            12000.00, 0, 12000.00, 'INR', 'confirmed', 'unpaid',
            'Birthday party photography with candid moments',
            NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'
        )
        ON CONFLICT DO NOTHING;

        -- Insert CURRENT bookings (in_progress) - created this month
        INSERT INTO bookings (
            customer_id, photographer_id, booking_date, booking_time, duration_hours,
            location, venue_name, event_type, total_amount, advance_amount, pending_amount,
            currency, status, payment_status, special_requirements, confirmed_at, created_at, updated_at
        ) VALUES
        -- Booking 3: Ananya & Rohan - Wedding (current, in_progress)
        (
            customer_user_id_1, photographer_id, CURRENT_DATE, '10:00:00', 10,
            'Leela Palace, Bangalore', 'Leela Palace', 'Wedding',
            50000.00, 20000.00, 30000.00, 'INR', 'in_progress', 'partial',
            'Full wedding coverage with multiple ceremonies',
            NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days', NOW()
        ),
        -- Booking 4: Tech Innovations - Corporate Event (current, in_progress)
        (
            customer_user_id_2, photographer_id, CURRENT_DATE + INTERVAL '2 days', '14:00:00', 6,
            'Hyatt Regency, Delhi', 'Hyatt Regency', 'Corporate Event',
            30000.00, 30000.00, 0, 'INR', 'in_progress', 'paid',
            'Corporate event coverage with headshots',
            NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', NOW()
        )
        ON CONFLICT DO NOTHING;

        -- Insert PAST bookings (completed) - created this month to show in stats
        INSERT INTO bookings (
            customer_id, photographer_id, booking_date, booking_time, duration_hours,
            location, venue_name, event_type, total_amount, advance_amount, pending_amount,
            currency, status, payment_status, special_requirements, confirmed_at, completed_at, created_at, updated_at
        ) VALUES
        -- Booking 5: Kavya & Karthik - Wedding (past, completed)
        (
            customer_user_id_1, photographer_id, CURRENT_DATE - INTERVAL '5 days', '11:00:00', 12,
            'Taj Lands End, Mumbai', 'Taj Lands End', 'Wedding',
            75000.00, 75000.00, 0, 'INR', 'completed', 'paid',
            'Premium wedding package with drone coverage',
            NOW() - INTERVAL '10 days', NOW() - INTERVAL '5 days', NOW() - INTERVAL '10 days', NOW() - INTERVAL '5 days'
        ),
        -- Booking 6: Fashion Forward Magazine - Fashion Shoot (past, completed)
        (
            customer_user_id_4, photographer_id, CURRENT_DATE - INTERVAL '3 days', '10:00:00', 6,
            'Studio 9, Mumbai', 'Studio 9', 'Fashion Shoot',
            40000.00, 40000.00, 0, 'INR', 'completed', 'paid',
            'Fashion editorial shoot for magazine',
            NOW() - INTERVAL '8 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '8 days', NOW() - INTERVAL '3 days'
        )
        ON CONFLICT DO NOTHING;

        RAISE NOTICE 'Successfully inserted seed data for photographer_id: %', photographer_id;

    ELSE
        RAISE NOTICE 'No photographer found. Please ensure you have at least one photographer in the database.';
    END IF;
END $$;

-- Verify data was inserted
SELECT 
    'Bookings inserted' as info,
    COUNT(*) as total_bookings,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_requests,
    COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as upcoming_bookings,
    COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as current_bookings,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as past_bookings
FROM bookings
WHERE photographer_id = (
    SELECT photographer_id FROM photographers 
    WHERE user_id = (SELECT user_id FROM users WHERE email = 'your-photographer@email.com' LIMIT 1)
    LIMIT 1
);









