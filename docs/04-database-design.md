# Database Design

## 1. Overview

The BaaS platform uses **PostgreSQL** as its primary application database.

PostgreSQL stores application-level data, relationships, authentication information, and blockchain transaction metadata.

The actual blockchain-backed event history is stored in the **MultiChain network**, primarily through MultiChain data streams.

Therefore, the system uses two complementary data stores:

```text
┌──────────────────────────┐
│       PostgreSQL         │
│                          │
│ Application Data         │
│ Business Data            │
│ Product Metadata         │
│ Transaction Metadata     │
│ Authentication Data     │
└────────────┬─────────────┘
             │
             │
             │
┌────────────▼─────────────┐
│       MultiChain         │
│                          │
│ Product Events           │
│ Ownership Events         │
│ Warranty Events          │
│ Supply-Chain Events      │
└──────────────────────────┘
```

PostgreSQL is therefore **not intended to replace the blockchain**. It manages the application's relational data, while MultiChain provides the shared, append-only blockchain history.

---

# 2. Database Responsibilities

## 2.1 PostgreSQL Stores

PostgreSQL shall store:

* Business information
* Business authentication information
* Business blockchain identity/address
* Product metadata
* Blockchain transaction records
* Operation status
* Application timestamps
* Audit information where required

## 2.2 MultiChain Stores

MultiChain shall store:

* Product registration events
* Ownership transfer events
* Warranty events
* Supply-chain events
* Blockchain timestamps
* Blockchain transaction information

The application shall avoid storing large amounts of unnecessary data directly on the blockchain.

---

# 3. Database Entities

The initial PostgreSQL schema consists of the following core entities:

```text
Business
   │
   ├────────── Product
   │              │
   │              └──── BlockchainTransaction
   │
   └────────── BusinessIdentity
```

The initial tables are:

```text
businesses
business_identities
products
blockchain_transactions
```

An API credential table may be added if credentials are separated from the business table during implementation.

---

# 4. Entity Relationship Overview

```text
┌──────────────────────┐
│      businesses      │
├──────────────────────┤
│ PK id                │
│ name                 │
│ api_key_hash         │
│ multichain_address   │
│ created_at           │
└──────────┬───────────┘
           │
           │ 1
           │
           │ N
     ┌─────▼──────────────┐
     │      products      │
     ├────────────────────┤
     │ PK id              │
     │ product_id         │
     │ business_id        │
     │ name               │
     │ description        │
     │ created_at         │
     └────────┬───────────┘
              │
              │ 1
              │
              │ N
   ┌──────────▼──────────────────┐
   │   blockchain_transactions   │
   ├─────────────────────────────┤
   │ PK id                       │
   │ product_id                  │
   │ business_id                 │
   │ operation                   │
   │ transaction_id              │
   │ status                      │
   │ created_at                  │
   └─────────────────────────────┘
```

The detailed visual ERD will be maintained separately in:

```text
docs/ERD/erd.drawio
```

---

# 5. Business Table

## Table

```text
businesses
```

## Purpose

Stores businesses registered with the BaaS platform.

## Schema

| Column               | Type         | Constraints      | Description                 |
| -------------------- | ------------ | ---------------- | --------------------------- |
| `id`                 | UUID         | PK               | Unique business identifier  |
| `name`               | VARCHAR(255) | NOT NULL         | Business name               |
| `api_key_hash`       | TEXT         | NOT NULL, UNIQUE | Hash of business API key    |
| `multichain_address` | TEXT         | NOT NULL, UNIQUE | Blockchain identity/address |
| `created_at`         | TIMESTAMP    | NOT NULL         | Registration timestamp      |

### Example

```text
businesses
────────────────────────────────────
id                  UUID
name                "Example Retail"
api_key_hash        "hashed-value"
multichain_address  "1ABC..."
created_at          2026-09-20 ...
```

---

# 6. Business Identity Table

## Table

```text
business_identities
```

## Purpose

Stores blockchain identity information separately from general business information.

This separation allows the platform to support blockchain-specific configuration without placing all blockchain information directly into the business table.

## Schema

| Column        | Type      | Constraints      | Description            |
| ------------- | --------- | ---------------- | ---------------------- |
| `id`          | UUID      | PK               | Identity record ID     |
| `business_id` | UUID      | FK               | Associated business    |
| `address`     | TEXT      | NOT NULL, UNIQUE | MultiChain address     |
| `created_at`  | TIMESTAMP | NOT NULL         | Identity creation time |

Relationship:

```text
Business 1 ─────── 1 BusinessIdentity
```

For the MVP, a business will normally have one blockchain identity.

---

# 7. Product Table

## Table

```text
products
```

## Purpose

Stores application-level product information.

