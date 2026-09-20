# MultiChain Design

## 1. Overview

The Blockchain-as-a-Service platform uses **MultiChain** as its permissioned blockchain layer.

The purpose of MultiChain in this project is not to provide cryptocurrency or financial transactions. Instead, it provides a shared, append-only and tamper-evident record of important e-commerce events such as:

* Product registration
* Ownership transfers
* Warranty events
* Supply-chain events

The BaaS backend hides MultiChain's technical details from Web2 businesses. Businesses interact only with the platform's REST API, while the backend communicates with MultiChain through its JSON-RPC API.

```text
Web2 Business
      │
      │ REST / JSON
      ▼
BaaS REST API
      │
      ▼
Business Service Layer
      │
      ▼
Blockchain Service
      │
      │ JSON-RPC
      ▼
MultiChain Network
```

The business therefore does not need to understand blockchain nodes, stream publishing, blockchain permissions, or MultiChain RPC commands.

---

# 2. Why MultiChain?

MultiChain was selected because the project requires a **permissioned B2B blockchain** rather than a public cryptocurrency network.

The main requirements are:

* Multiple businesses should participate in the network.
* Different businesses should have different permissions.
* Important product events should be recorded in an append-only history.
* The backend should be able to interact with the blockchain through an API.
* The project should not require cryptocurrency or customer wallets.
* The blockchain should be practical to develop and demonstrate as an academic MVP.

MultiChain provides streams for append-only data storage and supports network-level and stream-level permissions. Its JSON-RPC API can be used by an application to create streams, publish data, query stream data, and manage permissions.

---

# 3. MultiChain Network

The conceptual network contains multiple participating businesses.

For example:

```text
                 MultiChain Network
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
   Manufacturer    Distributor     Retailer
      Node             Node           Node
```

Each participant can have one or more MultiChain addresses.

For the academic MVP, the entire network may be run on a single development machine using multiple local nodes.

The logical architecture remains the same:

```text
Manufacturer ──┐
               │
Distributor ───┼──► MultiChain Network
               │
Retailer ──────┘
```

The number of physical nodes used during development does not change the conceptual architecture.

---

# 4. MultiChain Streams

MultiChain **streams** are the main mechanism used by this project to store blockchain-backed e-commerce events.

A stream is an ordered collection of published items. Each item can contain JSON, text, or binary data and is associated with transaction and block information such as its transaction ID and block time.

The platform will use four main streams:

```text
MultiChain
│
├── products
│
├── ownership
│
├── warranty
│
└── supply_chain
```

Each stream represents a different category of business event.

---

# 5. Products Stream

The `products` stream stores product registration information.

Example conceptual record:

```json
{
  "productId": "P1001",
  "businessId": "B001",
  "event": "REGISTERED",
  "name": "Laptop X",
  "description": "Business laptop"
}
```

The stream key can be the product ID:

```text
Key:
P1001
```

This allows the backend to retrieve records associated with a particular product.

### Example flow

```text
POST /api/products
       │
       ▼
BaaS Backend
       │
       ▼
publish(products, P1001, productData)
       │
       ▼
MultiChain
       │
       ▼
Transaction ID
```

The resulting transaction ID is returned to the backend and stored in PostgreSQL as blockchain transaction metadata.

MultiChain's `publish` API is designed for publishing items to streams and returns the transaction ID of the transaction sent.

---

# 6. Ownership Stream

The `ownership` stream records changes in product ownership.

Example:

```json
{
  "productId": "P1001",
  "previousOwner": "B001",
  "newOwner": "B002",
  "event": "OWNERSHIP_TRANSFERRED"
}
```

The key can again be the product ID:

```text
Key:
P1001
```

Multiple ownership events can therefore exist for the same product.

Example:

```text
P1001
 │
 ├── B001 → B002
 │
 ├── B002 → B003
 │
 └── B003 → B004
```

This creates a chronological ownership history.

The PostgreSQL database does not need to maintain a second copy of this complete history for the MVP.

---

# 7. Warranty Stream

The `warranty` stream stores warranty-related events.

Example:

