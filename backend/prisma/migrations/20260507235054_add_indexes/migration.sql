/*
  Warnings:

  - The values [FULL_YEAR] on the enum `PaymentMethod` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `isPaid` on the `Fee` table. All the data in the column will be lost.
  - You are about to drop the column `isCurrent` on the `StudentBelt` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "FeeStatus" AS ENUM ('PENDING', 'PAID', 'FULL_YEAR', 'OVERDUE');

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentMethod_new" AS ENUM ('ONLINE', 'CASH');
ALTER TABLE "Fee" ALTER COLUMN "paymentMethod" TYPE "PaymentMethod_new" USING ("paymentMethod"::text::"PaymentMethod_new");
ALTER TYPE "PaymentMethod" RENAME TO "PaymentMethod_old";
ALTER TYPE "PaymentMethod_new" RENAME TO "PaymentMethod";
DROP TYPE "public"."PaymentMethod_old";
COMMIT;

-- AlterTable
ALTER TABLE "Fee" DROP COLUMN "isPaid",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "status" "FeeStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Gym" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "currentBelt" "Belt" NOT NULL DEFAULT 'WHITE',
ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "StudentBelt" DROP COLUMN "isCurrent";

-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Attendance_gymId_idx" ON "Attendance"("gymId");

-- CreateIndex
CREATE INDEX "Attendance_date_idx" ON "Attendance"("date");

-- CreateIndex
CREATE INDEX "Fee_studentId_idx" ON "Fee"("studentId");

-- CreateIndex
CREATE INDEX "Student_teacherId_idx" ON "Student"("teacherId");

-- CreateIndex
CREATE INDEX "Student_gymId_idx" ON "Student"("gymId");
