;; Factoring Contract

;; Define data structures
(define-map factoring-offers
  { offer-id: uint }
  {
    amount: uint,
    factor: principal,
    seller: principal,
    discount-rate: uint,
    due-date: uint,
    status: (string-ascii 20)
  }
)

(define-data-var next-offer-id uint u1)

;; Error codes
(define-constant err-unauthorized (err u100))
(define-constant err-offer-not-found (err u101))
(define-constant err-invalid-discount-rate (err u102))
(define-constant err-invalid-amount (err u103))

;; Functions
(define-public (create-factoring-offer (amount uint) (discount-rate uint) (due-date uint))
  (let
    ((offer-id (var-get next-offer-id)))
    (asserts! (> amount u0) err-invalid-amount)
    (asserts! (< discount-rate u10000) err-invalid-discount-rate)
    (map-set factoring-offers
      { offer-id: offer-id }
      {
        amount: amount,
        factor: tx-sender,
        seller: tx-sender,
        discount-rate: discount-rate,
        due-date: due-date,
        status: "open"
      }
    )
    (var-set next-offer-id (+ offer-id u1))
    (ok offer-id)
  )
)

(define-public (accept-factoring-offer (offer-id uint))
  (let
    ((offer (unwrap! (map-get? factoring-offers { offer-id: offer-id }) err-offer-not-found))
     (discounted-amount (/ (* (get amount offer) (- u10000 (get discount-rate offer))) u10000)))
    (try! (stx-transfer? discounted-amount (get factor offer) tx-sender))
    (ok (map-set factoring-offers
      { offer-id: offer-id }
      (merge offer { status: "accepted" })
    ))
  )
)

(define-read-only (get-factoring-offer (offer-id uint))
  (map-get? factoring-offers { offer-id: offer-id })
)

