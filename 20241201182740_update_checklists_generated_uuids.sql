CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

ALTER TABLE items ALTER COLUMN id SET DEFAULT uuid_generate_v4();
ALTER TABLE checklist_items ALTER COLUMN id SET DEFAULT uuid_generate_v4();
ALTER TABLE checklists ALTER COLUMN id SET DEFAULT uuid_generate_v4();
