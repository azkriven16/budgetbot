export interface TransactionData {
  amount: number
  type: 'INCOME' | 'EXPENSE'
  category: string
  description: string
  newBalance: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: Date
  transaction?: TransactionData
}