```json
{
  "productId": "P1001",
  "event": "WARRANTY_STARTED",
  "startDate": "2026-09-21",
  "durationMonths": 24
}
```

Additional events can be added later:

```text
WARRANTY_STARTED
WARRANTY_EXTENDED
WARRANTY_CLAIMED
WARRANTY_EXPIRED
```

The stream provides a chronological record of warranty events associated with the product.

---

# 8. Supply Chain Stream

The `supply_chain` stream records movement or processing of a product through the supply chain.

Example:

```json
{
  "productId": "P1001",
  "event": "SHIPPED",
  "from": "B001",
  "to": "B002",
  "timestamp": "2026-09-21T12:00:00Z"
}
```

Possible events include:

```text
MANUFACTURED
PACKED
SHIPPED
RECEIVED
WAREHOUSED
DELIVERED
```

The exact event types can be defined by the application requirements.

Example history:

```text
Manufacturer
     │
     │ SHIPPED
     ▼
Distributor
     │
     │ RECEIVED
     ▼
Warehouse
     │
     │ SHIPPED
     ▼
Retailer
```

---

# 9. Stream Data Model

The four streams can be summarized as follows:

| Stream         | Purpose                 | Example Event           |
| -------------- | ----------------------- | ----------------------- |
| `products`     | Product registration    | `REGISTERED`            |
| `ownership`    | Ownership changes       | `OWNERSHIP_TRANSFERRED` |
| `warranty`     | Warranty lifecycle      | `WARRANTY_STARTED`      |
| `supply_chain` | Product movement/events | `SHIPPED`               |

The product ID acts as the common identifier across the streams.

```text
                     Product P1001
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
      products        ownership       warranty
          │
          ▼
    supply_chain
```

This allows the BaaS backend to reconstruct the blockchain-backed history of a product.

---

# 10. Stream Keys

Each stream item contains one or more keys that can be used for efficient retrieval.

For this project, the primary key will generally be the product ID.

Example:

```text
Stream: ownership

Key: P1001

Data:
{
    "previousOwner": "B001",
    "newOwner": "B002",
    "event": "OWNERSHIP_TRANSFERRED"
}
```

Therefore:

```text
GET /api/products/P1001/ownership/history
```

can be translated internally into a MultiChain stream query for items associated with:

```text
ownership + P1001
```

MultiChain provides stream querying APIs such as `getstreamkeysummary` and other stream retrieval commands.

---

# 11. MultiChain Permissions

MultiChain supports permissions at both the network level and, for streams, at the individual stream level.

Relevant permissions include:

```text
connect
send
receive
create
mine
activate
admin
```

Streams can additionally use permissions such as:

```text
stream.write
stream.read
stream.admin
```

depending on the stream configuration.

The BaaS platform will use these permissions to control which participating businesses can publish particular types of blockchain data.

---

# 12. Business-to-Blockchain Identity

Each registered business is associated with a MultiChain address.

Conceptually:

```text
Business
   │
   ├── Business ID: B001
   │
   ├── API Key
   │
   └── MultiChain Address
             │
             ▼
        MultiChain
```

The API key identifies the business at the BaaS application layer.

The MultiChain address identifies the blockchain participant at the blockchain layer.

These are two different identities serving different purposes.

```text
HTTP/API identity
       │
       ▼
    Business
       │
       ▼
Blockchain identity
       │
       ▼
MultiChain address
```

The client should not be allowed to arbitrarily provide another business's blockchain identity.

The backend determines the appropriate blockchain identity from the authenticated business.

---

# 13. Permission Model

A simplified permission model for the project is:

| Participant    | Example Responsibilities                     |
| -------------- | -------------------------------------------- |
| Manufacturer   | Register products, manufacturing events      |
| Distributor    | Distribution and shipment events             |
| Warehouse      | Receiving and warehouse events               |
| Retailer       | Receiving and retail-related events          |
| Platform Admin | Manage businesses and blockchain permissions |

For example:

```text
Manufacturer
    │
    └── products.write

Distributor
    │
    └── supply_chain.write

Retailer
    │
    └── supply_chain.write
```

The exact permission assignment will be finalized during implementation because it depends on the actual MultiChain network configuration.

