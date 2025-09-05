# BOO - Bitcoin Optimistic Oracle
An implementation of an Optimistic Oracle on Stacks, enabling the secure retrieval of arbitrary off-chain data through a propose-and-dispute mechanism enhanced with AI-driven validation for accuracy and reliability. \
Established oracle providers such as [Pyth](https://www.pyth.network/price-feeds) and [DIA](https://www.diadata.org/) offer robust mechanisms for retrieving real-world data, with a primary focus on price feeds across various asset classes including cryptocurrencies, equities, commodities, and foreign exchange rates. \
BOO provides oracle data with it incorporates a built-in incentive model that rewards participants for fulfilling requests or providing data, fostering a self-sustaining ecosystem through tokenized payments and reducing reliance on external subsidies.

## Workflow
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

