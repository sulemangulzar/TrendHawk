-- Add decision_status to user_decisions table
ALTER TABLE user_decisions 
ADD COLUMN IF NOT EXISTS decision_status TEXT;

-- Update existing decisions to have a default status if they are 'saved'
UPDATE user_decisions 
SET decision_status = 'saved' 
WHERE decision_status IS NULL;

-- Ensure the column is searchable
CREATE INDEX IF NOT EXISTS idx_user_decisions_status ON user_decisions(decision_status);
