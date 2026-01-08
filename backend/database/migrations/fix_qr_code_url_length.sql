-- ============================================================================
-- Fix QR Code URL Column Length
-- The qr_code_url stores base64 images which can be very long
-- Change from VARCHAR(500) to TEXT
-- ============================================================================

-- Alter the column to TEXT type (unlimited length)
ALTER TABLE photo_booth_galleries 
ALTER COLUMN qr_code_url TYPE TEXT;

