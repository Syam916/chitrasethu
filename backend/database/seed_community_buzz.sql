-- ============================================================================
-- COMMUNITY BUZZ SEED DATA
-- Version: 1.0.0
-- Date: 2025-01-15
-- Description: Sample data for Community Buzz features (discussions, groups, collaborations)
-- ============================================================================

-- This script should be run AFTER the main seed_postgres.sql
-- Make sure users, user_profiles, and photographers tables have data first

-- ============================================================================
-- 1. DISCUSSION TOPICS
-- ============================================================================

INSERT INTO discussion_topics (user_id, title, description, category, replies_count, views_count, is_pinned, is_locked)
VALUES
    -- Equipment discussions
    (4, 'Best Camera for Wedding Photography in 2024?', 
     'I''m planning to upgrade my wedding photography setup. Looking for recommendations on cameras that perform well in low light and handle fast-paced wedding ceremonies. Budget is around 3-4 lakhs. What are you all using?',
     'Equipment', 8, 245, FALSE, FALSE),
    
    (5, 'Lighting Setup for Fashion Photography', 
     'Working on a new fashion campaign and need advice on studio lighting. What''s the best lighting kit for professional fashion shoots? Budget isn''t a major constraint, want quality equipment.',
     'Equipment', 12, 189, FALSE, FALSE),
    
    (6, 'Drone Recommendations for Event Photography', 
     'Looking to add aerial shots to my event coverage. Need recommendations for a good drone that''s reliable and produces quality footage. Anyone have experience with DJI vs other brands?',
     'Equipment', 6, 156, FALSE, FALSE),
    
    -- Business discussions
    (4, 'How do you price your wedding photography packages?', 
     'Just starting out and struggling with pricing. How do you all determine your rates? Should I charge per hour, per event, or create fixed packages? Would love to hear from experienced photographers.',
     'Business', 15, 312, TRUE, FALSE),
    
    (7, 'Client Contract Templates for Photography', 
     'Need a good contract template for my photography business. What clauses should I include? Anyone willing to share their template or recommend a good resource?',
     'Business', 9, 198, FALSE, FALSE),
    
    (5, 'Building Your Photography Brand on Social Media', 
     'Social media is crucial for photographers now. What strategies have worked best for you? Instagram vs Facebook vs LinkedIn - which platform drives the most clients?',
     'Business', 11, 267, FALSE, FALSE),
    
    -- Post-Processing discussions
    (4, 'Lightroom vs Photoshop for Wedding Photos', 
     'Still learning post-processing. Should I focus on Lightroom or Photoshop for wedding photography? What workflow do you use?',
     'Post-Processing', 14, 298, FALSE, FALSE),
    
    (6, 'Color Grading Techniques for Corporate Events', 
     'Corporate events often have challenging lighting. What color grading techniques work best to maintain professional look while fixing white balance issues?',
     'Post-Processing', 7, 145, FALSE, FALSE),
    
    -- Client Relations discussions
    (4, 'How to Handle Difficult Clients', 
     'Had a client who wasn''t happy with photos despite following all their requirements. How do you handle situations where clients are unreasonable in their expectations?',
     'Client Relations', 18, 389, FALSE, FALSE),
    
    (7, 'Best Practices for Client Communication', 
     'Communication is key in photography business. What tools and strategies do you use to keep clients informed throughout the project? Looking to improve my client experience.',
     'Client Relations', 10, 223, FALSE, FALSE),
    
    -- Techniques discussions
    (5, 'Golden Hour Photography Tips', 
     'Love shooting during golden hour but sometimes struggle with exposure. Any tips for getting perfect golden hour shots? Share your techniques!',
     'Techniques', 13, 345, FALSE, FALSE),
    
    (6, 'Candid Photography Techniques', 
     'Candid shots capture real emotions. What''s your approach to candid photography during events? How do you stay unobtrusive while getting great shots?',
     'Techniques', 9, 201, FALSE, FALSE),
    
    -- Inspiration discussions
    (5, 'Photography Projects for Portfolio Building', 
     'Looking to build my portfolio with creative projects. What kind of personal projects have helped you improve your skills and attract clients?',
     'Inspiration', 11, 256, FALSE, FALSE),
    
    (7, 'Best Photography Books and Resources', 
     'Want to keep learning and improving. What photography books, courses, or online resources have been most valuable for your growth as a photographer?',
     'Inspiration', 16, 312, FALSE, FALSE);

