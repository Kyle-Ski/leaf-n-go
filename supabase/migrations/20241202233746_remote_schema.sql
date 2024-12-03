create sequence "public"."shared_checklists_audit_id_seq";

create table "public"."checklist_items" (
    "id" uuid not null default uuid_generate_v4(),
    "checklist_id" uuid not null default gen_random_uuid(),
    "item_id" uuid default gen_random_uuid(),
    "completed" boolean default false,
    "quantity" smallint default '1'::smallint
);


alter table "public"."checklist_items" enable row level security;

create table "public"."checklists" (
    "id" uuid not null default uuid_generate_v4(),
    "created_at" timestamp with time zone not null default now(),
    "title" text default ''::text,
    "category" text,
    "user_id" uuid default auth.uid()
);


alter table "public"."checklists" enable row level security;

create table "public"."items" (
    "id" uuid not null default uuid_generate_v4(),
    "name" text default ''::text,
    "quantity" smallint default '1'::smallint,
    "weight" real,
    "notes" text,
    "user_id" uuid
);


alter table "public"."items" enable row level security;

create table "public"."shared_checklists" (
    "id" uuid not null default gen_random_uuid(),
    "checklist_id" uuid not null,
    "user_id" uuid not null,
    "role" text not null,
    "added_at" timestamp without time zone default now()
);


alter table "public"."shared_checklists" enable row level security;

create table "public"."shared_checklists_audit" (
    "id" bigint not null default nextval('shared_checklists_audit_id_seq'::regclass),
    "shared_checklist_id" uuid not null,
    "action_type" text not null,
    "performed_by" uuid not null,
    "timestamp" timestamp without time zone not null default CURRENT_TIMESTAMP,
    "old_data" jsonb,
    "new_data" jsonb
);


create table "public"."trip_checklists" (
    "id" uuid not null default gen_random_uuid(),
    "trip_id" uuid not null,
    "checklist_id" uuid not null,
    "created_at" timestamp with time zone default now()
);


alter table "public"."trip_checklists" enable row level security;

create table "public"."trip_participants" (
    "id" uuid not null default gen_random_uuid(),
    "trip_id" uuid not null,
    "user_id" uuid not null,
    "role" text not null,
    "added_at" timestamp without time zone default now()
);


alter table "public"."trip_participants" enable row level security;

create table "public"."trips" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "title" text not null,
    "start_date" date,
    "end_date" date,
    "location" text,
    "notes" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."trips" enable row level security;

create table "public"."user_settings" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "dark_mode" boolean default false,
    "email_notifications" boolean default true,
    "push_notifications" boolean default true,
    "updated_at" timestamp with time zone default now(),
    "created_at" timestamp with time zone default now()
);


alter table "public"."user_settings" enable row level security;

alter sequence "public"."shared_checklists_audit_id_seq" owned by "public"."shared_checklists_audit"."id";

CREATE UNIQUE INDEX checklist_items_pkey ON public.checklist_items USING btree (id);

CREATE UNIQUE INDEX checklists_pkey ON public.checklists USING btree (id);

CREATE UNIQUE INDEX items_pkey ON public.items USING btree (id);

CREATE UNIQUE INDEX shared_checklists_audit_pkey ON public.shared_checklists_audit USING btree (id);

CREATE UNIQUE INDEX shared_checklists_pkey ON public.shared_checklists USING btree (id);

CREATE UNIQUE INDEX trip_checklists_pkey ON public.trip_checklists USING btree (id);

CREATE UNIQUE INDEX trip_participants_pkey ON public.trip_participants USING btree (id);

CREATE UNIQUE INDEX trips_pkey ON public.trips USING btree (id);

CREATE UNIQUE INDEX unique_user_id ON public.user_settings USING btree (user_id);

CREATE UNIQUE INDEX user_settings_pkey ON public.user_settings USING btree (id);

alter table "public"."checklist_items" add constraint "checklist_items_pkey" PRIMARY KEY using index "checklist_items_pkey";

alter table "public"."checklists" add constraint "checklists_pkey" PRIMARY KEY using index "checklists_pkey";

alter table "public"."items" add constraint "items_pkey" PRIMARY KEY using index "items_pkey";

alter table "public"."shared_checklists" add constraint "shared_checklists_pkey" PRIMARY KEY using index "shared_checklists_pkey";

