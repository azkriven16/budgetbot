export function validateAmount(value: number): void {
  if (value <= 0 || value > 1_000_000) {
    throw new Error(`Amount must be between 0.01 and 1,000,000. Got: ${value}`)
  }
}

export function assertOwnership(recordUserId: string, authenticatedUserId: string): void {
  if (recordUserId !== authenticatedUserId) {
    throw new Error('Forbidden')
  }
}
