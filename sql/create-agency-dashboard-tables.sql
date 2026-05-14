-- DEPRECATED: This file provisions the old non-prefixed schema.
-- Use sql/bh-pipeline-tables.sql instead.
-- DO NOT run this file against any environment.

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  avatar_url text,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view all team members"
  ON team_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM team_members tm WHERE tm.user_id = auth.uid())
  );

CREATE POLICY "Admins can manage team members"
  ON team_members FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM team_members tm WHERE tm.user_id = auth.uid() AND tm.role = 'admin')
  );

-- Add pipeline columns to leads
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS pipeline_status text NOT NULL DEFAULT 'intake_pending'
    CHECK (pipeline_status IN ('intake_pending', 'intake_complete', 'proposal_sent', 'signed', 'in_buildout', 'live')),
  ADD COLUMN IF NOT EXISTS assigned_to uuid REFERENCES team_members(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS status_changed_at timestamptz NOT NULL DEFAULT now();

-- Activity log
CREATE TABLE IF NOT EXISTS activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  team_member_id uuid REFERENCES team_members(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('status_change', 'note', 'assignment', 'proposal', 'general')),
  description text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view activity log"
  ON activity_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM team_members tm WHERE tm.user_id = auth.uid())
  );

CREATE POLICY "Team members can insert activity log"
  ON activity_log FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM team_members tm WHERE tm.user_id = auth.uid())
  );

-- Index for faster activity lookups
CREATE INDEX IF NOT EXISTS idx_activity_log_client_id ON activity_log(client_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_pipeline_status ON leads(pipeline_status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
