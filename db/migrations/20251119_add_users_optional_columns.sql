-- Migration: Add optional user profile columns if they do not already exist
-- Safety: Uses IF NOT EXISTS to avoid errors if partially applied previously.
-- Apply with: psql "$DATABASE_URL" -f db/migrations/20251119_add_users_optional_columns.sql

DO $$ BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='title'
	) THEN
		ALTER TABLE "users" ADD COLUMN "title" TEXT;
	END IF;
END $$;

DO $$ BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='phone'
	) THEN
		ALTER TABLE "users" ADD COLUMN "phone" TEXT;
	END IF;
END $$;

DO $$ BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='job_history'
	) THEN
		ALTER TABLE "users" ADD COLUMN "job_history" JSONB DEFAULT '[]'::jsonb;
	END IF;
END $$;

DO $$ BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='public_skills'
	) THEN
		ALTER TABLE "users" ADD COLUMN "public_skills" JSONB DEFAULT '[]'::jsonb;
	END IF;
END $$;

DO $$ BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='client_testimonials'
	) THEN
		ALTER TABLE "users" ADD COLUMN "client_testimonials" JSONB DEFAULT '[]'::jsonb;
	END IF;
END $$;

DO $$ BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='earned_badges'
	) THEN
		ALTER TABLE "users" ADD COLUMN "earned_badges" JSONB DEFAULT '[]'::jsonb;
	END IF;
END $$;

DO $$ BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='years_experience'
	) THEN
		ALTER TABLE "users" ADD COLUMN "years_experience" INT DEFAULT 0;
	END IF;
END $$;

DO $$ BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='headshot_url'
	) THEN
		ALTER TABLE "users" ADD COLUMN "headshot_url" TEXT;
	END IF;
END $$;

-- NOTE: Columns mapped in Prisma via @map(...) already appear with snake_case in DB.
-- This ensures runtime queries referencing these fields will no longer fail.