-- ============================================================================
-- 2. DISCUSSION REPLIES
-- ============================================================================

INSERT INTO discussion_replies (topic_id, user_id, parent_reply_id, reply_text, likes_count, is_edited, is_active)
VALUES
    -- Replies to "Best Camera for Wedding Photography in 2024?"
    ((SELECT topic_id FROM discussion_topics WHERE title = 'Best Camera for Wedding Photography in 2024?'), 5, NULL, 'I''ve been using Canon EOS R5 for weddings and it''s amazing! The low light performance is exceptional and autofocus is super fast. Well worth the investment.', 5, FALSE, TRUE),
    ((SELECT topic_id FROM discussion_topics WHERE title = 'Best Camera for Wedding Photography in 2024?'), 6, NULL, 'Sony A7 IV is also a great option. Slightly cheaper than R5 but still excellent for weddings. The eye-tracking autofocus is a game-changer for ceremonies.', 3, FALSE, TRUE),
    ((SELECT topic_id FROM discussion_topics WHERE title = 'Best Camera for Wedding Photography in 2024?'), 7, NULL, 'I use Nikon Z6 II and love it! Great value for money. The image quality is fantastic and battery life is solid for long wedding days.', 2, FALSE, TRUE),
    ((SELECT topic_id FROM discussion_topics WHERE title = 'Best Camera for Wedding Photography in 2024?'), 1, NULL, 'Thanks everyone! Leaning towards Canon R5 after hearing your experiences. Any specific lens recommendations to go with it?', 0, FALSE, TRUE),
    ((SELECT topic_id FROM discussion_topics WHERE title = 'Best Camera for Wedding Photography in 2024?'), 4, NULL, 
     'I agree with Priya! R5 is fantastic. I pair it with RF 24-70mm f/2.8 and RF 70-200mm f/2.8. Perfect combo for weddings.', 4, FALSE, TRUE),
    
    -- Replies to "How do you price your wedding photography packages?"
    ((SELECT topic_id FROM discussion_topics WHERE title = 'How do you price your wedding photography packages?'), 5, NULL, 'I charge per package (Basic, Premium, Luxury). Each includes different hours of coverage, number of photos, and deliverables. This makes it easier for clients to choose and protects you from scope creep.', 8, FALSE, TRUE),
    ((SELECT topic_id FROM discussion_topics WHERE title = 'How do you price your wedding photography packages?'), 6, NULL, 'Package pricing works best in my experience too. I have 3 tiers: 8-hour coverage, 12-hour, and full day. Base price starts at ₹50k and goes up based on inclusions.', 6, FALSE, TRUE),
    ((SELECT topic_id FROM discussion_topics WHERE title = 'How do you price your wedding photography packages?'), 7, NULL, 'When starting out, I charged ₹2k per hour plus editing costs. Now I use packages starting at ₹40k. Helps both you and the client plan better.', 4, FALSE, TRUE),
    
    -- Replies to "Lightroom vs Photoshop for Wedding Photos"
    ((SELECT topic_id FROM discussion_topics WHERE title = 'Lightroom vs Photoshop for Wedding Photos'), 5, NULL, 'Lightroom for 90% of my work - organizing, basic editing, color correction. Photoshop only for heavy retouching or complex edits. Lightroom workflow is much faster for weddings.', 9, FALSE, TRUE),
    ((SELECT topic_id FROM discussion_topics WHERE title = 'Lightroom vs Photoshop for Wedding Photos'), 6, NULL, 'Agreed! I use Lightroom for all culling and basic edits. Batch processing saves so much time. Photoshop only when I need to remove objects or do advanced compositing.', 7, FALSE, TRUE),
    ((SELECT topic_id FROM discussion_topics WHERE title = 'Lightroom vs Photoshop for Wedding Photos'), 4, NULL, 'Perfect! Starting with Lightroom then. Thanks for the advice!', 2, FALSE, TRUE),
    
    -- Replies to "How to Handle Difficult Clients"
    ((SELECT topic_id FROM discussion_topics WHERE title = 'How to Handle Difficult Clients'), 5, NULL, 'Always have a detailed contract that outlines deliverables. If client complaints, refer back to contract. Stay professional, offer reasonable solutions, but know when to stand your ground.', 12, FALSE, TRUE),
    ((SELECT topic_id FROM discussion_topics WHERE title = 'How to Handle Difficult Clients'), 6, NULL, 'Document everything - requirements, approvals, communications. A paper trail helps resolve disputes. Sometimes offering a few extra edited photos can resolve issues amicably.', 8, FALSE, TRUE),
    
    -- Replies to "Golden Hour Photography Tips"
    ((SELECT topic_id FROM discussion_topics WHERE title = 'Golden Hour Photography Tips'), 4, NULL, 'Shoot in RAW and slightly overexpose for golden hour. The warm tones look amazing and you can recover highlights if needed. Also, use spot metering on the subject.', 6, FALSE, TRUE),
    ((SELECT topic_id FROM discussion_topics WHERE title = 'Golden Hour Photography Tips'), 7, NULL, 'Arrive early to scout locations! Golden hour moves fast. I use apps like Photo Pills to plan exact timing. Worth the preparation!', 5, FALSE, TRUE);

