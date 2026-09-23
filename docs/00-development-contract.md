# Development Contract

This document defines the shared contracts, ownership boundaries, development branches, interfaces, and tasks for the BaaS backend.

The purpose of this document is to allow all team members to work in parallel without independently changing database structures, API endpoints, request/response formats, or module interfaces.

Changes to locked contracts must be discussed by the team before implementation.

---

# 1. Team Ownership

| Member   | Responsibility                                         |
| -------- | ------------------------------------------------------ |
| Member 1 | MultiChain + blockchain layer + blockchain integration |
| Member 2 | PostgreSQL + Docker + database layer                   |
| Member 3 | Product + ownership backend                            |
| Member 4 | Warranty + supply-chain backend                        |

## 1.1 Ownership Boundaries

### Member 1 — Blockchain

Owns:

```text
src/blockchain/
├── multichain.client.ts
├── product.blockchain.ts
├── ownership.blockchain.ts
├── warranty.blockchain.ts
└── supply-chain.blockchain.ts
```

Also owns:

```text
src/config/multichain.ts
src/types/blockchain.types.ts
tests/blockchain/
```

Responsibilities:

* MultiChain installation/configuration
* MultiChain node connectivity
* JSON-RPC client
* Stream operations
* Blockchain-specific data structures
* Blockchain transaction IDs
* Blockchain read/write operations
* Blockchain permissions
* Optional Smart Filters
* Blockchain integration tests

Member 1 does not own product HTTP routes, controllers, or application-level product services.

---

### Member 2 — Database

Owns:

```text
src/db/
├── connection.ts
├── schema/
└── migrations/
```

Also owns:

```text
Docker PostgreSQL setup
Database configuration
Database migrations
Database constraints
Database indexes
```

Responsibilities:

* PostgreSQL
* Docker development database
* Database schema
* Migrations
* Database connection
* Database queries/repositories
* Database indexes and constraints

Other members should not independently modify the database schema.

---

### Member 3 — Product + Ownership

Owns:

```text
src/routes/products.routes.ts
src/routes/ownership.routes.ts

src/controllers/product.controller.ts
src/controllers/ownership.controller.ts

src/services/product.service.ts
src/services/ownership.service.ts

src/schemas/product.schema.ts
src/schemas/ownership.schema.ts
```

Responsibilities:

* Product registration
* Product retrieval
* Product verification API
* Ownership transfer API
* Ownership history API
* Product/ownership request validation
* Product/ownership application logic

Member 3 consumes the database and blockchain interfaces but does not implement their internals.

---

### Member 4 — Warranty + Supply Chain

Owns:

```text
src/routes/warranty.routes.ts
src/routes/supply-chain.routes.ts

src/controllers/warranty.controller.ts
src/controllers/supply-chain.controller.ts

src/services/warranty.service.ts
src/services/supply-chain.service.ts

src/schemas/warranty.schema.ts
src/schemas/supply-chain.schema.ts
```

Responsibilities:

* Warranty API
* Warranty event validation
* Supply-chain API
* Supply-chain event validation
* Warranty/supply-chain application logic

Member 4 consumes the database and blockchain interfaces but does not implement their internals.

---

# 2. Git Branches

Each member works on their own feature branch.

```text
main
│
├── feature/multichain
├── feature/database
├── feature/products-ownership
└── feature/warranty-supply-chain
```

## Branch ownership

| Branch                          | Owner    |
| ------------------------------- | -------- |
| `feature/multichain`            | Member 1 |
| `feature/database`              | Member 2 |
| `feature/products-ownership`    | Member 3 |
| `feature/warranty-supply-chain` | Member 4 |

Do not commit directly to `main`.

Completed work is merged through pull requests.

---

# 3. Development Rules

## 3.1 Do not modify another member's module without coordination

For example, Member 3 should not modify:

```text
src/blockchain/
```

to make product registration work.

Instead, Member 3 should use the blockchain interface defined by Member 1.

Similarly, Member 3 should not modify:

```text
src/db/schema/
```

to add a column without discussing it with Member 2.

---

## 3.2 Contracts are defined before implementation

The following contracts must be agreed upon before parallel feature development:

1. PostgreSQL schema
2. REST API endpoints
3. Request/response structures
4. Blockchain operation interfaces
5. TypeScript interfaces used between modules

---

## 3.3 Temporary mocks are allowed

A member does not need to wait for another member's implementation.