alter table "public"."shared_checklists_audit" add constraint "shared_checklists_audit_pkey" PRIMARY KEY using index "shared_checklists_audit_pkey";

alter table "public"."trip_checklists" add constraint "trip_checklists_pkey" PRIMARY KEY using index "trip_checklists_pkey";

alter table "public"."trip_participants" add constraint "trip_participants_pkey" PRIMARY KEY using index "trip_participants_pkey";

alter table "public"."trips" add constraint "trips_pkey" PRIMARY KEY using index "trips_pkey";

alter table "public"."user_settings" add constraint "user_settings_pkey" PRIMARY KEY using index "user_settings_pkey";

alter table "public"."checklist_items" add constraint "checklist_items_checklist_id_fkey" FOREIGN KEY (checklist_id) REFERENCES checklists(id) ON DELETE CASCADE not valid;

alter table "public"."checklist_items" validate constraint "checklist_items_checklist_id_fkey";

alter table "public"."checklist_items" add constraint "checklist_items_item_id_fkey" FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE not valid;

alter table "public"."checklist_items" validate constraint "checklist_items_item_id_fkey";

alter table "public"."checklists" add constraint "checklists_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."checklists" validate constraint "checklists_user_id_fkey";

alter table "public"."items" add constraint "items_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."items" validate constraint "items_user_id_fkey";

alter table "public"."shared_checklists" add constraint "shared_checklists_checklist_id_fkey" FOREIGN KEY (checklist_id) REFERENCES checklists(id) ON DELETE CASCADE not valid;

alter table "public"."shared_checklists" validate constraint "shared_checklists_checklist_id_fkey";

alter table "public"."shared_checklists" add constraint "shared_checklists_role_check" CHECK ((role = ANY (ARRAY['editor'::text, 'viewer'::text]))) not valid;

alter table "public"."shared_checklists" validate constraint "shared_checklists_role_check";

alter table "public"."shared_checklists_audit" add constraint "shared_checklists_audit_action_type_check" CHECK ((action_type = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text]))) not valid;

alter table "public"."shared_checklists_audit" validate constraint "shared_checklists_audit_action_type_check";

alter table "public"."trip_checklists" add constraint "trip_checklists_checklist_id_fkey" FOREIGN KEY (checklist_id) REFERENCES checklists(id) ON DELETE CASCADE not valid;

alter table "public"."trip_checklists" validate constraint "trip_checklists_checklist_id_fkey";

alter table "public"."trip_checklists" add constraint "trip_checklists_trip_id_fkey" FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE not valid;

alter table "public"."trip_checklists" validate constraint "trip_checklists_trip_id_fkey";

alter table "public"."trip_participants" add constraint "trip_participants_role_check" CHECK ((role = ANY (ARRAY['owner'::text, 'editor'::text, 'viewer'::text]))) not valid;

alter table "public"."trip_participants" validate constraint "trip_participants_role_check";

alter table "public"."trip_participants" add constraint "trip_participants_trip_id_fkey" FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE not valid;

alter table "public"."trip_participants" validate constraint "trip_participants_trip_id_fkey";

alter table "public"."trips" add constraint "trips_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."trips" validate constraint "trips_user_id_fkey";

alter table "public"."user_settings" add constraint "unique_user_id" UNIQUE using index "unique_user_id";

alter table "public"."user_settings" add constraint "user_settings_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_settings" validate constraint "user_settings_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.log_shared_checklist_changes()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO shared_checklists_audit (
            shared_checklist_id,
            action_type,
            performed_by,
            new_data
        ) VALUES (
            NEW.id,
            'INSERT',
            auth.uid(),
            to_jsonb(NEW)
        );
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO shared_checklists_audit (
            shared_checklist_id,
            action_type,
            performed_by,
            old_data,
            new_data
        ) VALUES (
            NEW.id,
            'UPDATE',
            auth.uid(),
            to_jsonb(OLD),
            to_jsonb(NEW)
        );
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO shared_checklists_audit (
            shared_checklist_id,
            action_type,
            performed_by,
            old_data
        ) VALUES (
            OLD.id,
            'DELETE',
            auth.uid(),
            to_jsonb(OLD)
        );
    END IF;
    RETURN NULL;
END;
$function$
;

grant delete on table "public"."checklist_items" to "anon";

grant insert on table "public"."checklist_items" to "anon";

grant references on table "public"."checklist_items" to "anon";

grant select on table "public"."checklist_items" to "anon";

