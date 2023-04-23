-- CreateTable
CREATE TABLE "WingSocialPost" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "wingId" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "WingSocialPost_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WingSocialPost" ADD CONSTRAINT "WingSocialPost_wingId_fkey" FOREIGN KEY ("wingId") REFERENCES "Wing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