-- ============================================================================
-- 3. COMMUNITY GROUPS
-- ============================================================================

INSERT INTO community_groups (creator_id, group_name, description, group_type, group_icon_url, member_count, is_public, is_active)
VALUES
    (4, 'Mumbai Wedding Photographers', 
     'A community for wedding photographers in Mumbai. Share tips, collaborate, and support each other in the wedding photography industry.',
     'regional', 'https://i.pravatar.cc/150?img=11', 12, TRUE, TRUE),
    
    (5, 'Fashion Photography Network', 
     'Professional fashion photographers sharing work, techniques, and business insights. High-end fashion and commercial photography focus.',
     'network', 'https://i.pravatar.cc/150?img=12', 8, TRUE, TRUE),
    
    (6, 'Corporate Event Photographers', 
     'For photographers specializing in corporate events, conferences, and business photography. Share best practices and client management tips.',
     'project', 'https://i.pravatar.cc/150?img=13', 6, TRUE, TRUE),
    
    (7, 'Portrait & Family Photography', 
     'Dedicated to portrait and family photographers. Share techniques, discuss lighting, and showcase your work in a supportive community.',
     'equipment', 'https://i.pravatar.cc/150?img=14', 10, TRUE, TRUE),
    
    (4, 'Wedding Photography Business', 
     'Business-focused group for wedding photographers. Discuss pricing, contracts, marketing, and growing your wedding photography business.',
     'other', 'https://i.pravatar.cc/150?img=11', 15, TRUE, TRUE);

-- ============================================================================
-- 4. GROUP MEMBERS
-- ============================================================================

