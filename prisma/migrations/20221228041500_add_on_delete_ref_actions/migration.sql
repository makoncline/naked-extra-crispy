-- DropForeignKey
ALTER TABLE "Image" DROP CONSTRAINT "Image_spotId_fkey";

-- DropForeignKey
ALTER TABLE "Image" DROP CONSTRAINT "Image_wingId_fkey";

-- DropForeignKey
ALTER TABLE "Place" DROP CONSTRAINT "Place_spotId_fkey";

-- DropForeignKey
ALTER TABLE "Wing" DROP CONSTRAINT "Wing_spotId_fkey";

-- AddForeignKey
ALTER TABLE "Place" ADD CONSTRAINT "Place_spotId_fkey" FOREIGN KEY ("spotId") REFERENCES "Spot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wing" ADD CONSTRAINT "Wing_spotId_fkey" FOREIGN KEY ("spotId") REFERENCES "Spot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_spotId_fkey" FOREIGN KEY ("spotId") REFERENCES "Spot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_wingId_fkey" FOREIGN KEY ("wingId") REFERENCES "Wing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
