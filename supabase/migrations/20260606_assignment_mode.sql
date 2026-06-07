-- F8 Instructor Assignment Mode
-- Adds a dedicated JSONB column for the assignment payload so instructors can
-- query submissions by sourceId without scanning the full inputs blob.
-- Additive and backward-compatible: old rows have assignment = NULL and render
-- the existing ShareView layout unchanged.

ALTER TABLE deal_shares
  ADD COLUMN IF NOT EXISTS assignment JSONB;

-- Defense text must be ≤2000 chars when present (guards DB storage; the API
-- enforces the same limit before the round-trip).
-- Postgres has no ADD CONSTRAINT IF NOT EXISTS, so guard with a catalog check.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'assignment_defense_length'
  ) THEN
    ALTER TABLE deal_shares
      ADD CONSTRAINT assignment_defense_length
      CHECK (
        assignment IS NULL
        OR char_length(assignment->>'defense') <= 2000
      );
  END IF;
END $$;

-- Index on sourceId so "fetch all submissions for assignment X" is fast.
CREATE INDEX IF NOT EXISTS deal_shares_assignment_source_id
  ON deal_shares ((assignment->>'sourceId'))
  WHERE assignment IS NOT NULL;
