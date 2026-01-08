-- ============================================================================
-- FIX: Change qr_code_url from VARCHAR(500) to TEXT
-- The QR code base64 image string is too long for VARCHAR(500)
-- ============================================================================

-- Run this SQL command in your PostgreSQL database:
ALTER TABLE photo_booth_galleries 
ALTER COLUMN qr_code_url TYPE TEXT;

