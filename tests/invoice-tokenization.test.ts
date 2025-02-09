import { describe, it, expect, beforeEach } from "vitest"

// Mock storage for invoices
const invoices = new Map()
let nextInvoiceId = 1

// Mock functions to simulate contract behavior
function createInvoice(issuer: string, debtor: string, amount: number, dueDate: number) {
  const invoiceId = nextInvoiceId++
  invoices.set(invoiceId, { issuer, debtor, amount, dueDate, status: "active" })
  return invoiceId
}

function settleInvoice(invoiceId: number, sender: string) {
  const invoice = invoices.get(invoiceId)
  if (!invoice) throw new Error("Invoice not found")
  if (invoice.debtor !== sender) throw new Error("Unauthorized")
  invoice.status = "settled"
  invoices.set(invoiceId, invoice)
  return true
}

function getInvoice(invoiceId: number) {
  return invoices.get(invoiceId)
}

describe("Invoice Tokenization Contract", () => {
  beforeEach(() => {
    invoices.clear()
    nextInvoiceId = 1
  })
  
  it("should create an invoice", () => {
    const invoiceId = createInvoice("issuer1", "debtor1", 1000, 1625097600)
    expect(invoiceId).toBe(1)
    const invoice = getInvoice(invoiceId)
    expect(invoice).toBeDefined()
    expect(invoice.amount).toBe(1000)
    expect(invoice.status).toBe("active")
  })
  
  it("should settle an invoice", () => {
    const invoiceId = createInvoice("issuer1", "debtor1", 1000, 1625097600)
    const result = settleInvoice(invoiceId, "debtor1")
    expect(result).toBe(true)
    const settledInvoice = getInvoice(invoiceId)
    expect(settledInvoice.status).toBe("settled")
  })
  
  it("should not allow unauthorized settlement", () => {
    const invoiceId = createInvoice("issuer1", "debtor1", 1000, 1625097600)
    expect(() => settleInvoice(invoiceId, "unauthorized")).toThrow("Unauthorized")
  })
  
  it("should retrieve an invoice", () => {
    const invoiceId = createInvoice("issuer1", "debtor1", 1000, 1625097600)
    const invoice = getInvoice(invoiceId)
    expect(invoice).toBeDefined()
    expect(invoice.issuer).toBe("issuer1")
    expect(invoice.debtor).toBe("debtor1")
    expect(invoice.amount).toBe(1000)
    expect(invoice.dueDate).toBe(1625097600)
  })
})

