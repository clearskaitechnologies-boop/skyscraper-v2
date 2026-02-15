DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM information_schema.columns 
		WHERE table_name='feature_flags' AND column_name='rollout_percent'
	) THEN
		ALTER TABLE feature_flags ADD COLUMN rollout_percent INTEGER DEFAULT 0;
	END IF;
END$$;

UPDATE feature_flags SET rollout_percent = 0 WHERE rollout_percent IS NULL;
