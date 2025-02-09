import { describe, it, expect, beforeEach } from "vitest"

// Mock storage for factoring offers
const factoringOffers = new Map()
let nextOfferId = 1

// Mock functions to simulate contract behavior
function createFactoringOffer(invoiceId: number, factor: string, discountRate: number) {
  const offerId = nextOfferId++
  factoringOffers.set(offerId, { invoiceId, factor, discountRate, status: "open" })
  return offerId
}

function acceptFactoringOffer(offerId: number, sender: string) {
  const offer = factoringOffers.get(offerId)
  if (!offer) throw new Error("Offer not found")
  // In a real scenario, we would check if the sender is the invoice issuer
  offer.status = "accepted"
  factoringOffers.set(offerId, offer)
  return true
}

function getFactoringOffer(offerId: number) {
  return factoringOffers.get(offerId)
}

describe("Factoring Contract", () => {
  beforeEach(() => {
    factoringOffers.clear()
    nextOfferId = 1
  })
  
  it("should create a factoring offer", () => {
    const offerId = createFactoringOffer(1, "factor1", 500) // 5% discount rate
    expect(offerId).toBe(1)
    const offer = getFactoringOffer(offerId)
    expect(offer).toBeDefined()
    expect(offer.discountRate).toBe(500)
    expect(offer.status).toBe("open")
  })
  
  it("should accept a factoring offer", () => {
    const offerId = createFactoringOffer(1, "factor1", 500)
    const result = acceptFactoringOffer(offerId, "issuer1")
    expect(result).toBe(true)
    const acceptedOffer = getFactoringOffer(offerId)
    expect(acceptedOffer.status).toBe("accepted")
  })
  
  it("should retrieve a factoring offer", () => {
    const offerId = createFactoringOffer(1, "factor1", 500)
    const offer = getFactoringOffer(offerId)
    expect(offer).toBeDefined()
    expect(offer.invoiceId).toBe(1)
    expect(offer.factor).toBe("factor1")
    expect(offer.discountRate).toBe(500)
    expect(offer.status).toBe("open")
  })
})

