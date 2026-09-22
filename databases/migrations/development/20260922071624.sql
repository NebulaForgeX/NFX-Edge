-- Create extension "pgcrypto"
CREATE EXTENSION "pgcrypto" WITH SCHEMA "public" VERSION "1.4";
-- Add new schema named "sites"
CREATE SCHEMA "sites";
-- Set comment to schema: "sites"
COMMENT ON SCHEMA "sites" IS 'NFX-Edge sites: TLS certificates and DNS credentials';
-- Create "namecheap_credentials" table
CREATE TABLE "sites"."namecheap_credentials" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "account_id" uuid NOT NULL,
  "profile_id" uuid NULL,
  "label" character varying(255) NOT NULL DEFAULT '',
  "api_user" character varying(255) NOT NULL,
  "user_name" character varying(255) NOT NULL,
  "api_key" text NOT NULL,
  "client_ip" character varying(45) NOT NULL,
  "sandbox" boolean NOT NULL DEFAULT false,
  "last_verified_at" timestamp NULL,
  "last_error_message" text NULL,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);
-- Create index "idx_namecheap_credentials_account_id" to table: "namecheap_credentials"
CREATE INDEX "idx_namecheap_credentials_account_id" ON "sites"."namecheap_credentials" ("account_id");
-- Create index "uq_namecheap_credentials_account_api_user_sandbox" to table: "namecheap_credentials"
CREATE UNIQUE INDEX "uq_namecheap_credentials_account_api_user_sandbox" ON "sites"."namecheap_credentials" ("account_id", "api_user", "sandbox");
-- Set comment to table: "namecheap_credentials"
COMMENT ON TABLE "sites"."namecheap_credentials" IS 'Namecheap XML API credentials; an Edge account may store many Namecheap logins.';
-- Set comment to column: "label" on table: "namecheap_credentials"
COMMENT ON COLUMN "sites"."namecheap_credentials"."label" IS 'Operator note; not the Namecheap display name or UserName.';
-- Set comment to column: "api_user" on table: "namecheap_credentials"
COMMENT ON COLUMN "sites"."namecheap_credentials"."api_user" IS 'Namecheap.com login sent as ApiUser and UserName.';
-- Set comment to column: "user_name" on table: "namecheap_credentials"
COMMENT ON COLUMN "sites"."namecheap_credentials"."user_name" IS 'Always equal to api_user.';
-- Set comment to column: "client_ip" on table: "namecheap_credentials"
COMMENT ON COLUMN "sites"."namecheap_credentials"."client_ip" IS 'IPv4 sent as ClientIp; must match Namecheap API whitelist and Edge outbound IP.';
-- Create "tls_certificates" table
CREATE TABLE "sites"."tls_certificates" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "account_id" uuid NULL,
  "profile_id" uuid NULL,
  "domain" character varying(255) NOT NULL,
  "folder_name" character varying(255) NULL,
  "status" character varying(32) NULL DEFAULT 'process',
  "email" character varying(255) NULL,
  "certificate" text NULL,
  "private_key" text NULL,
  "sans" jsonb NULL DEFAULT '[]',
  "issuer" character varying(255) NULL,
  "not_before" timestamp NULL,
  "not_after" timestamp NULL,
  "is_valid" boolean NULL DEFAULT true,
  "days_remaining" integer NULL,
  "sans_changed" boolean NOT NULL DEFAULT false,
  "last_error_message" text NULL,
  "last_error_time" timestamp NULL,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);
-- Create index "uq_tls_certificates_domain" to table: "tls_certificates"
CREATE UNIQUE INDEX "uq_tls_certificates_domain" ON "sites"."tls_certificates" ("domain");
-- Create "NamecheapCredentialsActiveView" view
CREATE VIEW "sites"."NamecheapCredentialsActiveView" (
  "id",
  "account_id",
  "profile_id",
  "label",
  "api_user",
  "user_name",
  "api_key",
  "client_ip",
  "sandbox",
  "last_verified_at",
  "last_error_message",
  "created_at",
  "updated_at"
) AS SELECT id,
    account_id,
    profile_id,
    label,
    api_user,
    user_name,
    api_key,
    client_ip,
    sandbox,
    last_verified_at,
    last_error_message,
    created_at,
    updated_at
   FROM sites.namecheap_credentials;
-- Set comment to view: "NamecheapCredentialsActiveView"
COMMENT ON VIEW "sites"."NamecheapCredentialsActiveView" IS 'Namecheap credential rows for list/detail reads.';
-- Create "TlsCertificatesActiveView" view
CREATE VIEW "sites"."TlsCertificatesActiveView" (
  "id",
  "account_id",
  "profile_id",
  "domain",
  "folder_name",
  "status",
  "email",
  "certificate",
  "private_key",
  "sans",
  "issuer",
  "not_before",
  "not_after",
  "is_valid",
  "days_remaining",
  "sans_changed",
  "last_error_message",
  "last_error_time",
  "created_at",
  "updated_at"
) AS SELECT id,
    account_id,
    profile_id,
    domain,
    folder_name,
    status,
    email,
    certificate,
    private_key,
    sans,
    issuer,
    not_before,
    not_after,
    is_valid,
    days_remaining,
    sans_changed,
    last_error_message,
    last_error_time,
    created_at,
    updated_at
   FROM sites.tls_certificates;
-- Set comment to view: "TlsCertificatesActiveView"
COMMENT ON VIEW "sites"."TlsCertificatesActiveView" IS 'TLS certificate rows for list/detail reads.';
