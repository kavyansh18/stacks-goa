(define-trait solver-trait (
    (is-registered
        (principal)
        (response bool uint)
    )
))

(define-constant MIN_COLL u100000)

(define-constant ERR_LOWER_COLL (err u101))
(define-constant ERR_ALREADY_REG (err u102))
(define-constant ERR_NOT_REGISTERED (err u103))
(define-constant ERR_INSUFFICIENT_COLL (err u104))

(define-map addr-to-coll
    principal
    uint
)

(define-public (register-solver (amount uint))
    (begin
        (asserts! (>= amount MIN_COLL) ERR_LOWER_COLL)
        (match (map-get? addr-to-coll tx-sender)
            coll
            ERR_ALREADY_REG (begin
                (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
                (map-set addr-to-coll tx-sender amount)
                (ok true)
            )
        )
    )
)

(define-public (add-collateral (amount uint))
    (begin
        (asserts! (>= amount MIN_COLL) ERR_LOWER_COLL)
        (asserts! (unwrap! (is-registered tx-sender) ERR_NOT_REGISTERED)
            ERR_NOT_REGISTERED
        )
        (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
        (map-set addr-to-coll tx-sender
            (+ (unwrap! (map-get? addr-to-coll tx-sender) ERR_NOT_REGISTERED)
                amount
            ))
        (ok true)
    )
)

(define-public (unregister-solver (address principal))
    (match (map-get? addr-to-coll tx-sender)
        coll (begin
            (try! (as-contract (stx-transfer? coll tx-sender address)))
            (map-delete addr-to-coll tx-sender)
            (ok true)
        )
        ERR_NOT_REGISTERED
    )
)

(define-read-only (get-collateral (solver principal))
    (ok (map-get? addr-to-coll solver))
)

(define-read-only (is-registered (solver principal))
    (ok (is-some (map-get? addr-to-coll solver)))
)

(define-public (slash-solver
        (solver principal)
        (amount uint)
    )
    (match (map-get? addr-to-coll solver)
        coll (if (>= coll amount)
            (begin
                (map-set addr-to-coll solver (- coll amount))
                (ok true)
            )
            ERR_INSUFFICIENT_COLL
        )
        ERR_NOT_REGISTERED
    )
)
