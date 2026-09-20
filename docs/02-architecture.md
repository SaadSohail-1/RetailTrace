# System Architecture

## 1. Architecture Overview

The system follows a **layered BaaS architecture** in which existing Web2 e-commerce applications communicate with a conventional REST API while the BaaS platform handles blockchain interaction internally.

The underlying blockchain network is implemented using **MultiChain**, a permissioned blockchain platform.

The architecture separates:

* Web2 business applications
* BaaS API
* Application/business logic
* PostgreSQL database
* Blockchain integration layer
* MultiChain blockchain network

The primary architectural goal is **abstraction**:

> An e-commerce business should be able to use blockchain-backed services without knowing how MultiChain works internally.

---

# 2. High-Level Architecture

```text
┌──────────────────────────────────────────────────────────────┐
│                    EXISTING WEB2 BUSINESSES                  │
│                                                              │
│  Manufacturer App    Distributor App    Retailer App         │
└───────────────┬──────────────┬──────────────┬───────────────┘
                │              │              │
                │              │              │
                └──────────────┼──────────────┘
                               │
                         REST / JSON
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                         BaaS PLATFORM                        │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                    REST API Layer                      │  │
│  │                                                        │  │
│  │ Products │ Verification │ Ownership │ Warranty │ SCM   │  │
│  └───────────────────────────┬────────────────────────────┘  │
│                              │                               │
│  ┌───────────────────────────▼────────────────────────────┐  │
│  │                  Authentication Layer                  │  │
│  │                                                        │  │
│  │ API Keys │ Business Identity │ Authorization           │  │
│  └───────────────────────────┬────────────────────────────┘  │
│                              │                               │
│  ┌───────────────────────────▼────────────────────────────┐  │
│  │                  Business Service Layer                │  │
│  │                                                        │  │
│  │ Product Service │ Ownership │ Warranty │ Supply Chain  │  │
│  └───────────────┬──────────────────────────┬─────────────┘  │
│                  │                          │                │
│                  │                          │                │
│                  ▼                          ▼                │
│  ┌────────────────────────┐    ┌─────────────────────────┐   │
│  │    PostgreSQL DB       │    │   Blockchain Service    │   │
│  │                        │    │                         │   │
│  │ Businesses             │    │ MultiChain RPC Client   │   │
│  │ Products               │    │ Stream Operations       │   │
│  │ Transactions           │    │ Permission Operations   │   │
│  │ Application Data       │    │                         │   │
│  └────────────────────────┘    └────────────┬────────────┘   │
└─────────────────────────────────────────────┼───────────────┘
                                              │
                                        JSON-RPC
                                              │
                                              ▼
┌──────────────────────────────────────────────────────────────┐
│                     MULTICHAIN NETWORK                       │
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    │
│  │ MultiChain   │    │ MultiChain   │    │ MultiChain   │    │
│  │    Node 1    │    │    Node 2    │    │    Node 3    │    │
│  │              │    │              │    │              │    │
│  │ Manufacturer │    │ Distributor  │    │ Retailer     │    │
│  └──────────────┘    └──────────────┘    └──────────────┘    │
│                                                              │
│  Streams:                                                    │
│  ├── products                                                │
│  ├── ownership                                               │
│  ├── warranty                                                │
│  └── supply_chain                                            │
└──────────────────────────────────────────────────────────────┘
```

---

# 3. Architectural Layers

## 3.1 Web2 Business Layer

This represents an existing e-commerce application consuming the BaaS platform.

The business does not communicate directly with MultiChain.

It only knows the BaaS API.

Example:

```http
POST /api/products
```

The business does not need to know that the operation eventually results in a MultiChain stream publication.

### Responsibilities

* Consume BaaS REST APIs
* Provide product/business information
* Request blockchain-backed operations
* Display verification/history to its users

---

# 4. BaaS REST API Layer

The REST API is the public interface of the BaaS platform.

Example endpoints:

```text
POST /api/products
GET  /api/products/:id
GET  /api/products/:id/verify

POST /api/products/:id/ownership
GET  /api/products/:id/ownership/history

POST /api/products/:id/warranty
GET  /api/products/:id/warranty

POST /api/products/:id/supply-chain/events
GET  /api/products/:id/supply-chain/history
```

### Responsibilities

* Receive HTTP requests
* Validate request format
* Authenticate businesses
* Return standardized JSON responses
* Hide blockchain-specific implementation details

The API must not expose MultiChain RPC commands to businesses.

For example, a business should never need to send:

```text
publish
liststreamitems
grant
verifypermission
```

Those operations are internal to the BaaS platform.

---

# 5. Authentication and Authorization Layer

The authentication layer identifies the business making an API request.

A business will be issued API credentials.

Conceptually:

