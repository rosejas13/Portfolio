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
-- Data for Name: posts; Type: TABLE DATA; Schema: api; Owner: -
--



--
-- Data for Name: projects; Type: TABLE DATA; Schema: api; Owner: -
--

INSERT INTO api.projects (id, title, slug, tagline, description, tech_stack, image_url, live_url, repo_url, start_date, end_date, status, sort_order, created_at, updated_at, uuid) VALUES (1, 'Portfolio', 'portfolio', 'PostgREST-powered full-stack portfolio', 'A portfolio site built with React, PostgREST, and PostgreSQL. No traditional backend — the database is the server, and Gas City agents orchestrate the development workflow.', '{React,TypeScript,PostgreSQL,PostgREST,"Gas City"}', NULL, NULL, NULL, NULL, NULL, 'published', 1, '2026-05-16 07:31:52.060507+00', '2026-05-16 07:31:52.060507+00', '19c808dd-22da-4a85-9052-4f27b19d2823') ON CONFLICT DO NOTHING;


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

-- leads_id_seq managed by the database


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


