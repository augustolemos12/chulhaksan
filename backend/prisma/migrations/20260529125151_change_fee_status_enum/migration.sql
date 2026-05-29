/*
  Warnings:

  - The values [FULL_YEAR,OVERDUE] on the enum `FeeStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FeeStatus_new" AS ENUM ('PENDING', 'PARTIALLY_PAID', 'PAID');
ALTER TABLE "public"."Fee" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Fee" ALTER COLUMN "status" TYPE "FeeStatus_new" USING ("status"::text::"FeeStatus_new");
ALTER TYPE "FeeStatus" RENAME TO "FeeStatus_old";
ALTER TYPE "FeeStatus_new" RENAME TO "FeeStatus";
DROP TYPE "public"."FeeStatus_old";
ALTER TABLE "Fee" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;
