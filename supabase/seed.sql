SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- Dumped from database version 15.6
-- Dumped by pg_dump version 15.7 (Ubuntu 15.7-1.pgdg20.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	(NULL, '8e59f4e4-12c1-4a3a-9b36-df1e21e3d6bf', NULL, NULL, 'devuser@example.com', NULL, '2024-11-10 23:24:57.403454+00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2024-11-10 23:24:57.403454+00', '2024-11-10 23:24:57.403454+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	(NULL, '37050980-c727-46cf-8e93-bb37ac4bfc76', NULL, NULL, 'skiroyjenkins@gmail.com', NULL, '2024-11-11 00:42:25.469548+00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2024-11-11 00:41:56.452599+00', '2024-11-15 19:52:39.406799+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: key; Type: TABLE DATA; Schema: pgsodium; Owner: supabase_admin
--



--
-- Data for Name: checklists; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."checklists" ("id", "created_at", "title", "category", "user_id") VALUES
	('28c14664-36b6-4722-8b99-f9e57e9a8a76', '2024-11-11 22:05:59.653559+00', 'Mountain Adventure', 'Overnight', '8e59f4e4-12c1-4a3a-9b36-df1e21e3d6bf'),
	('c4979283-fd6f-4bc9-b244-7d48c29c3e0c', '2024-11-11 22:05:59.653559+00', 'Trail Running Essentials', 'Day Trip', '8e59f4e4-12c1-4a3a-9b36-df1e21e3d6bf'),
	('a1b2c3d4-e5f6-4890-abcd-1234567890ab', '2024-11-12 19:45:42.62193+00', 'Weekend Hiking Trip', 'Overnight', '37050980-c727-46cf-8e93-bb37ac4bfc76'),
	('b2c3d4e5-f6a7-489b-cdef-2345678901bc', '2024-11-12 19:45:42.62193+00', 'Two-Week Backpacking', 'Multi-Day', '37050980-c727-46cf-8e93-bb37ac4bfc76'),
	('c3d4e5f6-a7b8-49cd-efab-3456789012cd', '2024-11-12 19:45:42.62193+00', 'Day Hike Essentials', 'Day Trip', '37050980-c727-46cf-8e93-bb37ac4bfc76');


--
-- Data for Name: items; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."items" ("id", "name", "quantity", "weight", "notes", "user_id") VALUES
	('d9e19aaf-4c58-4e02-8b35-3ef1a89fa8be', 'Cooking Pot', 1, 0.8, 'Lightweight aluminum cooking pot', '8e59f4e4-12c1-4a3a-9b36-df1e21e3d6bf'),
	('a981c44b-dca8-4f0b-9d0a-0a6f39e0b347', 'First Aid Kit', 1, 0.3, 'Compact first aid kit for emergencies', '8e59f4e4-12c1-4a3a-9b36-df1e21e3d6bf'),
	('e8c6e5c1-1fbc-42df-8d94-37268e3d4b58', 'Headlamp', 1, 0.1, 'Battery-operated headlamp with extra batteries', '8e59f4e4-12c1-4a3a-9b36-df1e21e3d6bf'),
	('a431f514-079d-4a6c-a7e2-6185a0e2d9ea', 'Sleeping Pad', 1, 0.5, 'Self-inflating sleeping pad for extra comfort', '8e59f4e4-12c1-4a3a-9b36-df1e21e3d6bf'),
	('cf9e7f2c-e236-4a84-a5b7-21df24f50d63', 'Trekking Poles', 2, 0.4, 'Collapsible trekking poles for added support', '8e59f4e4-12c1-4a3a-9b36-df1e21e3d6bf'),
	('d4e5f6a7-b8c9-41de-9abc-4567890123de', 'Tent', 1, 2.5, 'Lightweight 2-person tent', '37050980-c727-46cf-8e93-bb37ac4bfc76'),
	('e5f6a7b8-c901-42ef-abcd-5678901234ef', 'Sleeping Bag', 1, 1.8, '3-season sleeping bag', '37050980-c727-46cf-8e93-bb37ac4bfc76'),
	('f6a7b8c9-012d-43de-89ab-6789012345aa', 'Cooking Stove', 1, 0.5, 'Compact stove for cooking', '37050980-c727-46cf-8e93-bb37ac4bfc76'),
	('a7b8c901-2d3e-44ab-90cd-7890123456bb', 'First Aid Kit', 1, 0.3, 'Essential first aid supplies', '37050980-c727-46cf-8e93-bb37ac4bfc76'),
	('b8c9012d-3e4f-45bc-de12-8901234567cc', 'Water Bottle', 2, 0.5, 'Stainless steel bottle', '37050980-c727-46cf-8e93-bb37ac4bfc76'),
	('c9012d3e-4f5a-46ef-1234-9012345678dd', 'Backpack', 1, 1.2, '60L backpack', '37050980-c727-46cf-8e93-bb37ac4bfc76');


--
-- Data for Name: checklist_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."checklist_items" ("id", "checklist_id", "item_id", "completed", "quantity") VALUES
	('3e8d4b4b-7cf6-41d9-bc32-bf4e9e0a0c60', '28c14664-36b6-4722-8b99-f9e57e9a8a76', 'd9e19aaf-4c58-4e02-8b35-3ef1a89fa8be', false, 1),
	('746bd8a6-5fb4-4709-a0ed-81ea74b56ab9', '28c14664-36b6-4722-8b99-f9e57e9a8a76', 'a981c44b-dca8-4f0b-9d0a-0a6f39e0b347', true, 1),
	('5fa11b3d-4af2-41c6-9ed7-8ebc623e8423', '28c14664-36b6-4722-8b99-f9e57e9a8a76', 'e8c6e5c1-1fbc-42df-8d94-37268e3d4b58', false, 1),
	('ee98eb4e-4f10-4017-b2f2-d8f08b56d1e8', 'c4979283-fd6f-4bc9-b244-7d48c29c3e0c', 'a431f514-079d-4a6c-a7e2-6185a0e2d9ea', true, 1),
	('afc58eb7-e580-4c6f-a4e3-c107b0219b59', 'c4979283-fd6f-4bc9-b244-7d48c29c3e0c', 'cf9e7f2c-e236-4a84-a5b7-21df24f50d63', true, 2),
	('1a2b3c4d-5e6f-7890-ab12-34567890abcd', 'c3d4e5f6-a7b8-49cd-efab-3456789012cd', 'd4e5f6a7-b8c9-41de-9abc-4567890123de', false, 1),
	('2b3c4d5e-6f7a-8901-bc23-45678901cdef', 'c3d4e5f6-a7b8-49cd-efab-3456789012cd', 'e5f6a7b8-c901-42ef-abcd-5678901234ef', false, 1),
	('3c4d5e6f-7a8b-9012-cd34-56789012def0', 'c3d4e5f6-a7b8-49cd-efab-3456789012cd', 'f6a7b8c9-012d-43de-89ab-6789012345aa', false, 1),
	('4d5e6f7a-8b9c-0123-de45-67890123abf1', 'c3d4e5f6-a7b8-49cd-efab-3456789012cd', 'a7b8c901-2d3e-44ab-90cd-7890123456bb', false, 1),
	('5e6f7a8b-9c0d-1234-ef56-78901234baf2', 'c3d4e5f6-a7b8-49cd-efab-3456789012cd', 'b8c9012d-3e4f-45bc-de12-8901234567cc', false, 2),
	('6f7a8b9c-0d12-3456-fa67-89012345caf3', 'c3d4e5f6-a7b8-49cd-efab-3456789012cd', 'c9012d3e-4f5a-46ef-1234-9012345678dd', false, 1);


--
-- Data for Name: user_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."user_settings" ("id", "user_id", "dark_mode", "email_notifications", "push_notifications", "updated_at", "created_at") VALUES
	('f5eaf1f3-4d66-4a9f-8a9b-64d9209ee4cc', '8e59f4e4-12c1-4a3a-9b36-df1e21e3d6bf', false, true, true, '2024-11-10 23:27:05.38125+00', '2024-11-10 23:27:05.38125+00'),
	('bcad4535-d3d0-45c9-8ed8-56582d9a7311', '37050980-c727-46cf-8e93-bb37ac4bfc76', true, true, false, '2024-11-11 00:53:38.611808+00', '2024-11-11 00:53:38.611808+00');


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: hooks; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--



--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 1, false);


--
-- Name: key_key_id_seq; Type: SEQUENCE SET; Schema: pgsodium; Owner: supabase_admin
--

SELECT pg_catalog.setval('"pgsodium"."key_key_id_seq"', 1, false);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('"supabase_functions"."hooks_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

RESET ALL;
