(define-constant ERR_NOT_ENOUGH_FUNDS (err u201))
(define-constant ERR_UNAUTHORIZED (err u202))

(define-map req-to-balance
    uint
    uint
)

(define-public (fund-request
        (request-id uint)
        (amount uint)
    )
    (begin
        (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
        (map-set req-to-balance request-id amount)

        (print {
            event: "RequestFunded",
            id: request-id,
            amount: amount,
            from: tx-sender,
        })
        (ok true)
    )
)

(define-public (reward-solver
        (solver principal)
        (amount uint)
        (request-id uint)
    )
    (begin
        ;; (asserts! (is-eq tx-sender .boo-core-v0_0_1) ERR_UNAUTHORIZED)

        (match (map-get? req-to-balance request-id)
            bal (if (>= bal amount)
                (begin
                    (try! (stx-transfer? amount (as-contract tx-sender) solver))
                    (map-set req-to-balance request-id (- bal amount))

                    (print {
                        event: "SolverRewarded",
                        id: request-id,
                        solver: solver,
                        amount: amount,
                    })
                    (ok true)
                )
                ERR_NOT_ENOUGH_FUNDS
            )
            ERR_NOT_ENOUGH_FUNDS
        )
    )
)

(define-read-only (get-request-balance (request-id uint))
    (ok (map-get? req-to-balance request-id))
)