INSERT INTO group_members (group_id, user_id, role, joined_at)
VALUES
    -- Mumbai Wedding Photographers group members
    ((SELECT group_id FROM community_groups WHERE group_name = 'Mumbai Wedding Photographers'), 4, 'admin', NOW() - INTERVAL '30 days'),
    ((SELECT group_id FROM community_groups WHERE group_name = 'Mumbai Wedding Photographers'), 5, 'member', NOW() - INTERVAL '25 days'),
    ((SELECT group_id FROM community_groups WHERE group_name = 'Mumbai Wedding Photographers'), 6, 'member', NOW() - INTERVAL '20 days'),
    ((SELECT group_id FROM community_groups WHERE group_name = 'Mumbai Wedding Photographers'), 1, 'member', NOW() - INTERVAL '15 days'),
    
    -- Fashion Photography Network members
    ((SELECT group_id FROM community_groups WHERE group_name = 'Fashion Photography Network'), 5, 'admin', NOW() - INTERVAL '45 days'),
    ((SELECT group_id FROM community_groups WHERE group_name = 'Fashion Photography Network'), 4, 'member', NOW() - INTERVAL '40 days'),
    ((SELECT group_id FROM community_groups WHERE group_name = 'Fashion Photography Network'), 1, 'member', NOW() - INTERVAL '35 days'),
    
    -- Corporate Event Photographers members
    ((SELECT group_id FROM community_groups WHERE group_name = 'Corporate Event Photographers'), 6, 'admin', NOW() - INTERVAL '60 days'),
    ((SELECT group_id FROM community_groups WHERE group_name = 'Corporate Event Photographers'), 4, 'member', NOW() - INTERVAL '55 days'),
    ((SELECT group_id FROM community_groups WHERE group_name = 'Corporate Event Photographers'), 2, 'member', NOW() - INTERVAL '50 days'),
    
    -- Portrait & Family Photography members
    ((SELECT group_id FROM community_groups WHERE group_name = 'Portrait & Family Photography'), 7, 'admin', NOW() - INTERVAL '35 days'),
    ((SELECT group_id FROM community_groups WHERE group_name = 'Portrait & Family Photography'), 5, 'member', NOW() - INTERVAL '30 days'),
    ((SELECT group_id FROM community_groups WHERE group_name = 'Portrait & Family Photography'), 3, 'member', NOW() - INTERVAL '25 days'),
    
    -- Wedding Photography Business members
    ((SELECT group_id FROM community_groups WHERE group_name = 'Wedding Photography Business'), 4, 'admin', NOW() - INTERVAL '20 days'),
    ((SELECT group_id FROM community_groups WHERE group_name = 'Wedding Photography Business'), 5, 'moderator', NOW() - INTERVAL '18 days'),
    ((SELECT group_id FROM community_groups WHERE group_name = 'Wedding Photography Business'), 6, 'member', NOW() - INTERVAL '15 days'),
    ((SELECT group_id FROM community_groups WHERE group_name = 'Wedding Photography Business'), 7, 'member', NOW() - INTERVAL '12 days');

-- ============================================================================
-- 5. COLLABORATIONS
-- ============================================================================

INSERT INTO collaborations (user_id, title, description, collaboration_type, skills, location, date, budget, responses_count, is_active)
VALUES
    (4, 'Need Second Shooter for Wedding - December 20th', 
     'Looking for an experienced second shooter for a high-end wedding in Mumbai. Must have own equipment and experience with wedding photography. Full day coverage required.',
     'seeking', '["Wedding Photography", "Second Shooter", "Candid Photography"]'::jsonb, 'Mumbai, Maharashtra', '2024-12-20', '₹15,000 - ₹20,000', 3, TRUE),
    
    (5, 'Fashion Photographer for Magazine Editorial', 
     'Opportunity for fashion photographer to work on a magazine editorial shoot. Must have portfolio demonstrating fashion photography skills. Shooting next month.',
     'seeking', '["Fashion Photography", "Editorial", "Studio Photography"]'::jsonb, 'Delhi, NCR', '2025-02-15', '₹30,000 - ₹40,000', 2, TRUE),
    
    (6, 'Offering Drone Photography Services', 
     'Professional drone photographer available for events, weddings, and real estate. Fully licensed and insured. Can provide aerial coverage for your projects.',
     'offering', '["Drone Photography", "Aerial Videography", "Event Coverage"]'::jsonb, 'Bangalore, Karnataka', '2025-03-01', '₹8,000 - ₹12,000 per day', 4, TRUE),
    
    (7, 'Looking for Assistant for Portrait Sessions', 
     'Need an assistant for upcoming portrait photography sessions. Tasks include lighting setup, equipment management, and client interaction. Great learning opportunity!',
     'seeking', '["Assistant", "Lighting", "Portrait Photography"]'::jsonb, 'Chennai, Tamil Nadu', '2025-01-30', '₹5,000 - ₹8,000 per session', 1, TRUE),
    
    (4, 'Wedding Photography Collaboration - February', 
     'Experienced wedding photographer offering collaboration opportunity. Looking to mentor or partner with emerging photographers for upcoming wedding season.',
     'offering', '["Wedding Photography", "Mentorship", "Collaboration"]'::jsonb, 'Mumbai, Maharashtra', '2025-02-28', 'Negotiable', 5, TRUE),
    
    (5, 'Fashion Week Coverage - Multiple Photographers Needed', 
     'Fashion week event requires multiple photographers for comprehensive coverage. Various roles available - runway, backstage, portraits. Professional equipment required.',
     'seeking', '["Fashion Photography", "Event Coverage", "Runway Photography"]'::jsonb, 'Mumbai, Maharashtra', '2025-02-10', '₹20,000 - ₹35,000', 6, TRUE),
    
    (6, 'Corporate Event Photography Services', 
     'Corporate photographer available for conferences, seminars, and business events. Professional coverage with quick turnaround for deliverables. References available.',
     'offering', '["Corporate Photography", "Event Coverage", "Business Photography"]'::jsonb, 'Bangalore, Karnataka', '2025-04-01', '₹15,000 - ₹25,000 per day', 2, TRUE);

