ALTER TABLE api.projects ADD COLUMN IF NOT EXISTS uuid uuid NOT NULL DEFAULT gen_random_uuid();
CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_uuid ON api.projects (uuid);
ALTER TABLE api.posts ADD COLUMN IF NOT EXISTS uuid uuid NOT NULL DEFAULT gen_random_uuid();
CREATE UNIQUE INDEX IF NOT EXISTS idx_posts_uuid ON api.posts (uuid);
ALTER TABLE api.leads ADD COLUMN IF NOT EXISTS uuid uuid NOT NULL DEFAULT gen_random_uuid();
CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_uuid ON api.leads (uuid);
ALTER TABLE api.experiences ADD COLUMN IF NOT EXISTS uuid uuid NOT NULL DEFAULT gen_random_uuid();
CREATE UNIQUE INDEX IF NOT EXISTS idx_experiences_uuid ON api.experiences (uuid);
ALTER TABLE api.education ADD COLUMN IF NOT EXISTS uuid uuid NOT NULL DEFAULT gen_random_uuid();
CREATE UNIQUE INDEX IF NOT EXISTS idx_education_uuid ON api.education (uuid);

--
-- PostgreSQL database dump
--


-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;

--
-- Data for Name: education; Type: TABLE DATA; Schema: api; Owner: -
--

