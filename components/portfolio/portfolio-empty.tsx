export function PortfolioEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <span className="text-5xl" aria-hidden="true">📈</span>
      <div>
        <p className="text-sm font-medium text-primary mb-1">No investments logged yet</p>
        <p className="text-xs text-muted">Log your first investment — try &apos;bought 5 shares of AAPL at $190&apos;</p>
      </div>
    </div>
  )
}