For example:

```ts
const result = await blockchain.registerProduct(data);
```

can initially use a mock implementation returning:

```json
{
  "transactionId": "mock-transaction-id"
}
```

The real MultiChain implementation can be connected later.

This allows parallel development.

---

# 4. PostgreSQL Contract

The PostgreSQL database contains four core tables:

```text
businesses
business_identities
products
blockchain_transactions
```

The database represents application state and blockchain transaction metadata.

Blockchain event history itself is stored in MultiChain.

---

# 5. PostgreSQL Schema

## 5.1 Required PostgreSQL Extension

UUID generation uses PostgreSQL's `pgcrypto` extension.

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

---

## 5.2 businesses

Stores registered businesses that consume the BaaS API.

```sql
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(255) NOT NULL,

    api_key_hash TEXT NOT NULL UNIQUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Columns

| Column         | Type         | Constraints      | Description                  |
| -------------- | ------------ | ---------------- | ---------------------------- |
| `id`           | UUID         | PK               | Internal business identifier |
| `name`         | VARCHAR(255) | NOT NULL         | Business name                |
| `api_key_hash` | TEXT         | UNIQUE, NOT NULL | Hashed API key               |
| `created_at`   | TIMESTAMPTZ  | NOT NULL         | Creation timestamp           |

The raw API key must not be stored in PostgreSQL.

---

# 6. business_identities

Maps an application business to its MultiChain blockchain identity.

```sql
CREATE TABLE business_identities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    business_id UUID NOT NULL UNIQUE,

    address TEXT NOT NULL UNIQUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_business_identity_business
        FOREIGN KEY (business_id)
        REFERENCES businesses(id)
        ON DELETE CASCADE
);
```

### Columns

| Column        | Type        | Constraints          | Description          |
| ------------- | ----------- | -------------------- | -------------------- |
| `id`          | UUID        | PK                   | Internal identity ID |
| `business_id` | UUID        | FK, UNIQUE, NOT NULL | Associated business  |
| `address`     | TEXT        | UNIQUE, NOT NULL     | MultiChain address   |
| `created_at`  | TIMESTAMPTZ | NOT NULL             | Creation timestamp   |

`business_id UNIQUE` enforces the intended 1:1 relationship.

---

# 7. products

Stores application-level product information.

```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    product_id VARCHAR(100) NOT NULL UNIQUE,

    business_id UUID NOT NULL,

    name VARCHAR(255) NOT NULL,

    description TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_product_business
        FOREIGN KEY (business_id)
        REFERENCES businesses(id)
        ON DELETE RESTRICT
);
```

### Columns

| Column        | Type         | Constraints      | Description                          |
| ------------- | ------------ | ---------------- | ------------------------------------ |
| `id`          | UUID         | PK               | Internal product identifier          |
| `product_id`  | VARCHAR(100) | UNIQUE, NOT NULL | Business-facing product identifier   |
| `business_id` | UUID         | FK, NOT NULL     | Business that registered the product |
| `name`        | VARCHAR(255) | NOT NULL         | Product name                         |
| `description` | TEXT         | Nullable         | Product description                  |
| `created_at`  | TIMESTAMPTZ  | NOT NULL         | Creation timestamp                   |
| `updated_at`  | TIMESTAMPTZ  | NOT NULL         | Last update timestamp                |

`product_id` is the identifier exposed through the API.

Example:

```text
P1001
```

The UUID `id` remains an internal database identifier.

---

# 8. blockchain_transactions

Stores metadata linking application operations to MultiChain transactions.

```sql
CREATE TABLE blockchain_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    product_id UUID NOT NULL,

    business_id UUID NOT NULL,

    operation VARCHAR(100) NOT NULL,

    transaction_id TEXT NOT NULL UNIQUE,

    status VARCHAR(50) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_blockchain_transaction_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_blockchain_transaction_business
        FOREIGN KEY (business_id)
        REFERENCES businesses(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_blockchain_transaction_status
        CHECK (status IN ('PENDING', 'CONFIRMED', 'FAILED')),

    CONSTRAINT chk_blockchain_transaction_operation
        CHECK (
            operation IN (
                'PRODUCT_REGISTERED',
                'OWNERSHIP_TRANSFERRED',
                'WARRANTY_EVENT',
                'SUPPLY_CHAIN_EVENT'
            )
        )
);
```

### Columns

| Column           | Type         | Constraints      | Description                       |
| ---------------- | ------------ | ---------------- | --------------------------------- |
| `id`             | UUID         | PK               | Internal transaction record ID    |
| `product_id`     | UUID         | FK, NOT NULL     | Related product                   |
| `business_id`    | UUID         | FK, NOT NULL     | Business performing the operation |
| `operation`      | VARCHAR(100) | NOT NULL         | Application operation             |
| `transaction_id` | TEXT         | UNIQUE, NOT NULL | MultiChain transaction ID         |
| `status`         | VARCHAR(50)  | NOT NULL         | Blockchain transaction status     |
| `created_at`     | TIMESTAMPTZ  | NOT NULL         | Creation timestamp                |

---

# 9. Database Relationships

```text
businesses
    │
    ├────────────── 1 : 1 ────────────── business_identities
    │
    │
    ├────────────── 1 : N ────────────── products
    │                                      │
    │                                      │
    └────────────── 1 : N ──────── blockchain_transactions
                                           │
                                           │
