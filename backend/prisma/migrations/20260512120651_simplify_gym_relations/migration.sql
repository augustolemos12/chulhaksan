/*
  Warnings:

  - You are about to drop the `MercadoPagoAccount` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TeacherGym` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[teacherId,name]` on the table `Gym` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `teacherId` to the `Gym` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "MercadoPagoAccount" DROP CONSTRAINT "MercadoPagoAccount_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "TeacherGym" DROP CONSTRAINT "TeacherGym_gymId_fkey";

-- DropForeignKey
ALTER TABLE "TeacherGym" DROP CONSTRAINT "TeacherGym_teacherId_fkey";

-- AlterTable
ALTER TABLE "Gym" ADD COLUMN     "teacherId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "MercadoPagoAccount";

-- DropTable
DROP TABLE "TeacherGym";

-- CreateIndex
CREATE INDEX "Gym_teacherId_idx" ON "Gym"("teacherId");

-- CreateIndex
CREATE INDEX "Gym_deletedAt_idx" ON "Gym"("deletedAt");

-- CreateIndex
CREATE INDEX "Gym_isActive_idx" ON "Gym"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Gym_teacherId_name_key" ON "Gym"("teacherId", "name");

-- AddForeignKey
ALTER TABLE "Gym" ADD CONSTRAINT "Gym_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