The product table does **not** contain the complete blockchain history.

Blockchain events such as ownership transfers and supply-chain events are stored on MultiChain.

## Schema

| Column        | Type         | Constraints      | Description                        |
| ------------- | ------------ | ---------------- | ---------------------------------- |
| `id`          | UUID         | PK               | Internal database ID               |
| `product_id`  | VARCHAR(100) | NOT NULL, UNIQUE | Public/business product identifier |
| `business_id` | UUID         | FK, NOT NULL     | Business that registered product   |
| `name`        | VARCHAR(255) | NOT NULL         | Product name                       |
| `description` | TEXT         | NULL             | Product description                |
| `created_at`  | TIMESTAMP    | NOT NULL         | Product creation time              |
| `updated_at`  | TIMESTAMP    | NOT NULL         | Last application update            |

Example:

```text
products
────────────────────────────────────────
id          UUID
product_id  "P1001"
business_id UUID → businesses.id
name        "Laptop X"
description "Example laptop"
created_at  ...
updated_at  ...
```

---

# 8. Blockchain Transaction Table

## Table

```text
blockchain_transactions
```

## Purpose

Stores application-level metadata about operations submitted to MultiChain.

The table does not duplicate the blockchain record itself.

It allows the BaaS platform to associate:

```text
API Operation
      ↓
Product
      ↓
MultiChain Transaction
```

## Schema

| Column           | Type         | Constraints      | Description                       |
| ---------------- | ------------ | ---------------- | --------------------------------- |
| `id`             | UUID         | PK               | Internal transaction record       |
| `product_id`     | UUID         | FK, NOT NULL     | Associated product                |
| `business_id`    | UUID         | FK, NOT NULL     | Business that initiated operation |
| `operation`      | VARCHAR(100) | NOT NULL         | Operation type                    |
| `transaction_id` | TEXT         | NOT NULL, UNIQUE | MultiChain transaction ID         |
| `status`         | VARCHAR(50)  | NOT NULL         | Operation status                  |
| `created_at`     | TIMESTAMP    | NOT NULL         | Transaction creation time         |

Possible operation values:

```text
PRODUCT_REGISTERED
OWNERSHIP_TRANSFERRED
WARRANTY_EVENT
SUPPLY_CHAIN_EVENT
```

Possible status values:

```text
PENDING
CONFIRMED
FAILED
```

---

# 9. Optional Audit Log

An application-level audit table may be added if required.

## Table

```text
audit_logs
```

Possible schema:

| Column          | Type         | Constraints | Description                   |
| --------------- | ------------ | ----------- | ----------------------------- |
| `id`            | UUID         | PK          | Log ID                        |
| `business_id`   | UUID         | FK          | Business performing operation |
| `operation`     | VARCHAR(100) | NOT NULL    | Operation performed           |
| `resource_type` | VARCHAR(100) | NOT NULL    | Resource type                 |
| `resource_id`   | VARCHAR(100) | NOT NULL    | Resource identifier           |
| `created_at`    | TIMESTAMP    | NOT NULL    | Event timestamp               |

This is optional for the MVP.

Blockchain history itself should not be duplicated in an audit table simply for the sake of duplication.

---

# 10. API Credential Design

The BaaS platform uses API keys for business authentication.

The raw API key must **not** be stored in plaintext.

Instead:

```text
Generated API Key
       │
       ▼
Hash
       │
       ▼
PostgreSQL
```

When a request arrives:

```text
Client API Key
       │
       ▼
Hash / Verify
       │
       ▼
Stored Credential
       │
       ▼
Business
```

For the initial implementation, the API key hash may be stored in `businesses`.

If the authentication system becomes more complex, a separate:

```text
api_credentials
```

table can be introduced.

---

# 11. Relationships

## 11.1 Business → Products

One business can register many products.

```text
Business 1 ───────── N Products
```

Foreign key:

```text
products.business_id
        ↓
businesses.id
```

---

## 11.2 Business → Business Identity

Each business has a blockchain identity.

```text
Business 1 ───────── 1 BusinessIdentity
```

Foreign key:

```text
business_identities.business_id
        ↓
businesses.id
```

---

## 11.3 Product → Blockchain Transactions

One product can have many blockchain transactions.

```text
Product 1 ───────── N BlockchainTransactions
```

Foreign key:

```text
blockchain_transactions.product_id
        ↓
products.id
```

Example:

```text
Product P1001
    │
    ├── tx001 → PRODUCT_REGISTERED
    ├── tx002 → OWNERSHIP_TRANSFERRED
    ├── tx003 → WARRANTY_EVENT
    └── tx004 → SUPPLY_CHAIN_EVENT
```

---

## 11.4 Business → Blockchain Transactions

