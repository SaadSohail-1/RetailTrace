# Blockchain-as-a-Service Platform for E-Commerce

## 1. Overview

### 1.1 Project Description

The project is a **Blockchain-as-a-Service (BaaS) platform** that enables existing Web2 e-commerce businesses to integrate blockchain-based functionality through simple REST APIs.

The platform acts as an abstraction layer between Web2 applications and the underlying blockchain network. Businesses do not need to manage blockchain infrastructure, blockchain nodes, blockchain data structures, or blockchain-specific APIs themselves.

The BaaS platform provides services such as:

* Product registration
* Product verification
* Ownership transfer
* Warranty records
* Supply-chain event tracking

The underlying blockchain infrastructure will use **MultiChain**, a permissioned blockchain platform. MultiChain data streams will be used to maintain append-only, timestamped blockchain records, while MultiChain permissions will control which participating businesses can perform specific operations.

### 1.2 Problem Statement

Existing Web2 e-commerce businesses may benefit from blockchain-based product authenticity, ownership, warranty, and supply-chain tracking, but integrating blockchain directly requires knowledge of blockchain infrastructure, node management, transaction handling, and blockchain-specific APIs.

The proposed system addresses this problem by providing a simple REST API through which businesses can access blockchain-backed services without directly interacting with the underlying MultiChain network.

### 1.3 Main Objective

The main objective is to develop a working BaaS prototype that demonstrates how an existing Web2 e-commerce application can consume blockchain functionality through conventional REST APIs.

The system should hide the complexity of MultiChain from the business application while maintaining blockchain-backed records for operations where shared, tamper-evident history is required.

---

# 2. Target Users

## 2.1 E-Commerce Businesses

Existing Web2 businesses that want to integrate blockchain-backed services into their applications.

Examples include:

* Manufacturers
* Retailers
* Distributors
* Warranty providers
* Supply-chain participants

These businesses interact primarily with the BaaS REST API rather than directly with MultiChain.

## 2.2 BaaS Administrator

The platform administrator manages:

* Registered businesses
* API credentials
* Business blockchain identities
* Blockchain permissions
* Platform configuration

## 2.3 End Customers

Customers are indirect users of the system.

They do not interact directly with the blockchain. Instead, their e-commerce application can use the BaaS API to provide functionality such as:

* Product authenticity verification
* Ownership history
* Warranty information
* Supply-chain history

---

# 3. Project Scope

## 3.1 In Scope

The MVP will provide the following functionality:

1. Business registration and authentication
2. API-based access for Web2 businesses
3. Product registration on the blockchain
4. Product verification
5. Ownership transfer
6. Ownership history
7. Warranty event recording
8. Warranty history
9. Supply-chain event recording
10. Supply-chain history
11. Blockchain transaction tracking
12. MultiChain permission management
13. PostgreSQL-based application data storage
14. REST API abstraction over MultiChain
15. Basic administrator functionality

## 3.2 Out of Scope

The following features are outside the MVP:

* Cryptocurrency payments
* Customer cryptocurrency wallets
* Token-based payments
* Cryptocurrency exchange
* Public blockchain deployment
* Consumer-facing crypto functionality
* Building a new blockchain protocol
* Custom consensus algorithm
* Large-scale cloud deployment
* Production-grade multi-region infrastructure
* Advanced enterprise data privacy features
* Full commercial BaaS billing/subscription system

The project focuses on demonstrating the **BaaS concept and blockchain integration**, rather than building a production-scale commercial platform.

---

# 4. Functional Requirements

## FR-01 — Business Registration

The system shall allow an administrator to register a participating e-commerce business.

A business record shall contain information such as:

* Business ID
* Business name
* Contact information
* API credentials
* Blockchain identity/address
* Registration timestamp

Each participating business shall have an associated blockchain identity/address used when interacting with the MultiChain network.

---

## FR-02 — API Authentication

The system shall authenticate businesses before allowing access to BaaS services.

The API shall use API credentials to identify the requesting business.

The backend shall associate each API request with a registered business and its corresponding permissions.

---

## FR-03 — Product Registration

The system shall allow a registered business to register a product through the BaaS REST API.

Example:

```http
POST /api/products
```

Example request:

```json
{
  "productId": "P1001",
  "name": "Product A",
  "description": "Example product"
}
```

