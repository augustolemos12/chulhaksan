-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "imageUrl" DROP NOT NULL;
ALTER TABLE "Event" ADD COLUMN "imageUrlSquare" TEXT;
ALTER TABLE "Event" ADD COLUMN "imageUrlVertical" TEXT;
ALTER TABLE "Event" ADD COLUMN "imageUrlBanner" TEXT;
