CREATE TYPE "OAuthPkceMode" AS ENUM ('disabled-unverified', 's256-verified');

ALTER TABLE "oauth_transactions"
  ADD COLUMN "pkce_mode" "OAuthPkceMode" NOT NULL DEFAULT 'disabled-unverified';

ALTER TABLE "oauth_transactions"
  ADD CONSTRAINT "oauth_transactions_pkce_mode_metadata_check"
  CHECK (
    (
      "pkce_mode" = 'disabled-unverified'
      AND "pkce_ciphertext" IS NULL
      AND "pkce_nonce" IS NULL
      AND "pkce_authentication_tag" IS NULL
      AND "pkce_key_version" IS NULL
    )
    OR
    (
      "pkce_mode" = 's256-verified'
      AND "pkce_ciphertext" IS NOT NULL
      AND "pkce_nonce" IS NOT NULL
      AND "pkce_authentication_tag" IS NOT NULL
      AND "pkce_key_version" IS NOT NULL
    )
  );
