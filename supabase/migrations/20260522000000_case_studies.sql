-- Case study support for the projects table
-- Adds a long-form markdown column for project case studies

ALTER TABLE api.projects ADD COLUMN IF NOT EXISTS case_study text;
ALTER TABLE api.projects ADD COLUMN IF NOT EXISTS case_study_updated_at timestamptz;
