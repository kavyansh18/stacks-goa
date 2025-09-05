# BOO - Bitcoin Optimistic Oracle
An implementation of Optimistic Oracle on Stacks, allowing you to get any off chain data with AI validation.

# Workflow
This section provides a detailed explanation of the oracle's architecture and functionality within our Web3 ecosystem, ensuring secure and reliable data integration from off-chain sources to on-chain smart contracts

```mermaid
sequenceDiagram
    participant reqBody
    participant coreContract
    participant treasuryContract
    participant solverContract
    participant AIValidator
    actor solver
    reqBody->>coreContract: call `request-data`
    coreContract->>treasuryContract: calls `fund-request`
    treasuryContract->>treasuryContract: adds funds to be given for correct data
    treasuryContract->>coreContract: add to map of requests
    solver->>solverContract: register on platform, if not registered
    solver->>solverContract: adds collateral for security
    solver->>coreContract: calls `set-response`
    coreContract-->>AIValidator: checks if data is valid
    activate AIValidator
    AIValidator-->>coreContract: slash if incorrect, else call `finalise-response`
    deactivate AIValidator
    coreContract->>reqBody: give back response    
```