import { describe, it, expect, beforeEach } from "vitest"

// Mock storage for scheduled payments
const scheduledPayments = new Map()
let nextPaymentId = 1

// Mock functions to simulate contract behavior
function schedulePayment(payer: string, payee: string, amount: number, dueDate: number, discountRate: number) {
  const paymentId = nextPaymentId++
  scheduledPayments.set(paymentId, { payer, payee, amount, dueDate, discountRate, status: "scheduled" })
  return paymentId
}

function executePayment(paymentId: number, sender: string) {
  const payment = scheduledPayments.get(paymentId)
  if (!payment) throw new Error("Payment not found")
  if (payment.payer !== sender) throw new Error("Unauthorized")
  payment.status = "executed"
  scheduledPayments.set(paymentId, payment)
  return true
}

function getScheduledPayment(paymentId: number) {
  return scheduledPayments.get(paymentId)
}

describe("Payment Automation Contract", () => {
  beforeEach(() => {
    scheduledPayments.clear()
    nextPaymentId = 1
  })
  
  it("should schedule a payment", () => {
    const paymentId = schedulePayment("payer1", "payee1", 1000, 1625097600, 500) // 5% discount rate
    expect(paymentId).toBe(1)
    const payment = getScheduledPayment(paymentId)
    expect(payment).toBeDefined()
    expect(payment.amount).toBe(1000)
    expect(payment.status).toBe("scheduled")
  })
  
  it("should execute a payment", () => {
    const paymentId = schedulePayment("payer1", "payee1", 1000, 1625097600, 500)
    const result = executePayment(paymentId, "payer1")
    expect(result).toBe(true)
    const executedPayment = getScheduledPayment(paymentId)
    expect(executedPayment.status).toBe("executed")
  })
  
  it("should not allow unauthorized execution", () => {
    const paymentId = schedulePayment("payer1", "payee1", 1000, 1625097600, 500)
    expect(() => executePayment(paymentId, "unauthorized")).toThrow("Unauthorized")
  })
  
  it("should retrieve a scheduled payment", () => {
    const paymentId = schedulePayment("payer1", "payee1", 1000, 1625097600, 500)
    const payment = getScheduledPayment(paymentId)
    expect(payment).toBeDefined()
    expect(payment.payer).toBe("payer1")
    expect(payment.payee).toBe("payee1")
    expect(payment.amount).toBe(1000)
    expect(payment.dueDate).toBe(1625097600)
    expect(payment.discountRate).toBe(500)
  })
})