```text
Business
    │
    │ API Key
    ▼
Authentication Middleware
    │
    ├── Valid?
    │      │
    │      ├── No → 401 Unauthorized
    │      │
    │      └── Yes
    │
    ▼
Business Identity
    │
    ▼
Authorization
```

The authenticated business is associated with a corresponding blockchain identity/address.

This allows the BaaS platform to map:

```text
Web2 Business
      ↓
BaaS Identity
      ↓
MultiChain Address
      ↓
MultiChain Permissions
```

---

# 6. Business Service Layer

The business service layer contains the application's actual business logic.

Suggested services:

```text
ProductService
OwnershipService
WarrantyService
SupplyChainService
```

The services should not directly expose MultiChain RPC commands to API controllers.

Instead:

```text
Controller
    ↓
Business Service
    ↓
Blockchain Service
```

### Example

```text
ProductController
       ↓
ProductService
       ↓
MultiChainService
       ↓
MultiChain RPC
```

This separation makes the system easier to maintain and allows the blockchain implementation to be changed later without redesigning the REST API.

---

# 7. PostgreSQL Database Layer

PostgreSQL is responsible for **application data**, not for replacing the blockchain ledger.

It stores information such as:

```text
Business
Product
BlockchainTransaction
```

Potential additional tables may include:

```text
ApiCredential
BusinessIdentity
AuditLog
```

The exact schema will be defined in:

```text
docs/04-database-design.md
```

### PostgreSQL Responsibilities

PostgreSQL stores:

* Business accounts
* API credential metadata
* Product metadata
* Application relationships
* Blockchain transaction IDs
* Operation status
* Application-level audit information

---

# 8. Blockchain Service Layer

The blockchain service is the abstraction layer between the BaaS application and MultiChain.

Suggested structure:

```text
BlockchainService
│
├── ProductBlockchainService
├── OwnershipBlockchainService
├── WarrantyBlockchainService
├── SupplyChainBlockchainService
└── MultiChainClient
```

The `MultiChainClient` is responsible for communicating with the MultiChain JSON-RPC API.

For example:

```text
ProductService
      ↓
ProductBlockchainService
      ↓
MultiChainClient
      ↓
JSON-RPC
      ↓
MultiChain
```

This prevents application services from becoming tightly coupled to raw RPC calls.

---

# 9. MultiChain Network

The blockchain layer consists of multiple participating MultiChain nodes.

For the academic prototype, the network may contain a small number of nodes representing different business participants.

Example:

```text
Node 1 → Manufacturer
Node 2 → Distributor
Node 3 → Retailer
```

These nodes participate in the same permissioned MultiChain network.

The actual number of nodes can be reduced during development if necessary.

The important architectural concept is that **different businesses have blockchain identities and permissions within the shared network**.

---

# 10. MultiChain Data Streams

The blockchain data model will primarily use MultiChain streams.

Initial streams:

```text
products
ownership
warranty
supply_chain
```

## 10.1 Products Stream

Stores product registration records.

Example:

```json
{
  "productId": "P1001",
  "businessId": "B001",
  "name": "Product A",
  "event": "REGISTERED"
}
```

---

## 10.2 Ownership Stream

Stores ownership-transfer events.

Example:

```json
{
  "productId": "P1001",
  "previousOwner": "B001",
  "newOwner": "B002",
  "event": "OWNERSHIP_TRANSFERRED"
}
```

Ownership changes are appended as new events rather than replacing previous records.

---

## 10.3 Warranty Stream

Stores warranty-related events.

Example:

```json
{
  "productId": "P1001",
  "event": "WARRANTY_ACTIVATED",
  "durationMonths": 12
}
```

---

## 10.4 Supply-Chain Stream

Stores product movement and supply-chain events.

Example:

```json
{
  "productId": "P1001",
  "event": "SHIPPED",
  "from": "Manufacturer",
  "to": "Warehouse-A"
}
```

A complete product history can therefore be reconstructed from the stream events.

---

# 11. Permission Model

The MultiChain network will use permissions to control which participants can publish specific types of data.

Conceptually:

```text
                    MultiChain
                        │
          ┌─────────────┼─────────────┐
          │             │             │
    Manufacturer    Distributor    Retailer
          │             │             │
          ▼             ▼             ▼
     Products       Supply Chain   Supply Chain
     Manufacturing     Events         Events
```

Example:

| Participant  | Possible permissions                       |
| ------------ | ------------------------------------------ |
| Manufacturer | Product registration, manufacturing events |
| Warehouse    | Warehouse events                           |
| Distributor  | Distribution events                        |
| Retailer     | Retail/receipt events                      |

The BaaS backend will also perform application-level authorization before submitting blockchain operations.

Therefore, authorization exists at two levels:

```text
API Authorization
        ↓
BaaS Backend
        ↓
MultiChain Permissions
        ↓
Blockchain
```

This provides defense in depth.

---

