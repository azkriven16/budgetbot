/*
  Warnings:

  - You are about to drop the `Investment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SavingsContribution` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SavingsGoal` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Investment" DROP CONSTRAINT "Investment_userId_fkey";

-- DropForeignKey
ALTER TABLE "SavingsContribution" DROP CONSTRAINT "SavingsContribution_goalId_fkey";

-- DropForeignKey
ALTER TABLE "SavingsGoal" DROP CONSTRAINT "SavingsGoal_userId_fkey";

-- DropTable
DROP TABLE "Investment";

-- DropTable
DROP TABLE "SavingsContribution";

-- DropTable
DROP TABLE "SavingsGoal";

-- DropEnum
DROP TYPE "InvestmentAction";
