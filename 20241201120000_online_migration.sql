

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


CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";





SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."checklist_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "checklist_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "item_id" "uuid" DEFAULT "gen_random_uuid"(),
    "completed" boolean DEFAULT false,
    "quantity" smallint DEFAULT '1'::smallint
);


ALTER TABLE "public"."checklist_items" OWNER TO "postgres";


COMMENT ON TABLE "public"."checklist_items" IS 'Join table for checklists and items';



COMMENT ON COLUMN "public"."checklist_items"."checklist_id" IS 'Foreign Key referencing checklists.id';



COMMENT ON COLUMN "public"."checklist_items"."item_id" IS 'Foreign Key referencing items.id';



COMMENT ON COLUMN "public"."checklist_items"."completed" IS 'Indicates if the item is completed for that checklist';



COMMENT ON COLUMN "public"."checklist_items"."quantity" IS 'Quantity specific for that checklist';



CREATE TABLE IF NOT EXISTS "public"."checklists" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "title" "text" DEFAULT ''::"text",
    "category" "text",
    "user_id" "uuid" DEFAULT "auth"."uid"()
);


ALTER TABLE "public"."checklists" OWNER TO "postgres";


COMMENT ON TABLE "public"."checklists" IS 'user''s checklists database table';



COMMENT ON COLUMN "public"."checklists"."category" IS 'Category or type of trip for checklist';



COMMENT ON COLUMN "public"."checklists"."user_id" IS 'Reference to the user who created the checklist';



CREATE TABLE IF NOT EXISTS "public"."items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" DEFAULT ''::"text",
    "quantity" smallint DEFAULT '1'::smallint,
    "weight" real,
    "notes" "text",
    "user_id" "uuid"
);


ALTER TABLE "public"."items" OWNER TO "postgres";


COMMENT ON TABLE "public"."items" IS 'items that will go into a checklist';



COMMENT ON COLUMN "public"."items"."name" IS 'Name of the item (e.g., "Tent", "Water Bottle")';



COMMENT ON COLUMN "public"."items"."weight" IS 'Optional, weight of the item';



COMMENT ON COLUMN "public"."items"."notes" IS 'Optional, notes for the item';



COMMENT ON COLUMN "public"."items"."user_id" IS 'Foreign Key. Links to the user who owns the item.';



CREATE TABLE IF NOT EXISTS "public"."user_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "dark_mode" boolean DEFAULT false,
    "email_notifications" boolean DEFAULT true,
    "push_notifications" boolean DEFAULT true,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_settings" OWNER TO "postgres";


ALTER TABLE ONLY "public"."checklist_items"
    ADD CONSTRAINT "checklist_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."checklists"
    ADD CONSTRAINT "checklists_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."items"
    ADD CONSTRAINT "items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_settings"
    ADD CONSTRAINT "unique_user_id" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."user_settings"
    ADD CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."checklist_items"
    ADD CONSTRAINT "checklist_items_checklist_id_fkey" FOREIGN KEY ("checklist_id") REFERENCES "public"."checklists"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."checklist_items"
    ADD CONSTRAINT "checklist_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."checklists"
    ADD CONSTRAINT "checklists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."items"
    ADD CONSTRAINT "items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_settings"
    ADD CONSTRAINT "user_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Allow authenticated users to delete their own checklist items" ON "public"."checklist_items" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."checklists"
  WHERE (("checklists"."id" = "checklist_items"."checklist_id") AND ("checklists"."user_id" = "auth"."uid"())))));



CREATE POLICY "Allow authenticated users to delete their own checklists" ON "public"."checklists" FOR DELETE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Allow authenticated users to delete their own items" ON "public"."items" FOR DELETE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Allow authenticated users to delete their own settings" ON "public"."user_settings" FOR DELETE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Allow authenticated users to insert checklist items into their " ON "public"."checklist_items" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."checklists"
  WHERE (("checklists"."id" = "checklist_items"."checklist_id") AND ("checklists"."user_id" = "auth"."uid"())))));



CREATE POLICY "Allow authenticated users to insert checklists" ON "public"."checklists" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Allow authenticated users to insert items" ON "public"."items" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Allow authenticated users to insert their own settings" ON "public"."user_settings" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Allow authenticated users to read their own checklist items" ON "public"."checklist_items" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."checklists"
  WHERE (("checklists"."id" = "checklist_items"."checklist_id") AND ("checklists"."user_id" = "auth"."uid"())))));



CREATE POLICY "Allow authenticated users to read their own checklists" ON "public"."checklists" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Allow authenticated users to read their own items" ON "public"."items" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Allow authenticated users to read their own settings" ON "public"."user_settings" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Allow authenticated users to update their own checklist items" ON "public"."checklist_items" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."checklists"
  WHERE (("checklists"."id" = "checklist_items"."checklist_id") AND ("checklists"."user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."checklists"
  WHERE (("checklists"."id" = "checklist_items"."checklist_id") AND ("checklists"."user_id" = "auth"."uid"())))));



CREATE POLICY "Allow authenticated users to update their own checklists" ON "public"."checklists" FOR UPDATE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Allow authenticated users to update their own items" ON "public"."items" FOR UPDATE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Allow authenticated users to update their own settings" ON "public"."user_settings" FOR UPDATE USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."checklist_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."checklists" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_settings" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."checklists";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



































































































































































































GRANT ALL ON TABLE "public"."checklist_items" TO "anon";
GRANT ALL ON TABLE "public"."checklist_items" TO "authenticated";
GRANT ALL ON TABLE "public"."checklist_items" TO "service_role";



GRANT ALL ON TABLE "public"."checklists" TO "anon";
GRANT ALL ON TABLE "public"."checklists" TO "authenticated";
GRANT ALL ON TABLE "public"."checklists" TO "service_role";



GRANT ALL ON TABLE "public"."items" TO "anon";
GRANT ALL ON TABLE "public"."items" TO "authenticated";
GRANT ALL ON TABLE "public"."items" TO "service_role";



GRANT ALL ON TABLE "public"."user_settings" TO "anon";
GRANT ALL ON TABLE "public"."user_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."user_settings" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
