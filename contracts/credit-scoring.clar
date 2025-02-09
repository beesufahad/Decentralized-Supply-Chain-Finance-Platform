;; Credit Scoring Contract

;; Define data structures
(define-map credit-scores
  { participant: principal }
  { score: uint }
)

(define-map authorized-assessors
  { assessor: principal }
  { authorized: bool }
)

;; Error codes
(define-constant err-unauthorized (err u100))
(define-constant err-invalid-score (err u101))

;; Functions
(define-public (add-authorized-assessor (assessor principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) err-unauthorized)
    (ok (map-set authorized-assessors
      { assessor: assessor }
      { authorized: true }
    ))
  )
)

(define-public (update-credit-score (participant principal) (new-score uint))
  (let
    ((is-authorized (default-to { authorized: false } (map-get? authorized-assessors { assessor: tx-sender }))))
    (asserts! (get authorized is-authorized) err-unauthorized)
    (asserts! (<= new-score u1000) err-invalid-score)
    (ok (map-set credit-scores
      { participant: participant }
      { score: new-score }
    ))
  )
)

(define-read-only (get-credit-score (participant principal))
  (default-to { score: u0 } (map-get? credit-scores { participant: participant }))
)

;; Contract owner
(define-data-var contract-owner principal tx-sender)

