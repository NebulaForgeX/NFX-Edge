CREATE OR REPLACE VIEW "sites"."TlsCertificatesActiveView" AS
SELECT
  "id", "account_id", "profile_id", "domain", "folder_name", "status",
  "email", "certificate", "private_key", "sans", "issuer",
  "not_before", "not_after", "is_valid", "days_remaining", "sans_changed",
  "last_error_message", "last_error_time", "created_at", "updated_at"
FROM "sites"."tls_certificates";

COMMENT ON VIEW "sites"."TlsCertificatesActiveView" IS 'TLS certificate rows for list/detail reads.';