products ───────────── 1 : N ─────────────┘
```

Formally:

```text
businesses.id
    ↓
business_identities.business_id

businesses.id
    ↓
products.business_id

businesses.id
    ↓
blockchain_transactions.business_id

products.id
    ↓
blockchain_transactions.product_id
```

---

# 10. Required Database Indexes

The following indexes should exist:

```sql
CREATE INDEX idx_products_business_id
    ON products(business_id);

CREATE INDEX idx_blockchain_transactions_product_id
    ON blockchain_transactions(product_id);

CREATE INDEX idx_blockchain_transactions_business_id
    ON blockchain_transactions(business_id);
```

The following columns already have indexes because of `UNIQUE` constraints:

```text
businesses.api_key_hash
business_identities.address
products.product_id
blockchain_transactions.transaction_id
```

---

# 11. REST API Contract

The following endpoints are locked for the MVP.

```text
POST   /api/products
GET    /api/products/:productId
GET    /api/products/:productId/verify

POST   /api/products/:productId/ownership
GET    /api/products/:productId/ownership/history

POST   /api/products/:productId/warranty
GET    /api/products/:productId/warranty

POST   /api/products/:productId/supply-chain/events
GET    /api/products/:productId/supply-chain/history
```

Endpoint names should not be changed without team agreement.

---

# 12. API Authentication

Every protected API request uses:

```http
X-API-Key: <api-key>
```

The API key identifies the business.

The client does not send:

```json
{
    "businessId": "..."
}
```

for authentication.

The backend determines the authenticated business from the API key.

---

# 13. Standard API Response

Successful responses use:

```json
{
    "success": true,
    "data": {}
}
```

Error responses use:

```json
{
    "success": false,
    "error": {
        "code": "ERROR_CODE",
        "message": "Human-readable error message"
    }
}
```

---

# 14. POST /api/products

Registers a product.

## Request

```http
POST /api/products
X-API-Key: <api-key>
Content-Type: application/json
```

```json
{
    "productId": "P1001",
    "name": "Laptop X",
    "description": "Business laptop"
}
```

### Request fields

| Field         | Type   | Required | Rules            |
| ------------- | ------ | -------- | ---------------- |
| `productId`   | string | Yes      | 1–100 characters |
| `name`        | string | Yes      | 1–255 characters |
| `description` | string | No       | Nullable         |

`businessId` is NOT accepted from the client.

The business is determined from the API key.

## Success

Status:

```text
201 Created
```

Response:

```json
{
    "success": true,
    "data": {
        "product": {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "productId": "P1001",
            "businessId": "550e8400-e29b-41d4-a716-446655440001",
            "name": "Laptop X",
            "description": "Business laptop",
            "createdAt": "2026-09-23T12:00:00Z",
            "updatedAt": "2026-09-23T12:00:00Z"
        },
        "blockchainTransaction": {
            "transactionId": "MULTICHAIN_TRANSACTION_ID",
            "status": "CONFIRMED"
        }
    }
}
```

## Errors

```text
400 INVALID_REQUEST
401 UNAUTHORIZED
409 PRODUCT_ALREADY_EXISTS
500 INTERNAL_SERVER_ERROR
502 BLOCKCHAIN_ERROR
```

---

# 15. GET /api/products/:productId

Retrieves a product.

## Request

```http
GET /api/products/P1001
X-API-Key: <api-key>
```

## Success

Status:

```text
200 OK
```

Response:

```json
{
    "success": true,
    "data": {
        "product": {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "productId": "P1001",
            "businessId": "550e8400-e29b-41d4-a716-446655440001",
            "name": "Laptop X",
            "description": "Business laptop",
            "createdAt": "2026-09-23T12:00:00Z",
            "updatedAt": "2026-09-23T12:00:00Z"
        }
    }
}
```

## Errors

```text
401 UNAUTHORIZED
404 PRODUCT_NOT_FOUND
500 INTERNAL_SERVER_ERROR
```

---

# 16. GET /api/products/:productId/verify

Verifies whether the product has a valid blockchain registration.

## Request

```http
GET /api/products/P1001/verify
X-API-Key: <api-key>
```

## Success

Status:

```text
200 OK
```

Response:

```json
{
    "success": true,
    "data": {
        "productId": "P1001",
        "verified": true,
        "registration": {
            "transactionId": "MULTICHAIN_TRANSACTION_ID",
            "event": "REGISTERED"
        }
    }
}
```

If no valid blockchain registration exists:

```json
{
    "success": true,
    "data": {
        "productId": "P1001",
        "verified": false,
        "registration": null
    }
}
```

Verification must check the blockchain-backed record rather than relying only on PostgreSQL.

---

# 17. POST /api/products/:productId/ownership

Transfers ownership.

## Request

```http
POST /api/products/P1001/ownership
X-API-Key: <api-key>
Content-Type: application/json
```

```json
{
    "newOwner": "B002"
}
```

### Request fields

| Field      | Type   | Required |
| ---------- | ------ | -------- |
| `newOwner` | string | Yes      |

`newOwner` represents the destination business identity.

## Success

Status:

```text
201 Created
```

Response:

```json
{
    "success": true,
    "data": {
        "productId": "P1001",
        "previousOwner": "B001",
        "newOwner": "B002",
        "blockchainTransaction": {
            "transactionId": "MULTICHAIN_TRANSACTION_ID",
            "status": "CONFIRMED"
        }
    }
}
```

## Errors

```text
400 INVALID_REQUEST
401 UNAUTHORIZED
403 OWNERSHIP_TRANSFER_NOT_ALLOWED
404 PRODUCT_NOT_FOUND
409 INVALID_OWNERSHIP_STATE
500 INTERNAL_SERVER_ERROR
502 BLOCKCHAIN_ERROR
```

---

# 18. GET /api/products/:productId/ownership/history

Retrieves ownership history.

## Request

```http
GET /api/products/P1001/ownership/history
X-API-Key: <api-key>
```

## Success

```json
{
    "success": true,
    "data": {
        "productId": "P1001",
        "history": [
            {
                "previousOwner": null,
                "newOwner": "B001",
                "event": "REGISTERED",
                "transactionId": "TX001",
                "timestamp": "2026-09-23T12:00:00Z"
            },
            {
                "previousOwner": "B001",
                "newOwner": "B002",
                "event": "OWNERSHIP_TRANSFERRED",
                "transactionId": "TX002",
                "timestamp": "2026-09-23T13:00:00Z"
            }
        ]
    }
}
```

The history is obtained from MultiChain.

---

# 19. POST /api/products/:productId/warranty

Adds a warranty event.

## Request

```http
POST /api/products/P1001/warranty
X-API-Key: <api-key>
Content-Type: application/json
```

```json
{
    "event": "WARRANTY_STARTED",
    "startDate": "2026-09-23",
    "durationMonths": 24
}
```

### Request fields

| Field            | Type        | Required |
| ---------------- | ----------- | -------- |
| `event`          | string      | Yes      |
| `startDate`      | string/date | Yes      |
| `durationMonths` | integer     | Yes      |

For the MVP, supported events are:

```text
WARRANTY_STARTED
WARRANTY_EXTENDED
WARRANTY_CLAIMED
WARRANTY_EXPIRED
```

## Success

```json
{
    "success": true,
    "data": {
        "productId": "P1001",
        "event": {
            "event": "WARRANTY_STARTED",
            "startDate": "2026-09-23",
            "durationMonths": 24
        },
        "blockchainTransaction": {
            "transactionId": "MULTICHAIN_TRANSACTION_ID",
            "status": "CONFIRMED"
        }
    }
}
```

---

# 20. GET /api/products/:productId/warranty

Retrieves warranty history.

## Success

```json
{
    "success": true,
    "data": {
        "productId": "P1001",
        "events": [
            {
                "event": "WARRANTY_STARTED",
                "startDate": "2026-09-23",
                "durationMonths": 24,
                "transactionId": "TX003",
                "timestamp": "2026-09-23T12:00:00Z"
            }
        ]
    }
}
```

---

# 21. POST /api/products/:productId/supply-chain/events

Adds a supply-chain event.

## Request

```http
POST /api/products/P1001/supply-chain/events
X-API-Key: <api-key>
Content-Type: application/json
```

```json
{
    "event": "SHIPPED",
    "from": "B001",
    "to": "B002"
}
```

### Request fields

| Field   | Type   | Required |
| ------- | ------ | -------- |
| `event` | string | Yes      |
| `from`  | string | Yes      |
| `to`    | string | Yes      |

Initial supported event types:

```text
MANUFACTURED
PACKED
SHIPPED
RECEIVED
WAREHOUSED
DELIVERED
```

## Success

```json
{
    "success": true,
    "data": {
        "productId": "P1001",
        "event": {
            "event": "SHIPPED",
            "from": "B001",
            "to": "B002"
        },
        "blockchainTransaction": {
            "transactionId": "MULTICHAIN_TRANSACTION_ID",
            "status": "CONFIRMED"
        }
    }
}
```

---

# 22. GET /api/products/:productId/supply-chain/history

Retrieves supply-chain history.

## Success

```json
{
    "success": true,
    "data": {
        "productId": "P1001",
        "events": [
            {
                "event": "MANUFACTURED",
                "from": "B001",
                "to": null,
                "transactionId": "TX004",
                "timestamp": "2026-09-23T12:00:00Z"
            },
            {
                "event": "SHIPPED",
                "from": "B001",
                "to": "B002",
                "transactionId": "TX005",
                "timestamp": "2026-09-23T13:00:00Z"
            },
            {
                "event": "RECEIVED",
                "from": "B001",
                "to": "B002",
                "transactionId": "TX006",
                "timestamp": "2026-09-23T15:00:00Z"
            }
        ]
    }
}
```

---

# 23. HTTP Status Codes

The API uses:

| Status | Meaning                          |
| ------ | -------------------------------- |
| `200`  | Successful retrieval/operation   |
| `201`  | Resource/event created           |
| `400`  | Invalid request                  |
| `401`  | Missing/invalid API key          |
| `403`  | Authenticated but not authorized |
| `404`  | Resource not found               |
| `409`  | Conflict                         |
| `500`  | Internal server error            |
| `502`  | Blockchain dependency error      |

---

# 24. Blockchain Contract

The blockchain layer provides four logical data domains:

```text
products
ownership
warranty
supply_chain
```

These names are logical names for the application design.

The final MultiChain stream names are:

```text
TBD
```

until Member 1 completes the MultiChain implementation decision.

---

# 25. Blockchain Data Contract

Even though the exact stream names and keys are not finalized, the data structures must remain compatible with the following application-level contract.

---

## 25.1 Product Registration

Logical operation:

```text
REGISTER_PRODUCT
```

Required data:

```json
{
    "productId": "P1001",
    "businessId": "B001",
    "event": "REGISTERED",
    "name": "Laptop X",
    "description": "Business laptop"
}
```

Required fields:

| Field         | Type   | Required |
| ------------- | ------ | -------- |
| `productId`   | string | Yes      |
| `businessId`  | string | Yes      |
| `event`       | string | Yes      |
| `name`        | string | Yes      |
| `description` | string | No       |

---

# 26. Ownership Blockchain Contract

Logical operation:

```text
TRANSFER_OWNERSHIP
```

Required data:

```json
{
    "productId": "P1001",
    "previousOwner": "B001",
    "newOwner": "B002",
    "event": "OWNERSHIP_TRANSFERRED"
}
```

Required fields:

| Field           | Type   | Required |
| --------------- | ------ | -------- |
| `productId`     | string | Yes      |
| `previousOwner` | string | Yes      |
| `newOwner`      | string | Yes      |
| `event`         | string | Yes      |

The exact stream name and stream key are TBD.

---

# 27. Warranty Blockchain Contract

Logical operation:

```text
ADD_WARRANTY_EVENT
```

Required data:

```json
{
    "productId": "P1001",
    "event": "WARRANTY_STARTED",
    "startDate": "2026-09-23",
    "durationMonths": 24
}
```

Required fields:

| Field            | Type    | Required |
| ---------------- | ------- | -------- |
| `productId`      | string  | Yes      |
| `event`          | string  | Yes      |
| `startDate`      | date    | Yes      |
| `durationMonths` | integer | Yes      |

---

# 28. Supply-Chain Blockchain Contract

Logical operation:

```text
ADD_SUPPLY_CHAIN_EVENT
```

Required data:

```json
{
    "productId": "P1001",
    "event": "SHIPPED",
    "from": "B001",
    "to": "B002"
}
```

Required fields:

| Field       | Type   | Required |
| ----------- | ------ | -------- |
| `productId` | string | Yes      |
| `event`     | string | Yes      |
| `from`      | string | Yes      |
| `to`        | string | Yes      |

---

# 29. Blockchain Implementation Details

The following are intentionally not locked yet:

```text
Stream names
Stream keys
Exact MultiChain JSON-RPC commands
MultiChain permission configuration
Smart Filter implementation
Confirmation/polling strategy
```

Member 1 will finalize these after testing the MultiChain network.

The application-level data contract above must remain stable unless the team agrees to change it.

---

# 30. Blockchain TypeScript Interfaces

The blockchain module should expose application-level functions rather than exposing raw MultiChain RPC calls to the rest of the backend.

Conceptually:

```ts
interface ProductBlockchainService {
    registerProduct(
        data: RegisterProductBlockchainData
    ): Promise<BlockchainResult>;

