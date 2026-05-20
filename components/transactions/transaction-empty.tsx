import { ReceiptText } from 'lucide-react'

export function TransactionEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <ReceiptText className="h-8 w-8 text-muted" />
      <p className="text-sm font-medium text-secondary">No transactions found</p>
      <p className="text-xs text-muted">Try changing the filters or add a transaction via chat.</p>
    </div>
  )
}
