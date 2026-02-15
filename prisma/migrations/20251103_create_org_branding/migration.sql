-- CreateTable for OrgBranding (missing from initial schema)
CREATE TABLE "org_branding" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "companyName" TEXT,
    "license" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "colorPrimary" TEXT DEFAULT '#117CFF',
    "colorAccent" TEXT DEFAULT '#FFC838',
    "logoUrl" TEXT,
    "teamPhotoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "org_branding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "org_branding_orgId_ownerId_key" ON "org_branding"("orgId", "ownerId");

-- CreateIndex
CREATE INDEX "org_branding_ownerId_idx" ON "org_branding"("ownerId");