The important architectural principle is that blockchain permissions are controlled by the BaaS platform rather than by arbitrary API clients.

---

# 14. Application Authorization vs Blockchain Authorization

There are two separate authorization layers.

## Layer 1 — BaaS API

The API authenticates the business using an API key.

```text
X-API-Key
    │
    ▼
Authenticate Business
    │
    ▼
Check Application Permission
```

## Layer 2 — MultiChain

The blockchain operation is performed using an address with the required MultiChain permission.

```text
Business
    │
    ▼
BaaS Authorization
    │
    ▼
Blockchain Identity
    │
    ▼
MultiChain Permission
    │
    ▼
Blockchain Operation
```

This provides defense in depth.

A business cannot simply bypass the BaaS API and claim another business's identity.

---

# 15. JSON-RPC Integration

The BaaS backend communicates with MultiChain through its JSON-RPC API.

The application should isolate this communication inside a dedicated blockchain client.

```text
Product Controller
        │
        ▼
Product Service
        │
        ▼
Blockchain Service
        │
        ▼
MultiChain Client
        │
        │ JSON-RPC
        ▼
MultiChain Node
```

Example conceptual operation:

```text
POST /api/products
        │
        ▼
product.service.ts
        │
        ▼
product.blockchain.ts
        │
        ▼
multichain.client.ts
        │
        ▼
JSON-RPC: publish
        │
        ▼
MultiChain
```

The official MultiChain API supports JSON-RPC access from applications as well as command-line access through `multichain-cli`.

---

# 16. Blockchain Service Layer

The backend should not place MultiChain RPC calls directly inside controllers.

Instead:

```text
Controller
    ↓
Business Service
    ↓
Blockchain Service
    ↓
MultiChain Client
```

For example:

```text
product.controller.ts
        ↓
product.service.ts
        ↓
product.blockchain.ts
        ↓
multichain.client.ts
```

This separation has several benefits:

* Controllers remain focused on HTTP.
* Business logic remains separate from blockchain-specific code.
* MultiChain RPC details are isolated.
* The blockchain implementation can be changed later without rewriting the API layer.

---

# 17. Example Product Registration

The complete flow is:

```text
Business
   │
   │ POST /api/products
   ▼
API Controller
   │
   ▼
Product Service
   │
   ├──────────────► PostgreSQL
   │
   ▼
Blockchain Service
   │
   ▼
MultiChain Client
   │
   │ JSON-RPC publish
   ▼
products stream
   │
   ▼
Transaction ID
   │
   ├──────────────► PostgreSQL
   │
   ▼
API Response
```

Example blockchain data:

```json
{
  "productId": "P1001",
  "businessId": "B001",
  "event": "REGISTERED",
  "name": "Laptop X"
}
```

The blockchain transaction ID might conceptually look like:

```text
a8f3...91c2
```

The exact transaction ID is generated by MultiChain.

---

# 18. Product Verification

Product verification should rely on the blockchain record rather than simply trusting PostgreSQL.

Flow:

```text
GET /api/products/P1001/verify
             │
             ▼
       Product Service
             │
             ▼
      Blockchain Service
             │
             ▼
        MultiChain
             │
             ▼
      products stream
             │
             ▼
       Registration found?
          /       \
        YES        NO
        │           │
        ▼           ▼
    Verified    Not Verified
```

This allows the BaaS platform to answer whether the product has a corresponding blockchain-backed registration record.

---

# 19. Ownership Transfer

Ownership transfer follows a similar pattern.

```text
POST /api/products/P1001/ownership
{
    "newOwner": "B002"
}
```

The backend:

1. Authenticates the requesting business.
2. Checks whether it is authorized to transfer the product.
3. Determines the current ownership state.
4. Creates the ownership event.
5. Publishes it to the `ownership` stream.
6. Receives the blockchain transaction ID.
7. Stores transaction metadata in PostgreSQL.
8. Returns the result to the client.

Conceptually:

```text
B001
 │
 │ transfer
 ▼
B002

Blockchain:
P1001
B001 → B002
```

The complete ownership history remains available as a sequence of blockchain events.