grant trigger on table "public"."checklist_items" to "anon";

grant truncate on table "public"."checklist_items" to "anon";

grant update on table "public"."checklist_items" to "anon";

grant delete on table "public"."checklist_items" to "authenticated";

grant insert on table "public"."checklist_items" to "authenticated";

grant references on table "public"."checklist_items" to "authenticated";

grant select on table "public"."checklist_items" to "authenticated";

grant trigger on table "public"."checklist_items" to "authenticated";

grant truncate on table "public"."checklist_items" to "authenticated";

grant update on table "public"."checklist_items" to "authenticated";

grant delete on table "public"."checklist_items" to "service_role";

grant insert on table "public"."checklist_items" to "service_role";

grant references on table "public"."checklist_items" to "service_role";

grant select on table "public"."checklist_items" to "service_role";

grant trigger on table "public"."checklist_items" to "service_role";

grant truncate on table "public"."checklist_items" to "service_role";

grant update on table "public"."checklist_items" to "service_role";

grant delete on table "public"."checklists" to "anon";

grant insert on table "public"."checklists" to "anon";

grant references on table "public"."checklists" to "anon";

grant select on table "public"."checklists" to "anon";

grant trigger on table "public"."checklists" to "anon";

grant truncate on table "public"."checklists" to "anon";

grant update on table "public"."checklists" to "anon";

grant delete on table "public"."checklists" to "authenticated";

grant insert on table "public"."checklists" to "authenticated";

grant references on table "public"."checklists" to "authenticated";

grant select on table "public"."checklists" to "authenticated";

grant trigger on table "public"."checklists" to "authenticated";

grant truncate on table "public"."checklists" to "authenticated";

grant update on table "public"."checklists" to "authenticated";

grant delete on table "public"."checklists" to "service_role";

grant insert on table "public"."checklists" to "service_role";

grant references on table "public"."checklists" to "service_role";

grant select on table "public"."checklists" to "service_role";

grant trigger on table "public"."checklists" to "service_role";

grant truncate on table "public"."checklists" to "service_role";

grant update on table "public"."checklists" to "service_role";

grant delete on table "public"."items" to "anon";

grant insert on table "public"."items" to "anon";

grant references on table "public"."items" to "anon";

grant select on table "public"."items" to "anon";

grant trigger on table "public"."items" to "anon";

grant truncate on table "public"."items" to "anon";

grant update on table "public"."items" to "anon";

grant delete on table "public"."items" to "authenticated";

grant insert on table "public"."items" to "authenticated";

grant references on table "public"."items" to "authenticated";

grant select on table "public"."items" to "authenticated";

grant trigger on table "public"."items" to "authenticated";

grant truncate on table "public"."items" to "authenticated";

grant update on table "public"."items" to "authenticated";

grant delete on table "public"."items" to "service_role";

grant insert on table "public"."items" to "service_role";

grant references on table "public"."items" to "service_role";

grant select on table "public"."items" to "service_role";

grant trigger on table "public"."items" to "service_role";

grant truncate on table "public"."items" to "service_role";

grant update on table "public"."items" to "service_role";

grant delete on table "public"."shared_checklists" to "anon";

grant insert on table "public"."shared_checklists" to "anon";

grant references on table "public"."shared_checklists" to "anon";

grant select on table "public"."shared_checklists" to "anon";

grant trigger on table "public"."shared_checklists" to "anon";

grant truncate on table "public"."shared_checklists" to "anon";

grant update on table "public"."shared_checklists" to "anon";

grant delete on table "public"."shared_checklists" to "authenticated";

grant insert on table "public"."shared_checklists" to "authenticated";

grant references on table "public"."shared_checklists" to "authenticated";

grant select on table "public"."shared_checklists" to "authenticated";

grant trigger on table "public"."shared_checklists" to "authenticated";

grant truncate on table "public"."shared_checklists" to "authenticated";

grant update on table "public"."shared_checklists" to "authenticated";

grant delete on table "public"."shared_checklists" to "service_role";

grant insert on table "public"."shared_checklists" to "service_role";

grant references on table "public"."shared_checklists" to "service_role";

grant select on table "public"."shared_checklists" to "service_role";

grant trigger on table "public"."shared_checklists" to "service_role";

grant truncate on table "public"."shared_checklists" to "service_role";

grant update on table "public"."shared_checklists" to "service_role";

