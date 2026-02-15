-- Adds users.public_skills column if missing (JSONB array default [])
DO $$ BEGIN
	BEGIN
		ALTER TABLE users ADD COLUMN public_skills JSONB DEFAULT '[]'::jsonb;
	EXCEPTION WHEN duplicate_column THEN
		-- already exists
	END;
END $$;

-- Verification
SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='public_skills';