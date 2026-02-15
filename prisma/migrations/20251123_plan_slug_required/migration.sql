-- Prisma manual migration: make Plan.slug NOT NULL
ALTER TABLE "Plan" ALTER COLUMN "slug" SET NOT NULL;