    verifyProduct(
        productId: string
    ): Promise<ProductVerificationResult>;
}
```

```ts
interface OwnershipBlockchainService {
    transferOwnership(
        data: TransferOwnershipBlockchainData
    ): Promise<BlockchainResult>;

    getOwnershipHistory(
        productId: string
    ): Promise<OwnershipEvent[]>;
}
```

```ts
interface WarrantyBlockchainService {
    addWarrantyEvent(
        data: WarrantyBlockchainData
    ): Promise<BlockchainResult>;

    getWarrantyHistory(
        productId: string
    ): Promise<WarrantyEvent[]>;
}
```

```ts
interface SupplyChainBlockchainService {
    addSupplyChainEvent(
        data: SupplyChainBlockchainData
    ): Promise<BlockchainResult>;

    getSupplyChainHistory(
        productId: string
    ): Promise<SupplyChainEvent[]>;
}
```

Common result:

```ts
interface BlockchainResult {
    transactionId: string;
    status: "PENDING" | "CONFIRMED" | "FAILED";
}
```

These interfaces allow application developers to work without waiting for the actual MultiChain implementation.

---

# 31. Feature Module Interfaces

Application services should depend on interfaces rather than MultiChain implementation details.

Example:

```text
product.service.ts
        │
        ▼
