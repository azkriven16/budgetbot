import '@/lib/env'
import type { SavingsGoal } from '../app/generated/prisma/client'
import { prisma } from './prisma'
import { validateAmount } from './validators'

export interface GoalWithProgress {
  id: string
  name: string
  emoji: string | null
  targetAmount: number
  currentAmount: number
  percentage: number
  isCompleted: boolean
}

export interface ContributeResult {
  goalId: string
  goalName: string
  newAmount: number
  percentage: number
  justCompleted: boolean
}

export async function getUserGoals(userId: string): Promise<GoalWithProgress[]> {
  const goals = await prisma.savingsGoal.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  })
  return goals.map((g) => {
    const target = Number(g.targetAmount)
    const current = Number(g.currentAmount)
    const percentage = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0
    return {
      id: g.id,
      name: g.name,
      emoji: g.emoji,
      targetAmount: target,
      currentAmount: current,
      percentage,
      isCompleted: g.isCompleted,
    }
  })
}

async function applyContribution(goal: SavingsGoal, amount: number): Promise<ContributeResult> {
  const newCurrentAmount = Number(goal.currentAmount) + amount
  const targetAmount = Number(goal.targetAmount)
  const justCompleted = !goal.isCompleted && newCurrentAmount >= targetAmount
  const percentage = targetAmount > 0 ? Math.min(Math.round((newCurrentAmount / targetAmount) * 100), 100) : 0

  await prisma.$transaction(async (tx) => {
    await tx.savingsContribution.create({ data: { goalId: goal.id, amount } })
    await tx.savingsGoal.update({
      where: { id: goal.id },
      data: {
        currentAmount: { increment: amount },
        ...(justCompleted ? { isCompleted: true } : {}),
      },
    })
  })

  return { goalId: goal.id, goalName: goal.name, newAmount: newCurrentAmount, percentage, justCompleted }
}

export async function contributeToGoal(
  userId: string,
  goalName: string,
  amount: number,
): Promise<ContributeResult | null> {
  validateAmount(amount)
  const goal = await prisma.savingsGoal.findFirst({
    where: { userId, name: { equals: goalName, mode: 'insensitive' } },
  })
  if (!goal) return null
  return applyContribution(goal, amount)
}

export async function contributeToGoalById(
  userId: string,
  goalId: string,
  amount: number,
): Promise<ContributeResult | null> {
  validateAmount(amount)
  const goal = await prisma.savingsGoal.findUnique({ where: { id: goalId } })
  if (!goal || goal.userId !== userId) return null
  return applyContribution(goal, amount)
}
