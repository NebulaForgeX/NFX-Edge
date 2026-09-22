CREATE OR REPLACE VIEW "sites"."NamecheapCredentialsActiveView" AS
SELECT
  "id", "account_id", "profile_id", "label", "api_user", "user_name", "api_key",
  "client_ip", "sandbox", "last_verified_at", "last_error_message",
  "created_at", "updated_at"
FROM "sites"."namecheap_credentials";

COMMENT ON VIEW "sites"."NamecheapCredentialsActiveView" IS 'Namecheap credential rows for list/detail reads.';