ProductBlockchainService
        │
        ▼
product.blockchain.ts
        │
        ▼
multichain.client.ts
        │
        ▼
MultiChain
```

The same pattern applies to ownership, warranty, and supply chain.

---

# 32. Backend Folder Ownership

```text
src/
│
├── config/
│   ├── env.ts
│   ├── database.ts
│   └── multichain.ts
│
├── routes/
│   ├── index.ts
│   ├── products.routes.ts              # Member 3
│   ├── ownership.routes.ts             # Member 3
│   ├── warranty.routes.ts              # Member 4
│   └── supply-chain.routes.ts          # Member 4
│
├── controllers/
│   ├── product.controller.ts           # Member 3
│   ├── ownership.controller.ts         # Member 3
│   ├── warranty.controller.ts          # Member 4
│   └── supply-chain.controller.ts      # Member 4
│
├── services/
│   ├── product.service.ts              # Member 3
│   ├── ownership.service.ts            # Member 3
│   ├── warranty.service.ts             # Member 4
│   └── supply-chain.service.ts         # Member 4
│
├── blockchain/                         # Member 1
│   ├── multichain.client.ts
│   ├── product.blockchain.ts
│   ├── ownership.blockchain.ts
│   ├── warranty.blockchain.ts
│   └── supply-chain.blockchain.ts
│
├── db/                                 # Member 2
│   ├── connection.ts
│   ├── schema/
│   │   ├── businesses.ts
│   │   ├── business-identities.ts
│   │   ├── products.ts
│   │   └── blockchain-transactions.ts
│   └── migrations/
│
├── middleware/
│   ├── authentication.ts
│   ├── authorization.ts
│   ├── error-handler.ts
│   └── validation.ts
│
├── schemas/
│   ├── product.schema.ts               # Member 3
│   ├── ownership.schema.ts             # Member 3
│   ├── warranty.schema.ts              # Member 4
│   └── supply-chain.schema.ts          # Member 4
│
├── types/
│   ├── business.types.ts
│   ├── product.types.ts
│   ├── blockchain.types.ts
│   └── api.types.ts
│
└── utils/
    ├── api-response.ts
    ├── errors.ts
    └── logger.ts
