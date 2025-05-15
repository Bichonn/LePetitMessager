<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250514222833 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
       
        $this->addSql(<<<'SQL'
            CREATE TABLE accounts_reports (id SERIAL NOT NULL, fk_reporter_id INT NOT NULL, fk_reported_id INT NOT NULL, content VARCHAR(255) DEFAULT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_995CD53988394AC1 ON accounts_reports (fk_reporter_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_995CD539FD4B4282 ON accounts_reports (fk_reported_id)
        SQL);
        $this->addSql(<<<'SQL'
            COMMENT ON COLUMN accounts_reports.created_at IS '(DC2Type:datetime_immutable)'
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE comments (id SERIAL NOT NULL, fk_user_id INT NOT NULL, fk_post_id INT DEFAULT NULL, content_text VARCHAR(280) DEFAULT NULL, content_multimedia TEXT DEFAULT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_5F9E962A5741EEB9 ON comments (fk_user_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_5F9E962ABBA63E00 ON comments (fk_post_id)
        SQL);
        $this->addSql(<<<'SQL'
            COMMENT ON COLUMN comments.created_at IS '(DC2Type:datetime_immutable)'
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE favoris (id SERIAL NOT NULL, fk_user_id INT NOT NULL, fk_post_id INT NOT NULL, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_8933C4325741EEB9 ON favoris (fk_user_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_8933C432BBA63E00 ON favoris (fk_post_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE follows (id SERIAL NOT NULL, fk_follower_id INT NOT NULL, fk_following_id INT NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_4B638A73C5D25467 ON follows (fk_follower_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_4B638A7339CBE1BA ON follows (fk_following_id)
        SQL);
        $this->addSql(<<<'SQL'
            COMMENT ON COLUMN follows.created_at IS '(DC2Type:datetime_immutable)'
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE hashtags (id SERIAL NOT NULL, content VARCHAR(63) NOT NULL, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE likes (id SERIAL NOT NULL, fk_user_id INT NOT NULL, fk_post_id INT NOT NULL, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_49CA4E7D5741EEB9 ON likes (fk_user_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_49CA4E7DBBA63E00 ON likes (fk_post_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE messages (id SERIAL NOT NULL, fk_user1_id INT NOT NULL, fk_user2_id INT NOT NULL, content_text VARCHAR(500) DEFAULT NULL, content_multimedia TEXT DEFAULT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_DB021E9664866755 ON messages (fk_user1_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_DB021E967633C8BB ON messages (fk_user2_id)
        SQL);
        $this->addSql(<<<'SQL'
            COMMENT ON COLUMN messages.created_at IS '(DC2Type:datetime_immutable)'
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE notifications (id SERIAL NOT NULL, fk_user_id INT NOT NULL, fk_post_id INT NOT NULL, content VARCHAR(255) NOT NULL, is_read BOOLEAN NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_6000B0D35741EEB9 ON notifications (fk_user_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_6000B0D3BBA63E00 ON notifications (fk_post_id)
        SQL);
        $this->addSql(<<<'SQL'
            COMMENT ON COLUMN notifications.created_at IS '(DC2Type:datetime_immutable)'
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE posts (id SERIAL NOT NULL, fk_user_id INT NOT NULL, content_text VARCHAR(1000) DEFAULT NULL, content_multimedia TEXT DEFAULT NULL, metadata JSON DEFAULT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_885DBAFA5741EEB9 ON posts (fk_user_id)
        SQL);
        $this->addSql(<<<'SQL'
            COMMENT ON COLUMN posts.created_at IS '(DC2Type:datetime_immutable)'
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE posts_reports (id SERIAL NOT NULL, fk_post_id INT NOT NULL, fk_user_id INT NOT NULL, content VARCHAR(255) DEFAULT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_5E7FBE2EBBA63E00 ON posts_reports (fk_post_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_5E7FBE2E5741EEB9 ON posts_reports (fk_user_id)
        SQL);
        $this->addSql(<<<'SQL'
            COMMENT ON COLUMN posts_reports.created_at IS '(DC2Type:datetime_immutable)'
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE reposts (id SERIAL NOT NULL, fk_user_id INT NOT NULL, fk_post_id INT NOT NULL, content_text VARCHAR(1000) DEFAULT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_F0DDCD725741EEB9 ON reposts (fk_user_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_F0DDCD72BBA63E00 ON reposts (fk_post_id)
        SQL);
        $this->addSql(<<<'SQL'
            COMMENT ON COLUMN reposts.created_at IS '(DC2Type:datetime_immutable)'
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE users (id SERIAL NOT NULL, first_name VARCHAR(50) NOT NULL, last_name VARCHAR(70) NOT NULL, username VARCHAR(50) NOT NULL, email VARCHAR(100) NOT NULL, password TEXT NOT NULL, bio VARCHAR(255) NOT NULL, profile_picture TEXT DEFAULT NULL, banner TEXT DEFAULT NULL, account_ban BOOLEAN NOT NULL, user_premium BOOLEAN NOT NULL, private_account BOOLEAN NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            COMMENT ON COLUMN users.created_at IS '(DC2Type:datetime_immutable)'
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE accounts_reports ADD CONSTRAINT FK_995CD53988394AC1 FOREIGN KEY (fk_reporter_id) REFERENCES users (id) NOT DEFERRABLE INITIALLY IMMEDIATE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE accounts_reports ADD CONSTRAINT FK_995CD539FD4B4282 FOREIGN KEY (fk_reported_id) REFERENCES users (id) NOT DEFERRABLE INITIALLY IMMEDIATE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE comments ADD CONSTRAINT FK_5F9E962A5741EEB9 FOREIGN KEY (fk_user_id) REFERENCES users (id) NOT DEFERRABLE INITIALLY IMMEDIATE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE comments ADD CONSTRAINT FK_5F9E962ABBA63E00 FOREIGN KEY (fk_post_id) REFERENCES posts (id) NOT DEFERRABLE INITIALLY IMMEDIATE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE favoris ADD CONSTRAINT FK_8933C4325741EEB9 FOREIGN KEY (fk_user_id) REFERENCES users (id) NOT DEFERRABLE INITIALLY IMMEDIATE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE favoris ADD CONSTRAINT FK_8933C432BBA63E00 FOREIGN KEY (fk_post_id) REFERENCES posts (id) NOT DEFERRABLE INITIALLY IMMEDIATE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE follows ADD CONSTRAINT FK_4B638A73C5D25467 FOREIGN KEY (fk_follower_id) REFERENCES users (id) NOT DEFERRABLE INITIALLY IMMEDIATE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE follows ADD CONSTRAINT FK_4B638A7339CBE1BA FOREIGN KEY (fk_following_id) REFERENCES users (id) NOT DEFERRABLE INITIALLY IMMEDIATE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE likes ADD CONSTRAINT FK_49CA4E7D5741EEB9 FOREIGN KEY (fk_user_id) REFERENCES users (id) NOT DEFERRABLE INITIALLY IMMEDIATE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE likes ADD CONSTRAINT FK_49CA4E7DBBA63E00 FOREIGN KEY (fk_post_id) REFERENCES posts (id) NOT DEFERRABLE INITIALLY IMMEDIATE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE messages ADD CONSTRAINT FK_DB021E9664866755 FOREIGN KEY (fk_user1_id) REFERENCES users (id) NOT DEFERRABLE INITIALLY IMMEDIATE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE messages ADD CONSTRAINT FK_DB021E967633C8BB FOREIGN KEY (fk_user2_id) REFERENCES users (id) NOT DEFERRABLE INITIALLY IMMEDIATE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE notifications ADD CONSTRAINT FK_6000B0D35741EEB9 FOREIGN KEY (fk_user_id) REFERENCES users (id) NOT DEFERRABLE INITIALLY IMMEDIATE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE notifications ADD CONSTRAINT FK_6000B0D3BBA63E00 FOREIGN KEY (fk_post_id) REFERENCES posts (id) NOT DEFERRABLE INITIALLY IMMEDIATE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE posts ADD CONSTRAINT FK_885DBAFA5741EEB9 FOREIGN KEY (fk_user_id) REFERENCES users (id) NOT DEFERRABLE INITIALLY IMMEDIATE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE posts_reports ADD CONSTRAINT FK_5E7FBE2EBBA63E00 FOREIGN KEY (fk_post_id) REFERENCES posts (id) NOT DEFERRABLE INITIALLY IMMEDIATE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE posts_reports ADD CONSTRAINT FK_5E7FBE2E5741EEB9 FOREIGN KEY (fk_user_id) REFERENCES users (id) NOT DEFERRABLE INITIALLY IMMEDIATE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reposts ADD CONSTRAINT FK_F0DDCD725741EEB9 FOREIGN KEY (fk_user_id) REFERENCES users (id) NOT DEFERRABLE INITIALLY IMMEDIATE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reposts ADD CONSTRAINT FK_F0DDCD72BBA63E00 FOREIGN KEY (fk_post_id) REFERENCES posts (id) NOT DEFERRABLE INITIALLY IMMEDIATE
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE SCHEMA pgbouncer
        SQL);
        $this->addSql(<<<'SQL'
            CREATE SCHEMA realtime
        SQL);
        $this->addSql(<<<'SQL'
            CREATE SCHEMA vault
        SQL);
        $this->addSql(<<<'SQL'
            CREATE SCHEMA graphql_public
        SQL);
        $this->addSql(<<<'SQL'
            CREATE SCHEMA graphql
        SQL);
        $this->addSql(<<<'SQL'
            CREATE SCHEMA storage
        SQL);
        $this->addSql(<<<'SQL'
            CREATE SCHEMA auth
        SQL);
        $this->addSql(<<<'SQL'
            CREATE SCHEMA public
        SQL);
        $this->addSql(<<<'SQL'
            CREATE SCHEMA extensions
        SQL);
        $this->addSql(<<<'SQL'
            CREATE SEQUENCE graphql.seq_schema_version INCREMENT BY 1 MINVALUE 1 START 1
        SQL);
        $this->addSql(<<<'SQL'
            CREATE SEQUENCE auth.refresh_tokens_id_seq INCREMENT BY 1 MINVALUE 1 START 1
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE realtime.schema_migrations (version BIGINT NOT NULL, inserted_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, PRIMARY KEY(version))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE auth.one_time_tokens (id UUID NOT NULL, user_id UUID NOT NULL, token_type VARCHAR(255) NOT NULL, token_hash TEXT NOT NULL, relates_to TEXT NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT 'now()' NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT 'now()' NOT NULL, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens (relates_to)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens (token_hash)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens (user_id, token_type)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_F792B521A76ED395 ON auth.one_time_tokens (user_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE auth.flow_state (id UUID NOT NULL, user_id UUID DEFAULT NULL, auth_code TEXT NOT NULL, code_challenge_method VARCHAR(255) NOT NULL, code_challenge TEXT NOT NULL, provider_type TEXT NOT NULL, provider_access_token TEXT DEFAULT NULL, provider_refresh_token TEXT DEFAULT NULL, created_at TIMESTAMP(0) WITH TIME ZONE DEFAULT NULL, updated_at TIMESTAMP(0) WITH TIME ZONE DEFAULT NULL, authentication_method TEXT NOT NULL, auth_code_issued_at TIMESTAMP(0) WITH TIME ZONE DEFAULT NULL, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX flow_state_created_at_idx ON auth.flow_state (created_at)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX idx_auth_code ON auth.flow_state (auth_code)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX idx_user_id_auth_method ON auth.flow_state (user_id, authentication_method)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE storage.buckets (id TEXT NOT NULL, name TEXT NOT NULL, owner UUID DEFAULT NULL, created_at TIMESTAMP(0) WITH TIME ZONE DEFAULT 'now()', updated_at TIMESTAMP(0) WITH TIME ZONE DEFAULT 'now()', public BOOLEAN DEFAULT false, avif_autodetection BOOLEAN DEFAULT false, file_size_limit BIGINT DEFAULT NULL, allowed_mime_types VARCHAR(255) DEFAULT NULL, owner_id TEXT DEFAULT NULL, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE UNIQUE INDEX bname ON storage.buckets (name)
        SQL);
        $this->addSql(<<<'SQL'
            COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead'
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE auth.saml_relay_states (id UUID NOT NULL, sso_provider_id UUID NOT NULL, flow_state_id UUID DEFAULT NULL, request_id TEXT NOT NULL, for_email TEXT DEFAULT NULL, redirect_to TEXT DEFAULT NULL, created_at TIMESTAMP(0) WITH TIME ZONE DEFAULT NULL, updated_at TIMESTAMP(0) WITH TIME ZONE DEFAULT NULL, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states (created_at)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states (for_email)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states (sso_provider_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_E601D7E89692F398 ON auth.saml_relay_states (flow_state_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE auth.saml_providers (id UUID NOT NULL, sso_provider_id UUID NOT NULL, entity_id TEXT NOT NULL, metadata_xml TEXT NOT NULL, metadata_url TEXT DEFAULT NULL, attribute_mapping JSONB DEFAULT NULL, created_at TIMESTAMP(0) WITH TIME ZONE DEFAULT NULL, updated_at TIMESTAMP(0) WITH TIME ZONE DEFAULT NULL, name_id_format TEXT DEFAULT NULL, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE UNIQUE INDEX saml_providers_entity_id_key ON auth.saml_providers (entity_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers (sso_provider_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE auth.mfa_challenges (id UUID NOT NULL, factor_id UUID NOT NULL, created_at TIMESTAMP(0) WITH TIME ZONE NOT NULL, verified_at TIMESTAMP(0) WITH TIME ZONE DEFAULT NULL, ip_address VARCHAR(255) NOT NULL, otp_code TEXT DEFAULT NULL, web_authn_session_data JSONB DEFAULT NULL, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges (created_at)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_5A13C7D9BC88C1A3 ON auth.mfa_challenges (factor_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE auth.users (id UUID NOT NULL, instance_id UUID DEFAULT NULL, aud VARCHAR(255) DEFAULT NULL, role VARCHAR(255) DEFAULT NULL, email VARCHAR(255) DEFAULT NULL, encrypted_password VARCHAR(255) DEFAULT NULL, email_confirmed_at TIMESTAMP(0) WITH TIME ZONE DEFAULT NULL, invited_at TIMESTAMP(0) WITH TIME ZONE DEFAULT NULL, confirmation_token VARCHAR(255) DEFAULT NULL, confirmation_sent_at TIMESTAMP(0) WITH TIME ZONE DEFAULT NULL, recovery_token VARCHAR(255) DEFAULT NULL, recovery_sent_at TIMESTAMP(0) WITH TIME ZONE DEFAULT NULL, email_change_token_new VARCHAR(255) DEFAULT NULL, email_change VARCHAR(255) DEFAULT NULL, email_change_sent_at TIMESTAMP(0) WITH TIME ZONE DEFAULT NULL, last_sign_in_at TIMESTAMP(0) WITH TIME ZONE DEFAULT NULL, raw_app_meta_data JSONB DEFAULT NULL, raw_user_meta_data JSONB DEFAULT NULL, is_super_admin BOOLEAN DEFAULT NULL, created_at TIMESTAMP(0) WITH TIME ZONE DEFAULT NULL, updated_at TIMESTAMP(0) WITH TIME ZONE DEFAULT NULL, phone TEXT DEFAULT NULL, phone_confirmed_at TIMESTAMP(0) WITH TIME ZONE DEFAULT NULL, phone_change TEXT DEFAULT '', phone_change_token VARCHAR(255) DEFAULT '', phone_change_sent_at TIMESTAMP(0) WITH TIME ZONE DEFAULT NULL, confirmed_at TIMESTAMP(0) WITH TIME ZONE DEFAULT NULL, email_change_token_current VARCHAR(255) DEFAULT '', email_change_confirm_status SMALLINT DEFAULT 0, banned_until TIMESTAMP(0) WITH TIME ZONE DEFAULT NULL, reauthentication_token VARCHAR(255) DEFAULT '', reauthentication_sent_at TIMESTAMP(0) WITH TIME ZONE DEFAULT NULL, is_sso_user BOOLEAN DEFAULT false NOT NULL, deleted_at TIMESTAMP(0) WITH TIME ZONE DEFAULT NULL, is_anonymous BOOLEAN DEFAULT false NOT NULL, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE UNIQUE INDEX users_phone_key ON auth.users (phone)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE UNIQUE INDEX confirmation_token_idx ON auth.users (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE UNIQUE INDEX recovery_token_idx ON auth.users (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE UNIQUE INDEX users_email_partial_key ON auth.users (email) WHERE (is_sso_user = false)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX users_instance_id_email_idx ON auth.users (instance_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX users_instance_id_idx ON auth.users (instance_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX users_is_anonymous_idx ON auth.users (is_anonymous)
        SQL);
        $this->addSql(<<<'SQL'
            COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.'
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE auth.instances (id UUID NOT NULL, uuid UUID DEFAULT NULL, raw_base_config TEXT DEFAULT NULL, created_at TIMESTAMP(0) WITH TIME ZONE DEFAULT NULL, updated_at TIMESTAMP(0) WITH TIME ZONE DEFAULT NULL, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE auth.mfa_factors (id UUID NOT NULL, user_id UUID NOT NULL, friendly_name TEXT DEFAULT NULL, factor_type VARCHAR(255) NOT NULL, status VARCHAR(255) NOT NULL, created_at TIMESTAMP(0) WITH TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITH TIME ZONE NOT NULL, secret TEXT DEFAULT NULL, phone TEXT DEFAULT NULL, last_challenged_at TIMESTAMP(0) WITH TIME ZONE DEFAULT NULL, web_authn_credential JSONB DEFAULT NULL, web_authn_aaguid UUID DEFAULT NULL, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE UNIQUE INDEX mfa_factors_last_challenged_at_key ON auth.mfa_factors (last_challenged_at)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors (user_id, created_at)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors (user_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors (user_id, phone)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE auth.schema_migrations (version VARCHAR(255) NOT NULL, PRIMARY KEY(version))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE storage.migrations (id INT NOT NULL, name VARCHAR(100) NOT NULL, hash VARCHAR(40) NOT NULL, executed_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE UNIQUE INDEX migrations_name_key ON storage.migrations (name)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE auth.sessions (id UUID NOT NULL, user_id UUID NOT NULL, created_at TIMESTAMP(0) WITH TIME ZONE DEFAULT NULL, updated_at TIMESTAMP(0) WITH TIME ZONE DEFAULT NULL, factor_id UUID DEFAULT NULL, aal VARCHAR(255) DEFAULT NULL, not_after TIMESTAMP(0) WITH TIME ZONE DEFAULT NULL, refreshed_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, user_agent TEXT DEFAULT NULL, ip VARCHAR(255) DEFAULT NULL, tag TEXT DEFAULT NULL, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX sessions_not_after_idx ON auth.sessions (not_after)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX sessions_user_id_idx ON auth.sessions (user_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX user_id_created_at_idx ON auth.sessions (user_id, created_at)
        SQL);
        $this->addSql(<<<'SQL'
            COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.'
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE storage.s3_multipart_uploads (id TEXT NOT NULL, bucket_id TEXT NOT NULL, in_progress_size BIGINT DEFAULT 0 NOT NULL, upload_signature TEXT NOT NULL, key TEXT NOT NULL COLLATE "C", version TEXT NOT NULL, owner_id TEXT DEFAULT NULL, created_at TIMESTAMP(0) WITH TIME ZONE DEFAULT 'now()' NOT NULL, user_metadata JSONB DEFAULT NULL, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads (bucket_id, key, created_at)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_C3072FD884CE584D ON storage.s3_multipart_uploads (bucket_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE storage.objects (id UUID DEFAULT 'gen_random_uuid()' NOT NULL, bucket_id TEXT DEFAULT NULL, name TEXT DEFAULT NULL, owner UUID DEFAULT NULL, created_at TIMESTAMP(0) WITH TIME ZONE DEFAULT 'now()', updated_at TIMESTAMP(0) WITH TIME ZONE DEFAULT 'now()', last_accessed_at TIMESTAMP(0) WITH TIME ZONE DEFAULT 'now()', metadata JSONB DEFAULT NULL, path_tokens VARCHAR(255) DEFAULT NULL, version TEXT DEFAULT NULL, owner_id TEXT DEFAULT NULL, user_metadata JSONB DEFAULT NULL, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE UNIQUE INDEX bucketid_objname ON storage.objects (bucket_id, name)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX idx_objects_bucket_id_name ON storage.objects (bucket_id, name)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX name_prefix_search ON storage.objects (name)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_A5DC6E9F84CE584D ON storage.objects (bucket_id)
        SQL);
        $this->addSql(<<<'SQL'
            COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead'
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE realtime.subscription (id BIGINT NOT NULL, subscription_id UUID NOT NULL, entity VARCHAR(255) NOT NULL, filters VARCHAR(255) DEFAULT '{}' NOT NULL, claims JSONB NOT NULL, claims_role VARCHAR(255) NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT 'utc' NOT NULL, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription (entity)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_key ON realtime.subscription (subscription_id, entity, filters)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE auth.audit_log_entries (id UUID NOT NULL, instance_id UUID DEFAULT NULL, payload JSON DEFAULT NULL, created_at TIMESTAMP(0) WITH TIME ZONE DEFAULT NULL, ip_address VARCHAR(64) DEFAULT '' NOT NULL, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries (instance_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE auth.sso_providers (id UUID NOT NULL, resource_id TEXT DEFAULT NULL, created_at TIMESTAMP(0) WITH TIME ZONE DEFAULT NULL, updated_at TIMESTAMP(0) WITH TIME ZONE DEFAULT NULL, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.'
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE auth.identities (id UUID DEFAULT 'gen_random_uuid()' NOT NULL, user_id UUID NOT NULL, provider_id TEXT NOT NULL, identity_data JSONB NOT NULL, provider TEXT NOT NULL, last_sign_in_at TIMESTAMP(0) WITH TIME ZONE DEFAULT NULL, created_at TIMESTAMP(0) WITH TIME ZONE DEFAULT NULL, updated_at TIMESTAMP(0) WITH TIME ZONE DEFAULT NULL, email TEXT DEFAULT NULL, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE UNIQUE INDEX identities_provider_id_provider_unique ON auth.identities (provider_id, provider)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX identities_email_idx ON auth.identities (email)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX identities_user_id_idx ON auth.identities (user_id)
        SQL);
        $this->addSql(<<<'SQL'
            COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data'
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE auth.mfa_amr_claims (id UUID NOT NULL, session_id UUID NOT NULL, created_at TIMESTAMP(0) WITH TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITH TIME ZONE NOT NULL, authentication_method TEXT NOT NULL, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE UNIQUE INDEX mfa_amr_claims_session_id_authentication_method_pkey ON auth.mfa_amr_claims (session_id, authentication_method)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_19ACBC5C613FECDF ON auth.mfa_amr_claims (session_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE auth.refresh_tokens (id BIGSERIAL NOT NULL, session_id UUID DEFAULT NULL, instance_id UUID DEFAULT NULL, token VARCHAR(255) DEFAULT NULL, user_id VARCHAR(255) DEFAULT NULL, revoked BOOLEAN DEFAULT NULL, created_at TIMESTAMP(0) WITH TIME ZONE DEFAULT NULL, updated_at TIMESTAMP(0) WITH TIME ZONE DEFAULT NULL, parent VARCHAR(255) DEFAULT NULL, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE UNIQUE INDEX refresh_tokens_token_unique ON auth.refresh_tokens (token)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens (instance_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens (instance_id, user_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens (parent)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens (session_id, revoked)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens (updated_at)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_39BB651D613FECDF ON auth.refresh_tokens (session_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE auth.sso_domains (id UUID NOT NULL, sso_provider_id UUID NOT NULL, domain TEXT NOT NULL, created_at TIMESTAMP(0) WITH TIME ZONE DEFAULT NULL, updated_at TIMESTAMP(0) WITH TIME ZONE DEFAULT NULL, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains (sso_provider_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE storage.s3_multipart_uploads_parts (id UUID DEFAULT 'gen_random_uuid()' NOT NULL, upload_id TEXT NOT NULL, bucket_id TEXT NOT NULL, size BIGINT DEFAULT 0 NOT NULL, part_number INT NOT NULL, key TEXT NOT NULL COLLATE "C", etag TEXT NOT NULL, owner_id TEXT DEFAULT NULL, version TEXT NOT NULL, created_at TIMESTAMP(0) WITH TIME ZONE DEFAULT 'now()' NOT NULL, PRIMARY KEY(id))
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_50BA7D5584CE584D ON storage.s3_multipart_uploads_parts (bucket_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_50BA7D55CCCFBA31 ON storage.s3_multipart_uploads_parts (upload_id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE accounts_reports DROP CONSTRAINT FK_995CD53988394AC1
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE accounts_reports DROP CONSTRAINT FK_995CD539FD4B4282
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE comments DROP CONSTRAINT FK_5F9E962A5741EEB9
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE comments DROP CONSTRAINT FK_5F9E962ABBA63E00
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE favoris DROP CONSTRAINT FK_8933C4325741EEB9
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE favoris DROP CONSTRAINT FK_8933C432BBA63E00
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE follows DROP CONSTRAINT FK_4B638A73C5D25467
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE follows DROP CONSTRAINT FK_4B638A7339CBE1BA
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE likes DROP CONSTRAINT FK_49CA4E7D5741EEB9
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE likes DROP CONSTRAINT FK_49CA4E7DBBA63E00
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE messages DROP CONSTRAINT FK_DB021E9664866755
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE messages DROP CONSTRAINT FK_DB021E967633C8BB
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE notifications DROP CONSTRAINT FK_6000B0D35741EEB9
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE notifications DROP CONSTRAINT FK_6000B0D3BBA63E00
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE posts DROP CONSTRAINT FK_885DBAFA5741EEB9
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE posts_reports DROP CONSTRAINT FK_5E7FBE2EBBA63E00
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE posts_reports DROP CONSTRAINT FK_5E7FBE2E5741EEB9
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reposts DROP CONSTRAINT FK_F0DDCD725741EEB9
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reposts DROP CONSTRAINT FK_F0DDCD72BBA63E00
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE accounts_reports
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE comments
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE favoris
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE follows
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE hashtags
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE likes
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE messages
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE notifications
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE posts
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE posts_reports
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE reposts
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE users
        SQL);
    }
}
