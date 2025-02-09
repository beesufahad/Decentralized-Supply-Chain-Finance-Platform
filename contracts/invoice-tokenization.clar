;; Invoice Tokenization Contract

;; Define token
(define-fungible-token invoice-token)

;; Define data structures
(define-map invoices
  { invoice-id: uint }
  {
    issuer: principal,
    debtor: principal,
    amount: uint,
    due-date: uint,
    status: (string-ascii 20)
  }
)

(define-data-var next-invoice-id uint u1)

;; Error codes
(define-constant err-unauthorized (err u100))
(define-constant err-invalid-amount (err u101))
(define-constant err-invoice-not-found (err u102))

;; Functions
(define-public (create-invoice (debtor principal) (amount uint) (due-date uint))
  (let
    ((invoice-id (var-get next-invoice-id)))
    (asserts! (> amount u0) err-invalid-amount)
    (try! (ft-mint? invoice-token amount tx-sender))
    (map-set invoices
      { invoice-id: invoice-id }
      {
        issuer: tx-sender,
        debtor: debtor,
        amount: amount,
        due-date: due-date,
        status: "active"
      }
    )
    (var-set next-invoice-id (+ invoice-id u1))
    (ok invoice-id)
  )
)

(define-public (settle-invoice (invoice-id uint))
  (let
    ((invoice (unwrap! (map-get? invoices { invoice-id: invoice-id }) err-invoice-not-found)))
    (asserts! (is-eq (get debtor invoice) tx-sender) err-unauthorized)
    (try! (ft-transfer? invoice-token (get amount invoice) tx-sender (get issuer invoice)))
    (ok (map-set invoices
      { invoice-id: invoice-id }
      (merge invoice { status: "settled" })
    ))
  )
)

(define-read-only (get-invoice (invoice-id uint))
  (map-get? invoices { invoice-id: invoice-id })
)

