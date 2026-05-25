-- Content length validation constraints
-- Adds max length checks on text columns that accept user/admin content

ALTER TABLE api.projects DROP CONSTRAINT IF EXISTS case_study_max_length;
ALTER TABLE api.projects ADD CONSTRAINT case_study_max_length CHECK (char_length(case_study) <= 50000);

ALTER TABLE api.posts DROP CONSTRAINT IF EXISTS content_max_length;
ALTER TABLE api.posts ADD CONSTRAINT content_max_length CHECK (char_length(content) <= 100000);
