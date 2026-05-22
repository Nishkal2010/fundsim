-- Add percentile_band to deal_shares for viral OG card copy
-- ("Top 14% of PE deals this week"). Computed on write by share-create API.
ALTER TABLE deal_shares
  ADD COLUMN IF NOT EXISTS percentile_band smallint;

COMMENT ON COLUMN deal_shares.percentile_band IS
  'Percentile rank (0–99) among same-simulator deals in the rolling 7-day window. NULL until computed.';
