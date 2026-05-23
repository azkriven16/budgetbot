export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'You do not have permission to modify this record') {
    super(message)
    this.name = 'ForbiddenError'
  }
}

export function validateAmount(value: number): number {
  if (!isFinite(value) || value <= 0 || value > 1_000_000) {
    throw new ValidationError(`Amount out of bounds: ${value}`)
  }
  return value
}

export function assertOwnership(recordUserId: string, authenticatedUserId: string): void {
  if (recordUserId !== authenticatedUserId) {
    throw new ForbiddenError()
  }
}
