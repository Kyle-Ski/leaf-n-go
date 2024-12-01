SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- Dumped from database version 15.6
-- Dumped by pg_dump version 15.6

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

INSERT INTO "auth"."audit_log_entries" ("instance_id", "id", "payload", "created_at", "ip_address") VALUES
	('00000000-0000-0000-0000-000000000000', '5dfe5a8c-95e4-41b8-863e-4b54f4a4dab4', '{"action":"user_confirmation_requested","actor_id":"21a63dea-a866-4582-8cea-0a754dbd88e2","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2024-11-09 22:02:41.198572+00', ''),
	('00000000-0000-0000-0000-000000000000', '5e256bd0-9cf2-4667-b3a4-d3b78dd6c408', '{"action":"user_signedup","actor_id":"21a63dea-a866-4582-8cea-0a754dbd88e2","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"team"}', '2024-11-09 22:03:55.709735+00', ''),
	('00000000-0000-0000-0000-000000000000', '8cead18a-cb36-4a6f-a0b4-7cdf1c68867f', '{"action":"login","actor_id":"21a63dea-a866-4582-8cea-0a754dbd88e2","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-09 22:04:08.66548+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fa19a4aa-2579-42a4-926b-4ecccaba8bbf', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"skiroyjenkins@gmail.com","user_id":"21a63dea-a866-4582-8cea-0a754dbd88e2","user_phone":""}}', '2024-11-09 22:19:09.560966+00', ''),
	('00000000-0000-0000-0000-000000000000', '73894874-8394-421d-80dd-5e39fc58084d', '{"action":"user_confirmation_requested","actor_id":"88c86313-a1b4-41be-b62a-0dbdc91a4862","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2024-11-09 22:19:45.249261+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a00d50a3-01f7-46dc-8f1b-2796890a7011', '{"action":"user_signedup","actor_id":"88c86313-a1b4-41be-b62a-0dbdc91a4862","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"team"}', '2024-11-09 22:20:00.860644+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f7a79c39-193b-4ad3-a247-e9fe6dc3cbff', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"skiroyjenkins@gmail.com","user_id":"88c86313-a1b4-41be-b62a-0dbdc91a4862","user_phone":""}}', '2024-11-09 23:22:29.336253+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd6c0bdcb-44e4-4699-8657-da13ab7b1aea', '{"action":"user_confirmation_requested","actor_id":"7d87a987-f5d0-4f63-9724-0dfc84cda4ab","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2024-11-09 23:22:53.899232+00', ''),
	('00000000-0000-0000-0000-000000000000', '05600229-97de-46cb-a4d7-81e7679af594', '{"action":"user_signedup","actor_id":"7d87a987-f5d0-4f63-9724-0dfc84cda4ab","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"team"}', '2024-11-09 23:23:22.029279+00', ''),
	('00000000-0000-0000-0000-000000000000', '47376556-9fc8-4972-9845-2c652b460d2e', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"skiroyjenkins@gmail.com","user_id":"7d87a987-f5d0-4f63-9724-0dfc84cda4ab","user_phone":""}}', '2024-11-09 23:34:52.812095+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b835ce4b-6f13-443a-8ee5-3a40447afb7c', '{"action":"user_confirmation_requested","actor_id":"cf65b3ce-2d4d-40be-a75a-88f38ad1b546","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2024-11-10 00:07:49.066388+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c5f5684d-4b3f-46eb-8650-97d2caf5b2b7', '{"action":"user_confirmation_requested","actor_id":"cf65b3ce-2d4d-40be-a75a-88f38ad1b546","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2024-11-10 00:15:34.869114+00', ''),
	('00000000-0000-0000-0000-000000000000', '1539daa5-5673-4b59-8dc6-0cf9777e7fb6', '{"action":"user_signedup","actor_id":"cf65b3ce-2d4d-40be-a75a-88f38ad1b546","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"team"}', '2024-11-10 00:16:19.906294+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bb12e75b-3a29-4f0d-b420-98618c4257fe', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"skiroyjenkins@gmail.com","user_id":"cf65b3ce-2d4d-40be-a75a-88f38ad1b546","user_phone":""}}', '2024-11-10 00:19:01.709828+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e6d9058e-87af-4058-9716-697cef3da920', '{"action":"user_confirmation_requested","actor_id":"8f4597e9-077e-4e49-9ff8-f3c8bc8e1e26","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2024-11-10 00:19:42.879479+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fed19c42-8011-4dbd-9585-ea51ec8329e4', '{"action":"user_signedup","actor_id":"8f4597e9-077e-4e49-9ff8-f3c8bc8e1e26","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"team"}', '2024-11-10 00:19:49.305303+00', ''),
	('00000000-0000-0000-0000-000000000000', '6ab830e9-a879-49f9-9a49-ce2473afa9b3', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"skiroyjenkins@gmail.com","user_id":"8f4597e9-077e-4e49-9ff8-f3c8bc8e1e26","user_phone":""}}', '2024-11-10 00:20:27.513391+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a0d2f0e1-2638-4b9b-82e8-8e323aad5fa4', '{"action":"user_confirmation_requested","actor_id":"7ce5557d-9d79-45fc-aa4e-f68c0ff60aec","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2024-11-10 00:21:09.570586+00', ''),
	('00000000-0000-0000-0000-000000000000', '6689780b-6991-45c5-b257-4f7e559d0944', '{"action":"user_signedup","actor_id":"7ce5557d-9d79-45fc-aa4e-f68c0ff60aec","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"team"}', '2024-11-10 00:21:30.766385+00', ''),
	('00000000-0000-0000-0000-000000000000', 'dfab767e-71ac-4a0d-8eb5-b501a6c4aca1', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"skiroyjenkins@gmail.com","user_id":"7ce5557d-9d79-45fc-aa4e-f68c0ff60aec","user_phone":""}}', '2024-11-10 00:25:51.049921+00', ''),
	('00000000-0000-0000-0000-000000000000', '244fb313-1abf-4668-bb31-c110b2328f14', '{"action":"user_confirmation_requested","actor_id":"a57e492d-39c4-4796-bcd1-fd6fbbe21137","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2024-11-10 00:27:34.668755+00', ''),
	('00000000-0000-0000-0000-000000000000', '5d5af1d8-67e7-4ec2-abe2-e84ff805eadc', '{"action":"user_signedup","actor_id":"a57e492d-39c4-4796-bcd1-fd6fbbe21137","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"team"}', '2024-11-10 00:27:49.858613+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bff53315-75a0-498d-bde8-007b03478503', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"skiroyjenkins@gmail.com","user_id":"a57e492d-39c4-4796-bcd1-fd6fbbe21137","user_phone":""}}', '2024-11-10 00:37:07.790551+00', ''),
	('00000000-0000-0000-0000-000000000000', '05a6ff81-aa05-446a-8485-c0762a34ff67', '{"action":"user_confirmation_requested","actor_id":"f6f8ea9b-d55c-4022-8778-60a8fd773528","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2024-11-10 00:37:33.848873+00', ''),
	('00000000-0000-0000-0000-000000000000', '4c9c9330-dbc7-4886-9612-412097949d9a', '{"action":"user_signedup","actor_id":"f6f8ea9b-d55c-4022-8778-60a8fd773528","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"team"}', '2024-11-10 00:37:42.574308+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f66e0225-5669-4365-ad52-add6e5b88739', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"skiroyjenkins@gmail.com","user_id":"f6f8ea9b-d55c-4022-8778-60a8fd773528","user_phone":""}}', '2024-11-10 00:45:14.333146+00', ''),
	('00000000-0000-0000-0000-000000000000', '18c0d600-6986-4ffe-b6d7-9a59edf720ab', '{"action":"user_confirmation_requested","actor_id":"b58c7a3b-566d-47ef-8687-d6b7c0b54da2","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2024-11-10 00:45:22.090892+00', ''),
	('00000000-0000-0000-0000-000000000000', '626ae1ef-74ef-4aa0-983b-81dab015cf32', '{"action":"user_signedup","actor_id":"b58c7a3b-566d-47ef-8687-d6b7c0b54da2","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"team"}', '2024-11-10 00:45:32.811309+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bf8781a3-c542-4992-9dbb-04605465b0ed', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"skiroyjenkins@gmail.com","user_id":"b58c7a3b-566d-47ef-8687-d6b7c0b54da2","user_phone":""}}', '2024-11-10 00:55:00.80746+00', ''),
	('00000000-0000-0000-0000-000000000000', '4240fa1d-fbb1-4edd-ab02-c27bae260205', '{"action":"user_confirmation_requested","actor_id":"e518d4c7-c315-48a6-8bf4-7e11f1a117b1","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2024-11-10 00:57:54.401168+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c01ff1fd-9f4e-4841-86d4-6579dcb15ffb', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"skiroyjenkins@gmail.com","user_id":"e518d4c7-c315-48a6-8bf4-7e11f1a117b1","user_phone":""}}', '2024-11-10 00:59:49.124363+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b81c5cbe-22b3-43cb-b83c-c8b35167f7f1', '{"action":"user_confirmation_requested","actor_id":"f56e67a1-8bab-4a90-9c3d-b0a7cf09a7c2","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2024-11-10 01:00:14.27079+00', ''),
	('00000000-0000-0000-0000-000000000000', '7285e335-5dd2-4ff9-882e-f82f50e535f5', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"skiroyjenkins@gmail.com","user_id":"f56e67a1-8bab-4a90-9c3d-b0a7cf09a7c2","user_phone":""}}', '2024-11-10 01:08:51.791027+00', ''),
	('00000000-0000-0000-0000-000000000000', '06f34439-b175-4129-a981-04ad8a049d1e', '{"action":"user_confirmation_requested","actor_id":"ec661a2d-890c-4a18-97be-9f22d22ad829","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2024-11-10 01:09:17.299269+00', ''),
	('00000000-0000-0000-0000-000000000000', '45c4f74c-70d0-4086-8e96-b604c3650826', '{"action":"user_signedup","actor_id":"ec661a2d-890c-4a18-97be-9f22d22ad829","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"team"}', '2024-11-10 01:09:25.496837+00', ''),
	('00000000-0000-0000-0000-000000000000', '500b2e77-d47e-4d20-9136-0cab9c2439fa', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"skiroyjenkins@gmail.com","user_id":"ec661a2d-890c-4a18-97be-9f22d22ad829","user_phone":""}}', '2024-11-10 01:11:37.325555+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd2582058-b62c-4b2b-a850-20568d20b377', '{"action":"user_confirmation_requested","actor_id":"e58a62a9-5204-4e65-bf14-8efdee18c0c2","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2024-11-10 01:11:59.258465+00', ''),
	('00000000-0000-0000-0000-000000000000', '0b2cc243-d938-47a6-ac5f-d47f4c7d424c', '{"action":"user_signedup","actor_id":"e58a62a9-5204-4e65-bf14-8efdee18c0c2","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"team"}', '2024-11-10 01:12:07.66241+00', ''),
	('00000000-0000-0000-0000-000000000000', '8fb6a5d7-e7f3-4afd-ab8d-03276f600962', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"skiroyjenkins@gmail.com","user_id":"e58a62a9-5204-4e65-bf14-8efdee18c0c2","user_phone":""}}', '2024-11-10 01:15:11.129973+00', ''),
	('00000000-0000-0000-0000-000000000000', '771db520-250d-4e6c-986e-05db21973e04', '{"action":"user_confirmation_requested","actor_id":"11efc005-6b5b-45e0-a7bf-886b98c6e441","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2024-11-10 01:15:34.615062+00', ''),
	('00000000-0000-0000-0000-000000000000', '95dcf24c-1940-4bfa-a873-cf0fbc5fd8aa', '{"action":"user_signedup","actor_id":"11efc005-6b5b-45e0-a7bf-886b98c6e441","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"team"}', '2024-11-10 01:15:45.775411+00', ''),
	('00000000-0000-0000-0000-000000000000', '3693b14f-7b65-4725-8fc9-cd2d30ca02a6', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"skiroyjenkins@gmail.com","user_id":"11efc005-6b5b-45e0-a7bf-886b98c6e441","user_phone":""}}', '2024-11-10 01:16:13.811421+00', ''),
	('00000000-0000-0000-0000-000000000000', '67cecbb2-61e8-4f7e-8716-0c23ab5265bd', '{"action":"user_confirmation_requested","actor_id":"041e9c20-4ec2-4322-b52f-e6ff93960988","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2024-11-10 01:16:57.63511+00', ''),
	('00000000-0000-0000-0000-000000000000', '8b6d8466-95db-4f0e-99f4-7ada3fb9e990', '{"action":"user_signedup","actor_id":"041e9c20-4ec2-4322-b52f-e6ff93960988","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"team"}', '2024-11-10 01:17:06.425851+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cd66f834-fe7f-4d7c-a650-d028c77c6ece', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"skiroyjenkins@gmail.com","user_id":"041e9c20-4ec2-4322-b52f-e6ff93960988","user_phone":""}}', '2024-11-10 17:35:41.536566+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a14570e6-925b-4da8-856b-fa2d8344e5f3', '{"action":"user_confirmation_requested","actor_id":"2a2624b8-7a16-451d-b734-0ac9d13f167d","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2024-11-10 17:39:17.089286+00', ''),
	('00000000-0000-0000-0000-000000000000', '6276f87d-8e1b-46c0-89de-35a39ab58f66', '{"action":"user_signedup","actor_id":"2a2624b8-7a16-451d-b734-0ac9d13f167d","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"team"}', '2024-11-10 17:39:31.955609+00', ''),
	('00000000-0000-0000-0000-000000000000', '27bdedb3-d453-43ae-a03d-fa04055e9e9f', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"skiroyjenkins@gmail.com","user_id":"2a2624b8-7a16-451d-b734-0ac9d13f167d","user_phone":""}}', '2024-11-10 17:52:22.982678+00', ''),
	('00000000-0000-0000-0000-000000000000', '79936614-09c3-4ba1-b5f2-8747d0d4d6b5', '{"action":"user_confirmation_requested","actor_id":"cc169bdf-d17f-4ecf-9e7c-0ce21ad22463","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2024-11-10 17:54:03.631937+00', ''),
	('00000000-0000-0000-0000-000000000000', '682c77dd-88dc-4b1d-a061-33d17322982a', '{"action":"user_signedup","actor_id":"cc169bdf-d17f-4ecf-9e7c-0ce21ad22463","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"team"}', '2024-11-10 17:54:50.483851+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ec7d1b7b-56a0-49da-81bd-5432904043b5', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"skiroyjenkins@gmail.com","user_id":"cc169bdf-d17f-4ecf-9e7c-0ce21ad22463","user_phone":""}}', '2024-11-10 18:04:01.23398+00', ''),
	('00000000-0000-0000-0000-000000000000', '9b21672d-f18f-44c7-b188-b9941b8e6f83', '{"action":"user_confirmation_requested","actor_id":"671e3301-e2cf-41f3-95a8-a720902147a9","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2024-11-10 18:06:06.464035+00', ''),
	('00000000-0000-0000-0000-000000000000', '9dd1a1c6-e068-406c-86d3-49843c337dcc', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"skiroyjenkins@gmail.com","user_id":"671e3301-e2cf-41f3-95a8-a720902147a9","user_phone":""}}', '2024-11-10 18:14:19.706183+00', ''),
	('00000000-0000-0000-0000-000000000000', '28e86e04-31bc-4cc7-b987-724c4a058153', '{"action":"user_confirmation_requested","actor_id":"bda84b5d-c8b5-4ede-8abd-e202c173769a","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2024-11-10 18:15:01.443824+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b3d0956b-0a33-412e-a324-b65746e026c9', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"skiroyjenkins@gmail.com","user_id":"bda84b5d-c8b5-4ede-8abd-e202c173769a","user_phone":""}}', '2024-11-10 18:19:00.179303+00', ''),
	('00000000-0000-0000-0000-000000000000', '41603317-3c21-4352-8515-fbf74bb44c2b', '{"action":"user_confirmation_requested","actor_id":"fe3f7cef-6eba-471a-bb36-0b7d470556f9","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2024-11-10 18:20:55.021898+00', ''),
	('00000000-0000-0000-0000-000000000000', '97632214-8e2b-4cde-9a7f-7aba9ca4fa45', '{"action":"user_signedup","actor_id":"fe3f7cef-6eba-471a-bb36-0b7d470556f9","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"team"}', '2024-11-10 18:25:21.333428+00', ''),
	('00000000-0000-0000-0000-000000000000', '7f6b6ba1-3e71-45cb-9397-8fe203fa70a1', '{"action":"token_refreshed","actor_id":"fe3f7cef-6eba-471a-bb36-0b7d470556f9","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"token"}', '2024-11-10 19:52:05.226932+00', ''),
	('00000000-0000-0000-0000-000000000000', '8266955d-0a1d-487c-be66-3d91be8183b3', '{"action":"token_revoked","actor_id":"fe3f7cef-6eba-471a-bb36-0b7d470556f9","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"token"}', '2024-11-10 19:52:05.230058+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c7c02f0a-8465-4bd5-a9e3-55b9ada6b932', '{"action":"login","actor_id":"fe3f7cef-6eba-471a-bb36-0b7d470556f9","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-10 19:52:29.875804+00', ''),
	('00000000-0000-0000-0000-000000000000', '626396bd-ea56-4ffe-9ce7-5704fe76de9a', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"skiroyjenkins@gmail.com","user_id":"fe3f7cef-6eba-471a-bb36-0b7d470556f9","user_phone":""}}', '2024-11-10 19:57:45.756479+00', ''),
	('00000000-0000-0000-0000-000000000000', '4bab3dd2-ad22-43a8-beaa-7441ad392ff2', '{"action":"user_confirmation_requested","actor_id":"6b35d14c-6ff8-4101-a648-fe93ec3b52ea","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2024-11-10 23:01:12.959282+00', ''),
	('00000000-0000-0000-0000-000000000000', '6f886bde-c61a-44d9-adc2-682c068970e8', '{"action":"user_signedup","actor_id":"6b35d14c-6ff8-4101-a648-fe93ec3b52ea","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"team"}', '2024-11-10 23:01:22.350403+00', ''),
	('00000000-0000-0000-0000-000000000000', '2eae762b-b054-4231-971a-f7f6171d127a', '{"action":"logout","actor_id":"6b35d14c-6ff8-4101-a648-fe93ec3b52ea","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account"}', '2024-11-10 23:04:31.195694+00', ''),
	('00000000-0000-0000-0000-000000000000', '11e872bd-157a-4d05-b6d0-d46ac8f2dedd', '{"action":"login","actor_id":"6b35d14c-6ff8-4101-a648-fe93ec3b52ea","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-10 23:04:55.556189+00', ''),
	('00000000-0000-0000-0000-000000000000', '4cd52d5f-0971-4e34-ab64-82d18e5601e8', '{"action":"logout","actor_id":"6b35d14c-6ff8-4101-a648-fe93ec3b52ea","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account"}', '2024-11-10 23:05:03.728855+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e6f2eef3-df57-4af5-a3b0-70c5023bb709', '{"action":"login","actor_id":"6b35d14c-6ff8-4101-a648-fe93ec3b52ea","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-10 23:06:23.958958+00', ''),
	('00000000-0000-0000-0000-000000000000', '8db101fe-c4c7-4d99-b96e-21bd78ff33ac', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"skiroyjenkins@gmail.com","user_id":"6b35d14c-6ff8-4101-a648-fe93ec3b52ea","user_phone":""}}', '2024-11-11 00:41:32.737553+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c9898085-27ee-4b20-8eb6-f191fc54100d', '{"action":"user_confirmation_requested","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2024-11-11 00:41:56.46017+00', ''),
	('00000000-0000-0000-0000-000000000000', 'eebc5099-2ce1-4896-a54e-0289416754f2', '{"action":"user_signedup","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"team"}', '2024-11-11 00:42:25.468952+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ff90c394-de53-4bd5-86a8-f99314ccd26e', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-11 00:43:11.562005+00', ''),
	('00000000-0000-0000-0000-000000000000', '4d214cbf-e501-41ec-b9c5-c0536093c296', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-11 00:43:57.803577+00', ''),
	('00000000-0000-0000-0000-000000000000', '11bb3db3-ea20-4400-97de-efe1eb5536b9', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-11 00:53:24.280273+00', ''),
	('00000000-0000-0000-0000-000000000000', '6b3e150b-521e-45f7-90c6-385425260d9f', '{"action":"logout","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account"}', '2024-11-11 00:53:57.654583+00', ''),
	('00000000-0000-0000-0000-000000000000', '2bd5b7c2-4085-4d7c-8d6c-eb6d251606de', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-11 00:56:25.916529+00', ''),
	('00000000-0000-0000-0000-000000000000', '305e3cc0-61d6-4954-9c1d-88c17df8d8a4', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-11 01:08:20.312074+00', ''),
	('00000000-0000-0000-0000-000000000000', '3a453ebc-e7c4-4865-aeb2-e77fca0e6742', '{"action":"logout","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account"}', '2024-11-11 01:09:15.602102+00', ''),
	('00000000-0000-0000-0000-000000000000', 'aa9225bf-3288-4baa-88e9-3737fb37646c', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-12 19:52:01.487473+00', ''),
	('00000000-0000-0000-0000-000000000000', '5210ad8c-79d9-4313-9392-53de43f9ab34', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-12 20:02:33.015709+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f86cc0ee-1289-419f-8e47-12c138682e68', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-12 20:15:08.714555+00', ''),
	('00000000-0000-0000-0000-000000000000', '14fb5288-f7f0-4832-bdb6-08bfb76e57ad', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-13 00:15:15.580341+00', ''),
	('00000000-0000-0000-0000-000000000000', '7e7d1639-ff38-42c1-8a4e-064526caa22a', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-13 00:30:35.728122+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a948dc2e-9d02-4b3d-8644-d73881d17a16', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-13 01:14:19.748447+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd3eefec4-bfd7-4782-81ed-2d38edb049e8', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-13 02:41:19.559537+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b3d7e564-da0b-4493-b4c8-05bc0eabdff1', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-13 02:42:19.952939+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b89c0d29-88af-4a77-b940-a9977fb5a358', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-13 02:48:54.879685+00', ''),
	('00000000-0000-0000-0000-000000000000', '3b2d5e13-4a60-40eb-a5e9-c1ce3528f475', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-14 17:57:34.87066+00', ''),
	('00000000-0000-0000-0000-000000000000', '1adc9e17-488a-4100-b705-53431e4333f3', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-15 14:39:46.942942+00', ''),
	('00000000-0000-0000-0000-000000000000', '13d62e89-29d7-4813-b330-f756f41fc6a7', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-15 15:00:43.205443+00', ''),
	('00000000-0000-0000-0000-000000000000', '153a2ef5-2738-45a5-ae45-1cca07ec2a70', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-15 15:06:06.621592+00', ''),
	('00000000-0000-0000-0000-000000000000', '0933861d-7ed7-441b-9f65-f01101fc715e', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-15 15:07:26.32813+00', ''),
	('00000000-0000-0000-0000-000000000000', '2d653251-f30a-4383-98e3-121834b492fb', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-15 15:10:34.904719+00', ''),
	('00000000-0000-0000-0000-000000000000', '3eea3d22-a46a-4f61-ad21-3d29c89346b1', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-15 15:11:24.02839+00', ''),
	('00000000-0000-0000-0000-000000000000', '3c87df95-c095-4795-a6e3-6aab716d309c', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-15 15:15:55.542933+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cfd03e1a-ea9d-4180-aa2e-61bc89a865ad', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-15 15:17:54.28382+00', ''),
	('00000000-0000-0000-0000-000000000000', '4ab5c65f-7696-45a8-a29e-063a44ca4710', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-15 16:14:47.781264+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bdaf578d-a49e-474d-8690-c60697119f0e', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-15 16:30:50.724599+00', ''),
	('00000000-0000-0000-0000-000000000000', '28143b0f-ad99-491d-a1e1-b6ddaba9bd0e', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-15 16:31:57.013519+00', ''),
	('00000000-0000-0000-0000-000000000000', '03e7ebd0-2f14-44f8-a46f-94441779270b', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-15 16:52:09.794366+00', ''),
	('00000000-0000-0000-0000-000000000000', 'df6794c2-b398-4e07-b299-380d6172d518', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-15 16:53:55.806022+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ae910550-51a4-4687-88fa-bf46f2d0ee19', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-15 17:00:53.668597+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fff15051-7411-41d5-a6fa-9fe1ed8bc5bf', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-15 17:01:25.162498+00', ''),
	('00000000-0000-0000-0000-000000000000', '576a8265-1f9c-4d3c-99cb-f6acac18dd2e', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-15 17:08:42.989338+00', ''),
	('00000000-0000-0000-0000-000000000000', '53591441-5a28-41db-99be-ad2939bb60d9', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-15 17:09:43.979836+00', ''),
	('00000000-0000-0000-0000-000000000000', '7ab2adb0-4004-4dd3-93bd-ca412508d99a', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-15 17:13:35.022193+00', ''),
	('00000000-0000-0000-0000-000000000000', '30c77f08-3c85-4a60-9861-96d97d63c882', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-15 17:22:27.395397+00', ''),
	('00000000-0000-0000-0000-000000000000', '8d828ae6-8313-4770-a619-22f0d556e517', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-15 17:30:41.304119+00', ''),
	('00000000-0000-0000-0000-000000000000', '6fb04d8e-65e4-4679-95ed-2268b1c71970', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-15 17:31:24.076808+00', ''),
	('00000000-0000-0000-0000-000000000000', '14b3a084-8fee-41ad-8a5d-6d0cdb243058', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-15 17:36:59.49504+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bacb1001-f5af-4bca-846d-3d21a21c1112', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-15 17:37:46.20987+00', ''),
	('00000000-0000-0000-0000-000000000000', '9bf1cdf3-a376-4013-9b4c-15b1ceced999', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-15 17:41:51.547121+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd26f8b00-d687-46e4-b1f8-c2e40ad2564a', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-15 18:03:01.006128+00', ''),
	('00000000-0000-0000-0000-000000000000', '6ab835c6-e37d-4afd-80d6-beaa5e402a6c', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-15 18:20:58.631846+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b12c2fd0-e661-49f5-8e93-3470a1e8ca3f', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-15 18:40:06.129702+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ad901e81-ae34-4be4-8ae6-e99bd26da186', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-15 18:48:36.443043+00', ''),
	('00000000-0000-0000-0000-000000000000', '22cffd1a-6351-4d8f-a79b-e372666f343d', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-15 18:50:51.598353+00', ''),
	('00000000-0000-0000-0000-000000000000', '6a4b0fca-6ce4-435b-a13d-1a347f9dc313', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-15 19:02:06.551486+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f27b5d58-74d5-41da-98c2-6a1aa6c0f6a1', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-15 19:14:59.468107+00', ''),
	('00000000-0000-0000-0000-000000000000', '310f4d53-4143-458d-851d-f125243daca0', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-15 19:20:55.418933+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c59c4bd1-5aff-41c8-85ec-3683319b7c5b', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-15 19:26:46.664486+00', ''),
	('00000000-0000-0000-0000-000000000000', '4d392bca-4f7b-499c-8b51-0e51c7ca10b2', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-15 19:27:54.655395+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ebba028c-0ff7-4fce-90a9-188f81f953ff', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-15 19:37:36.423526+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b9388b0e-2d1c-4421-bbaa-decd622e9b93', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-15 19:52:39.398453+00', ''),
	('00000000-0000-0000-0000-000000000000', '76a7913b-dd2a-4224-ad09-3c3212e0fb05', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-17 23:28:27.887393+00', ''),
	('00000000-0000-0000-0000-000000000000', '838a6ae6-47a1-4391-b61a-f069308495f4', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-11-18 00:19:10.055452+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a8479369-92c9-4646-8e81-8cc367aceb9d', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-12-01 14:54:40.55641+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ccc99e52-cf42-49c4-a9a6-70036225b5aa', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-12-01 14:56:35.171336+00', ''),
	('00000000-0000-0000-0000-000000000000', '9ab8151f-a89d-4f96-b852-a30b69f75e04', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-12-01 15:14:37.508702+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f085c0d6-2e52-4e42-9cd2-b22947028335', '{"action":"login","actor_id":"37050980-c727-46cf-8e93-bb37ac4bfc76","actor_username":"skiroyjenkins@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-12-01 16:37:50.367987+00', '');


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	(NULL, '8e59f4e4-12c1-4a3a-9b36-df1e21e3d6bf', NULL, NULL, 'devuser@example.com', NULL, '2024-11-10 23:24:57.403454+00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '{}', '{}', NULL, '2024-11-10 23:24:57.403454+00', '2024-11-10 23:24:57.403454+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '37050980-c727-46cf-8e93-bb37ac4bfc76', 'authenticated', 'authenticated', 'skiroyjenkins@gmail.com', '$2a$10$FzPG1dudcyLXGE8UdETvwuaMFCKAyMTN4lsei98m5jig2GKkUMfIq', '2024-11-11 00:42:25.469548+00', NULL, '', '2024-11-11 00:41:56.460687+00', '', NULL, '', '', NULL, '2024-12-01 16:37:50.369748+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "37050980-c727-46cf-8e93-bb37ac4bfc76", "email": "skiroyjenkins@gmail.com", "email_verified": false, "phone_verified": false}', NULL, '2024-11-11 00:41:56.452599+00', '2024-12-01 16:37:50.376353+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('37050980-c727-46cf-8e93-bb37ac4bfc76', '37050980-c727-46cf-8e93-bb37ac4bfc76', '{"sub": "37050980-c727-46cf-8e93-bb37ac4bfc76", "email": "skiroyjenkins@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2024-11-11 00:41:56.457741+00', '2024-11-11 00:41:56.45779+00', '2024-11-11 00:41:56.45779+00', '89eee15c-b408-4bd9-bb81-ea5d25406f7d');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag") VALUES
	('05f1f0dc-1d88-49e5-9677-1488b991c9ce', '37050980-c727-46cf-8e93-bb37ac4bfc76', '2024-11-15 16:14:47.784131+00', '2024-11-15 16:14:47.784131+00', NULL, 'aal1', NULL, NULL, 'node', '174.29.30.35', NULL),
	('9de69f96-1ab0-4ae6-b1fd-6e083db6acda', '37050980-c727-46cf-8e93-bb37ac4bfc76', '2024-11-12 19:52:01.497014+00', '2024-11-12 19:52:01.497014+00', NULL, 'aal1', NULL, NULL, 'node', '44.220.252.126', NULL),
	('68f3bccf-dd31-4cb2-8c0b-bb13025164a2', '37050980-c727-46cf-8e93-bb37ac4bfc76', '2024-11-12 20:02:33.018092+00', '2024-11-12 20:02:33.018092+00', NULL, 'aal1', NULL, NULL, 'node', '3.91.213.130', NULL),
	('2eacafa4-e11b-4502-ad4e-cf2ec06ad7e5', '37050980-c727-46cf-8e93-bb37ac4bfc76', '2024-11-12 20:15:08.715641+00', '2024-11-12 20:15:08.715641+00', NULL, 'aal1', NULL, NULL, 'node', '3.236.7.40', NULL),
	('31900d20-c67c-4e76-86e2-835cfddd6dd9', '37050980-c727-46cf-8e93-bb37ac4bfc76', '2024-11-13 00:15:15.582076+00', '2024-11-13 00:15:15.582076+00', NULL, 'aal1', NULL, NULL, 'node', '3.228.25.14', NULL),
	('2c26fbd6-5dc9-4ed8-974b-c23e15f394c5', '37050980-c727-46cf-8e93-bb37ac4bfc76', '2024-11-13 00:30:35.730271+00', '2024-11-13 00:30:35.730271+00', NULL, 'aal1', NULL, NULL, 'node', '3.239.92.75', NULL),
	('1bef423b-7701-4001-b27b-e777d1ae8a71', '37050980-c727-46cf-8e93-bb37ac4bfc76', '2024-11-13 01:14:19.757682+00', '2024-11-13 01:14:19.757682+00', NULL, 'aal1', NULL, NULL, 'node', '18.234.166.215', NULL),
	('94d6dfe2-63f9-49a5-a84e-b189f24cc507', '37050980-c727-46cf-8e93-bb37ac4bfc76', '2024-11-13 02:41:19.563256+00', '2024-11-13 02:41:19.563256+00', NULL, 'aal1', NULL, NULL, 'node', '44.192.2.151', NULL),
	('89fc5fad-111c-4c3d-a6c3-a7dbdf5470a8', '37050980-c727-46cf-8e93-bb37ac4bfc76', '2024-11-13 02:42:19.954275+00', '2024-11-13 02:42:19.954275+00', NULL, 'aal1', NULL, NULL, 'node', '54.158.46.198', NULL),
	('ff83773e-b949-4cdd-98da-8aaacdf569a2', '37050980-c727-46cf-8e93-bb37ac4bfc76', '2024-11-13 02:48:54.880767+00', '2024-11-13 02:48:54.880767+00', NULL, 'aal1', NULL, NULL, 'node', '54.221.135.219', NULL),
	('5088280b-6b11-402f-82fb-659f22101b0e', '37050980-c727-46cf-8e93-bb37ac4bfc76', '2024-11-14 17:57:34.887153+00', '2024-11-14 17:57:34.887153+00', NULL, 'aal1', NULL, NULL, 'node', '54.210.175.119', NULL),
	('1ff3897e-3a21-4604-90b1-519900e6a4cd', '37050980-c727-46cf-8e93-bb37ac4bfc76', '2024-11-15 14:39:46.952746+00', '2024-11-15 14:39:46.952746+00', NULL, 'aal1', NULL, NULL, 'node', '174.29.30.35', NULL),
	('ba2b0f9e-6ddd-481f-9bb1-845f8fc0076a', '37050980-c727-46cf-8e93-bb37ac4bfc76', '2024-11-15 15:00:43.207016+00', '2024-11-15 15:00:43.207016+00', NULL, 'aal1', NULL, NULL, 'node', '174.29.30.35', NULL),
	('212ea1c4-a2e9-4f20-b0de-4fa3dc958cd5', '37050980-c727-46cf-8e93-bb37ac4bfc76', '2024-11-15 15:06:06.622734+00', '2024-11-15 15:06:06.622734+00', NULL, 'aal1', NULL, NULL, 'node', '174.29.30.35', NULL),
	('f78c9d92-1331-4f6b-b28f-e89c1b8339f4', '37050980-c727-46cf-8e93-bb37ac4bfc76', '2024-11-15 15:07:26.329874+00', '2024-11-15 15:07:26.329874+00', NULL, 'aal1', NULL, NULL, 'node', '174.29.30.35', NULL),
	('1d6ccea0-eaae-4cbe-ac1e-12c8a3be69ac', '37050980-c727-46cf-8e93-bb37ac4bfc76', '2024-11-15 15:10:34.906249+00', '2024-11-15 15:10:34.906249+00', NULL, 'aal1', NULL, NULL, 'node', '174.29.30.35', NULL),
	('704f4526-18d7-4e53-9341-1236aae01369', '37050980-c727-46cf-8e93-bb37ac4bfc76', '2024-11-15 15:11:24.02913+00', '2024-11-15 15:11:24.02913+00', NULL, 'aal1', NULL, NULL, 'node', '174.29.30.35', NULL),
	('fc20500b-4f0b-40a0-a0cb-d21ab91f1378', '37050980-c727-46cf-8e93-bb37ac4bfc76', '2024-11-15 15:15:55.545607+00', '2024-11-15 15:15:55.545607+00', NULL, 'aal1', NULL, NULL, 'node', '174.29.30.35', NULL),
	('0ae2f65d-fb3e-4ebe-93b1-50e1f820e59a', '37050980-c727-46cf-8e93-bb37ac4bfc76', '2024-11-15 15:17:54.284838+00', '2024-11-15 15:17:54.284838+00', NULL, 'aal1', NULL, NULL, 'node', '3.84.3.108', NULL),
	('fed0e909-32d5-4956-89f6-0828fcd36305', '37050980-c727-46cf-8e93-bb37ac4bfc76', '2024-11-15 16:30:50.726952+00', '2024-11-15 16:30:50.726952+00', NULL, 'aal1', NULL, NULL, 'node', '174.29.30.35', NULL),
	('2c235fee-a1c9-42c0-a740-a412d6849af9', '37050980-c727-46cf-8e93-bb37ac4bfc76', '2024-11-15 16:31:57.014546+00', '2024-11-15 16:31:57.014546+00', NULL, 'aal1', NULL, NULL, 'node', '174.29.30.35', NULL),
	('02d22a52-61e2-43b4-8786-a888e57d2bb6', '37050980-c727-46cf-8e93-bb37ac4bfc76', '2024-11-15 16:52:09.797149+00', '2024-11-15 16:52:09.797149+00', NULL, 'aal1', NULL, NULL, 'node', '23.22.0.158', NULL),
	('26c9f8fb-ba65-4896-aae7-91e050ba8e15', '37050980-c727-46cf-8e93-bb37ac4bfc76', '2024-11-15 16:53:55.807041+00', '2024-11-15 16:53:55.807041+00', NULL, 'aal1', NULL, NULL, 'node', '23.22.0.158', NULL),
	('451d2cc7-eef4-4f80-92f6-32dd22969c78', '37050980-c727-46cf-8e93-bb37ac4bfc76', '2024-11-15 17:00:53.670211+00', '2024-11-15 17:00:53.670211+00', NULL, 'aal1', NULL, NULL, 'node', '174.29.30.35', NULL),
	('3669450b-f397-43df-902a-378b0a5972dc', '37050980-c727-46cf-8e93-bb37ac4bfc76', '2024-11-15 17:01:25.163369+00', '2024-11-15 17:01:25.163369+00', NULL, 'aal1', NULL, NULL, 'node', '174.29.30.35', NULL),
	('22daab06-0300-469a-badd-79694485e08d', '37050980-c727-46cf-8e93-bb37ac4bfc76', '2024-11-15 17:08:42.991031+00', '2024-11-15 17:08:42.991031+00', NULL, 'aal1', NULL, NULL, 'node', '174.29.30.35', NULL),
	('b607c378-2b15-4104-bd01-e8f3120083ec', '37050980-c727-46cf-8e93-bb37ac4bfc76', '2024-11-15 17:09:43.980575+00', '2024-11-15 17:09:43.980575+00', NULL, 'aal1', NULL, NULL, 'node', '174.29.30.35', NULL),
	('a88019f6-3265-446a-997d-2c17f068c09d', '37050980-c727-46cf-8e93-bb37ac4bfc76', '2024-11-15 17:13:35.024332+00', '2024-11-15 17:13:35.024332+00', NULL, 'aal1', NULL, NULL, 'node', '174.29.30.35', NULL),
	('41cc59d2-92e2-434d-8ff9-4facc1bbfa3e', '37050980-c727-46cf-8e93-bb37ac4bfc76', '2024-11-15 17:22:27.398353+00', '2024-11-15 17:22:27.398353+00', NULL, 'aal1', NULL, NULL, 'node', '174.29.30.35', NULL),
	('3d4c26e6-9a60-4ef8-898e-894b9dbf3468', '37050980-c727-46cf-8e93-bb37ac4bfc76', '2024-11-15 17:30:41.306869+00', '2024-11-15 17:30:41.306869+00', NULL, 'aal1', NULL, NULL, 'node', '174.29.30.35', NULL),
	('a9019c34-a78e-4b94-ab10-392cf600f111', '37050980-c727-46cf-8e93-bb37ac4bfc76', '2024-11-15 17:31:24.077745+00', '2024-11-15 17:31:24.077745+00', NULL, 'aal1', NULL, NULL, 'node', '174.29.30.35', NULL),
	('b9d3281d-aba4-46a6-9dcd-ba1a2ab0dd4e', '37050980-c727-46cf-8e93-bb37ac4bfc76', '2024-11-15 17:36:59.497304+00', '2024-11-15 17:36:59.497304+00', NULL, 'aal1', NULL, NULL, 'node', '174.29.30.35', NULL),
	('250515f9-0087-4d99-9733-f45452f7c5e0', '37050980-c727-46cf-8e93-bb37ac4bfc76', '2024-11-15 17:37:46.21064+00', '2024-11-15 17:37:46.21064+00', NULL, 'aal1', NULL, NULL, 'node', '174.29.30.35', NULL),
	('a9ad1f70-352b-438a-98da-88f8110dcc11', '37050980-c727-46cf-8e93-bb37ac4bfc76', '2024-11-15 17:41:51.548181+00', '2024-11-15 17:41:51.548181+00', NULL, 'aal1', NULL, NULL, 'node', '174.29.30.35', NULL),
	('1c0eb5a7-e390-474d-bbef-f6ceea563af1', '37050980-c727-46cf-8e93-bb37ac4bfc76', '2024-11-15 18:03:01.00717+00', '2024-11-15 18:03:01.00717+00', NULL, 'aal1', NULL, NULL, 'node', '174.29.30.35', NULL),
	('fd5192ad-f9e8-40c9-8be0-a43eabd0a33d', '37050980-c727-46cf-8e93-bb37ac4bfc76', '2024-11-15 18:20:58.63288+00', '2024-11-15 18:20:58.63288+00', NULL, 'aal1', NULL, NULL, 'node', '174.29.30.35', NULL),
	('ef561e2b-e9dd-4210-b1c8-b0c1bdcdcb37', '37050980-c727-46cf-8e93-bb37ac4bfc76', '2024-11-15 18:40:06.13211+00', '2024-11-15 18:40:06.13211+00', NULL, 'aal1', NULL, NULL, 'node', '3.227.233.242', NULL),
	('edb31eb7-14eb-44dc-8658-e055c7c6487c', '37050980-c727-46cf-8e93-bb37ac4bfc76', '2024-11-15 18:48:36.445266+00', '2024-11-15 18:48:36.445266+00', NULL, 'aal1', NULL, NULL, 'node', '3.87.152.122', NULL),
	('4c72e854-7139-4d06-8bf8-141df4f0f5ad', '37050980-c727-46cf-8e93-bb37ac4bfc76', '2024-11-15 18:50:51.600944+00', '2024-11-15 18:50:51.600944+00', NULL, 'aal1', NULL, NULL, 'node', '174.29.30.35', NULL),
	('1ef26863-af80-48f5-907b-da3b8799f473', '37050980-c727-46cf-8e93-bb37ac4bfc76', '2024-11-15 19:02:06.553001+00', '2024-11-15 19:02:06.553001+00', NULL, 'aal1', NULL, NULL, 'node', '174.29.30.35', NULL),
	('5a72ef69-be15-48b4-9e40-9b27c8f767d3', '37050980-c727-46cf-8e93-bb37ac4bfc76', '2024-11-15 19:14:59.469125+00', '2024-11-15 19:14:59.469125+00', NULL, 'aal1', NULL, NULL, 'node', '174.29.30.35', NULL),
	('abf0f03f-2059-45d0-ba62-1e8659a5d457', '37050980-c727-46cf-8e93-bb37ac4bfc76', '2024-11-15 19:20:55.421333+00', '2024-11-15 19:20:55.421333+00', NULL, 'aal1', NULL, NULL, 'node', '174.29.30.35', NULL),
	('a139b41b-5a3e-44a5-b5a7-8ca67e40bb0c', '37050980-c727-46cf-8e93-bb37ac4bfc76', '2024-11-15 19:26:46.665536+00', '2024-11-15 19:26:46.665536+00', NULL, 'aal1', NULL, NULL, 'node', '174.29.30.35', NULL),
	('563ebd98-dab0-40c8-8e46-96235638a659', '37050980-c727-46cf-8e93-bb37ac4bfc76', '2024-11-15 19:27:54.656486+00', '2024-11-15 19:27:54.656486+00', NULL, 'aal1', NULL, NULL, 'node', '174.29.30.35', NULL),
	('4c4b223d-6a79-4e9e-9a1e-ce2da9bce1dc', '37050980-c727-46cf-8e93-bb37ac4bfc76', '2024-11-15 19:37:36.424602+00', '2024-11-15 19:37:36.424602+00', NULL, 'aal1', NULL, NULL, 'node', '54.242.229.142', NULL),
	('158c40f3-b942-4536-a7b7-22830c614d3d', '37050980-c727-46cf-8e93-bb37ac4bfc76', '2024-11-15 19:52:39.399559+00', '2024-11-15 19:52:39.399559+00', NULL, 'aal1', NULL, NULL, 'node', '3.236.246.231', NULL),
	('f182451f-da2b-4839-ba89-4e59302895de', '37050980-c727-46cf-8e93-bb37ac4bfc76', '2024-11-17 23:28:27.89994+00', '2024-11-17 23:28:27.89994+00', NULL, 'aal1', NULL, NULL, 'node', '3.237.94.56', NULL),
	('c44c396a-a349-4cc4-b56a-3f6c8751717d', '37050980-c727-46cf-8e93-bb37ac4bfc76', '2024-11-18 00:19:10.056444+00', '2024-11-18 00:19:10.056444+00', NULL, 'aal1', NULL, NULL, 'node', '3.87.90.208', NULL),
	('d5e2054b-b66c-427e-9177-f6a5b722a1b4', '37050980-c727-46cf-8e93-bb37ac4bfc76', '2024-12-01 14:54:40.567836+00', '2024-12-01 14:54:40.567836+00', NULL, 'aal1', NULL, NULL, 'node', '54.162.115.23', NULL),
	('22b4961d-1169-4f13-84f3-e0f056745f54', '37050980-c727-46cf-8e93-bb37ac4bfc76', '2024-12-01 14:56:35.172962+00', '2024-12-01 14:56:35.172962+00', NULL, 'aal1', NULL, NULL, 'node', '44.210.80.25', NULL),
	('47ec63f5-5fae-4a7b-8c7b-0553084b88d2', '37050980-c727-46cf-8e93-bb37ac4bfc76', '2024-12-01 15:14:37.510899+00', '2024-12-01 15:14:37.510899+00', NULL, 'aal1', NULL, NULL, 'node', '3.82.188.24', NULL),
	('cdfa0bb1-4a78-4825-8cd0-8253c1458edb', '37050980-c727-46cf-8e93-bb37ac4bfc76', '2024-12-01 16:37:50.369826+00', '2024-12-01 16:37:50.369826+00', NULL, 'aal1', NULL, NULL, 'node', '54.152.248.55', NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('9de69f96-1ab0-4ae6-b1fd-6e083db6acda', '2024-11-12 19:52:01.52015+00', '2024-11-12 19:52:01.52015+00', 'password', '5c4ccf05-5956-4664-acf7-0fe6d19cfd6a'),
	('68f3bccf-dd31-4cb2-8c0b-bb13025164a2', '2024-11-12 20:02:33.023523+00', '2024-11-12 20:02:33.023523+00', 'password', '993ea129-5043-47e0-8230-1482112925ed'),
	('2eacafa4-e11b-4502-ad4e-cf2ec06ad7e5', '2024-11-12 20:15:08.720623+00', '2024-11-12 20:15:08.720623+00', 'password', '92ca122a-fe86-4a7b-96b8-ecc3f0165c83'),
	('31900d20-c67c-4e76-86e2-835cfddd6dd9', '2024-11-13 00:15:15.589137+00', '2024-11-13 00:15:15.589137+00', 'password', '9d43a045-c0cc-4378-95f8-280ab9936a7c'),
	('2c26fbd6-5dc9-4ed8-974b-c23e15f394c5', '2024-11-13 00:30:35.737066+00', '2024-11-13 00:30:35.737066+00', 'password', '1fca4f88-078e-487d-99fc-ba727c33a0e1'),
	('1bef423b-7701-4001-b27b-e777d1ae8a71', '2024-11-13 01:14:19.79681+00', '2024-11-13 01:14:19.79681+00', 'password', '2ea257a5-67e2-4179-b57d-a4db520c5e83'),
	('94d6dfe2-63f9-49a5-a84e-b189f24cc507', '2024-11-13 02:41:19.572482+00', '2024-11-13 02:41:19.572482+00', 'password', '59e1e33c-fec4-4abe-8487-f88fd363a128'),
	('89fc5fad-111c-4c3d-a6c3-a7dbdf5470a8', '2024-11-13 02:42:19.957374+00', '2024-11-13 02:42:19.957374+00', 'password', '3b1a5016-1a18-4b1d-b206-f81b440173d0'),
	('ff83773e-b949-4cdd-98da-8aaacdf569a2', '2024-11-13 02:48:54.886771+00', '2024-11-13 02:48:54.886771+00', 'password', '2ac04a5a-7731-4660-afe1-16c603827e63'),
	('5088280b-6b11-402f-82fb-659f22101b0e', '2024-11-14 17:57:34.939141+00', '2024-11-14 17:57:34.939141+00', 'password', '1649b8a1-e342-4df6-bb47-e2ae4618c983'),
	('1ff3897e-3a21-4604-90b1-519900e6a4cd', '2024-11-15 14:39:46.967016+00', '2024-11-15 14:39:46.967016+00', 'password', '6312d8eb-136f-4e1f-9f92-db651ea7dd42'),
	('ba2b0f9e-6ddd-481f-9bb1-845f8fc0076a', '2024-11-15 15:00:43.213313+00', '2024-11-15 15:00:43.213313+00', 'password', '271d80e4-3747-42e5-a378-67b8858f4338'),
	('212ea1c4-a2e9-4f20-b0de-4fa3dc958cd5', '2024-11-15 15:06:06.628041+00', '2024-11-15 15:06:06.628041+00', 'password', '5808d850-214d-4fce-8438-1af89f543e25'),
	('f78c9d92-1331-4f6b-b28f-e89c1b8339f4', '2024-11-15 15:07:26.332885+00', '2024-11-15 15:07:26.332885+00', 'password', '909d1679-a4e6-4be7-a6b7-8ac1013d7762'),
	('1d6ccea0-eaae-4cbe-ac1e-12c8a3be69ac', '2024-11-15 15:10:34.913026+00', '2024-11-15 15:10:34.913026+00', 'password', '77a9efd7-c5b6-4f65-a061-78cc5a31db21'),
	('704f4526-18d7-4e53-9341-1236aae01369', '2024-11-15 15:11:24.032094+00', '2024-11-15 15:11:24.032094+00', 'password', '7ec8b93a-1aef-4c65-94f2-3dbf83e2b04f'),
	('fc20500b-4f0b-40a0-a0cb-d21ab91f1378', '2024-11-15 15:15:55.553311+00', '2024-11-15 15:15:55.553311+00', 'password', 'e334d186-796c-4604-ac3d-296a74ce9aa7'),
	('0ae2f65d-fb3e-4ebe-93b1-50e1f820e59a', '2024-11-15 15:17:54.287822+00', '2024-11-15 15:17:54.287822+00', 'password', '0a70a0cc-d382-45f0-bd8c-8ee1426a144a'),
	('05f1f0dc-1d88-49e5-9677-1488b991c9ce', '2024-11-15 16:14:47.792981+00', '2024-11-15 16:14:47.792981+00', 'password', 'c7d58dce-0d80-4050-86b9-d4dc75b8d45c'),
	('fed0e909-32d5-4956-89f6-0828fcd36305', '2024-11-15 16:30:50.734012+00', '2024-11-15 16:30:50.734012+00', 'password', '5e19e9f1-ec50-419c-89ec-4d7756526c2e'),
	('2c235fee-a1c9-42c0-a740-a412d6849af9', '2024-11-15 16:31:57.017498+00', '2024-11-15 16:31:57.017498+00', 'password', 'd72fc009-4f9e-4245-ac6e-ac7e8a37a9e6'),
	('02d22a52-61e2-43b4-8786-a888e57d2bb6', '2024-11-15 16:52:09.804492+00', '2024-11-15 16:52:09.804492+00', 'password', '00ab988f-99b3-4976-a919-1c6d531a3ae6'),
	('26c9f8fb-ba65-4896-aae7-91e050ba8e15', '2024-11-15 16:53:55.810528+00', '2024-11-15 16:53:55.810528+00', 'password', '5a13e784-952d-48c5-a21e-d89060fbc740'),
	('451d2cc7-eef4-4f80-92f6-32dd22969c78', '2024-11-15 17:00:53.67599+00', '2024-11-15 17:00:53.67599+00', 'password', '432bd869-7eb7-483d-9e64-588665b94c35'),
	('3669450b-f397-43df-902a-378b0a5972dc', '2024-11-15 17:01:25.165965+00', '2024-11-15 17:01:25.165965+00', 'password', '6e1fee65-02a3-4d88-aa82-43d0a5a56cd9'),
	('22daab06-0300-469a-badd-79694485e08d', '2024-11-15 17:08:42.996682+00', '2024-11-15 17:08:42.996682+00', 'password', '19ef689c-d62b-40f1-9661-9e0c3f996ff0'),
	('b607c378-2b15-4104-bd01-e8f3120083ec', '2024-11-15 17:09:43.982521+00', '2024-11-15 17:09:43.982521+00', 'password', '77928599-4841-462a-8cbd-73bf72c1f582'),
	('a88019f6-3265-446a-997d-2c17f068c09d', '2024-11-15 17:13:35.029734+00', '2024-11-15 17:13:35.029734+00', 'password', 'b3ddba9c-8bf8-42c4-9563-23c81c02b501'),
	('41cc59d2-92e2-434d-8ff9-4facc1bbfa3e', '2024-11-15 17:22:27.40446+00', '2024-11-15 17:22:27.40446+00', 'password', '5c4a1134-c456-4fa0-8ef2-aa268144eebe'),
	('3d4c26e6-9a60-4ef8-898e-894b9dbf3468', '2024-11-15 17:30:41.311509+00', '2024-11-15 17:30:41.311509+00', 'password', 'f04b8b6b-8a7a-4bf7-aded-90d96f7e27ac'),
	('a9019c34-a78e-4b94-ab10-392cf600f111', '2024-11-15 17:31:24.079597+00', '2024-11-15 17:31:24.079597+00', 'password', 'c90ffdac-1490-417e-a991-661e44ff41d0'),
	('b9d3281d-aba4-46a6-9dcd-ba1a2ab0dd4e', '2024-11-15 17:36:59.501077+00', '2024-11-15 17:36:59.501077+00', 'password', '87dace8a-dd82-46e5-a84a-38632fd3a2ac'),
	('250515f9-0087-4d99-9733-f45452f7c5e0', '2024-11-15 17:37:46.212572+00', '2024-11-15 17:37:46.212572+00', 'password', '1c1cbdd9-daf0-485d-93f6-cbad7f4cefe9'),
	('a9ad1f70-352b-438a-98da-88f8110dcc11', '2024-11-15 17:41:51.553358+00', '2024-11-15 17:41:51.553358+00', 'password', 'f3d83dbb-8a30-4238-9b38-2822cdba6e5d'),
	('1c0eb5a7-e390-474d-bbef-f6ceea563af1', '2024-11-15 18:03:01.010804+00', '2024-11-15 18:03:01.010804+00', 'password', 'dea78bb2-c47e-45ae-acbf-97fadcac6359'),
	('fd5192ad-f9e8-40c9-8be0-a43eabd0a33d', '2024-11-15 18:20:58.637698+00', '2024-11-15 18:20:58.637698+00', 'password', '962714ee-82d2-465e-a4a9-29154a47db89'),
	('ef561e2b-e9dd-4210-b1c8-b0c1bdcdcb37', '2024-11-15 18:40:06.141076+00', '2024-11-15 18:40:06.141076+00', 'password', 'f2ac9ea4-6412-43dd-9a88-9888314a81d5'),
	('edb31eb7-14eb-44dc-8658-e055c7c6487c', '2024-11-15 18:48:36.452906+00', '2024-11-15 18:48:36.452906+00', 'password', 'c4c33a1e-43d8-4749-b465-b14b8525cae1'),
	('4c72e854-7139-4d06-8bf8-141df4f0f5ad', '2024-11-15 18:50:51.608584+00', '2024-11-15 18:50:51.608584+00', 'password', '234001e6-22cc-48b4-9d55-75e30327af40'),
	('1ef26863-af80-48f5-907b-da3b8799f473', '2024-11-15 19:02:06.559933+00', '2024-11-15 19:02:06.559933+00', 'password', '50756d86-15b2-4695-8ebc-316bd43188b0'),
	('5a72ef69-be15-48b4-9e40-9b27c8f767d3', '2024-11-15 19:14:59.474386+00', '2024-11-15 19:14:59.474386+00', 'password', '7d4621dc-fefb-430b-8d51-43abba9af58c'),
	('abf0f03f-2059-45d0-ba62-1e8659a5d457', '2024-11-15 19:20:55.426318+00', '2024-11-15 19:20:55.426318+00', 'password', '04547f8d-8fce-46c3-8831-cb85d8724628'),
	('a139b41b-5a3e-44a5-b5a7-8ca67e40bb0c', '2024-11-15 19:26:46.670166+00', '2024-11-15 19:26:46.670166+00', 'password', '49bf4676-af86-4c00-b883-1185120d168a'),
	('563ebd98-dab0-40c8-8e46-96235638a659', '2024-11-15 19:27:54.659445+00', '2024-11-15 19:27:54.659445+00', 'password', 'a3cfea55-d179-47de-b651-34198f459070'),
	('4c4b223d-6a79-4e9e-9a1e-ce2da9bce1dc', '2024-11-15 19:37:36.428512+00', '2024-11-15 19:37:36.428512+00', 'password', 'b85e288b-e10e-4a0b-94b3-14b398502cb4'),
	('158c40f3-b942-4536-a7b7-22830c614d3d', '2024-11-15 19:52:39.407382+00', '2024-11-15 19:52:39.407382+00', 'password', '2c7449a7-954b-4a97-80fd-2a3e57a1b72f'),
	('f182451f-da2b-4839-ba89-4e59302895de', '2024-11-17 23:28:27.921+00', '2024-11-17 23:28:27.921+00', 'password', '8adf1779-f1b5-4a62-902f-c50a33ca2538'),
	('c44c396a-a349-4cc4-b56a-3f6c8751717d', '2024-11-18 00:19:10.060612+00', '2024-11-18 00:19:10.060612+00', 'password', 'fb6d6691-2263-4c0c-a0bb-dc788910294b'),
	('d5e2054b-b66c-427e-9177-f6a5b722a1b4', '2024-12-01 14:54:40.606101+00', '2024-12-01 14:54:40.606101+00', 'password', 'd55d9937-ef95-4ffa-a914-e94959de7bd9'),
	('22b4961d-1169-4f13-84f3-e0f056745f54', '2024-12-01 14:56:35.179287+00', '2024-12-01 14:56:35.179287+00', 'password', '2914ba52-c098-452c-8ebd-a555c127cadd'),
	('47ec63f5-5fae-4a7b-8c7b-0553084b88d2', '2024-12-01 15:14:37.515691+00', '2024-12-01 15:14:37.515691+00', 'password', 'e978e51c-a455-472d-a1a0-d073e6c145d4'),
	('cdfa0bb1-4a78-4825-8cd0-8253c1458edb', '2024-12-01 16:37:50.376972+00', '2024-12-01 16:37:50.376972+00', 'password', '5d4faaab-d081-4007-85d0-5be63d8d9172');


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

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 29, 'Ac8TnVRnxTFHjcBGfz-RKg', '37050980-c727-46cf-8e93-bb37ac4bfc76', false, '2024-11-12 19:52:01.50544+00', '2024-11-12 19:52:01.50544+00', NULL, '9de69f96-1ab0-4ae6-b1fd-6e083db6acda'),
	('00000000-0000-0000-0000-000000000000', 30, 'HBpVF2cMkRrN4PVP7Z267g', '37050980-c727-46cf-8e93-bb37ac4bfc76', false, '2024-11-12 20:02:33.019868+00', '2024-11-12 20:02:33.019868+00', NULL, '68f3bccf-dd31-4cb2-8c0b-bb13025164a2'),
	('00000000-0000-0000-0000-000000000000', 31, 'RJ-CQbpKqSnTGi7XvVcLJw', '37050980-c727-46cf-8e93-bb37ac4bfc76', false, '2024-11-12 20:15:08.717959+00', '2024-11-12 20:15:08.717959+00', NULL, '2eacafa4-e11b-4502-ad4e-cf2ec06ad7e5'),
	('00000000-0000-0000-0000-000000000000', 32, 'GUxXk-tkYKjj1hGNqZSrOw', '37050980-c727-46cf-8e93-bb37ac4bfc76', false, '2024-11-13 00:15:15.584964+00', '2024-11-13 00:15:15.584964+00', NULL, '31900d20-c67c-4e76-86e2-835cfddd6dd9'),
	('00000000-0000-0000-0000-000000000000', 33, '4q0ZiaFzWGcFewTlMIiEGQ', '37050980-c727-46cf-8e93-bb37ac4bfc76', false, '2024-11-13 00:30:35.733486+00', '2024-11-13 00:30:35.733486+00', NULL, '2c26fbd6-5dc9-4ed8-974b-c23e15f394c5'),
	('00000000-0000-0000-0000-000000000000', 34, 'LPN5w5xpKhek95HGctPk3w', '37050980-c727-46cf-8e93-bb37ac4bfc76', false, '2024-11-13 01:14:19.777359+00', '2024-11-13 01:14:19.777359+00', NULL, '1bef423b-7701-4001-b27b-e777d1ae8a71'),
	('00000000-0000-0000-0000-000000000000', 35, 'l5F8z5P8igRsbv5KtbA30A', '37050980-c727-46cf-8e93-bb37ac4bfc76', false, '2024-11-13 02:41:19.568377+00', '2024-11-13 02:41:19.568377+00', NULL, '94d6dfe2-63f9-49a5-a84e-b189f24cc507'),
	('00000000-0000-0000-0000-000000000000', 36, 'VtySdK7Fj27fTLZKl1OAyA', '37050980-c727-46cf-8e93-bb37ac4bfc76', false, '2024-11-13 02:42:19.955523+00', '2024-11-13 02:42:19.955523+00', NULL, '89fc5fad-111c-4c3d-a6c3-a7dbdf5470a8'),
	('00000000-0000-0000-0000-000000000000', 37, '3jBaTUvPES5tsB75e_BGcA', '37050980-c727-46cf-8e93-bb37ac4bfc76', false, '2024-11-13 02:48:54.883115+00', '2024-11-13 02:48:54.883115+00', NULL, 'ff83773e-b949-4cdd-98da-8aaacdf569a2'),
	('00000000-0000-0000-0000-000000000000', 38, 'ankvlwCyTDNBzHiCPEfGpw', '37050980-c727-46cf-8e93-bb37ac4bfc76', false, '2024-11-14 17:57:34.903003+00', '2024-11-14 17:57:34.903003+00', NULL, '5088280b-6b11-402f-82fb-659f22101b0e'),
	('00000000-0000-0000-0000-000000000000', 39, '_4pYdRDg5KLNbMsKDtamNA', '37050980-c727-46cf-8e93-bb37ac4bfc76', false, '2024-11-15 14:39:46.956694+00', '2024-11-15 14:39:46.956694+00', NULL, '1ff3897e-3a21-4604-90b1-519900e6a4cd'),
	('00000000-0000-0000-0000-000000000000', 40, '94Gpums3XLZP51QwDjHqlQ', '37050980-c727-46cf-8e93-bb37ac4bfc76', false, '2024-11-15 15:00:43.209749+00', '2024-11-15 15:00:43.209749+00', NULL, 'ba2b0f9e-6ddd-481f-9bb1-845f8fc0076a'),
	('00000000-0000-0000-0000-000000000000', 41, 'AO5CJGnod3KG1AA_tZTdoQ', '37050980-c727-46cf-8e93-bb37ac4bfc76', false, '2024-11-15 15:06:06.625075+00', '2024-11-15 15:06:06.625075+00', NULL, '212ea1c4-a2e9-4f20-b0de-4fa3dc958cd5'),
	('00000000-0000-0000-0000-000000000000', 42, 'fdWGgRFirFARu3HKOnOY_w', '37050980-c727-46cf-8e93-bb37ac4bfc76', false, '2024-11-15 15:07:26.331014+00', '2024-11-15 15:07:26.331014+00', NULL, 'f78c9d92-1331-4f6b-b28f-e89c1b8339f4'),
	('00000000-0000-0000-0000-000000000000', 43, 'YGtvXWiOuwy8CshuI_2GUw', '37050980-c727-46cf-8e93-bb37ac4bfc76', false, '2024-11-15 15:10:34.908836+00', '2024-11-15 15:10:34.908836+00', NULL, '1d6ccea0-eaae-4cbe-ac1e-12c8a3be69ac'),
	('00000000-0000-0000-0000-000000000000', 44, 'm3jjyiC57h3jm66kWucdDg', '37050980-c727-46cf-8e93-bb37ac4bfc76', false, '2024-11-15 15:11:24.029803+00', '2024-11-15 15:11:24.029803+00', NULL, '704f4526-18d7-4e53-9341-1236aae01369'),
	('00000000-0000-0000-0000-000000000000', 45, 'BFD8DR8sRqiYQ8fJyCLlOQ', '37050980-c727-46cf-8e93-bb37ac4bfc76', false, '2024-11-15 15:15:55.548872+00', '2024-11-15 15:15:55.548872+00', NULL, 'fc20500b-4f0b-40a0-a0cb-d21ab91f1378'),
	('00000000-0000-0000-0000-000000000000', 46, 'UCmjejfG2Wm8UB-484ARJg', '37050980-c727-46cf-8e93-bb37ac4bfc76', false, '2024-11-15 15:17:54.285969+00', '2024-11-15 15:17:54.285969+00', NULL, '0ae2f65d-fb3e-4ebe-93b1-50e1f820e59a'),
	('00000000-0000-0000-0000-000000000000', 47, 'YlNY7Tqnhdp76MAxJ4-d7A', '37050980-c727-46cf-8e93-bb37ac4bfc76', false, '2024-11-15 16:14:47.786577+00', '2024-11-15 16:14:47.786577+00', NULL, '05f1f0dc-1d88-49e5-9677-1488b991c9ce'),
	('00000000-0000-0000-0000-000000000000', 48, '__UAITbT5X2KiLQiwtdR9g', '37050980-c727-46cf-8e93-bb37ac4bfc76', false, '2024-11-15 16:30:50.729676+00', '2024-11-15 16:30:50.729676+00', NULL, 'fed0e909-32d5-4956-89f6-0828fcd36305'),
	('00000000-0000-0000-0000-000000000000', 49, 'm7JIBIvcC2oRebh8u5ZPEQ', '37050980-c727-46cf-8e93-bb37ac4bfc76', false, '2024-11-15 16:31:57.015622+00', '2024-11-15 16:31:57.015622+00', NULL, '2c235fee-a1c9-42c0-a740-a412d6849af9'),
	('00000000-0000-0000-0000-000000000000', 50, '1vfqcHX8PQgBaqQ_NTSatA', '37050980-c727-46cf-8e93-bb37ac4bfc76', false, '2024-11-15 16:52:09.800106+00', '2024-11-15 16:52:09.800106+00', NULL, '02d22a52-61e2-43b4-8786-a888e57d2bb6'),
	('00000000-0000-0000-0000-000000000000', 51, 'f5hySyroomfb937NIumTBQ', '37050980-c727-46cf-8e93-bb37ac4bfc76', false, '2024-11-15 16:53:55.808098+00', '2024-11-15 16:53:55.808098+00', NULL, '26c9f8fb-ba65-4896-aae7-91e050ba8e15'),
	('00000000-0000-0000-0000-000000000000', 52, '79awxoCdm0dwdPf-P5ufmw', '37050980-c727-46cf-8e93-bb37ac4bfc76', false, '2024-11-15 17:00:53.671834+00', '2024-11-15 17:00:53.671834+00', NULL, '451d2cc7-eef4-4f80-92f6-32dd22969c78'),
	('00000000-0000-0000-0000-000000000000', 53, 'Rx9yWI9c4a20svnJ9l0aPQ', '37050980-c727-46cf-8e93-bb37ac4bfc76', false, '2024-11-15 17:01:25.164074+00', '2024-11-15 17:01:25.164074+00', NULL, '3669450b-f397-43df-902a-378b0a5972dc'),
	('00000000-0000-0000-0000-000000000000', 54, 'u2J7D5Q8yPBxnHp_rZhOhw', '37050980-c727-46cf-8e93-bb37ac4bfc76', false, '2024-11-15 17:08:42.993686+00', '2024-11-15 17:08:42.993686+00', NULL, '22daab06-0300-469a-badd-79694485e08d'),
	('00000000-0000-0000-0000-000000000000', 55, '2ZWtZVpdtOv8c3x_y9714A', '37050980-c727-46cf-8e93-bb37ac4bfc76', false, '2024-11-15 17:09:43.98131+00', '2024-11-15 17:09:43.98131+00', NULL, 'b607c378-2b15-4104-bd01-e8f3120083ec'),
	('00000000-0000-0000-0000-000000000000', 56, 'E-PyQ6hSdtTzu9PBkkcYJA', '37050980-c727-46cf-8e93-bb37ac4bfc76', false, '2024-11-15 17:13:35.026668+00', '2024-11-15 17:13:35.026668+00', NULL, 'a88019f6-3265-446a-997d-2c17f068c09d'),
	('00000000-0000-0000-0000-000000000000', 57, 'wBsqxMmignQPC3o7ZzcQ0A', '37050980-c727-46cf-8e93-bb37ac4bfc76', false, '2024-11-15 17:22:27.400971+00', '2024-11-15 17:22:27.400971+00', NULL, '41cc59d2-92e2-434d-8ff9-4facc1bbfa3e'),
	('00000000-0000-0000-0000-000000000000', 58, 'cen0-kx6GU67LsV38LGjLw', '37050980-c727-46cf-8e93-bb37ac4bfc76', false, '2024-11-15 17:30:41.308924+00', '2024-11-15 17:30:41.308924+00', NULL, '3d4c26e6-9a60-4ef8-898e-894b9dbf3468'),
	('00000000-0000-0000-0000-000000000000', 59, 'TA7EdpcmyQmYHXaEtBYsLg', '37050980-c727-46cf-8e93-bb37ac4bfc76', false, '2024-11-15 17:31:24.078436+00', '2024-11-15 17:31:24.078436+00', NULL, 'a9019c34-a78e-4b94-ab10-392cf600f111'),
	('00000000-0000-0000-0000-000000000000', 60, 'AEhLUAtBqZWXQ2bTEOLfBg', '37050980-c727-46cf-8e93-bb37ac4bfc76', false, '2024-11-15 17:36:59.498517+00', '2024-11-15 17:36:59.498517+00', NULL, 'b9d3281d-aba4-46a6-9dcd-ba1a2ab0dd4e'),
	('00000000-0000-0000-0000-000000000000', 61, '_tSp7lN33BSA5N9Za0bCcw', '37050980-c727-46cf-8e93-bb37ac4bfc76', false, '2024-11-15 17:37:46.211346+00', '2024-11-15 17:37:46.211346+00', NULL, '250515f9-0087-4d99-9733-f45452f7c5e0'),
	('00000000-0000-0000-0000-000000000000', 62, 'ZrBDYtnXLxSmFzSk0lM_bg', '37050980-c727-46cf-8e93-bb37ac4bfc76', false, '2024-11-15 17:41:51.549967+00', '2024-11-15 17:41:51.549967+00', NULL, 'a9ad1f70-352b-438a-98da-88f8110dcc11'),
	('00000000-0000-0000-0000-000000000000', 63, 'tGGi2SNUvUlyt7fnrGHc4A', '37050980-c727-46cf-8e93-bb37ac4bfc76', false, '2024-11-15 18:03:01.008912+00', '2024-11-15 18:03:01.008912+00', NULL, '1c0eb5a7-e390-474d-bbef-f6ceea563af1'),
	('00000000-0000-0000-0000-000000000000', 64, 'l2HWgb9I5J3KILPcxsn4DA', '37050980-c727-46cf-8e93-bb37ac4bfc76', false, '2024-11-15 18:20:58.634659+00', '2024-11-15 18:20:58.634659+00', NULL, 'fd5192ad-f9e8-40c9-8be0-a43eabd0a33d'),
	('00000000-0000-0000-0000-000000000000', 65, 'aTmwMfBpZMg6exIRgq6KAw', '37050980-c727-46cf-8e93-bb37ac4bfc76', false, '2024-11-15 18:40:06.135903+00', '2024-11-15 18:40:06.135903+00', NULL, 'ef561e2b-e9dd-4210-b1c8-b0c1bdcdcb37'),
	('00000000-0000-0000-0000-000000000000', 66, 'vGTlrYP0gp-hseW356EQtw', '37050980-c727-46cf-8e93-bb37ac4bfc76', false, '2024-11-15 18:48:36.448904+00', '2024-11-15 18:48:36.448904+00', NULL, 'edb31eb7-14eb-44dc-8658-e055c7c6487c'),
	('00000000-0000-0000-0000-000000000000', 67, 'b4qkgB7ry6z-5gDbx25xlw', '37050980-c727-46cf-8e93-bb37ac4bfc76', false, '2024-11-15 18:50:51.604144+00', '2024-11-15 18:50:51.604144+00', NULL, '4c72e854-7139-4d06-8bf8-141df4f0f5ad'),
	('00000000-0000-0000-0000-000000000000', 68, 'FIB7oqS4CE3_BPixEyz0OA', '37050980-c727-46cf-8e93-bb37ac4bfc76', false, '2024-11-15 19:02:06.555886+00', '2024-11-15 19:02:06.555886+00', NULL, '1ef26863-af80-48f5-907b-da3b8799f473'),
	('00000000-0000-0000-0000-000000000000', 69, 'b01MWN0rGjsZsR6pu6x_vQ', '37050980-c727-46cf-8e93-bb37ac4bfc76', false, '2024-11-15 19:14:59.470945+00', '2024-11-15 19:14:59.470945+00', NULL, '5a72ef69-be15-48b4-9e40-9b27c8f767d3'),
	('00000000-0000-0000-0000-000000000000', 70, 'VnydJNSCwwKvY-9mfGJlUA', '37050980-c727-46cf-8e93-bb37ac4bfc76', false, '2024-11-15 19:20:55.42323+00', '2024-11-15 19:20:55.42323+00', NULL, 'abf0f03f-2059-45d0-ba62-1e8659a5d457'),
	('00000000-0000-0000-0000-000000000000', 71, '5MeYZcYqyyLcj41sJ70JJg', '37050980-c727-46cf-8e93-bb37ac4bfc76', false, '2024-11-15 19:26:46.667247+00', '2024-11-15 19:26:46.667247+00', NULL, 'a139b41b-5a3e-44a5-b5a7-8ca67e40bb0c'),
	('00000000-0000-0000-0000-000000000000', 72, 'h00i_GoUz6wYYnBBIBEEPg', '37050980-c727-46cf-8e93-bb37ac4bfc76', false, '2024-11-15 19:27:54.657632+00', '2024-11-15 19:27:54.657632+00', NULL, '563ebd98-dab0-40c8-8e46-96235638a659'),
	('00000000-0000-0000-0000-000000000000', 73, 'h0ncYBRWZx9n8ZqbwnoYtA', '37050980-c727-46cf-8e93-bb37ac4bfc76', false, '2024-11-15 19:37:36.425829+00', '2024-11-15 19:37:36.425829+00', NULL, '4c4b223d-6a79-4e9e-9a1e-ce2da9bce1dc'),
	('00000000-0000-0000-0000-000000000000', 74, 'N8kJByPJiGAnUTUBRu2DGg', '37050980-c727-46cf-8e93-bb37ac4bfc76', false, '2024-11-15 19:52:39.402887+00', '2024-11-15 19:52:39.402887+00', NULL, '158c40f3-b942-4536-a7b7-22830c614d3d'),
	('00000000-0000-0000-0000-000000000000', 75, '7k-0xOKC9IVNEHLVnxue7g', '37050980-c727-46cf-8e93-bb37ac4bfc76', false, '2024-11-17 23:28:27.910953+00', '2024-11-17 23:28:27.910953+00', NULL, 'f182451f-da2b-4839-ba89-4e59302895de'),
	('00000000-0000-0000-0000-000000000000', 76, 'XYHXkgAtCqJbv79-ifFAWQ', '37050980-c727-46cf-8e93-bb37ac4bfc76', false, '2024-11-18 00:19:10.058702+00', '2024-11-18 00:19:10.058702+00', NULL, 'c44c396a-a349-4cc4-b56a-3f6c8751717d'),
	('00000000-0000-0000-0000-000000000000', 77, 'Ec2BuSnfwQ_EKUX-C1fGkA', '37050980-c727-46cf-8e93-bb37ac4bfc76', false, '2024-12-01 14:54:40.582462+00', '2024-12-01 14:54:40.582462+00', NULL, 'd5e2054b-b66c-427e-9177-f6a5b722a1b4'),
	('00000000-0000-0000-0000-000000000000', 78, 'yG7lXDyxTPu_lGvvnfMOqg', '37050980-c727-46cf-8e93-bb37ac4bfc76', false, '2024-12-01 14:56:35.175269+00', '2024-12-01 14:56:35.175269+00', NULL, '22b4961d-1169-4f13-84f3-e0f056745f54'),
	('00000000-0000-0000-0000-000000000000', 79, 'B5pQKdYzQf_Z9JZm964RDw', '37050980-c727-46cf-8e93-bb37ac4bfc76', false, '2024-12-01 15:14:37.513185+00', '2024-12-01 15:14:37.513185+00', NULL, '47ec63f5-5fae-4a7b-8c7b-0553084b88d2'),
	('00000000-0000-0000-0000-000000000000', 80, 'Dm6A_PURT7YZ5tfqyoCIBw', '37050980-c727-46cf-8e93-bb37ac4bfc76', false, '2024-12-01 16:37:50.372433+00', '2024-12-01 16:37:50.372433+00', NULL, 'cdfa0bb1-4a78-4825-8cd0-8253c1458edb');


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
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 80, true);


--
-- Name: key_key_id_seq; Type: SEQUENCE SET; Schema: pgsodium; Owner: supabase_admin
--

SELECT pg_catalog.setval('"pgsodium"."key_key_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

RESET ALL;
