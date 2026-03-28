-- Migration: Add duration column to recipe_steps table
-- Date: 2026-03-24
-- Description: Add optional duration field (in minutes) to track time for each cooking step

ALTER TABLE recipe_steps 
ADD COLUMN duration INT NULL COMMENT 'Duration in minutes for this step';

-- Example: Update existing records (optional)
-- UPDATE recipe_steps SET duration = 10 WHERE step_number = 1;