```

---

# 33. GitHub Issues

Development should be managed through GitHub Issues.

Each issue should represent one concrete unit of work.

Issues should use labels such as:

```text
backend
database
multichain
api
product
ownership
warranty
supply-chain
testing
documentation
blocked
```

---

# 34. Initial Issues

## Foundation

### Issue: Initialize backend

Owner: Team / Member 1

Tasks:

```text
[ ] Initialize TypeScript project
[ ] Install Express
[ ] Configure tsconfig.json
[ ] Create src/app.ts
[ ] Create src/server.ts
[ ] Add environment configuration
[ ] Add .env.example
[ ] Add basic error handling
```

Branch:

```text
feature/multichain
```

---

## Database

### Issue: Set up PostgreSQL with Docker

Owner: Member 2

```text
[ ] Create PostgreSQL Docker configuration
[ ] Configure database environment variables
[ ] Verify local PostgreSQL connection
[ ] Create database connection module
```

Branch:

```text
feature/database
```

---

### Issue: Implement PostgreSQL schema

Owner: Member 2

```text
[ ] Create businesses table
[ ] Create business_identities table
[ ] Create products table
[ ] Create blockchain_transactions table
[ ] Add foreign keys
[ ] Add unique constraints
[ ] Add check constraints
[ ] Add indexes
[ ] Create migrations
```

---

# 35. MultiChain Issues

### Issue: Set up MultiChain node

Owner: Member 1

```text
[ ] Install MultiChain
[ ] Create blockchain
[ ] Start node
[ ] Verify node connectivity
[ ] Verify JSON-RPC
[ ] Document RPC configuration
```

---

### Issue: Implement MultiChain JSON-RPC client

Owner: Member 1

File:

```text
src/blockchain/multichain.client.ts
```

```text
[ ] Implement RPC request helper
[ ] Configure RPC authentication
[ ] Implement error handling
[ ] Implement transaction ID handling
[ ] Add tests
```

---

### Issue: Implement product blockchain service

Owner: Member 1

File:

```text
src/blockchain/product.blockchain.ts
```

```text
[ ] Finalize product stream name
[ ] Finalize stream key
[ ] Implement product publish
[ ] Implement product query
[ ] Implement product verification
[ ] Return BlockchainResult
[ ] Add tests
```

---

### Issue: Implement ownership blockchain service

Owner: Member 1

```text
[ ] Finalize ownership stream
[ ] Implement ownership publish
[ ] Implement ownership history query
[ ] Implement current ownership lookup
[ ] Add tests
```

---

### Issue: Implement warranty blockchain service

Owner: Member 1

```text
[ ] Finalize warranty stream
[ ] Implement warranty event publishing
[ ] Implement warranty history query
[ ] Add tests
```

---

### Issue: Implement supply-chain blockchain service

Owner: Member 1

```text
[ ] Finalize supply_chain stream
[ ] Implement event publishing
[ ] Implement event history query
[ ] Add tests
```

---

# 36. Product + Ownership Issues

Owner: Member 3

### Issue: Implement product validation

```text
[ ] Create product.schema.ts
[ ] Validate productId
[ ] Validate name
[ ] Validate description
```

### Issue: Implement product routes

```text
[ ] POST /api/products
[ ] GET /api/products/:productId
[ ] GET /api/products/:productId/verify
```

### Issue: Implement product controller

```text
[ ] Create product.controller.ts
[ ] Handle request/response
[ ] Call product service
[ ] Handle errors
```

### Issue: Implement product service

```text
[ ] Create product.service.ts
[ ] Create product
[ ] Retrieve product
[ ] Register product on blockchain
[ ] Store blockchain transaction
[ ] Verify product through blockchain
```

### Issue: Implement ownership validation

```text
[ ] Create ownership.schema.ts
[ ] Validate newOwner
```

### Issue: Implement ownership routes/controller/service

```text
[ ] POST /api/products/:productId/ownership
[ ] GET /api/products/:productId/ownership/history
[ ] Implement transfer logic
[ ] Implement ownership history
[ ] Store blockchain transaction metadata
```

---

# 37. Warranty + Supply Chain Issues

Owner: Member 4

### Issue: Implement warranty validation

```text
[ ] Create warranty.schema.ts
[ ] Validate event
[ ] Validate startDate
[ ] Validate durationMonths
```

### Issue: Implement warranty API

```text
[ ] POST /api/products/:productId/warranty
[ ] GET /api/products/:productId/warranty
[ ] Implement warranty service
[ ] Store blockchain transaction metadata
```

### Issue: Implement supply-chain validation

```text
[ ] Create supply-chain.schema.ts
[ ] Validate event
[ ] Validate from
[ ] Validate to
```

### Issue: Implement supply-chain API

```text
[ ] POST /api/products/:productId/supply-chain/events
[ ] GET /api/products/:productId/supply-chain/history
[ ] Implement supply-chain service
[ ] Store blockchain transaction metadata
```

---

# 38. Integration Issues

After individual modules are complete, integration should happen in this order:

```text
1. Product Registration
2. Product Verification
3. Ownership Transfer
4. Ownership History
5. Warranty
6. Supply Chain
```

Each integration issue should verify:

```text
HTTP request
    ↓
