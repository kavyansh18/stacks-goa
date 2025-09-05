(define-constant ERR_UNAUTHORIZED (err u406))
(define-constant ERR_SOLVER_NOT_REG (err u407))
(define-constant ERR_VAL_ZERO (err u401))
(define-constant ERR_NOT_FOUND (err u404))
(define-constant ERR_ALREADY_ANSWERED (err u405))
(define-constant ERR_NO_RESPONSE_YET (err u408))

(use-trait solver-trait .boo-solver-v0_0_1.solver-trait)

(define-data-var no-of-requests uint u0)

(define-map id-to-req
    uint
    {
        requester: principal,
        request: (string-ascii 500),
        response: (optional (string-ascii 500)),
        prize: uint,
    }
)

(define-public (request-data
        (req (string-ascii 500))
        (prize-amount uint)
    )
    (let ((curr-id (var-get no-of-requests)))
        (asserts! (> prize-amount u0) ERR_VAL_ZERO)

        ;; transfer prize into treasury (stub)
        (try! (contract-call? .boo-treasury-v0_0_1 fund-request curr-id prize-amount
            tx-sender
        ))

        (map-set id-to-req curr-id {
            requester: tx-sender,
            request: req,
            response: none,
            prize: prize-amount,
        })
        (var-set no-of-requests (+ curr-id u1))

        (print {
            event: "RequestCreated",
            id: curr-id,
            requester: tx-sender,
            prize: prize-amount,
        })
        (ok curr-id)
    )
)

(define-public (set-response
        (id uint)
        (resp (string-ascii 500))
    )
    (begin
        ;; check solver registration in solver contract
        (asserts!
            (unwrap! (contract-call? .boo-solver-v0_0_1 is-registered tx-sender)
                ERR_SOLVER_NOT_REG
            )
            ERR_SOLVER_NOT_REG
        )

        (asserts! (<= id (var-get no-of-requests)) ERR_NOT_FOUND)

        (match (map-get? id-to-req id)
            req-data (if (is-some (get response req-data))
                ERR_ALREADY_ANSWERED
                (begin
                    (map-set id-to-req id {
                        requester: (get requester req-data),
                        request: (get request req-data),
                        response: (some resp),
                        prize: (get prize req-data),
                    })
                    (print {
                        event: "ResponseSet",
                        id: id,
                        solver: tx-sender,
                    })
                    (ok true)
                )
            )
            ERR_NOT_FOUND
        )
    )
)

(define-public (finalize-response
        (id uint)
        (solver principal)
    )
    (match (map-get? id-to-req id)
        req-data (if (is-some (get response req-data))
            (begin
                ;; pay solver via treasury (stub)
                (try! (contract-call? .boo-treasury-v0_0_1 reward-solver solver
                    (get prize req-data) id
                ))

                (map-set id-to-req id {
                    requester: (get requester req-data),
                    request: (get request req-data),
                    response: (get response req-data),
                    prize: u0,
                })
                (print {
                    event: "ResponseFinalized",
                    id: id,
                    solver: solver,
                })
                (ok true)
            )
            ERR_NO_RESPONSE_YET
        )
        ERR_NOT_FOUND
    )
)

(define-public (penalize-solver
        (solver principal)
        (amount uint)
    )
    (contract-call? .boo-solver-v0_0_1 slash-solver solver amount)
)

(define-read-only (get-data (id uint))
    (ok (map-get? id-to-req id))
)

(define-read-only (get-total-req)
    (ok (var-get no-of-requests))
)

(define-read-only (get-stx-balance)
    (stx-get-balance tx-sender)
)
