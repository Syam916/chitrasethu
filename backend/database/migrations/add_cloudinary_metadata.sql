-- ============================================================================
-- CLOUDINARY METADATA MIGRATION
-- Add public_id and metadata columns for Cloudinary integration
-- ============================================================================

-- Add columns to photographer_portfolios table
ALTER TABLE photographer_portfolios 
ADD COLUMN IF NOT EXISTS public_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS width INT,
ADD COLUMN IF NOT EXISTS height INT,
ADD COLUMN IF NOT EXISTS format VARCHAR(10),
ADD COLUMN IF NOT EXISTS bytes BIGINT,
ADD COLUMN IF NOT EXISTS cloudinary_folder VARCHAR(255);

-- Create index for faster lookups by public_id
CREATE INDEX IF NOT EXISTS idx_portfolios_public_id ON photographer_portfolios(public_id);

-- Add columns to user_profiles table for avatar metadata
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS avatar_public_id VARCHAR(255);

-- Add columns to messages table for attachment metadata
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS attachment_public_id VARCHAR(255);

-- Add comment explaining the JSONB structure for posts.media_urls
COMMENT ON COLUMN posts.media_urls IS 'JSONB array of media objects with structure: [{"url": "...", "publicId": "...", "width": 1920, "height": 1080, "format": "webp", "bytes": 245678, "thumbnailUrl": "..."}]';

-- Add comment for photographer_portfolios.image_url
COMMENT ON COLUMN photographer_portfolios.image_url IS 'Full Cloudinary URL for the portfolio image';
COMMENT ON COLUMN photographer_portfolios.public_id IS 'Cloudinary public_id for image transformations and deletion';

PRINT 'Cloudinary metadata columns added successfully!';


