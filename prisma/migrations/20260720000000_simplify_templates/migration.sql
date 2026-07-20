-- Drop columns from MessageTemplate
ALTER TABLE "MessageTemplate" DROP COLUMN IF EXISTS "type";
ALTER TABLE "MessageTemplate" DROP COLUMN IF EXISTS "purpose";