Route
    ↓
Controller
    ↓
Service
    ↓
PostgreSQL
    ↓
Blockchain Service
    ↓
MultiChain
    ↓
Transaction ID
    ↓
PostgreSQL
    ↓
HTTP response
```

---

# 39. Product Registration Integration

This should be the first complete end-to-end feature.

```text
POST /api/products
        ↓
Product Controller
        ↓
Product Service
        ↓
PostgreSQL
        ↓
Product Blockchain Service
        ↓
MultiChain
        ↓
Transaction ID
        ↓
Blockchain Transactions
        ↓
Response
```

This integration must work before the team considers the backend foundation complete.

---

# 40. Pull Request Rules

Every feature branch should create a pull request into `main`.

PRs should contain:

```text
## What changed

## Why

## Testing performed

## Related issue
```

Example:

```text
Closes #12
```

No direct pushes to `main`.

---

# 41. Contract Change Process

If a developer discovers that a contract needs to change:

```text
Developer
    ↓
Open GitHub Issue
    ↓
Discuss change
    ↓
Team agrees
    ↓
Update this document
    ↓
Update affected interfaces
    ↓
Update implementations
```

Do not silently change:

```text
API endpoint
request body
response body
database column
database relationship
blockchain data structure
TypeScript interface
```

because another member may already be implementing against the previous contract.

---

# 42. Definition of Done

A feature is considered complete only when:

```text
[ ] Code implemented
[ ] Validation implemented
[ ] Error handling implemented
[ ] Database integration complete if required
[ ] Blockchain integration complete if required
[ ] Tests pass
[ ] API endpoint tested
[ ] Documentation updated
[ ] Pull request reviewed
[ ] Issue closed
```

---

# 43. Initial Development Order

The team should proceed in this order:

```text
Phase 1
├── Backend initialization
├── PostgreSQL Docker setup
└── MultiChain setup

Phase 2
├── Lock database schema
├── Lock REST API contract
├── Define blockchain interfaces
└── Define TypeScript shared types

Phase 3
├── Database implementation
├── MultiChain implementation
├── Product + ownership implementation
└── Warranty + supply-chain implementation

Phase 4
└── End-to-end integration

Phase 5
├── Testing
├── Error handling
├── Smart Filters
└── Final documentation
```

The important principle is that **Phase 2 happens before everyone starts heavily modifying the codebase**.

---

# 44. Final Ownership Model

```text
                         SHARED CONTRACT
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
          ▼                    ▼                    ▼
      PostgreSQL             REST API          Blockchain
          │                    │                    │
      Member 2            Members 3/4           Member 1
          │                    │                    │
          └────────────────────┼────────────────────┘
                               │
                               ▼
                         Integration
```

The team is therefore divided by responsibility, while the contracts define the boundaries between those responsibilities.

No member should need to wait for another member's implementation as long as the agreed interface already exists.
