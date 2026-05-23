import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getOrCreateUser } from '@/lib/user'
import { getPortfolioSummary } from '@/lib/investments'
import { PortfolioSummary } from '@/components/portfolio/portfolio-summary'
import { HoldingCard } from '@/components/portfolio/holding-card'
import { InvestmentHistory } from '@/components/portfolio/investment-history'
import { PortfolioEmpty } from '@/components/portfolio/portfolio-empty'

export default async function PortfolioPage() {
  const { userId: clerkId } = await auth()
  if (!clerkId) redirect('/sign-in')

  const user = await getOrCreateUser(clerkId)
  const { holdings, history, totalInvested } = await getPortfolioSummary(user.id)

  if (history.length === 0) {
    return <PortfolioEmpty />
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <PortfolioSummary totalInvested={totalInvested} holdingCount={holdings.length} />

      {holdings.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-primary mb-3">Holdings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {holdings.map((h) => (
              <HoldingCard key={h.ticker} holding={h} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-sm font-semibold text-primary mb-3">History</h2>
        <InvestmentHistory records={history} />
      </section>
    </div>
  )
}
