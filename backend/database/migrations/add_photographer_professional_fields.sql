-- ============================================================================
-- PHOTOGRAPHER PROFESSIONAL FIELDS MIGRATION
-- Adds certifications and awards columns to photographers table
-- ============================================================================

ALTER TABLE photographers
ADD COLUMN IF NOT EXISTS certifications TEXT,
ADD COLUMN IF NOT EXISTS awards TEXT;

PRINT 'Photographer professional fields (certifications, awards) added successfully!';