---

# 20. Warranty Events

Warranty operations use the `warranty` stream.

Example:

```text
POST /api/products/P1001/warranty
```

The backend converts the API request into a blockchain event:

```json
{
  "productId": "P1001",
  "event": "WARRANTY_STARTED",
  "startDate": "2026-09-21",
  "durationMonths": 24
}
```

Then:

```text
REST API
   ↓
Warranty Service
   ↓
Blockchain Service
   ↓
MultiChain
   ↓
warranty stream
```

---

# 21. Supply-Chain Events

Supply-chain events follow the same pattern.

Example:

```text
POST /api/products/P1001/supply-chain/events
```

Request:

```json
{
  "event": "SHIPPED",
  "from": "B001",
  "to": "B002"
}
```

Blockchain record:

```json
{
  "productId": "P1001",
  "event": "SHIPPED",
  "from": "B001",
  "to": "B002"
}
```

The result is an immutable event in the `supply_chain` stream.

---

# 22. PostgreSQL vs MultiChain

The system deliberately separates application data from blockchain-backed event data.

## PostgreSQL

Stores:

* Businesses
* API credentials
* Products
* Business-to-blockchain identity mappings
* Blockchain transaction metadata
* Application-level information

## MultiChain

Stores:

* Product registration events
* Ownership events
* Warranty events
* Supply-chain events

Conceptually:

```text
             BaaS Platform
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
   PostgreSQL           MultiChain
        │                   │
        │                   │
 Application data      Event history
        │                   │
        │                   │
 Businesses            Products
 Products              Ownership
 Transactions          Warranty
                       Supply Chain
```

PostgreSQL therefore does not need to become a second blockchain.

---

# 23. Blockchain Transaction Tracking

Whenever the backend submits a blockchain operation, MultiChain returns a transaction ID.

The backend stores this transaction ID in PostgreSQL.

Example:

```text
Product:
P1001

Operation:
PRODUCT_REGISTERED

Blockchain Transaction:
a8f3...91c2
```

This creates a link between the application's operation and the corresponding blockchain transaction.

The PostgreSQL table:

```text
blockchain_transactions
```

contains metadata such as:

```text
id
product_id
business_id
operation
transaction_id
status
created_at
```

The actual blockchain event remains in MultiChain.

---

# 24. Smart Filters

MultiChain supports **Smart Filters**, which are JavaScript-based validation rules for blockchain transactions or stream items. Stream filters can be approved for individual streams and can validate the data being published.

For example, a product stream filter could ensure that:

```text
productId exists
AND
event == "REGISTERED"
AND
name exists
```

Conceptually:

```text
publish product
      │
      ▼
Smart Filter
      │
   ┌──┴──┐
   │     │
 valid  invalid
   │     │
   ▼     ▼
Accept  Reject
```

A possible future filter could enforce:

```text
if event == "REGISTERED":
    productId must exist
    name must exist
```

Smart Filters are optional for the initial MVP.

The initial implementation should first establish:

```text
REST API
   ↓
MultiChain
   ↓
Streams
   ↓
Verification
```

and introduce filters once the basic blockchain functionality is working.

---

# 25. No Smart Contracts in the Solidity Sense

This project does **not** use Solidity smart contracts.

MultiChain is not being used as an Ethereum/EVM development environment.

Therefore, the project does not contain:

```text
Solidity contracts
        ✗
Hardhat
        ✗
Ethers.js contract interaction
        ✗
ERC-20 tokens
        ✗
ERC-721 NFTs
        ✗
```

Instead, the blockchain logic is implemented through:

```text
MultiChain
├── Streams
├── Permissions
├── JSON-RPC
└── Optional Smart Filters
```

The BaaS backend contains the application's business logic.

---

# 26. Blockchain Data Flow

The overall blockchain data flow is:

```text
                    Web2 Business
                          │
                          │ REST
                          ▼
                    BaaS API
                          │
                          ▼
                  Business Services
                          │
                          ▼
                  Blockchain Service
                          │
                          │ JSON-RPC
                          ▼
                  MultiChain Node
                          │
             ┌────────────┼────────────┐
             │            │            │
             ▼            ▼            ▼
         products     ownership     warranty
                                      │
                                      ▼
                                supply_chain
```