grant delete on table "public"."shared_checklists_audit" to "anon";

grant insert on table "public"."shared_checklists_audit" to "anon";

grant references on table "public"."shared_checklists_audit" to "anon";

grant select on table "public"."shared_checklists_audit" to "anon";

grant trigger on table "public"."shared_checklists_audit" to "anon";

grant truncate on table "public"."shared_checklists_audit" to "anon";

grant update on table "public"."shared_checklists_audit" to "anon";

grant delete on table "public"."shared_checklists_audit" to "authenticated";

grant insert on table "public"."shared_checklists_audit" to "authenticated";

grant references on table "public"."shared_checklists_audit" to "authenticated";

grant select on table "public"."shared_checklists_audit" to "authenticated";

grant trigger on table "public"."shared_checklists_audit" to "authenticated";

grant truncate on table "public"."shared_checklists_audit" to "authenticated";

grant update on table "public"."shared_checklists_audit" to "authenticated";

grant delete on table "public"."shared_checklists_audit" to "service_role";

grant insert on table "public"."shared_checklists_audit" to "service_role";

grant references on table "public"."shared_checklists_audit" to "service_role";

grant select on table "public"."shared_checklists_audit" to "service_role";

grant trigger on table "public"."shared_checklists_audit" to "service_role";

grant truncate on table "public"."shared_checklists_audit" to "service_role";

grant update on table "public"."shared_checklists_audit" to "service_role";

grant delete on table "public"."trip_checklists" to "anon";

grant insert on table "public"."trip_checklists" to "anon";

grant references on table "public"."trip_checklists" to "anon";

grant select on table "public"."trip_checklists" to "anon";

grant trigger on table "public"."trip_checklists" to "anon";

grant truncate on table "public"."trip_checklists" to "anon";

grant update on table "public"."trip_checklists" to "anon";

grant delete on table "public"."trip_checklists" to "authenticated";

grant insert on table "public"."trip_checklists" to "authenticated";

grant references on table "public"."trip_checklists" to "authenticated";

grant select on table "public"."trip_checklists" to "authenticated";

grant trigger on table "public"."trip_checklists" to "authenticated";

grant truncate on table "public"."trip_checklists" to "authenticated";

grant update on table "public"."trip_checklists" to "authenticated";

grant delete on table "public"."trip_checklists" to "service_role";

grant insert on table "public"."trip_checklists" to "service_role";

grant references on table "public"."trip_checklists" to "service_role";

grant select on table "public"."trip_checklists" to "service_role";

grant trigger on table "public"."trip_checklists" to "service_role";

grant truncate on table "public"."trip_checklists" to "service_role";

grant update on table "public"."trip_checklists" to "service_role";

grant delete on table "public"."trip_participants" to "anon";

grant insert on table "public"."trip_participants" to "anon";

grant references on table "public"."trip_participants" to "anon";

grant select on table "public"."trip_participants" to "anon";

grant trigger on table "public"."trip_participants" to "anon";

grant truncate on table "public"."trip_participants" to "anon";

grant update on table "public"."trip_participants" to "anon";

grant delete on table "public"."trip_participants" to "authenticated";

grant insert on table "public"."trip_participants" to "authenticated";

grant references on table "public"."trip_participants" to "authenticated";

grant select on table "public"."trip_participants" to "authenticated";

grant trigger on table "public"."trip_participants" to "authenticated";

grant truncate on table "public"."trip_participants" to "authenticated";

grant update on table "public"."trip_participants" to "authenticated";

grant delete on table "public"."trip_participants" to "service_role";

grant insert on table "public"."trip_participants" to "service_role";

grant references on table "public"."trip_participants" to "service_role";

grant select on table "public"."trip_participants" to "service_role";

grant trigger on table "public"."trip_participants" to "service_role";

grant truncate on table "public"."trip_participants" to "service_role";

grant update on table "public"."trip_participants" to "service_role";

grant delete on table "public"."trips" to "anon";

grant insert on table "public"."trips" to "anon";

grant references on table "public"."trips" to "anon";

grant select on table "public"."trips" to "anon";

grant trigger on table "public"."trips" to "anon";

grant truncate on table "public"."trips" to "anon";

grant update on table "public"."trips" to "anon";

grant delete on table "public"."trips" to "authenticated";

grant insert on table "public"."trips" to "authenticated";

grant references on table "public"."trips" to "authenticated";

grant select on table "public"."trips" to "authenticated";

