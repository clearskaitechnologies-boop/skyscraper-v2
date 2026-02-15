-- Add indexes to public_tokens for faster queries
CREATE INDEX IF NOT EXISTS idx_public_tokens_token ON public.public_tokens(token);
CREATE INDEX IF NOT EXISTS idx_public_tokens_report_id ON public.public_tokens(report_id);

COMMENT ON INDEX idx_public_tokens_token IS 'Fast lookup for token validation in public views';
COMMENT ON INDEX idx_public_tokens_report_id IS 'Fast lookup when listing tokens for a report';