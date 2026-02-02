-- ============================================================================
-- Community Buzz Data - SQL INSERT Statements
-- ============================================================================
-- This file contains INSERT statements for events, posts, and related data
-- for the Community Buzz page
--
-- IMPORTANT: Make sure you have users and photographers in the database first!
-- Run this after seeding users and photographers.
-- ============================================================================

-- First, let's insert event categories if they don't exist
-- ============================================================================
INSERT INTO event_categories (category_name, slug, description, display_order, is_active)
VALUES 
  ('Wedding', 'wedding', 'Wedding ceremonies and celebrations', 1, true),
  ('Fashion', 'fashion', 'Fashion shows and editorial shoots', 2, true),
  ('Corporate', 'corporate', 'Corporate events and conferences', 3, true),
  ('Birthday', 'birthday', 'Birthday parties and celebrations', 4, true),
  ('Pre Wedding', 'pre-wedding', 'Pre-wedding photoshoots', 5, true),
  ('Portrait', 'portrait', 'Portrait photography sessions', 6, true),
  ('Event', 'event', 'General events', 7, true),
  ('Festival', 'festival', 'Festival and cultural events', 8, true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- EVENTS DATA
-- ============================================================================
-- Note: Replace creator_id with actual user_id from your users table
-- Replace category_id with actual category_id from event_categories table
-- You may need to adjust these based on your actual data

-- Get category IDs (assuming they exist)
-- Wedding category
DO $$
DECLARE
  wedding_cat_id INT;
  fashion_cat_id INT;
  corporate_cat_id INT;
  birthday_cat_id INT;
  prewedding_cat_id INT;
  creator_user_id INT;
BEGIN
  -- Get category IDs
  SELECT category_id INTO wedding_cat_id FROM event_categories WHERE slug = 'wedding' LIMIT 1;
  SELECT category_id INTO fashion_cat_id FROM event_categories WHERE slug = 'fashion' LIMIT 1;
  SELECT category_id INTO corporate_cat_id FROM event_categories WHERE slug = 'corporate' LIMIT 1;
  SELECT category_id INTO birthday_cat_id FROM event_categories WHERE slug = 'birthday' LIMIT 1;
  SELECT category_id INTO prewedding_cat_id FROM event_categories WHERE slug = 'pre-wedding' LIMIT 1;
  
  -- Get first photographer user_id as creator (adjust as needed)
  SELECT u.user_id INTO creator_user_id 
  FROM users u 
  JOIN photographers p ON u.user_id = p.user_id 
  WHERE u.user_type = 'photographer' 
  LIMIT 1;
  
  -- Insert events
  INSERT INTO events (
    creator_id, category_id, title, description, event_date, event_time,
    location, venue_name, city, state, expected_attendees,
    min_budget, max_budget, status, visibility, images, tags
  ) VALUES
  -- Event 1: Royal Wedding Ceremony
  (
    creator_user_id,
    wedding_cat_id,
    'Royal Wedding Ceremony',
    'Capture the magic of this royal wedding ceremony with traditional rituals and modern elegance.',
    '2024-03-15',
    '10:00:00',
    'Grand Palace Hotel, Mumbai',
    'Grand Palace Hotel',
    'Mumbai',
    'Maharashtra',
    250,
    45000.00,
    50000.00,
    'open',
    'public',
    '["https://images.unsplash.com/photo-1519741497674-611481863552?w=800"]'::jsonb,
    '["wedding", "royal", "traditional", "mumbai"]'::jsonb
  ),
  -- Event 2: Fashion Week Finale
  (
    creator_user_id,
    fashion_cat_id,
    'Fashion Week Finale',
    'High-end fashion photography for the biggest fashion event of the season.',
    '2024-03-20',
    '19:00:00',
    'Fashion Arena, Delhi',
    'Fashion Arena',
    'Delhi',
    'Delhi',
    150,
    30000.00,
    35000.00,
    'open',
    'public',
    '["https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800"]'::jsonb,
    '["fashion", "runway", "delhi"]'::jsonb
  ),
  -- Event 3: Corporate Gala Night
  (
    creator_user_id,
    corporate_cat_id,
    'Corporate Gala Night',
    'Professional event photography for corporate milestone celebration.',
    '2024-03-25',
    '18:30:00',
    'Business Center, Bangalore',
    'Business Center',
    'Bangalore',
    'Karnataka',
    300,
    20000.00,
    25000.00,
    'open',
    'public',
    '["https://images.unsplash.com/photo-1511578314322-379afb476865?w=800"]'::jsonb,
    '["corporate", "gala", "bangalore"]'::jsonb
  ),
  -- Event 4: Birthday Bash Celebration
  (
    creator_user_id,
    birthday_cat_id,
    'Birthday Bash Celebration',
    'Fun and colorful birthday party photography with family moments.',
    '2024-03-28',
    '16:00:00',
    'Rainbow Gardens, Chennai',
    'Rainbow Gardens',
    'Chennai',
    'Tamil Nadu',
    80,
    12000.00,
    15000.00,
    'open',
    'public',
    '["https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800"]'::jsonb,
    '["birthday", "celebration", "chennai"]'::jsonb
  ),
  -- Event 5: Pre-Wedding Romance
  (
    creator_user_id,
    prewedding_cat_id,
    'Pre-Wedding Romance',
    'Romantic pre-wedding photoshoot with sunset beach backdrop.',
    '2024-04-02',
    '17:30:00',
    'Seaside Resort, Goa',
    'Seaside Resort',
    'Goa',
    'Goa',
    4,
    25000.00,
    30000.00,
    'open',
    'public',
    '["https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?w=800"]'::jsonb,
    '["pre-wedding", "beach", "romance", "goa"]'::jsonb
  ),
  -- Event 6: Annual Awards Ceremony
  (
    creator_user_id,
    corporate_cat_id,
    'Annual Awards Ceremony',
    'Red carpet and awards ceremony photography for industry leaders.',
    '2024-04-05',
    '20:00:00',
    'Grand Auditorium, Mumbai',
    'Grand Auditorium',
    'Mumbai',
    'Maharashtra',
    500,
    70000.00,
    75000.00,
    'open',
    'public',
    '["https://images.unsplash.com/photo-1511578314322-379afb476865?w=800"]'::jsonb,
    '["awards", "ceremony", "corporate", "mumbai"]'::jsonb
  ),
  -- Event 7: Designer Fashion Show
  (
    creator_user_id,
    fashion_cat_id,
    'Designer Fashion Show',
    'Runway photography for emerging designers showcase event.',
    '2024-04-10',
    '19:30:00',
    'Luxury Hotel, Delhi',
    'Luxury Hotel',
    'Delhi',
    'Delhi',
    200,
    35000.00,
    40000.00,
    'open',
    'public',
    '["https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800"]'::jsonb,
    '["fashion", "designer", "runway", "delhi"]'::jsonb
  ),
  -- Event 8: Golden Anniversary
  (
    creator_user_id,
    wedding_cat_id,
    'Golden Anniversary',
    '50th anniversary celebration with traditional photography.',
    '2024-04-14',
    '12:00:00',
    'Heritage Villa, Jaipur',
    'Heritage Villa',
    'Jaipur',
    'Rajasthan',
    120,
    20000.00,
    22000.00,
    'open',
    'public',
    '["https://images.unsplash.com/photo-1519741497674-611481863552?w=800"]'::jsonb,
    '["anniversary", "wedding", "traditional", "jaipur"]'::jsonb
  )
  ON CONFLICT DO NOTHING;
END $$;

-- ============================================================================
-- POSTS DATA (for Community Highlights and Feed)
-- ============================================================================
-- Insert sample posts with tags for trending analysis
-- Note: Replace user_id with actual photographer user_ids

DO $$
DECLARE
  photographer_user_id INT;
  post_count INT := 0;
BEGIN
  -- Get photographer user IDs (get first 3 photographers)
  FOR photographer_user_id IN 
    SELECT u.user_id 
    FROM users u 
    JOIN photographers p ON u.user_id = p.user_id 
    WHERE u.user_type = 'photographer' 
    LIMIT 3
  LOOP
    -- Insert posts for each photographer
    INSERT INTO posts (
      user_id, content_type, caption, media_urls, thumbnail_url,
      location, tags, likes_count, comments_count, shares_count,
      is_featured, visibility
    ) VALUES
    -- Post 1: Wedding Photography
    (
      photographer_user_id,
      'image',
      'Beautiful sunset wedding ceremony at Taj Falaknuma Palace. The golden hour made everything magical! ✨ #WeddingPhotography #GoldenHour #ChitraSethu',
      '["https://images.unsplash.com/photo-1519741497674-611481863552?w=800"]'::jsonb,
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=400',
      'Hyderabad, India',
      '["WeddingPhotography", "GoldenHour", "Wedding", "Wedding Season"]'::jsonb,
      1245 + (post_count * 100),
      87 + (post_count * 10),
      23 + (post_count * 2),
      CASE WHEN post_count = 0 THEN true ELSE false END,
      'public'
    ),
    -- Post 2: Fashion Editorial
    (
      photographer_user_id,
      'image',
      'Fashion editorial shoot for @vogueIndia. Loved working with this amazing team! 📸💫 #FashionPhotography #Editorial #VogueIndia',
      '["https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800"]'::jsonb,
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
      'Mumbai, India',
      '["FashionPhotography", "Editorial", "Fashion Week", "Fashion"]'::jsonb,
      2341 + (post_count * 100),
      156 + (post_count * 10),
      45 + (post_count * 2),
      CASE WHEN post_count = 1 THEN true ELSE false END,
      'public'
    ),
    -- Post 3: Pre-Wedding
    (
      photographer_user_id,
      'image',
      'Pre-wedding shoot in the beautiful landscapes of Ladakh. Nothing beats natural beauty! 🏔️❤️ #PreWedding #Ladakh #NaturePhotography',
      '["https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?w=800"]'::jsonb,
      'https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?w=400',
      'Ladakh, India',
      '["PreWedding", "Pre-Wedding Shoots", "Ladakh", "NaturePhotography"]'::jsonb,
      987 + (post_count * 100),
      54 + (post_count * 10),
      18 + (post_count * 2),
      false,
      'public'
    ),
    -- Post 4: Corporate Event
    (
      photographer_user_id,
      'image',
      'Corporate headshots that tell a story. Professional photography isn''t just about the camera - it''s about connecting with your subject. 💼📷 #CorporateEvents #Portrait',
      '["https://images.unsplash.com/photo-1511578314322-379afb476865?w=800"]'::jsonb,
      'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400',
      'Bangalore, India',
      '["CorporateEvents", "Corporate", "Portrait", "Professional"]'::jsonb,
      634 + (post_count * 100),
      42 + (post_count * 10),
      18 + (post_count * 2),
      false,
      'public'
    ),
    -- Post 5: Birthday Party
    (
      photographer_user_id,
      'image',
      'Birthday celebrations are about capturing joy in its purest form! This little one''s smile made my day ✨🎂 #BirthdayPhotography #Joy #Memories #Birthday Parties',
      '["https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800"]'::jsonb,
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400',
      'Chennai, India',
      '["BirthdayPhotography", "Birthday Parties", "Joy", "Memories"]'::jsonb,
      456 + (post_count * 100),
      34 + (post_count * 10),
      12 + (post_count * 2),
      false,
      'public'
    );
    
    post_count := post_count + 1;
  END LOOP;
END $$;

-- ============================================================================
-- Verify Data Inserted
-- ============================================================================
-- Run these queries to verify the data was inserted correctly

-- SELECT COUNT(*) as total_events FROM events;
-- SELECT COUNT(*) as total_posts FROM posts;
-- SELECT COUNT(*) as total_categories FROM event_categories;

-- View events
-- SELECT e.event_id, e.title, ec.category_name, e.event_date, e.location 
-- FROM events e 
-- JOIN event_categories ec ON e.category_id = ec.category_id 
-- ORDER BY e.event_date;

-- View posts with tags
-- SELECT p.post_id, p.caption, p.tags, p.likes_count, p.is_featured 
-- FROM posts p 
-- ORDER BY p.created_at DESC 
-- LIMIT 10;