grant trigger on table "public"."trips" to "authenticated";

grant truncate on table "public"."trips" to "authenticated";

grant update on table "public"."trips" to "authenticated";

grant delete on table "public"."trips" to "service_role";

grant insert on table "public"."trips" to "service_role";

grant references on table "public"."trips" to "service_role";

grant select on table "public"."trips" to "service_role";

grant trigger on table "public"."trips" to "service_role";

grant truncate on table "public"."trips" to "service_role";

grant update on table "public"."trips" to "service_role";

grant delete on table "public"."user_settings" to "anon";

grant insert on table "public"."user_settings" to "anon";

grant references on table "public"."user_settings" to "anon";

grant select on table "public"."user_settings" to "anon";

grant trigger on table "public"."user_settings" to "anon";

grant truncate on table "public"."user_settings" to "anon";

grant update on table "public"."user_settings" to "anon";

grant delete on table "public"."user_settings" to "authenticated";

grant insert on table "public"."user_settings" to "authenticated";

grant references on table "public"."user_settings" to "authenticated";

grant select on table "public"."user_settings" to "authenticated";

grant trigger on table "public"."user_settings" to "authenticated";

grant truncate on table "public"."user_settings" to "authenticated";

grant update on table "public"."user_settings" to "authenticated";

grant delete on table "public"."user_settings" to "service_role";

grant insert on table "public"."user_settings" to "service_role";

grant references on table "public"."user_settings" to "service_role";

grant select on table "public"."user_settings" to "service_role";

grant trigger on table "public"."user_settings" to "service_role";

grant truncate on table "public"."user_settings" to "service_role";

grant update on table "public"."user_settings" to "service_role";

create policy "Allow authenticated users to delete their own checklist items"
on "public"."checklist_items"
as permissive
for delete
to public
using ((EXISTS ( SELECT 1
   FROM checklists
  WHERE ((checklists.id = checklist_items.checklist_id) AND (checklists.user_id = auth.uid())))));


create policy "Allow authenticated users to insert checklist items into their "
on "public"."checklist_items"
as permissive
for insert
to public
with check ((EXISTS ( SELECT 1
   FROM checklists
  WHERE ((checklists.id = checklist_items.checklist_id) AND (checklists.user_id = auth.uid())))));


create policy "Allow authenticated users to read their own checklist items"
on "public"."checklist_items"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM checklists
  WHERE ((checklists.id = checklist_items.checklist_id) AND (checklists.user_id = auth.uid())))));


create policy "Allow authenticated users to update their own checklist items"
on "public"."checklist_items"
as permissive
for update
to public
using ((EXISTS ( SELECT 1
   FROM checklists
  WHERE ((checklists.id = checklist_items.checklist_id) AND (checklists.user_id = auth.uid())))))
with check ((EXISTS ( SELECT 1
   FROM checklists
  WHERE ((checklists.id = checklist_items.checklist_id) AND (checklists.user_id = auth.uid())))));


create policy "Allow authenticated users to delete their own checklists"
on "public"."checklists"
as permissive
for delete
to public
using ((user_id = auth.uid()));


create policy "Allow authenticated users to insert checklists"
on "public"."checklists"
as permissive
for insert
to public
with check ((user_id = auth.uid()));


create policy "Allow authenticated users to read their own checklists"
on "public"."checklists"
as permissive
for select
to public
using ((user_id = auth.uid()));


create policy "Allow authenticated users to update their own checklists"
on "public"."checklists"
as permissive
for update
to public
using ((user_id = auth.uid()));


create policy "Allow authenticated users to delete their own items"
on "public"."items"
as permissive
for delete
to public
using ((user_id = auth.uid()));


create policy "Allow authenticated users to insert items"
on "public"."items"
as permissive
for insert
to public
with check ((user_id = auth.uid()));


create policy "Allow authenticated users to read their own items"
on "public"."items"
as permissive
for select
to public
using ((user_id = auth.uid()));


create policy "Allow authenticated users to update their own items"
on "public"."items"
as permissive
for update
to public
using ((user_id = auth.uid()));


create policy "Allow owners to revoke shared access"
on "public"."shared_checklists"
as permissive
for delete
to public
using ((EXISTS ( SELECT 1
   FROM shared_checklists sc
  WHERE ((sc.checklist_id = shared_checklists.checklist_id) AND (sc.user_id = auth.uid()) AND (sc.role = 'owner'::text)))));


