/*
# Create initial schema for Sapphic Constellation

1. New Tables
- `profiles`: User's own profile linked to auth.users
  - `id` (uuid, primary key, references auth.users)
  - `alias` (text, cosmic alias)
  - `real_name` (text, optional real name)
  - `display_mode` (text: 'anonymous', 'hybrid', 'real_name')
  - `consent_status` (text: 'approved', 'pending', 'revoked')
  - `created_at` (timestamp)
  
- `people`: People in the constellation (may or may not be users)
  - `id` (uuid, primary key)
  - `profile_id` (uuid, optional, references profiles if they're a user)
  - `alias` (text, cosmic alias)
  - `real_name` (text, optional)
  - `display_mode` (text)
  - `consent_status` (text)
  - `owner_id` (uuid, references auth.users - the person who owns this record)
  - `created_at` (timestamp)

- `connections`: Connections between people
  - `id` (uuid, primary key)
  - `source_person_id` (uuid, references people)
  - `target_person_id` (uuid, references people)
  - `relationship_type` (text: 'friend', 'date', 'same_event', 'introduced_by_friend')
  - `source_approved` (boolean)
  - `target_approved` (boolean)
  - `visibility` (text: 'visible', 'private', 'mutual_only')
  - `owner_id` (uuid, references auth.users - the person who owns this record)
  - `created_at` (timestamp)

- `invitations`: Pending invitations
  - `id` (uuid, primary key)
  - `inviter_id` (uuid, references auth.users)
  - `invitee_email` (text)
  - `proposed_alias` (text)
  - `proposed_relationship_type` (text)
  - `token` (text, unique, for consent URL)
  - `status` (text: 'pending', 'approved', 'rejected', 'expired')
  - `created_at` (timestamp)

2. Security
- Enable RLS on all tables
- Owner-scoped policies: users can only access their own data
- Profiles: users can manage their own profile
- People: users can manage people they've added/invited
- Connections: users can manage connections they own
- Invitations: users can manage invitations they sent or received

3. Notes
- `owner_id` on people and connections indicates who created/owns that record
- Consent flow: invitation -> person created -> connection created with mutual approval
- Privacy enforced: no visibility without mutual consent
*/

-- Profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  alias text NOT NULL,
  real_name text,
  display_mode text NOT NULL DEFAULT 'anonymous' CHECK (display_mode IN ('anonymous', 'hybrid', 'real_name')),
  consent_status text NOT NULL DEFAULT 'approved' CHECK (consent_status IN ('approved', 'pending', 'revoked')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- People table (can be users or non-users)
CREATE TABLE IF NOT EXISTS people (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  alias text NOT NULL,
  real_name text,
  display_mode text NOT NULL DEFAULT 'anonymous' CHECK (display_mode IN ('anonymous', 'hybrid', 'real_name')),
  consent_status text NOT NULL DEFAULT 'approved' CHECK (consent_status IN ('approved', 'pending', 'revoked')),
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE people ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "people_select_own" ON people;
CREATE POLICY "people_select_own" ON people FOR SELECT
  TO authenticated USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "people_insert_own" ON people;
CREATE POLICY "people_insert_own" ON people FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "people_update_own" ON people;
CREATE POLICY "people_update_own" ON people FOR UPDATE
  TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "people_delete_own" ON people;
CREATE POLICY "people_delete_own" ON people FOR DELETE
  TO authenticated USING (auth.uid() = owner_id);

-- Connections table
CREATE TABLE IF NOT EXISTS connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_person_id uuid NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  target_person_id uuid NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  relationship_type text NOT NULL CHECK (relationship_type IN ('friend', 'date', 'same_event', 'introduced_by_friend')),
  source_approved boolean NOT NULL DEFAULT false,
  target_approved boolean NOT NULL DEFAULT false,
  visibility text NOT NULL DEFAULT 'visible' CHECK (visibility IN ('visible', 'private', 'mutual_only')),
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (source_person_id, target_person_id)
);

ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "connections_select_own" ON connections;
CREATE POLICY "connections_select_own" ON connections FOR SELECT
  TO authenticated USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "connections_insert_own" ON connections;
CREATE POLICY "connections_insert_own" ON connections FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "connections_update_own" ON connections;
CREATE POLICY "connections_update_own" ON connections FOR UPDATE
  TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "connections_delete_own" ON connections;
CREATE POLICY "connections_delete_own" ON connections FOR DELETE
  TO authenticated USING (auth.uid() = owner_id);

-- Invitations table
CREATE TABLE IF NOT EXISTS invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_email text NOT NULL,
  proposed_alias text NOT NULL,
  proposed_relationship_type text NOT NULL CHECK (proposed_relationship_type IN ('friend', 'date', 'same_event', 'introduced_by_friend')),
  token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex'),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "invitations_select_own" ON invitations;
CREATE POLICY "invitations_select_own" ON invitations FOR SELECT
  TO authenticated USING (auth.uid() = inviter_id);

DROP POLICY IF EXISTS "invitations_insert_own" ON invitations;
CREATE POLICY "invitations_insert_own" ON invitations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = inviter_id);

DROP POLICY IF EXISTS "invitations_update_own" ON invitations;
CREATE POLICY "invitations_update_own" ON invitations FOR UPDATE
  TO authenticated USING (auth.uid() = inviter_id) WITH CHECK (auth.uid() = inviter_id);

-- Create indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_people_owner_id ON people(owner_id);
CREATE INDEX IF NOT EXISTS idx_connections_owner_id ON connections(owner_id);
CREATE INDEX IF NOT EXISTS idx_connections_source ON connections(source_person_id);
CREATE INDEX IF NOT EXISTS idx_connections_target ON connections(target_person_id);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_inviter_id ON invitations(inviter_id);
