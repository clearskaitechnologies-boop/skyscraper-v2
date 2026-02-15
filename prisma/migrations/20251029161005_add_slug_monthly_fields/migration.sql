/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Plan` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[monthlyPriceId]` on the table `Plan` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `monthlyPriceId` to the `Plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Plan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "monthlyPriceId" TEXT NOT NULL,
ADD COLUMN     "monthlyTokens" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Plan_slug_key" ON "Plan"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_monthlyPriceId_key" ON "Plan"("monthlyPriceId");
