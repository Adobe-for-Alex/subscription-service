/*
  Warnings:

  - You are about to drop the column `adobeId` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `mailTmId` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `startedAt` on the `Session` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Session" DROP COLUMN "adobeId",
DROP COLUMN "email",
DROP COLUMN "mailTmId",
DROP COLUMN "startedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "Mail" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "mailId" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionAccount" (
    "sessionId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionAccount_pkey" PRIMARY KEY ("sessionId","accountId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Mail_email_key" ON "Mail"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_mailId_key" ON "Account"("mailId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionAccount_accountId_key" ON "SessionAccount"("accountId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_mailId_fkey" FOREIGN KEY ("mailId") REFERENCES "Mail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionAccount" ADD CONSTRAINT "SessionAccount_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionAccount" ADD CONSTRAINT "SessionAccount_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
