-- ============================================================================
-- ADD POST_ID TO PORTFOLIO MIGRATION
-- Links portfolio items to posts for Instagram-like functionality
-- ============================================================================

ALTER TABLE photographer_portfolios
ADD COLUMN IF NOT EXISTS post_id INT;

-- Add foreign key constraint (optional, can be nullable for manually uploaded items)
-- ALTER TABLE photographer_portfolios
-- ADD CONSTRAINT fk_portfolio_post FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_portfolios_post_id ON photographer_portfolios(post_id);

PRINT 'Post ID column added to photographer_portfolios successfully!';

















