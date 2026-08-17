/*
  Warnings:

  - Added the required column `projectId` to the `labels` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "labels" ADD COLUMN     "projectId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "labels_projectId_idx" ON "labels"("projectId");

-- AddForeignKey
ALTER TABLE "labels" ADD CONSTRAINT "labels_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