The BaaS backend shall:

1. Authenticate the business.
2. Validate the request.
3. Store application-level product information in PostgreSQL.
4. Publish a blockchain record to the appropriate MultiChain stream.
5. Store the resulting blockchain transaction ID.
6. Return the blockchain operation status to the business.

The blockchain record shall contain only the information necessary for blockchain-backed verification and history.

---

## FR-04 — Product Verification

The system shall allow a business to verify whether a product has a corresponding blockchain record.

Example:

```http
GET /api/products/{productId}/verify
```

The verification process shall query the relevant MultiChain stream rather than relying solely on the PostgreSQL database.

The response shall indicate:

* Product identifier
* Blockchain record status
* Blockchain transaction ID
* Registration information
* Verification result

This demonstrates that verification is backed by the blockchain ledger rather than being simply a database lookup.

---

## FR-05 — Ownership Transfer

The system shall allow an authorized business to transfer ownership of a registered product.

Example:

```http
POST /api/products/{productId}/ownership
```

Example request:

```json
{
  "newOwner": "BUSINESS-002"
}
```

The BaaS backend shall:

1. Verify the requesting business.
2. Verify that the business is authorized to perform the operation.
3. Validate the product.
4. Publish an ownership-transfer event to the MultiChain ownership stream.
5. Store the transaction information in PostgreSQL.
6. Return the resulting blockchain transaction ID and status.

Ownership history shall remain available rather than being overwritten.

---

## FR-06 — Ownership History

The system shall allow authorized businesses to retrieve the ownership history of a product.

Example:

```http
GET /api/products/{productId}/ownership/history
```

The response shall contain the chronological ownership-transfer events recorded for the product.

---

## FR-07 — Warranty Management

The system shall allow an authorized business to record warranty-related events for a product.

Example:

```http
POST /api/products/{productId}/warranty
```

Example request:

```json
{
  "event": "WARRANTY_ACTIVATED",
  "startDate": "2026-09-20",
  "durationMonths": 12
}
```

Warranty events shall be recorded in the appropriate MultiChain stream.

The system shall support retrieving the warranty history of a product.

Example:

```http
GET /api/products/{productId}/warranty
```

---

## FR-08 — Supply-Chain Event Tracking

The system shall allow authorized participants to record supply-chain events.

Example:

```http
POST /api/products/{productId}/supply-chain/events
```

Example request:

```json
{
  "event": "SHIPPED",
  "location": "Warehouse-A"
}
```

Possible events include:

```text
MANUFACTURED
SHIPPED
WAREHOUSE_RECEIVED
DISTRIBUTOR_RECEIVED
RETAILER_RECEIVED
```

Supply-chain events shall be recorded as chronological entries in the MultiChain supply-chain stream.

The system shall allow businesses to retrieve the complete supply-chain history.

Example:

```http
GET /api/products/{productId}/supply-chain/history
```

---

## FR-09 — MultiChain Permissions

The system shall use MultiChain's permission system to control blockchain operations performed by participating businesses.

Different businesses may have different blockchain permissions.

For example:

| Participant  | Example Responsibility                         |
| ------------ | ---------------------------------------------- |
| Manufacturer | Register products, record manufacturing events |
| Warehouse    | Record warehouse events                        |
| Distributor  | Record distribution events                     |
| Retailer     | Record retail/receipt events                   |

The backend shall ensure that a business cannot perform blockchain operations for which its blockchain identity does not have permission.

MultiChain supports global and per-stream permissions, including stream-level `write` permissions.

---

## FR-10 — Blockchain Transaction Tracking

For every blockchain-backed operation, the system shall record the relevant MultiChain transaction ID.

The PostgreSQL database shall maintain information such as:

```text
transaction_id
operation
product_id
business_id
status
created_at
```

This allows the BaaS platform to associate application-level operations with their corresponding blockchain transactions.

---

## FR-11 — Blockchain Data Streams

The system shall organize blockchain records using MultiChain data streams.

The initial stream structure shall include:

```text
products
ownership
warranty
supply_chain
```

Each stream will contain records relevant to its purpose.

For example:

