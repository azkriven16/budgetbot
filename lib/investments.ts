import '@/lib/env'
import { prisma } from './prisma'
import { validateAmount } from './validators'

export interface Holding {
  ticker: string
  companyName: string | null
  totalShares: number
  totalCost: number
  averageCostPerShare: number
}

export interface InvestmentRecord {
  id: string
  ticker: string
  companyName: string | null
  action: 'BUY' | 'SELL'
  shares: number
  pricePerShare: number
  date: Date
  createdAt: Date
}

export interface PortfolioSummary {
  holdings: Holding[]
  history: InvestmentRecord[]
  totalInvested: number
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly status = 422,
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

export async function validateSell(userId: string, ticker: string, shares: number): Promise<void> {
  const records = await prisma.investment.findMany({
    where: { userId, ticker: ticker.toUpperCase() },
  })
  let net = 0
  for (const r of records) {
    if (r.action === 'BUY') net += Number(r.shares)
    else net -= Number(r.shares)
  }
  if (shares > net) {
    const held = Math.max(net, 0)
    throw new ValidationError(
      `You only hold ${held} share${held !== 1 ? 's' : ''} of ${ticker.toUpperCase()}.`,
    )
  }
}

export async function createInvestment(
  userId: string,
  data: {
    ticker: string
    companyName?: string
    action: 'BUY' | 'SELL'
    shares: number
    pricePerShare: number
    date?: Date
  },
) {
  validateAmount(data.shares)
  validateAmount(data.pricePerShare)

  if (data.action === 'SELL') {
    await validateSell(userId, data.ticker, data.shares)
  }

  return prisma.investment.create({
    data: {
      userId,
      ticker: data.ticker.toUpperCase(),
      companyName: data.companyName ?? null,
      action: data.action,
      shares: data.shares,
      pricePerShare: data.pricePerShare,
      date: data.date ?? new Date(),
    },
  })
}

export async function getPortfolioSummary(userId: string): Promise<PortfolioSummary> {
  const records = await prisma.investment.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
  })

  const map = new Map<
    string,
    {
      ticker: string
      companyName: string | null
      totalBuyShares: number
      totalBuyCost: number
      totalSellShares: number
    }
  >()

  for (const r of records) {
    const shares = Number(r.shares)
    const price = Number(r.pricePerShare)
    if (!map.has(r.ticker)) {
      map.set(r.ticker, {
        ticker: r.ticker,
        companyName: r.companyName,
        totalBuyShares: 0,
        totalBuyCost: 0,
        totalSellShares: 0,
      })
    }
    const h = map.get(r.ticker)!
    if (r.action === 'BUY') {
      h.totalBuyShares += shares
      h.totalBuyCost += shares * price
    } else {
      h.totalSellShares += shares
    }
  }

  const holdings: Holding[] = []
  for (const h of map.values()) {
    const netShares = h.totalBuyShares - h.totalSellShares
    if (netShares <= 0) continue
    const avgCostPerShare = h.totalBuyShares > 0 ? h.totalBuyCost / h.totalBuyShares : 0
    holdings.push({
      ticker: h.ticker,
      companyName: h.companyName,
      totalShares: netShares,
      totalCost: netShares * avgCostPerShare,
      averageCostPerShare: avgCostPerShare,
    })
  }

  const history: InvestmentRecord[] = records.map((r) => ({
    id: r.id,
    ticker: r.ticker,
    companyName: r.companyName,
    action: r.action as 'BUY' | 'SELL',
    shares: Number(r.shares),
    pricePerShare: Number(r.pricePerShare),
    date: r.date,
    createdAt: r.createdAt,
  }))

  const totalInvested = holdings.reduce((sum, h) => sum + h.totalCost, 0)

  return { holdings, history, totalInvested }
}
