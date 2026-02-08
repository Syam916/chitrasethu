-- ============================================================================
-- VIDEO SUPPORT FOR PORTFOLIO MIGRATION
-- Add video_url and media_type columns to support video portfolio items
-- ============================================================================

-- Make image_url nullable (videos don't have image_url)
ALTER TABLE photographer_portfolios 
ALTER COLUMN image_url DROP NOT NULL;

-- Add video_url column (nullable, for video portfolio items)
ALTER TABLE photographer_portfolios 
ADD COLUMN IF NOT EXISTS video_url VARCHAR(500);

-- Add media_type column to distinguish between 'image' and 'video'
-- Default to 'image' for existing records
ALTER TABLE photographer_portfolios 
ADD COLUMN IF NOT EXISTS media_type VARCHAR(20) DEFAULT 'image';

-- Update existing records to have media_type = 'image'
UPDATE photographer_portfolios 
SET media_type = 'image' 
WHERE media_type IS NULL;

-- Add constraint to ensure media_type is either 'image' or 'video'
ALTER TABLE photographer_portfolios 
ADD CONSTRAINT check_media_type 
CHECK (media_type IN ('image', 'video'));

-- Add constraint to ensure at least one of image_url or video_url is provided
-- Note: This constraint ensures data integrity - images must have image_url, videos must have video_url
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_media_url'
  ) THEN
    ALTER TABLE photographer_portfolios 
    ADD CONSTRAINT check_media_url 
    CHECK (
      (media_type = 'image' AND image_url IS NOT NULL) OR
      (media_type = 'video' AND video_url IS NOT NULL)
    );
  END IF;
END $$;

-- Add comment explaining the columns
COMMENT ON COLUMN photographer_portfolios.image_url IS 'Full Cloudinary URL for the portfolio image (used when media_type = image)';
COMMENT ON COLUMN photographer_portfolios.video_url IS 'Full Cloudinary URL for the portfolio video (used when media_type = video)';
COMMENT ON COLUMN photographer_portfolios.media_type IS 'Type of media: image or video';

PRINT 'Video support columns added to photographer_portfolios successfully!';