```text
products
    └── P1001 → product registration

ownership
    ├── P1001 → Manufacturer
    └── P1001 → Retailer

warranty
    └── P1001 → WARRANTY_ACTIVATED

supply_chain
    ├── P1001 → MANUFACTURED
    ├── P1001 → SHIPPED
    └── P1001 → RETAILER_RECEIVED
```

MultiChain streams provide an append-only structure in which items can contain JSON/text/binary data and metadata such as transaction IDs and block information.

---

## FR-12 — Blockchain Data Validation

The system may use **MultiChain Smart Filters** where appropriate to enforce blockchain-level validation rules.

Potential validation rules include:

* Required fields must be present.
* Invalid event types must be rejected.
* Unauthorized publishers must not be accepted.
* Invalid state transitions may be rejected.

MultiChain Smart Filters are JavaScript-based rules that can validate transactions or stream items.

Smart Filters are considered an enhancement to the core MVP and will only be implemented where they provide meaningful validation beyond the application layer.

---

# 5. Data Storage Requirements

## 5.1 PostgreSQL

PostgreSQL shall be used as the application's primary relational database.

It shall store:

* Business information
* API credentials/credential metadata
* Product metadata
* Application-level relationships
* Blockchain transaction records
* Operation status
* System/audit information

## 5.2 MultiChain

MultiChain shall store blockchain-backed records that require a shared, append-only history.

It shall be used for:

* Product registration records
* Ownership events
* Warranty events
* Supply-chain events
* Blockchain timestamps
* Blockchain transaction history

The system shall avoid storing large or unnecessary application data directly on the blockchain.

---

# 6. Blockchain Architecture Requirements

The blockchain architecture shall use a **permissioned MultiChain network**.

The conceptual architecture is:

```text
┌───────────────────────────────┐
│     Existing Web2 Business    │
└───────────────┬───────────────┘
                │
                │ REST API
                ▼
┌───────────────────────────────┐
│          BaaS Backend         │
│       Node.js + Express       │
│                               │
│  Authentication              │
│  Business Services            │
│  Blockchain Service           │
└───────────────┬───────────────┘
                │
                │ JSON-RPC
                ▼
┌───────────────────────────────┐
│       MultiChain Network      │
│                               │
│  Products Stream              │
│  Ownership Stream             │
│  Warranty Stream              │
│  Supply Chain Stream          │
│  Permissions                  │
└───────────────────────────────┘

                │
                │
                ▼
┌───────────────────────────────┐
│         PostgreSQL            │
│                               │
│ Application Data              │
│ Transaction Records           │
│ Business Data                 │
└───────────────────────────────┘
```

The backend shall communicate with MultiChain through its JSON-RPC interface rather than exposing MultiChain directly to Web2 businesses. MultiChain provides JSON-RPC commands for stream creation, publishing, querying, and permission management.

---

# 7. API Requirements

The BaaS API shall expose blockchain functionality through conventional REST endpoints.

Initial API:

```text
POST   /api/products

GET    /api/products/:id

GET    /api/products/:id/verify

POST   /api/products/:id/ownership

GET    /api/products/:id/ownership/history

POST   /api/products/:id/warranty

GET    /api/products/:id/warranty

POST   /api/products/:id/supply-chain/events

GET    /api/products/:id/supply-chain/history
```

The API shall not require businesses to know:

* MultiChain RPC commands
* MultiChain stream names
* Blockchain node addresses
* Blockchain transaction construction
* Blockchain permission-management commands

This abstraction is a core requirement of the BaaS architecture.

---

# 8. Non-Functional Requirements

## NFR-01 — Abstraction

The blockchain implementation shall be hidden behind the BaaS API.

A Web2 business should be able to use the platform without directly interacting with MultiChain.

## NFR-02 — Security

The system shall:

* Authenticate API requests.
* Protect API credentials.
* Associate blockchain operations with authorized businesses.
* Enforce blockchain permissions.
* Prevent unauthorized modification of application records.

## NFR-03 — Data Integrity

Blockchain-backed records shall provide an append-only history for supported operations.

Existing events such as ownership transfers and supply-chain events shall not simply be overwritten.

## NFR-04 — Reliability

The system shall record the status and transaction ID of blockchain operations so that application-level records can be associated with blockchain transactions.

## NFR-05 — Maintainability

The backend shall separate:

```text
REST API
    ↓
Business Services
    ↓
Blockchain Service
    ↓
MultiChain
```

