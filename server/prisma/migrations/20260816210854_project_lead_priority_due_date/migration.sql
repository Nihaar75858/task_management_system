-- AlterEnum
ALTER TYPE "Priority" ADD VALUE 'URGENT';

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "leadId" TEXT,
ADD COLUMN     "priority" "Priority";

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