# 12. Data Ownership and Responsibility

The system intentionally separates application data from blockchain data.

```text
                 Product
                    │
          ┌─────────┴─────────┐
          │                   │
          ▼                   ▼
      PostgreSQL          MultiChain
          │                   │
          │                   │
    Product metadata     Blockchain events
    Description          Registration
    Business relation    Ownership
    Application data     Warranty
                         Supply Chain
```

### PostgreSQL

Optimized for:

* Application queries
* Relationships
* Authentication
* Business information
* Product metadata
* Transaction tracking

### MultiChain

Used for:

* Shared records
* Append-only event history
* Blockchain-backed verification
* Business-to-business shared state
* Permission-controlled publishing

Large or unnecessary application data should not be stored on the blockchain.

---

# 13. Product Registration Architecture

The product registration flow is:

```text
Web2 Business
      │
      │ POST /api/products
      ▼
API Controller
      │
      ▼
Authentication
      │
      ▼
Product Service
      │
      ├──────────────────────┐
      │                      │
      ▼                      ▼
 PostgreSQL           Blockchain Service
      │                      │
      │                      ▼
      │                MultiChain RPC
      │                      │
      │                      ▼
      │                Products Stream
      │                      │
      │                      ▼
      │                Transaction ID
      │                      │
      └──────────┬───────────┘
                 ▼
             API Response
```

Example response:

```json
{
  "productId": "P1001",
  "transactionId": "abc123",
  "status": "confirmed"
}
```

The transaction information is then associated with the product in PostgreSQL.

---

# 14. Product Verification Architecture

Verification is intentionally performed against the blockchain record.

```text
Business
   │
   │ GET /api/products/P1001/verify
   ▼
API
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
Products Stream
   │
   ▼
Blockchain Record
   │
   ▼
Verification Result
   │
   ▼
Business
```

The PostgreSQL record may be used to locate application information, but the blockchain record is the source used for blockchain-backed verification.

---

# 15. Ownership Transfer Architecture

```text
Business A
    │
    │ POST ownership transfer
    ▼
BaaS API
    │
    ▼
Authentication
    │
    ▼
Authorization
    │
    ▼
Ownership Service
    │
    ▼
Blockchain Service
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
    ├──────────────► PostgreSQL
    │
    ▼
API Response
```

The previous ownership record remains part of the historical record.

---

# 16. Supply-Chain Architecture

Supply-chain participants submit events through the BaaS API.

```text
Manufacturer
     │
     │ MANUFACTURED
     ▼
   BaaS
     │
     ▼
MultiChain
     │
     ▼
Supply Chain Stream

Distributor
     │
     │ RECEIVED
     ▼
   BaaS
     │
     ▼
MultiChain
     │
     ▼
Supply Chain Stream

Retailer
     │
     │ RECEIVED
     ▼
   BaaS
     │
     ▼
MultiChain
```

The result is an append-only product lifecycle:

```text
MANUFACTURED
      ↓
SHIPPED
      ↓
WAREHOUSE_RECEIVED
      ↓
DISTRIBUTOR_RECEIVED
      ↓
RETAILER_RECEIVED
```

---

# 17. Deployment Architecture

For development, all components can initially run on a single development machine.

```text
┌──────────────────────────────────────────┐
│              Developer Machine           │
│                                          │
│  ┌──────────┐     ┌──────────────────┐   │
│  │ React    │     │ Node.js/Express  │   │
│  │ Frontend │────►│ BaaS Backend     │   │
│  └──────────┘     └───────┬──────────┘   │
│                            │             │
│               ┌────────────┴──────────┐  │
│               │                       │  │
│               ▼                       ▼  │
│        ┌──────────────┐       ┌────────┐ │
│        │ PostgreSQL   │       │Multi-  │ │
│        │              │       │Chain   │ │
│        └──────────────┘       │Node(s) │ │
│                               └────────┘ │
└──────────────────────────────────────────┘
```

The development environment does **not** require a virtual machine.

Multiple MultiChain nodes can be configured on the same machine for development if required.

The deployment architecture can later be distributed across separate machines for demonstration or production-like deployment.

---

# 18. Backend Project Structure

The backend is expected to follow this structure:

```text
backend/
├── src/
│   ├── routes/
│   │   ├── products.routes.ts
│   │   ├── ownership.routes.ts
│   │   ├── warranty.routes.ts
│   │   └── supply-chain.routes.ts
│   │
│   ├── controllers/
│   │   ├── product.controller.ts
│   │   ├── ownership.controller.ts
│   │   ├── warranty.controller.ts
│   │   └── supply-chain.controller.ts
│   │
│   ├── services/
│   │   ├── product.service.ts
│   │   ├── ownership.service.ts
│   │   ├── warranty.service.ts
│   │   └── supply-chain.service.ts
│   │
│   ├── blockchain/
│   │   ├── multichain.client.ts
│   │   ├── product.blockchain.ts
│   │   ├── ownership.blockchain.ts
│   │   ├── warranty.blockchain.ts
│   │   └── supply-chain.blockchain.ts
│   │
│   ├── db/
│   │   ├── connection.ts
│   │   └── schema/
│   │
│   ├── middleware/
│   │   ├── authentication.ts
│   │   └── authorization.ts
│   │
│   └── app.ts
│
└── package.json
```

