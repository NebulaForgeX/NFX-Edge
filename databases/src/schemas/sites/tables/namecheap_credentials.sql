CREATE TABLE IF NOT EXISTS "sites"."namecheap_credentials" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "account_id" UUID NOT NULL,
  "profile_id" UUID,
  "label" VARCHAR(255) NOT NULL DEFAULT '',
  "api_user" VARCHAR(255) NOT NULL,
  "user_name" VARCHAR(255) NOT NULL,
  "api_key" TEXT NOT NULL,
  "client_ip" VARCHAR(45) NOT NULL,
  "sandbox" BOOLEAN NOT NULL DEFAULT FALSE,
  "last_verified_at" TIMESTAMP,
  "last_error_message" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_namecheap_credentials_account_api_user_sandbox
  ON "sites"."namecheap_credentials" ("account_id", "api_user", "sandbox");
CREATE INDEX IF NOT EXISTS idx_namecheap_credentials_account_id
  ON "sites"."namecheap_credentials" ("account_id");

COMMENT ON TABLE "sites"."namecheap_credentials" IS 'Namecheap XML API credentials; an Edge account may store many Namecheap logins.';
COMMENT ON COLUMN "sites"."namecheap_credentials"."label" IS 'Operator note; not the Namecheap display name or UserName.';
COMMENT ON COLUMN "sites"."namecheap_credentials"."api_user" IS 'Namecheap.com login sent as ApiUser and UserName.';
COMMENT ON COLUMN "sites"."namecheap_credentials"."user_name" IS 'Always equal to api_user.';
COMMENT ON COLUMN "sites"."namecheap_credentials"."client_ip" IS 'IPv4 sent as ClientIp; must match Namecheap API whitelist and Edge outbound IP.';
