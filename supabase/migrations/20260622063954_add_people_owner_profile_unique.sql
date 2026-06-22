-- Ensure at most one self-node per user (owner_id + profile_id pair).
-- Previously createProfile upserted with onConflict: 'owner_id,profile_id',
-- but no unique constraint existed, so the upsert failed or duplicated rows.
CREATE UNIQUE INDEX IF NOT EXISTS people_owner_profile_unique
  ON public.people (owner_id, profile_id)
  WHERE profile_id IS NOT NULL;
