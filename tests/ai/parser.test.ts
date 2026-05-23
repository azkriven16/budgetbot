import { describe, it, expect } from 'vitest'
import { parseMessage } from '../../lib/ai/parse'

/**
 * Spec: context/feature-specs/15-ai-eval-harness.md
 *
 * Live AI calls — costs real tokens (~$0.01 per full run).
 * Run manually before deploying a prompt or model change: pnpm test:ai
 * Do NOT add to CI — these are non-deterministic and slow.
 *
 * Pass threshold: 8 out of 10 cases must match expected intent and key fields.
 */

describe('AI Parser — golden test cases', () => {
  it("expense message: 'spent $45 on groceries'", async () => {
    const result = await parseMessage('spent $45 on groceries')
    expect(result.intent).toBe('transaction')
    expect(result.transaction?.type).toBe('EXPENSE')
    expect(result.transaction?.amount).toBe(45)
  })

  it("income message: 'got paid $3000'", async () => {
    const result = await parseMessage('got paid $3000')
    expect(result.intent).toBe('transaction')
    expect(result.transaction?.type).toBe('INCOME')
    expect(result.transaction?.amount).toBe(3000)
  })

  it("savings contribution: 'added $200 to vacation fund'", async () => {
    const result = await parseMessage('added $200 to vacation fund')
    expect(result.intent).toBe('savings_contribution')
    expect(result.savingsContribution?.amount).toBe(200)
  })

  it("stock buy: 'bought 5 shares of AAPL at $190'", async () => {
    const result = await parseMessage('bought 5 shares of AAPL at $190')
    expect(result.intent).toBe('investment')
    expect(result.investment?.action).toBe('BUY')
    expect(result.investment?.shares).toBe(5)
  })

  it("stock sell: 'sold 2 NVDA at $500'", async () => {
    const result = await parseMessage('sold 2 NVDA at $500')
    expect(result.intent).toBe('investment')
    expect(result.investment?.action).toBe('SELL')
    expect(result.investment?.shares).toBe(2)
  })

  it("reminder: 'remind me to pay rent on the 1st of every month'", async () => {
    const result = await parseMessage('remind me to pay rent on the 1st of every month')
    expect(result.intent).toBe('reminder')
  })

  it("correction: 'wait that was $25 not $45'", async () => {
    const result = await parseMessage('wait that was $25 not $45')
    expect(result.intent).toBe('correction')
    expect(result.correction?.field).toBe('amount')
  })

  it("shorthand expense: 'uber eats $32'", async () => {
    const result = await parseMessage('uber eats $32')
    expect(result.intent).toBe('transaction')
    expect(result.transaction?.type).toBe('EXPENSE')
    expect(result.transaction?.amount).toBe(32)
  })

  it("question: \"what's my balance?\"", async () => {
    const result = await parseMessage("what's my balance?")
    expect(result.intent).toBe('question')
  })

  it("garbage input: 'asdf qwerty 12345'", async () => {
    const result = await parseMessage('asdf qwerty 12345')
    expect(result.intent).toBe('unknown')
  })
})
