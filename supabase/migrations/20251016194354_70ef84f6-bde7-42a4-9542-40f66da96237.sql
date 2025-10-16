-- First, delete duplicate login stats, keeping only the most recent one for each user
WITH ranked_stats AS (
  SELECT 
    id,
    user_id,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY last_login_at DESC, created_at DESC) as rn
  FROM user_login_stats
),
duplicates_to_delete AS (
  SELECT id
  FROM ranked_stats
  WHERE rn > 1
)
DELETE FROM user_login_stats
WHERE id IN (SELECT id FROM duplicates_to_delete);

-- Update the remaining records to have the correct total login count
WITH login_counts AS (
  SELECT 
    user_id,
    COUNT(*) as total_deleted_logins
  FROM user_login_stats
  GROUP BY user_id
)
UPDATE user_login_stats uls
SET login_count = GREATEST(uls.login_count, lc.total_deleted_logins)
FROM login_counts lc
WHERE uls.user_id = lc.user_id;

-- Add unique constraint on user_id to prevent future duplicates
ALTER TABLE user_login_stats
ADD CONSTRAINT user_login_stats_user_id_unique UNIQUE (user_id);