INSERT INTO api.education (id, school, degree, field, start_date, end_date, description, sort_order, created_at, updated_at) VALUES (1, 'University of New Mexico', 'Bachelor''''s', 'General and Special Education', '2025-01-01', NULL, NULL, 0, '2026-05-15 06:09:32.231911+00', '2026-05-15 06:09:32.231911+00') ON CONFLICT DO NOTHING;
INSERT INTO api.education (id, school, degree, field, start_date, end_date, description, sort_order, created_at, updated_at) VALUES (2, 'Highline College & Tacoma Community College', 'null', 'Computer Engineering Coursework', '2013-09-01', '2016-06-01', NULL, 0, '2026-05-15 06:09:32.241318+00', '2026-05-15 06:09:32.241318+00') ON CONFLICT DO NOTHING;


--
-- Data for Name: experiences; Type: TABLE DATA; Schema: api; Owner: -
--

INSERT INTO api.experiences (id, company, role, location, start_date, end_date, current, description, highlights, sort_order, created_at, updated_at) VALUES (1, 'Sibylline Americas', 'Technical Support Development Specialist', 'Seattle, WA (Remote)', '2023-04-01', '2025-09-01', false, NULL, '{"Built CI/CD pipelines from scratch with AWS CDK, reducing deployment time from 3+ hours to under 30 minutes","Developed cloud-native AWS applications supporting 100+ internal users within Amazon''s internal tooling ecosystem","Early adopter of Amazon Q (Claude/Bedrock) for AI-assisted development, cutting debugging time by 35%","Designed automated workflows eliminating 10+ hours of manual work per week","Managed 100+ ticket/month support queue with 95% SLA resolution rate","Passed Amazon internal security reviews and compliance certifications"}', 0, '2026-05-15 06:09:32.161551+00', '2026-05-15 06:09:32.161551+00') ON CONFLICT DO NOTHING;
INSERT INTO api.experiences (id, company, role, location, start_date, end_date, current, description, highlights, sort_order, created_at, updated_at) VALUES (2, 'Allied Universal (via Amazon)', 'Systems Support Specialist', 'Seattle, WA', '2022-09-01', '2023-04-01', false, NULL, '{"Developed workflow tooling reducing operational overhead","Implemented access management and data management solutions","Troubleshot hardware and software issues across cloud and on-premises environments"}', 0, '2026-05-15 06:09:32.173899+00', '2026-05-15 06:09:32.173899+00') ON CONFLICT DO NOTHING;
INSERT INTO api.experiences (id, company, role, location, start_date, end_date, current, description, highlights, sort_order, created_at, updated_at) VALUES (3, 'Allied Universal (via Amazon)', 'GSOC Operator', 'Seattle, WA', '2020-07-01', '2022-09-01', false, NULL, '{"Monitored critical infrastructure and managed incident response","Compiled performance metrics and security reports for management","Created documentation and reference materials adopted team-wide"}', 0, '2026-05-15 06:09:32.186109+00', '2026-05-15 06:09:32.186109+00') ON CONFLICT DO NOTHING;
INSERT INTO api.experiences (id, company, role, location, start_date, end_date, current, description, highlights, sort_order, created_at, updated_at) VALUES (4, 'Allied Universal (via Google)', 'Security Control Center Operator', 'Kirkland, WA', '2020-01-01', '2020-07-01', false, NULL, '{"Operated integrated security systems with focus on accuracy and rapid escalation"}', 0, '2026-05-15 06:09:32.198063+00', '2026-05-15 06:09:32.198063+00') ON CONFLICT DO NOTHING;
INSERT INTO api.experiences (id, company, role, location, start_date, end_date, current, description, highlights, sort_order, created_at, updated_at) VALUES (5, 'Experimac', 'Electronics Technician & Sales Associate', 'Federal Way / Tacoma, WA', '2016-10-01', '2018-05-01', false, NULL, '{"Managed parts inventory and device buybacks","Consistently met store sales targets"}', 0, '2026-05-15 06:09:32.209595+00', '2026-05-15 06:09:32.209595+00') ON CONFLICT DO NOTHING;
INSERT INTO api.experiences (id, company, role, location, start_date, end_date, current, description, highlights, sort_order, created_at, updated_at) VALUES (6, 'Expeditors International', 'Cargo Screening Supervisor', 'Kent, WA', '2019-06-01', '2020-01-01', false, NULL, '{"Oversaw screening operations and implemented QA processes","Maintained redundancy systems for critical procedures"}', 0, '2026-05-15 06:09:32.221939+00', '2026-05-15 06:09:32.221939+00') ON CONFLICT DO NOTHING;


--
-- Data for Name: leads; Type: TABLE DATA; Schema: api; Owner: -
--

INSERT INTO api.leads (id, name, email, message, source, status, notes, created_at, uuid) VALUES (1, 'Test', 'test@test.com', 'Smoke test', 'contact_form', 'new', NULL, '2026-05-15 07:36:36.812389+00', '4783e866-e738-477e-893c-ad2230276fb6') ON CONFLICT DO NOTHING;
INSERT INTO api.leads (id, name, email, message, source, status, notes, created_at, uuid) VALUES (2, 'Test', 't@t.com', 'smoke test', 'contact_form', 'new', NULL, '2026-05-15 07:38:13.907268+00', 'b8beb6cd-e626-4967-98be-34736c9f61b1') ON CONFLICT DO NOTHING;
INSERT INTO api.leads (id, name, email, message, source, status, notes, created_at, uuid) VALUES (4, '<script>alert(1)</script>', 'test@example.com', 'test message', 'contact_form', 'new', NULL, '2026-05-16 03:34:52.669324+00', '0acf18e6-408e-4a0e-b9f9-f82ba4cfc74f') ON CONFLICT DO NOTHING;
INSERT INTO api.leads (id, name, email, message, source, status, notes, created_at, uuid) VALUES (5, '"><script>alert(1)</script>', 'test@example.com', 'test message', 'contact_form', 'new', NULL, '2026-05-16 03:34:52.707978+00', '403ddc6a-0b02-4e1a-94f1-ed159b6a1ce1') ON CONFLICT DO NOTHING;
INSERT INTO api.leads (id, name, email, message, source, status, notes, created_at, uuid) VALUES (6, '<img src=x onerror=alert(1)>', 'test@example.com', 'test message', 'contact_form', 'new', NULL, '2026-05-16 03:34:52.749015+00', '057e87ae-4f42-457b-8e80-3f64b4645104') ON CONFLICT DO NOTHING;
INSERT INTO api.leads (id, name, email, message, source, status, notes, created_at, uuid) VALUES (10, '<script>alert(1)</script>', 'xss-test@example.com', 'test message', 'contact_form', 'new', NULL, '2026-05-16 03:37:37.659445+00', '4498a0fb-67d6-40b0-82f6-bbc264d3cd22') ON CONFLICT DO NOTHING;
INSERT INTO api.leads (id, name, email, message, source, status, notes, created_at, uuid) VALUES (11, '"><script>alert(1)</script>', 'xss-test@example.com', 'test message', 'contact_form', 'new', NULL, '2026-05-16 03:37:37.690938+00', '2d3b8aad-a3df-4484-8c6f-23945ab3fbb5') ON CONFLICT DO NOTHING;
INSERT INTO api.leads (id, name, email, message, source, status, notes, created_at, uuid) VALUES (12, '<img src=x onerror=alert(1)>', 'xss-test@example.com', 'test message', 'contact_form', 'new', NULL, '2026-05-16 03:37:37.722131+00', '4787c8c2-da6e-473f-b909-2c6bf9eee07e') ON CONFLICT DO NOTHING;
INSERT INTO api.leads (id, name, email, message, source, status, notes, created_at, uuid) VALUES (17, '<script>alert(1)</script>', 'xss-test@example.com', 'test message', 'contact_form', 'new', NULL, '2026-05-16 03:39:49.779407+00', '04ba65c6-9aba-471a-ac65-ddc26d953978') ON CONFLICT DO NOTHING;
INSERT INTO api.leads (id, name, email, message, source, status, notes, created_at, uuid) VALUES (18, '"><script>alert(1)</script>', 'xss-test@example.com', 'test message', 'contact_form', 'new', NULL, '2026-05-16 03:39:49.821622+00', '740447ac-7e50-4d6d-ac80-7d82e4120e2d') ON CONFLICT DO NOTHING;
INSERT INTO api.leads (id, name, email, message, source, status, notes, created_at, uuid) VALUES (19, '<img src=x onerror=alert(1)>', 'xss-test@example.com', 'test message', 'contact_form', 'new', NULL, '2026-05-16 03:39:49.855731+00', '5e329176-a101-48e6-bd5e-f68f285147a8') ON CONFLICT DO NOTHING;
INSERT INTO api.leads (id, name, email, message, source, status, notes, created_at, uuid) VALUES (23, '<script>alert(1)</script>', 'xss-test@example.com', 'test message', 'contact_form', 'new', NULL, '2026-05-16 03:40:59.774143+00', '0c082e7e-5f90-43a8-a0ac-a51f7879965c') ON CONFLICT DO NOTHING;
INSERT INTO api.leads (id, name, email, message, source, status, notes, created_at, uuid) VALUES (24, '"><script>alert(1)</script>', 'xss-test@example.com', 'test message', 'contact_form', 'new', NULL, '2026-05-16 03:40:59.810463+00', 'a28cadec-04d8-4c13-94bc-3d120733027b') ON CONFLICT DO NOTHING;
INSERT INTO api.leads (id, name, email, message, source, status, notes, created_at, uuid) VALUES (25, '<img src=x onerror=alert(1)>', 'xss-test@example.com', 'test message', 'contact_form', 'new', NULL, '2026-05-16 03:40:59.837072+00', '38d14e32-71c0-4206-a450-10344256800a') ON CONFLICT DO NOTHING;
INSERT INTO api.leads (id, name, email, message, source, status, notes, created_at, uuid) VALUES (29, '<script>alert(1)</script>', 'xss-test@example.com', 'test message', 'contact_form', 'new', NULL, '2026-05-16 03:53:22.052666+00', '0d1a9889-3047-41a9-8682-54937c862cf8') ON CONFLICT DO NOTHING;
INSERT INTO api.leads (id, name, email, message, source, status, notes, created_at, uuid) VALUES (30, '"><script>alert(1)</script>', 'xss-test@example.com', 'test message', 'contact_form', 'new', NULL, '2026-05-16 03:53:22.086233+00', 'cd92c92d-6b2c-47b2-bf33-35e39a1ede67') ON CONFLICT DO NOTHING;
INSERT INTO api.leads (id, name, email, message, source, status, notes, created_at, uuid) VALUES (31, '<img src=x onerror=alert(1)>', 'xss-test@example.com', 'test message', 'contact_form', 'new', NULL, '2026-05-16 03:53:22.113621+00', '42a9697e-af05-43e6-b028-81c4a46e62f5') ON CONFLICT DO NOTHING;
INSERT INTO api.leads (id, name, email, message, source, status, notes, created_at, uuid) VALUES (39, 'Test', 'test@example.com', 'valid message', 'contact_form', 'new', NULL, '2026-05-16 04:00:14.247716+00', '85c18342-db37-4331-9569-0e060e951148') ON CONFLICT DO NOTHING;
INSERT INTO api.leads (id, name, email, message, source, status, notes, created_at, uuid) VALUES (42, 'Test', 'test@example.com', '{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test"}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}', 'contact_form', 'new', NULL, '2026-05-16 04:02:20.401937+00', 'db15d860-4d43-4042-8418-60235bcea5b7') ON CONFLICT DO NOTHING;
INSERT INTO api.leads (id, name, email, message, source, status, notes, created_at, uuid) VALUES (43, 'Hacker', 'hacker@evil.com', 'cross origin test', 'contact_form', 'new', NULL, '2026-05-16 04:02:20.503796+00', 'c6a54716-c9b0-4467-ba8e-8910a0975e73') ON CONFLICT DO NOTHING;
INSERT INTO api.leads (id, name, email, message, source, status, notes, created_at, uuid) VALUES (46, 'Test', 'test@example.com', '{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test"}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}', 'contact_form', 'new', NULL, '2026-05-16 04:04:25.66301+00', 'dc014304-2deb-4cb9-a355-4fa8a66e43cc') ON CONFLICT DO NOTHING;
INSERT INTO api.leads (id, name, email, message, source, status, notes, created_at, uuid) VALUES (47, 'Hacker', 'hacker@evil.com', 'cross origin test', 'contact_form', 'new', NULL, '2026-05-16 04:04:25.730876+00', '83c9e448-36d1-4c87-8a61-2a3fbae1ff51') ON CONFLICT DO NOTHING;
INSERT INTO api.leads (id, name, email, message, source, status, notes, created_at, uuid) VALUES (48, '<script>alert(1)</script>', 'xss-test@example.com', 'test message', 'contact_form', 'new', NULL, '2026-05-16 04:04:52.421221+00', '3c644a9e-d0df-4e89-aedb-a96cb9e640c9') ON CONFLICT DO NOTHING;
INSERT INTO api.leads (id, name, email, message, source, status, notes, created_at, uuid) VALUES (49, '"><script>alert(1)</script>', 'xss-test@example.com', 'test message', 'contact_form', 'new', NULL, '2026-05-16 04:04:52.448582+00', '1b6e7b2c-830c-43c8-9a3e-d9d59467bb71') ON CONFLICT DO NOTHING;
INSERT INTO api.leads (id, name, email, message, source, status, notes, created_at, uuid) VALUES (50, '<img src=x onerror=alert(1)>', 'xss-test@example.com', 'test message', 'contact_form', 'new', NULL, '2026-05-16 04:04:52.472791+00', '9897e8c2-f8ef-458c-8d6f-e366f6814b07') ON CONFLICT DO NOTHING;
INSERT INTO api.leads (id, name, email, message, source, status, notes, created_at, uuid) VALUES (56, 'Test', 'test@example.com', '{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test"}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}', 'contact_form', 'new', NULL, '2026-05-16 04:04:58.647436+00', '3fbc6f26-b35b-42ae-b246-18af746a35e9') ON CONFLICT DO NOTHING;
INSERT INTO api.leads (id, name, email, message, source, status, notes, created_at, uuid) VALUES (57, 'Hacker', 'hacker@evil.com', 'cross origin test', 'contact_form', 'new', NULL, '2026-05-16 04:04:58.714329+00', 'c907f602-0fb0-4b39-a055-360c5a71f143') ON CONFLICT DO NOTHING;
INSERT INTO api.leads (id, name, email, message, source, status, notes, created_at, uuid) VALUES (58, '<script>alert(1)</script>', 'xss-test@example.com', 'test message', 'contact_form', 'new', NULL, '2026-05-16 04:08:42.209647+00', '2626e56d-40ca-42aa-a325-48d991fb41ec') ON CONFLICT DO NOTHING;
INSERT INTO api.leads (id, name, email, message, source, status, notes, created_at, uuid) VALUES (59, '"><script>alert(1)</script>', 'xss-test@example.com', 'test message', 'contact_form', 'new', NULL, '2026-05-16 04:08:42.235674+00', '140dd8f1-bb76-4bbf-8fe7-d5b8e30e94fa') ON CONFLICT DO NOTHING;
INSERT INTO api.leads (id, name, email, message, source, status, notes, created_at, uuid) VALUES (60, '<img src=x onerror=alert(1)>', 'xss-test@example.com', 'test message', 'contact_form', 'new', NULL, '2026-05-16 04:08:42.258335+00', '888be7a6-bdfb-4ff0-82e4-7b1f7b8199f5') ON CONFLICT DO NOTHING;
INSERT INTO api.leads (id, name, email, message, source, status, notes, created_at, uuid) VALUES (68, '<script>alert(1)</script>', 'xss-test@example.com', 'test message', 'contact_form', 'new', NULL, '2026-05-16 04:08:57.5884+00', 'ad4a485c-5799-44c6-9bbc-e8608051e5b6') ON CONFLICT DO NOTHING;
INSERT INTO api.leads (id, name, email, message, source, status, notes, created_at, uuid) VALUES (70, '<img src=x onerror=alert(1)>', 'xss-test@example.com', 'test message', 'contact_form', 'new', NULL, '2026-05-16 04:08:57.646638+00', 'f44ac216-d1a5-400e-8a02-81d68126e217') ON CONFLICT DO NOTHING;
INSERT INTO api.leads (id, name, email, message, source, status, notes, created_at, uuid) VALUES (66, 'Test', 'test@example.com', '{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test"}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}', 'contact_form', 'new', NULL, '2026-05-16 04:08:51.469935+00', '17d0fc45-3e00-47f7-8d29-e7d0488cbc61') ON CONFLICT DO NOTHING;
INSERT INTO api.leads (id, name, email, message, source, status, notes, created_at, uuid) VALUES (67, 'Hacker', 'hacker@evil.com', 'cross origin test', 'contact_form', 'new', NULL, '2026-05-16 04:08:51.547765+00', 'd2d7baea-84d4-4f38-8ed7-f195148282ce') ON CONFLICT DO NOTHING;
INSERT INTO api.leads (id, name, email, message, source, status, notes, created_at, uuid) VALUES (69, '"><script>alert(1)</script>', 'xss-test@example.com', 'test message', 'contact_form', 'new', NULL, '2026-05-16 04:08:57.622564+00', '6d9e01b5-eba3-4210-8c6b-bb3f7639c27b') ON CONFLICT DO NOTHING;
INSERT INTO api.leads (id, name, email, message, source, status, notes, created_at, uuid) VALUES (76, 'Test', 'test@example.com', '{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test"}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}', 'contact_form', 'new', NULL, '2026-05-16 04:09:15.012392+00', 'cddf514a-b04d-4463-a95c-a47aa32d0b88') ON CONFLICT DO NOTHING;
INSERT INTO api.leads (id, name, email, message, source, status, notes, created_at, uuid) VALUES (77, 'Hacker', 'hacker@evil.com', 'cross origin test', 'contact_form', 'new', NULL, '2026-05-16 04:09:15.072836+00', 'dc9a43c0-17b4-46e9-862b-cbe7f7a49f12') ON CONFLICT DO NOTHING;
INSERT INTO api.leads (id, name, email, message, source, status, notes, created_at, uuid) VALUES (80, 'Test', 'test@example.com', '{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test","next":{"a":"test"}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}', 'contact_form', 'new', NULL, '2026-05-16 04:10:52.514866+00', '0ef738ef-a5a8-4ff4-ad15-7e526c9b8ea2') ON CONFLICT DO NOTHING;
INSERT INTO api.leads (id, name, email, message, source, status, notes, created_at, uuid) VALUES (81, 'Hacker', 'hacker@evil.com', 'cross origin test', 'contact_form', 'new', NULL, '2026-05-16 04:10:52.589096+00', 'c6347879-bc6f-46a9-860d-e3199ee582fb') ON CONFLICT DO NOTHING;
INSERT INTO api.leads (id, name, email, message, source, status, notes, created_at, uuid) VALUES (82, '<script>alert(1)</script>', 'xss-test@example.com', 'test message', 'contact_form', 'new', NULL, '2026-05-16 04:11:06.587334+00', '5329cd58-5d92-47aa-b34a-9822970f4745') ON CONFLICT DO NOTHING;
INSERT INTO api.leads (id, name, email, message, source, status, notes, created_at, uuid) VALUES (83, '"><script>alert(1)</script>', 'xss-test@example.com', 'test message', 'contact_form', 'new', NULL, '2026-05-16 04:11:06.62051+00', '5efd7078-2786-41a5-abcd-e0c4e63b81e2') ON CONFLICT DO NOTHING;
INSERT INTO api.leads (id, name, email, message, source, status, notes, created_at, uuid) VALUES (84, '<img src=x onerror=alert(1)>', 'xss-test@example.com', 'test message', 'contact_form', 'new', NULL, '2026-05-16 04:11:06.644912+00', '86b6e5ba-1ce6-4483-9d0d-1c485b92f40b') ON CONFLICT DO NOTHING;


--
-- Data for Name: posts; Type: TABLE DATA; Schema: api; Owner: -
--



--
-- Data for Name: projects; Type: TABLE DATA; Schema: api; Owner: -
--

INSERT INTO api.projects (id, title, slug, tagline, description, tech_stack, image_url, live_url, repo_url, start_date, end_date, status, sort_order, created_at, updated_at, uuid) VALUES (1, 'All-in-PG', 'all-in-pg', 'PostgREST-powered full-stack portfolio', 'A portfolio site built with React, PostgREST, and PostgreSQL. No traditional backend — the database is the server, and Gas City agents orchestrate the development workflow.', '{React,TypeScript,PostgreSQL,PostgREST,"Gas City"}', NULL, NULL, NULL, NULL, NULL, 'published', 1, '2026-05-15 06:08:46.821218+00', '2026-05-15 06:08:46.821218+00', '9f92376a-2583-4203-89ea-0b2928eaae96') ON CONFLICT DO NOTHING;
INSERT INTO api.projects (id, title, slug, tagline, description, tech_stack, image_url, live_url, repo_url, start_date, end_date, status, sort_order, created_at, updated_at, uuid) VALUES (2, 'Portfolio', 'portfolio', 'PostgREST-powered full-stack portfolio', 'A portfolio site built with React, PostgREST, and PostgreSQL. No traditional backend — the database is the server, and Gas City agents orchestrate the development workflow.', '{React,TypeScript,PostgreSQL,PostgREST,"Gas City"}', NULL, NULL, NULL, NULL, NULL, 'published', 1, '2026-05-16 07:31:52.060507+00', '2026-05-16 07:31:52.060507+00', '19c808dd-22da-4a85-9052-4f27b19d2823') ON CONFLICT DO NOTHING;


--
-- Data for Name: skills; Type: TABLE DATA; Schema: api; Owner: -
--

INSERT INTO api.skills (id, name, category, icon_url, sort_order) VALUES (8, 'JavaScript/TypeScript', 'Language', NULL, 0) ON CONFLICT DO NOTHING;
INSERT INTO api.skills (id, name, category, icon_url, sort_order) VALUES (9, 'Python', 'Language', NULL, 0) ON CONFLICT DO NOTHING;
INSERT INTO api.skills (id, name, category, icon_url, sort_order) VALUES (10, 'Bash', 'Language', NULL, 0) ON CONFLICT DO NOTHING;
INSERT INTO api.skills (id, name, category, icon_url, sort_order) VALUES (11, 'React', 'Frontend', NULL, 0) ON CONFLICT DO NOTHING;
INSERT INTO api.skills (id, name, category, icon_url, sort_order) VALUES (12, 'Node.js', 'Backend', NULL, 0) ON CONFLICT DO NOTHING;
INSERT INTO api.skills (id, name, category, icon_url, sort_order) VALUES (13, 'GraphQL', 'Backend', NULL, 0) ON CONFLICT DO NOTHING;
INSERT INTO api.skills (id, name, category, icon_url, sort_order) VALUES (14, 'REST APIs', 'Backend', NULL, 0) ON CONFLICT DO NOTHING;
INSERT INTO api.skills (id, name, category, icon_url, sort_order) VALUES (15, 'AWS Lambda', 'Cloud', NULL, 0) ON CONFLICT DO NOTHING;
INSERT INTO api.skills (id, name, category, icon_url, sort_order) VALUES (16, 'Amazon S3', 'Cloud', NULL, 0) ON CONFLICT DO NOTHING;
INSERT INTO api.skills (id, name, category, icon_url, sort_order) VALUES (17, 'DynamoDB', 'Cloud', NULL, 0) ON CONFLICT DO NOTHING;
INSERT INTO api.skills (id, name, category, icon_url, sort_order) VALUES (18, 'API Gateway', 'Cloud', NULL, 0) ON CONFLICT DO NOTHING;
INSERT INTO api.skills (id, name, category, icon_url, sort_order) VALUES (19, 'CloudWatch', 'Cloud', NULL, 0) ON CONFLICT DO NOTHING;
INSERT INTO api.skills (id, name, category, icon_url, sort_order) VALUES (20, 'AWS IAM', 'Security', NULL, 0) ON CONFLICT DO NOTHING;
INSERT INTO api.skills (id, name, category, icon_url, sort_order) VALUES (21, 'AWS KMS', 'Security', NULL, 0) ON CONFLICT DO NOTHING;
INSERT INTO api.skills (id, name, category, icon_url, sort_order) VALUES (22, 'AWS CDK', 'DevOps', NULL, 0) ON CONFLICT DO NOTHING;
INSERT INTO api.skills (id, name, category, icon_url, sort_order) VALUES (23, 'CloudFormation', 'DevOps', NULL, 0) ON CONFLICT DO NOTHING;
INSERT INTO api.skills (id, name, category, icon_url, sort_order) VALUES (24, 'CI/CD', 'DevOps', NULL, 0) ON CONFLICT DO NOTHING;
INSERT INTO api.skills (id, name, category, icon_url, sort_order) VALUES (25, 'Infrastructure as Code', 'DevOps', NULL, 0) ON CONFLICT DO NOTHING;
INSERT INTO api.skills (id, name, category, icon_url, sort_order) VALUES (26, 'Docker', 'DevOps', NULL, 0) ON CONFLICT DO NOTHING;
INSERT INTO api.skills (id, name, category, icon_url, sort_order) VALUES (27, 'Git', 'Tools', NULL, 0) ON CONFLICT DO NOTHING;
INSERT INTO api.skills (id, name, category, icon_url, sort_order) VALUES (28, 'PostgreSQL', 'Backend', NULL, 0) ON CONFLICT DO NOTHING;
INSERT INTO api.skills (id, name, category, icon_url, sort_order) VALUES (29, 'PostgREST', 'Backend', NULL, 0) ON CONFLICT DO NOTHING;
INSERT INTO api.skills (id, name, category, icon_url, sort_order) VALUES (30, 'Threat Modeling', 'Security', NULL, 0) ON CONFLICT DO NOTHING;
INSERT INTO api.skills (id, name, category, icon_url, sort_order) VALUES (31, 'Electronics Repair', 'Hardware', NULL, 0) ON CONFLICT DO NOTHING;
INSERT INTO api.skills (id, name, category, icon_url, sort_order) VALUES (32, 'Micro-soldering', 'Hardware', NULL, 0) ON CONFLICT DO NOTHING;
INSERT INTO api.skills (id, name, category, icon_url, sort_order) VALUES (33, 'PCB Repair', 'Hardware', NULL, 0) ON CONFLICT DO NOTHING;


--
-- Data for Name: project_skills; Type: TABLE DATA; Schema: api; Owner: -
--



--
-- Data for Name: site_config; Type: TABLE DATA; Schema: api; Owner: -
--

INSERT INTO api.site_config (key, value) VALUES ('site_title', '"My Portfolio"') ON CONFLICT DO NOTHING;
INSERT INTO api.site_config (key, value) VALUES ('theme', '"light"') ON CONFLICT DO NOTHING;
INSERT INTO api.site_config (key, value) VALUES ('hero_tagline', '"Software Engineer | Full Stack · AWS · DevOps"') ON CONFLICT DO NOTHING;
INSERT INTO api.site_config (key, value) VALUES ('hero_bio', '"Software Engineer with 5+ years of full-stack development, AWS cloud architecture, and end-to-end DevOps experience. Built and delivered production systems at Amazon scale."') ON CONFLICT DO NOTHING;
INSERT INTO api.site_config (key, value) VALUES ('social_linkedin', '"https://linkedin.com/in/rosejas"') ON CONFLICT DO NOTHING;
INSERT INTO api.site_config (key, value) VALUES ('social_email', '"jas@jcrose.dev"') ON CONFLICT DO NOTHING;
INSERT INTO api.site_config (key, value) VALUES ('social_github', '"https://github.com/rosejas13"') ON CONFLICT DO NOTHING;


--
-- Name: education_id_seq; Type: SEQUENCE SET; Schema: api; Owner: -
--

SELECT pg_catalog.setval('api.education_id_seq', 2, true);


--
-- Name: experiences_id_seq; Type: SEQUENCE SET; Schema: api; Owner: -
--

SELECT pg_catalog.setval('api.experiences_id_seq', 6, true);


--
-- Name: leads_id_seq; Type: SEQUENCE SET; Schema: api; Owner: -
--

SELECT pg_catalog.setval('api.leads_id_seq', 87, true);


--
-- Name: posts_id_seq; Type: SEQUENCE SET; Schema: api; Owner: -
--

SELECT pg_catalog.setval('api.posts_id_seq', 1, false);


--
-- Name: projects_id_seq; Type: SEQUENCE SET; Schema: api; Owner: -
--

SELECT pg_catalog.setval('api.projects_id_seq', 2, true);


--
-- Name: skills_id_seq; Type: SEQUENCE SET; Schema: api; Owner: -
--

SELECT pg_catalog.setval('api.skills_id_seq', 34, true);


--
-- PostgreSQL database dump complete
--