-- ============================================================================
-- 6. COLLABORATION RESPONSES
-- ============================================================================

INSERT INTO collaboration_responses (collaboration_id, user_id, message, status)
VALUES
    ((SELECT collaboration_id FROM collaborations WHERE title = 'Need Second Shooter for Wedding - December 20th'), 6, 'I have 5 years of wedding photography experience and own professional equipment. Would love to second shoot for your wedding. Available on December 20th.', 'pending'),
    ((SELECT collaboration_id FROM collaborations WHERE title = 'Need Second Shooter for Wedding - December 20th'), 7, 'Experienced second shooter here. Have worked on 50+ weddings. Can provide portfolio and references. Very interested!', 'pending'),
    ((SELECT collaboration_id FROM collaborations WHERE title = 'Need Second Shooter for Wedding - December 20th'), 5, 'Available for second shooting. Have Canon R5 setup and experienced with wedding ceremonies. Flexible on rates.', 'pending'),
    
    ((SELECT collaboration_id FROM collaborations WHERE title = 'Fashion Photographer for Magazine Editorial'), 4, 'Fashion photographer with 8 years experience. Have shot for multiple magazines. Portfolio available. Very interested in this opportunity.', 'pending'),
    ((SELECT collaboration_id FROM collaborations WHERE title = 'Fashion Photographer for Magazine Editorial'), 7, 'Portrait photographer but interested in expanding to fashion. Would love the opportunity to work on this editorial shoot.', 'pending'),
    
    ((SELECT collaboration_id FROM collaborations WHERE title = 'Offering Drone Photography Services'), 4, 'Planning a destination wedding in February. Need drone coverage. Would love to discuss details.', 'pending'),
    ((SELECT collaboration_id FROM collaborations WHERE title = 'Offering Drone Photography Services'), 5, 'Corporate event in Bangalore next month. Need aerial shots. Please share portfolio.', 'pending'),
    ((SELECT collaboration_id FROM collaborations WHERE title = 'Offering Drone Photography Services'), 7, 'Real estate project needs aerial photography. Please contact to discuss requirements and availability.', 'pending'),
    
    ((SELECT collaboration_id FROM collaborations WHERE title = 'Looking for Assistant for Portrait Sessions'), 1, 'Photography student looking for hands-on experience. Available for assistant role. Eager to learn!', 'pending'),
    
    ((SELECT collaboration_id FROM collaborations WHERE title = 'Wedding Photography Collaboration - February'), 6, 'Emerging wedding photographer here. Would love mentorship opportunity. Very committed and passionate about wedding photography.', 'pending'),
    ((SELECT collaboration_id FROM collaborations WHERE title = 'Wedding Photography Collaboration - February'), 7, 'Recently started wedding photography business. Collaboration opportunity sounds perfect. Can travel to Mumbai.', 'pending');

-- ============================================================================
-- VERIFICATION QUERIES (OPTIONAL)
-- ============================================================================

-- Uncomment to verify data was inserted correctly

-- SELECT 'Discussion Topics' as table_name, COUNT(*) as record_count FROM discussion_topics
-- UNION ALL SELECT 'Discussion Replies', COUNT(*) FROM discussion_replies
-- UNION ALL SELECT 'Community Groups', COUNT(*) FROM community_groups
-- UNION ALL SELECT 'Group Members', COUNT(*) FROM group_members
-- UNION ALL SELECT 'Collaborations', COUNT(*) FROM collaborations
-- UNION ALL SELECT 'Collaboration Responses', COUNT(*) FROM collaboration_responses;