create policy "Allow sharing checklists"
on "public"."shared_checklists"
as permissive
for insert
to public
with check (((EXISTS ( SELECT 1
   FROM checklists
  WHERE ((checklists.id = shared_checklists.checklist_id) AND (checklists.user_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM shared_checklists sc
  WHERE ((sc.checklist_id = shared_checklists.checklist_id) AND (sc.user_id = auth.uid()) AND (sc.role = ANY (ARRAY['owner'::text, 'editor'::text])))))));


create policy "Allow updating shared checklist roles"
on "public"."shared_checklists"
as permissive
for update
to public
using ((EXISTS ( SELECT 1
   FROM shared_checklists sc
  WHERE ((sc.checklist_id = shared_checklists.checklist_id) AND (sc.user_id = auth.uid()) AND (sc.role = ANY (ARRAY['owner'::text, 'editor'::text]))))));


create policy "Allow viewing shared checklists"
on "public"."shared_checklists"
as permissive
for select
to public
using ((user_id = auth.uid()));


create policy "Allow users to delete their trip_checklists"
on "public"."trip_checklists"
as permissive
for delete
to public
using ((EXISTS ( SELECT 1
   FROM trips
  WHERE ((trips.id = trip_checklists.trip_id) AND (trips.user_id = auth.uid())))));


create policy "Allow users to insert their trip_checklists"
on "public"."trip_checklists"
as permissive
for insert
to public
with check ((EXISTS ( SELECT 1
   FROM trips
  WHERE ((trips.id = trip_checklists.trip_id) AND (trips.user_id = auth.uid())))));


create policy "Allow users to view their trip_checklists"
on "public"."trip_checklists"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM trips
  WHERE ((trips.id = trip_checklists.trip_id) AND (trips.user_id = auth.uid())))));


create policy "Allow adding participants to trips"
on "public"."trip_participants"
as permissive
for insert
to public
with check ((EXISTS ( SELECT 1
   FROM trip_participants tp
  WHERE ((tp.trip_id = trip_participants.trip_id) AND (tp.user_id = auth.uid()) AND (tp.role = 'owner'::text)))));


create policy "Allow managing participants (delete)"
on "public"."trip_participants"
as permissive
for delete
to public
using ((EXISTS ( SELECT 1
   FROM trip_participants tp
  WHERE ((tp.trip_id = trip_participants.trip_id) AND (tp.user_id = auth.uid()) AND (tp.role = 'owner'::text)))));


create policy "Allow managing participants (update)"
on "public"."trip_participants"
as permissive
for update
to public
using ((EXISTS ( SELECT 1
   FROM trip_participants tp
  WHERE ((tp.trip_id = trip_participants.trip_id) AND (tp.user_id = auth.uid()) AND (tp.role = 'owner'::text)))));


create policy "Allow viewing trip participants"
on "public"."trip_participants"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM trip_participants tp
  WHERE ((tp.trip_id = trip_participants.trip_id) AND (tp.user_id = auth.uid())))));


create policy "Allow users to delete their trips"
on "public"."trips"
as permissive
for delete
to public
using ((user_id = auth.uid()));


create policy "Allow users to insert their trips"
on "public"."trips"
as permissive
for insert
to public
with check ((user_id = auth.uid()));


create policy "Allow users to update their trips"
on "public"."trips"
as permissive
for update
to public
using ((user_id = auth.uid()));


create policy "Allow users to view their trips"
on "public"."trips"
as permissive
for select
to public
using ((user_id = auth.uid()));


create policy "Allow authenticated users to delete their own settings"
on "public"."user_settings"
as permissive
for delete
to public
using ((user_id = auth.uid()));


create policy "Allow authenticated users to insert their own settings"
on "public"."user_settings"
as permissive
for insert
to public
with check ((user_id = auth.uid()));


create policy "Allow authenticated users to read their own settings"
on "public"."user_settings"
as permissive
for select
to public
using ((user_id = auth.uid()));


create policy "Allow authenticated users to update their own settings"
on "public"."user_settings"
as permissive
for update
to public
using ((user_id = auth.uid()))
with check ((user_id = auth.uid()));


CREATE TRIGGER shared_checklists_audit_trigger AFTER INSERT OR DELETE OR UPDATE ON public.shared_checklists FOR EACH ROW EXECUTE FUNCTION log_shared_checklist_changes();