One business can initiate many blockchain operations.

```text
Business 1 ───────── N BlockchainTransactions
```

Foreign key:

```text
blockchain_transactions.business_id
        ↓
businesses.id
```

---

# 12. PostgreSQL vs MultiChain Data Model

An important design decision is that **not every blockchain event gets its own PostgreSQL table**.

For example, we do not need:

```text
ownership_events
warranty_events
supply_chain_events
```

in PostgreSQL for the MVP.

Instead:

```text
PostgreSQL
──────────────────────────────
products
businesses
blockchain_transactions
             │
             │ references
             ▼
       MultiChain
──────────────────────────────
ownership stream
warranty stream
supply_chain stream
products stream
```

This prevents the relational database from simply becoming a duplicate copy of the blockchain.

---

# 13. MultiChain Stream Data

The blockchain data model is maintained separately from the PostgreSQL relational model.

## 13.1 Products Stream

Conceptual record:

```json
{
  "productId": "P1001",
  "businessId": "B001",
  "event": "REGISTERED",
  "name": "Laptop X"
}
```

---

## 13.2 Ownership Stream

Conceptual record:

```json
{
  "productId": "P1001",
  "previousOwner": "B001",
  "newOwner": "B002",
  "event": "OWNERSHIP_TRANSFERRED"
}
```

---

## 13.3 Warranty Stream

Conceptual record:

```json
{
  "productId": "P1001",
  "event": "WARRANTY_ACTIVATED",
  "durationMonths": 12
}
```

---

## 13.4 Supply-Chain Stream

Conceptual record:

```json
{
  "productId": "P1001",
  "event": "SHIPPED",
  "from": "Manufacturer",
  "to": "Warehouse-A"
}
```

The exact stream item structure may be refined during `05-blockchain-design.md`.

---

# 14. Why Transaction IDs Are Stored in PostgreSQL

When a blockchain operation is submitted, MultiChain provides a transaction identifier.

Example:

```text
API Request
     ↓
MultiChain
     ↓
txid = abc123
```

The BaaS application stores:

```text
product_id
operation
transaction_id
status
business_id
```

This creates a link between the application's operation and its blockchain transaction.

Example:

```text
Product P1001
      │
      ▼
BlockchainTransaction
      │
      ├── operation: OWNERSHIP_TRANSFERRED
      ├── transaction_id: abc123
      ├── status: CONFIRMED
      └── business_id: B001
```

---

# 15. Transaction Status

Blockchain operations may have application-level states:

```text
PENDING
   │
   ▼
CONFIRMED
```

or:

```text
PENDING
   │
   ▼
FAILED
```

The status stored in PostgreSQL represents the application's understanding of the blockchain operation.

The blockchain remains the authoritative source for the actual blockchain record.

---

# 16. Data Integrity

## 16.1 Primary Keys

All major entities shall use UUID primary keys.

Example:

```text
businesses.id
products.id
blockchain_transactions.id
```

This separates internal database identifiers from business-facing identifiers.

---

## 16.2 Foreign Keys

Foreign-key constraints shall maintain relational integrity.

Example:

```text
products.business_id
      ↓
businesses.id
```

A product cannot reference a business that does not exist.

---

## 16.3 Unique Constraints

The following values should be unique:

```text
businesses.id
businesses.api_key_hash
businesses.multichain_address

business_identities.address

products.id
products.product_id

blockchain_transactions.transaction_id
```

---

# 17. Indexing

Indexes should be created for frequently queried fields.

Initial indexes should include:

```text
products.product_id
products.business_id

blockchain_transactions.product_id
blockchain_transactions.business_id
blockchain_transactions.transaction_id

business_identities.business_id
business_identities.address
```

These indexes support common API operations such as:

```text
GET /api/products/:id
GET /api/products/:id/verify
```

and transaction lookup.

---

# 18. Example Data

Assume the following businesses:

```text
B001 = Manufacturer
B002 = Distributor
B003 = Retailer
```

### Businesses

```text
B001 | Manufacturer Inc.
B002 | Distributor Inc.
B003 | Retailer Inc.
```

### Product

```text
P1001 | Laptop X | B001
```

### Blockchain Transactions

```text
tx001 | P1001 | B001 | PRODUCT_REGISTERED
tx002 | P1001 | B001 | SUPPLY_CHAIN_EVENT
tx003 | P1001 | B002 | OWNERSHIP_TRANSFERRED
tx004 | P1001 | B002 | SUPPLY_CHAIN_EVENT
tx005 | P1001 | B003 | WARRANTY_EVENT
```

### MultiChain History