This separation shall allow the blockchain implementation to be changed without redesigning the public BaaS API.

## NFR-06 — Usability

The API shall use simple, predictable REST endpoints and JSON request/response formats.

A developer familiar with conventional Web2 APIs should be able to use the platform without prior MultiChain knowledge.

---

# 9. Core System Flows

## 9.1 Product Registration

```text
Web2 Business
      │
      │ POST /api/products
      ▼
BaaS API
      │
      ├── Authenticate Business
      │
      ├── Validate Product
      │
      ├── Store Product Metadata
      │        ↓
      │    PostgreSQL
      │
      └── Publish Blockchain Record
               │
               ▼
          MultiChain
               │
          products stream
               │
               ▼
        Transaction ID
               │
               ▼
          BaaS Response
```

## 9.2 Product Verification

```text
Web2 Business
      │
      │ GET /api/products/P1001/verify
      ▼
BaaS API
      │
      ▼
MultiChain
      │
      │ Query products stream
      ▼
Blockchain Record
      │
      ▼
Verification Result
```

## 9.3 Ownership Transfer

```text
Business A
    │
    │ POST ownership transfer
    ▼
BaaS API
    │
    ├── Authenticate
    ├── Check permission
    └── Validate product
             │
             ▼
        MultiChain
             │
      ownership stream
             │
             ▼
       Transaction ID
```

## 9.4 Supply-Chain Tracking

```text
Manufacturer
      │
      ▼
MANUFACTURED
      │
      ▼
SHIPPED
      │
      ▼
Warehouse
      │
      ▼
WAREHOUSE_RECEIVED
      │
      ▼
Distributor
      │
      ▼
DISTRIBUTOR_RECEIVED
      │
      ▼
Retailer
      │
      ▼
RETAILER_RECEIVED
```

Each event is recorded as a separate blockchain event rather than modifying the previous event.

---

# 10. Technology Stack

| Layer                          | Technology                     |
| ------------------------------ | ------------------------------ |
| Frontend                       | React + Javascript/TypeScript  |
| Backend                        | Node.js + Express              |
| Database                       | PostgreSQL                     |
| Blockchain                     | MultiChain                     |
| Blockchain Interface           | MultiChain JSON-RPC API        |
| Blockchain Data Model          | MultiChain Data Streams        |
| Blockchain Access Control      | MultiChain Permissions         |
| Optional Blockchain Validation | MultiChain Smart Filters       |
| API Testing                    | Postman                        |
| Version Control                | Git + GitHub                   |

---

# 11. Project Constraints

The project is an academic proof-of-concept and therefore prioritizes:

* Demonstrating the BaaS architecture
* Demonstrating real blockchain interaction
* Demonstrating permissioned business participation
* Demonstrating blockchain-backed product history
* Maintaining a manageable implementation scope

The project does not attempt to reproduce the infrastructure, scalability, availability, security, or operational capabilities of a commercial BaaS provider.

---

# 12. MVP Definition

The MVP will be considered complete when the following end-to-end flow works:

```text
1. Register a business
        ↓
2. Authenticate using BaaS API
        ↓
3. Register a product
        ↓
4. BaaS publishes product record to MultiChain
        ↓
5. MultiChain returns transaction ID
        ↓
6. BaaS stores transaction information in PostgreSQL
        ↓
7. Business verifies the product
        ↓
8. Business transfers ownership
        ↓
9. BaaS records ownership event on MultiChain
        ↓
10. Business retrieves ownership history
        ↓
11. Business records warranty/supply-chain events
        ↓
12. Business retrieves blockchain-backed history
```

The MVP must demonstrate that an existing Web2 business can consume blockchain functionality through **simple REST APIs without directly managing the MultiChain blockchain**.

---

# 13. Future Enhancements

Potential future features include:

* Additional blockchain services
* Advanced Smart Filter rules
* More sophisticated business roles
* Additional MultiChain nodes
* Automated blockchain health monitoring
* Webhooks for blockchain operation status
* Rate limiting and API usage analytics
* API usage billing
* Enterprise-level stream privacy
* Cloud deployment
* High-availability blockchain infrastructure
* Additional blockchain platforms through a pluggable blockchain-service layer

These features are not required for the MVP.