The exact structure may be adjusted during implementation.

---

# 19. Architectural Principles

## 19.1 Blockchain Abstraction

Web2 businesses interact only with the BaaS REST API.

```text
Business
   ↓
REST API
   ↓
BaaS
   ↓
MultiChain
```

MultiChain implementation details must remain internal.

## 19.2 Separation of Concerns

Each layer should have a clearly defined responsibility.

```text
API
 ↓
Business Logic
 ↓
Data / Blockchain Services
 ↓
Infrastructure
```

## 19.3 Database and Blockchain Are Complementary

PostgreSQL and MultiChain are not competing databases.

They solve different problems.

```text
PostgreSQL → Application state
MultiChain  → Shared blockchain history
```

## 19.4 Permissioned Participation

Businesses participating in the supply chain should have identifiable blockchain identities and appropriate permissions.

## 19.5 Append-Only Event History

Events such as ownership transfers and supply-chain movements should be recorded as new events rather than modifying historical events.

---

# 20. Architecture Decision Summary

| Decision                                    | Choice                         | Reason                                                                                 |
| ------------------------------------------- | ------------------------------ | -------------------------------------------------------------------------------------- |
| BaaS API                                    | REST                           | Familiar to Web2 businesses                                                            |
| Backend                                     | Node.js + Express + TypeScript | Matches team's existing skills and provides straightforward JSON-RPC integration       |
| Database                                    | PostgreSQL                     | Relational application data and transaction tracking                                   |
| Blockchain                                  | MultiChain                     | Permissioned network with streams and permissions suitable for B2B blockchain services |
| Blockchain data model                       | Streams                        | Natural fit for append-only product/event history                                      |
| Blockchain access                           | JSON-RPC                       | Simple backend integration                                                             |
| Blockchain authorization                    | MultiChain permissions         | Allows different businesses to have different blockchain capabilities                  |
| Blockchain validation                       | Smart Filters where needed     | Provides programmable blockchain-level validation                                      |
| Public blockchain                           | No                             | Not required for the B2B MVP                                                           |
| Cryptocurrency                              | No                             | Not part of the project requirements                                                   |
| Smart contracts                             | No Solidity contracts          | MultiChain's stream/permission model is used instead                                   |
| Direct business-to-blockchain communication | No                             | Would violate the BaaS abstraction                                                     |
| VM for development                          | No                             | Components can run directly on the development machine                                 |

---

# 21. Final Architecture

The final conceptual architecture is:

```text
                         ┌──────────────────────┐
                         │ Existing Web2 Apps   │
                         │                      │
                         │ Manufacturer         │
                         │ Distributor          │
                         │ Retailer             │
                         └──────────┬───────────┘
                                    │
                              REST / JSON
                                    │
                                    ▼
                    ┌──────────────────────────────┐
                    │       BaaS API Layer         │
                    │                              │
                    │ Products                     │
                    │ Verification                 │
                    │ Ownership                    │
                    │ Warranty                     │
                    │ Supply Chain                 │
                    └──────────────┬───────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │ Authentication &             │
                    │ Authorization                │
                    └──────────────┬───────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │    Business Service Layer    │
                    │                              │
                    │ Product                      │
                    │ Ownership                    │
                    │ Warranty                     │
                    │ Supply Chain                 │
                    └───────────┬──────────┬────────┘
                                │          │
                       SQL      │          │ JSON-RPC
                                │          │
                                ▼          ▼
                     ┌──────────────┐  ┌───────────────┐
                     │ PostgreSQL   │  │ Blockchain    │
                     │              │  │ Service       │
                     │ App Data     │  └───────┬───────┘
                     │ Tx Records   │          │
                     └──────────────┘          │
                                               ▼
                                  ┌────────────────────────┐
                                  │   MultiChain Network   │
                                  │                        │
                                  │ Products Stream        │
                                  │ Ownership Stream       │
                                  │ Warranty Stream        │
                                  │ Supply Chain Stream    │
                                  │                        │
                                  │ Permissions            │
                                  │ Smart Filters*         │
                                  └────────────────────────┘

                                  * Optional for MVP
```

The architecture therefore implements the central project idea:

> **Existing Web2 businesses consume ordinary REST APIs, while the BaaS platform handles the MultiChain blockchain infrastructure, data streams, permissions, and blockchain transactions internally.**
