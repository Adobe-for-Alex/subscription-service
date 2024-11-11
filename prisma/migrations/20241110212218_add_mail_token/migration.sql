/*
  Warnings:

  - Added the required column `token` to the `Mail` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Mail" ADD COLUMN     "token" TEXT NOT NULL;