---

# 27. Example Complete Product Lifecycle

A product can move through the system as follows:

### Step 1 — Registration

```text
Manufacturer
     │
     ▼
POST /api/products
     │
     ▼
products stream
```

### Step 2 — Shipment

```text
Manufacturer → Distributor
       │
       ▼
supply_chain stream
```

### Step 3 — Ownership Transfer

```text
Manufacturer → Distributor
       │
       ▼
ownership stream
```

### Step 4 — Warranty

```text
Manufacturer
       │
       ▼
warranty stream
```

### Step 5 — Verification

```text
Customer/Business
       │
       ▼
GET /api/products/P1001/verify
       │
       ▼
MultiChain
       │
       ▼
Product registration record
```

The result is a blockchain-backed history of the product without requiring the consuming Web2 business to interact with the blockchain directly.

---

# 28. Security Considerations

The blockchain layer will follow these principles:

### 28.1 Blockchain credentials remain server-side

MultiChain RPC credentials must not be exposed to the frontend or API consumers.

```text
Frontend
    ✗
    │
    │ MultiChain credentials
    ▼

Backend
    ✓
```

### 28.2 API clients cannot choose arbitrary blockchain identities

The backend determines the blockchain identity associated with the authenticated business.

### 28.3 Stream permissions restrict publishing

Only authorized blockchain addresses should receive write permissions for the appropriate streams.

### 28.4 Input validation occurs before publishing

The API validates incoming data before sending it to MultiChain.

Smart Filters may provide an additional validation layer.

### 28.5 Blockchain transaction IDs are stored

Each important blockchain operation should be associated with its transaction ID in PostgreSQL.

---

# 29. Failure Handling

Blockchain operations can fail independently of PostgreSQL operations.

For example:

```text
API Request
    │
    ▼
PostgreSQL
    │
    ▼
MultiChain
    │
    ✗ failure
```

The backend must not report the operation as successfully blockchain-backed if the blockchain transaction was not successfully submitted.

The application should therefore track blockchain transaction status:

```text
PENDING
CONFIRMED
FAILED
```

The exact confirmation behavior will be finalized after testing the selected MultiChain setup.

---

# 30. MVP Scope

The initial blockchain MVP will implement:

```text
1. MultiChain network
2. Business blockchain identities
3. products stream
4. Product registration
5. Product verification
6. ownership stream
7. Ownership transfer
8. Ownership history
9. Blockchain transaction tracking
```

After these are working:

```text
10. warranty stream
11. Warranty events
12. supply_chain stream
13. Supply-chain events
14. Smart Filters
15. More detailed permission rules
```

This gives the team a working blockchain-backed BaaS core before adding additional features.

---

# 31. Final MultiChain Architecture

The final design can be summarized as:

```text
┌──────────────────────────────────────────────┐
│              Existing Web2 Business         │
│                                              │
│        REST API / JSON / API Key             │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│                 BaaS Backend                 │
│                                              │
│  Authentication / Authorization              │
│             │                                │
│       Business Services                      │
│        │             │                       │
│        ▼             ▼                       │
│  PostgreSQL    Blockchain Service             │
│                      │                       │
│                MultiChain Client              │
└──────────────────────┬───────────────────────┘
                       │
                    JSON-RPC
                       │
                       ▼
┌──────────────────────────────────────────────┐
│               MultiChain Network             │
│                                              │
│  ┌───────────┐  ┌────────────┐               │
│  │ products  │  │ ownership  │               │
│  └───────────┘  └────────────┘               │
│                                              │
│  ┌───────────┐  ┌────────────┐               │
│  │ warranty  │  │supply_chain│              │
│  └───────────┘  └────────────┘               │
│                                              │
│       Permissions + Optional Filters         │
└──────────────────────────────────────────────┘
```

The key design principle is:

> **The BaaS platform abstracts MultiChain from Web2 businesses while using MultiChain streams, permissions, and blockchain transaction records to provide trusted product and supply-chain services.**
