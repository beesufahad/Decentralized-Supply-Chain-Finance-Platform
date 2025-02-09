;; Payment Automation Contract

;; Define data structures
(define-map scheduled-payments
  { payment-id: uint }
  {
    payer: principal,
    payee: principal,
    amount: uint,
    due-date: uint,
    discount-rate: uint,
    status: (string-ascii 20)
  }
)

(define-data-var next-payment-id uint u1)

;; Error codes
(define-constant err-unauthorized (err u100))
(define-constant err-payment-not-found (err u101))
(define-constant err-invalid-discount-rate (err u102))

;; Functions
(define-public (schedule-payment (payee principal) (amount uint) (due-date uint) (discount-rate uint))
  (let
    ((payment-id (var-get next-payment-id)))
    (asserts! (< discount-rate u10000) err-invalid-discount-rate)
    (map-set scheduled-payments
      { payment-id: payment-id }
      {
        payer: tx-sender,
        payee: payee,
        amount: amount,
        due-date: due-date,
        discount-rate: discount-rate,
        status: "scheduled"
      }
    )
    (var-set next-payment-id (+ payment-id u1))
    (ok payment-id)
  )
)

(define-public (execute-payment (payment-id uint))
  (let
    ((payment (unwrap! (map-get? scheduled-payments { payment-id: payment-id }) err-payment-not-found))
     (current-time block-height)
     (discounted-amount (if (< current-time (get due-date payment))
                            (/ (* (get amount payment) (- u10000 (get discount-rate payment))) u10000)
                            (get amount payment))))
    (asserts! (is-eq tx-sender (get payer payment)) err-unauthorized)
    (try! (stx-transfer? discounted-amount tx-sender (get payee payment)))
    (ok (map-set scheduled-payments
      { payment-id: payment-id }
      (merge payment { status: "executed" })
    ))
  )
)

(define-read-only (get-scheduled-payment (payment-id uint))
  (map-get? scheduled-payments { payment-id: payment-id })
)