```text
products stream
    P1001 REGISTERED

ownership stream
    B001 → B002

warranty stream
    WARRANTY_ACTIVATED

supply_chain stream
    MANUFACTURED
    SHIPPED
    DISTRIBUTOR_RECEIVED
    RETAILER_RECEIVED
```

---

# 19. Typical Database Interaction

## Product Registration

```text
POST /api/products
        │
        ▼
Product Service
        │
        ├───────────────► PostgreSQL
        │                  Create Product
        │
        └───────────────► MultiChain
                           Publish Event
                                │
                                ▼
                              txid
                                │
                                ▼
                         PostgreSQL
                         Save txid
```

---

# 20. Product Verification

Verification should primarily use the blockchain.

```text
GET /api/products/P1001/verify
        │
        ▼
Product Service
        │
        ▼
MultiChain
        │
        ▼
Products Stream
        │
        ▼
Blockchain Record
        │
        ▼
Verification Result
```

PostgreSQL may be used to resolve the internal product/business relationship, but the existence of the blockchain record is verified through MultiChain.

---

# 21. Ownership Transfer

```text
POST /api/products/P1001/ownership
        │
        ▼
Ownership Service
        │
        ▼
MultiChain
        │
        ▼
Ownership Stream
        │
        ▼
Transaction ID
        │
        ▼
PostgreSQL
        │
        ▼
BlockchainTransaction
```

The previous ownership record is not deleted.

---

# 22. Supply-Chain Event

```text
POST /api/products/P1001/supply-chain/events
        │
        ▼
SupplyChainService
        │
        ▼
MultiChain
        │
        ▼
supply_chain stream
        │
        ▼
Transaction ID
        │
        ▼
PostgreSQL
```

The event remains available as part of the blockchain-backed product history.

---

# 23. Database Design Principles

### 23.1 PostgreSQL Is the Application Database

It manages:

```text
Users / Businesses
Products
Relationships
Authentication
Transaction Metadata
```

### 23.2 MultiChain Is the Blockchain Ledger

It manages:

```text
Product Events
Ownership Events
Warranty Events
Supply-Chain Events
```

### 23.3 Avoid Unnecessary Duplication

Blockchain history should not be duplicated into PostgreSQL unless there is a specific application requirement.

### 23.4 Internal IDs vs Business IDs

Internal database IDs are separate from public/business identifiers.

Example:

```text
Internal:
UUID → 550e8400...

Business:
P1001
```

### 23.5 Blockchain Transactions Are Referenced, Not Recreated

PostgreSQL stores the MultiChain transaction ID rather than attempting to reproduce the blockchain record.

---

# 24. Final Schema

The initial MVP database can therefore be summarized as:

```text
┌─────────────────────────┐
│       businesses        │
├─────────────────────────┤
│ PK id                   │
│ name                    │
│ api_key_hash            │
│ multichain_address      │
│ created_at              │
└────────────┬────────────┘
             │
       ┌─────┴──────────────┐
       │                    │
       ▼                    ▼
┌─────────────────┐  ┌─────────────────────────┐
│ business_       │  │       products          │
│ identities      │  ├─────────────────────────┤
├─────────────────┤  │ PK id                   │
│ PK id           │  │ product_id              │
│ business_id FK  │  │ business_id FK          │
│ address         │  │ name                    │
│ created_at      │  │ description             │
└─────────────────┘  │ created_at              │
                     │ updated_at              │
                     └────────────┬────────────┘
                                  │
                                  ▼
                     ┌─────────────────────────┐
                     │ blockchain_transactions │
                     ├─────────────────────────┤
                     │ PK id                   │
                     │ product_id FK           │
                     │ business_id FK          │
                     │ operation               │
                     │ transaction_id          │
                     │ status                  │
                     │ created_at              │
                     └─────────────────────────┘


              MULTICHAIN NETWORK
              ──────────────────

              products
              ownership
              warranty
              supply_chain
```

---

# 25. ERD Relationship Summary

The core relational relationships are:

```text
Business
   │
   ├───────────────< Product
   │                    │
   │                    └────────< BlockchainTransaction
   │
   └─────────────────── BusinessIdentity
```

Cardinality:

```text
Business 1 ─── N Product

Business 1 ─── 1 BusinessIdentity

Product 1 ─── N BlockchainTransaction

Business 1 ─── N BlockchainTransaction
```

The complete graphical ERD will be maintained in:

```text
docs/ERD/erd.drawio
```

and its textual representation in:

```text
docs/ERD/erd.md
```

---

# 26. Future Database Extensions

Potential future tables include:

```text
api_credentials
audit_logs
business_roles
api_usage
webhooks
```

These are not required for the initial MVP.

The schema should remain intentionally small so that the project focuses on demonstrating the BaaS architecture and blockchain integration rather than building a large enterprise database.
