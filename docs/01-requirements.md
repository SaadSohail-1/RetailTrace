# Blockchain-as-a-Service Platform for E-Commerce

## 1. Project Overview

This project proposes a Blockchain-as-a-Service (BaaS) platform that enables existing Web2 e-commerce businesses to integrate blockchain-based functionality through simple REST APIs.

The platform acts as an abstraction layer between conventional e-commerce applications and blockchain infrastructure. Businesses using the platform do not need to develop Solidity smart contracts, operate blockchain nodes, manage blockchain infrastructure, or directly interact with blockchain networks.

The BaaS platform handles these blockchain operations internally and exposes application-level APIs to its business clients.

### Core concept

```text
Existing Web2 E-Commerce Application
                |
                | REST API
                v
        BaaS Platform
                |
                | Blockchain integration
                v
        Smart Contracts
                |
                v
        Blockchain Network
```

The primary goal is to demonstrate how existing Web2 businesses can adopt selected Web3 capabilities without requiring direct knowledge of blockchain technologies.

---

# 2. Problem Statement

Traditional e-commerce businesses may benefit from blockchain-based capabilities such as:

* Product authenticity verification
* Tamper-resistant ownership records
* Warranty history
* Supply-chain traceability
* Verifiable product lifecycle events

However, implementing these capabilities independently requires knowledge of blockchain networks, smart contracts, transaction management, blockchain accounts, and supporting infrastructure.

This creates a technical barrier for businesses whose existing systems are based on conventional Web2 technologies.

The proposed platform addresses this problem by providing blockchain functionality through familiar REST APIs.

Instead of directly interacting with a blockchain, a business can make requests such as:

```http
POST /api/products/register
GET /api/products/{productId}/verify
POST /api/products/{productId}/transfer
POST /api/products/{productId}/warranty
POST /api/products/{productId}/events
```

The BaaS platform handles the underlying blockchain interaction.

---

# 3. Project Objectives

The project aims to:

1. Design a BaaS architecture connecting Web2 e-commerce applications with blockchain infrastructure.
2. Provide blockchain functionality through REST APIs.
3. Implement smart contracts for selected e-commerce use cases.
4. Demonstrate communication between a Node.js backend and blockchain smart contracts.
5. Maintain appropriate separation between on-chain and off-chain data.
6. Provide a web-based dashboard for demonstrating and managing the platform.
7. Demonstrate blockchain transactions using a local development blockchain without involving real cryptocurrency.
8. Provide transaction status and transaction hashes to API consumers.
9. Demonstrate how blockchain complexity can be hidden behind an application-level API.

---

# 4. Target Users

## 4.1 E-Commerce Business

The primary user of the BaaS platform is an existing e-commerce business.

The business interacts with the platform through REST APIs rather than directly interacting with the blockchain.

Examples include:

* Product registration
* Product verification
* Ownership transfer
* Warranty recording
* Supply-chain event recording

## 4.2 Platform Administrator

The platform administrator manages the BaaS platform and may monitor:

* Registered businesses
* Registered products
* Blockchain transactions
* Transaction status
* Blockchain-related errors
* Platform activity

---

# 5. System Scope

## 5.1 In Scope

The MVP will provide the following blockchain-backed services.

### Product Registration

A business can register a product through the BaaS API.

The platform will:

1. Validate the request.
2. Store required application data off-chain.
3. Submit a blockchain transaction.
4. Record the resulting transaction hash.
5. Return the transaction status to the API consumer.

Example:

```http
POST /api/products/register
```

---

### Product Verification

A business can verify whether a product has been registered on the blockchain.

Example:

```http
GET /api/products/{productId}/verify
```

The platform retrieves the relevant blockchain record and returns the verification result.

---

### Ownership Transfer

The platform will support recording changes in product ownership.

Example:

```http
POST /api/products/{productId}/transfer
```

The blockchain will maintain the ownership state and relevant transfer history.

---

### Warranty Records

The platform will support recording warranty-related information associated with a product.

Example:

```http
POST /api/products/{productId}/warranty
```

Important warranty records will be represented through blockchain transactions/events.

---

### Supply-Chain Events

The platform will allow businesses to record significant product lifecycle events.

Examples include:

* Manufactured
* Shipped
* Warehouse received
* Distributed
* Retailer received

Example:

```http
POST /api/products/{productId}/events
```

These events can provide a tamper-resistant product history.

---

# 6. Blockchain Model

The project will use an Ethereum-compatible blockchain architecture for the prototype.

Smart contracts will be written in Solidity.

The development blockchain will be provided by Hardhat Network.

The backend will communicate with deployed smart contracts through ethers.js.

```text
Node.js / Express
       |
       | ethers.js
       v
Smart Contract
       |
       v
Hardhat Network
```

The prototype will not require real cryptocurrency.

Hardhat provides a local development environment containing test accounts and test funds for transaction execution.

These accounts are infrastructure used by the prototype and are not exposed as cryptocurrency wallets to the business users.

---

# 7. On-Chain and Off-Chain Data

The system will use a hybrid data model.

Not all application data will be stored on the blockchain.

## 7.1 Off-Chain Data

The conventional database will store application data such as:

* Product names
* Product descriptions
* Prices
* Business information
* API credentials
* Application metadata
* Transaction hashes
* Transaction status
* Other data that does not require blockchain immutability

## 7.2 On-Chain Data

The blockchain will store data for which immutability and independent verification provide value.

Examples include:

* Product registration
* Product ownership
* Ownership changes
* Warranty records/events
* Supply-chain events

This separation reduces unnecessary blockchain storage and transaction usage while retaining blockchain functionality where it provides a meaningful benefit.

---

# 8. Functional Requirements

## FR-01: Business Authentication

The system shall authenticate registered businesses before allowing access to protected BaaS APIs.

## FR-02: Product Registration

The system shall allow an authenticated business to register a product.

## FR-03: Blockchain Registration

The system shall submit the relevant product registration information to the appropriate smart contract.

## FR-04: Transaction Tracking

The system shall record the blockchain transaction hash associated with a blockchain operation.

## FR-05: Transaction Status

The system shall provide the status of blockchain operations.

Possible statuses may include:

```text
PENDING
CONFIRMED
FAILED
```

## FR-06: Product Verification

The system shall allow an authenticated business to verify a product's blockchain registration.

## FR-07: Ownership Transfer

The system shall allow authorized operations to record product ownership transfers.

## FR-08: Warranty Recording

The system shall allow warranty information/events to be recorded for registered products.

## FR-09: Supply-Chain Event Recording

The system shall allow authorized businesses to record product lifecycle events.

## FR-10: Transaction History

The system shall allow relevant blockchain transaction information to be viewed through the BaaS platform.

## FR-11: Dashboard

The system shall provide a web dashboard for demonstrating and managing supported BaaS functionality.

---

# 9. Non-Functional Requirements

## NFR-01: Abstraction

The system shall hide blockchain implementation details from API consumers.

A business should not need to understand Solidity, smart contracts, blockchain nodes, or blockchain transaction mechanisms to use the platform.

## NFR-02: Security

Protected APIs shall require authentication.

Private keys used for blockchain transactions shall not be exposed to API consumers.

## NFR-03: Reliability

Blockchain failures shall be handled gracefully and should not cause the backend application to crash.

## NFR-04: Maintainability

The system shall separate API handling, business logic, database operations, and blockchain operations into distinct components.

## NFR-05: Scalability

The architecture should allow additional blockchain services to be added without requiring major changes to existing API functionality.

## NFR-06: Usability

The business-facing API shall use conventional HTTP/REST concepts and understandable request/response structures.

## NFR-07: Testability

Smart contracts, backend services, APIs, and major workflows should be independently testable.

---

# 10. System Constraints

The project is a four-person academic project with a limited implementation period.

Therefore, the MVP will prioritize demonstrating the BaaS concept over implementing production-scale infrastructure.

The project will use:

* Local blockchain infrastructure
* Test blockchain accounts
* Simulated business clients
* Limited blockchain services
* A simplified authentication system

The system will not attempt to provide production-level blockchain infrastructure comparable to commercial cloud BaaS providers.

---

# 11. Out of Scope

The following features are not part of the core MVP.

### Cryptocurrency Payments

The platform will not implement cryptocurrency payments.

### Customer Crypto Wallets

Customers will not be required to own or connect cryptocurrency wallets.

### Real-Money Blockchain Transactions

The prototype will not use real cryptocurrency or real financial transactions.

### Public Blockchain Deployment

The initial prototype will use a local development blockchain.

### Decentralized Cryptocurrency Exchange

Cryptocurrency trading or exchange functionality is outside the project scope.

### Full Production BaaS Infrastructure

The project will not attempt to provide:

* Global blockchain node infrastructure
* Multi-region deployment
* Enterprise-scale monitoring
* Production-grade key management
* Commercial billing
* High-availability infrastructure

---

# 12. Optional Future Features

The architecture may be extended in the future to support:

* Additional blockchain networks
* Token-based product representations
* Blockchain-based escrow
* Cryptocurrency payments
* External wallet integration
* Multi-business blockchain isolation
* Advanced analytics
* Event indexing
* Asynchronous blockchain job processing
* Production blockchain deployment

These features are not required for the MVP.

---

# 13. Core User Flows

## Product Registration

```text
Business
   |
   | POST /products/register
   v
BaaS API
   |
   | Validate + authenticate
   v
Backend Service
   |
   +----> Database
   |
   +----> ethers.js
              |
              v
        Smart Contract
              |
              v
         Blockchain
              |
              v
        Transaction Hash
              |
              v
           Business
```

## Product Verification

```text
Business
   |
   | GET /products/{id}/verify
   v
BaaS API
   |
   v
Blockchain Service
   |
   | ethers.js
   v
Smart Contract
   |
   v
Blockchain
   |
   v
Verification Result
   |
   v
Business
```

## Ownership Transfer

```text
Business
   |
   | POST /products/{id}/transfer
   v
BaaS API
   |
   v
Blockchain Service
   |
   v
Smart Contract
   |
   v
Blockchain
   |
   v
Transaction Hash / Status
```

---

# 14. High-Level Architecture

The proposed architecture consists of four major layers.

```text
┌─────────────────────────────────────┐
│         Web2 Business / UI         │
└─────────────────┬───────────────────┘
                  │ REST API
                  v
┌─────────────────────────────────────┐
│            BaaS Backend             │
│          Node.js + Express          │
│                                     │
│ Authentication                      │
│ API Controllers                     │
│ Business Services                   │
│ Blockchain Service                  │
└──────────────┬───────────┬──────────┘
               │           │
               │           │ ethers.js
               v           v
        ┌────────────┐  ┌───────────────┐
        │ PostgreSQL │  │ Smart Contract│
        │ / Database │  │    Solidity   │
        └────────────┘  └───────┬───────┘
                                │
                                v
                       ┌─────────────────┐
                       │ Hardhat Network │
                       └─────────────────┘
```

---

# 15. Technology Stack

| Layer                  | Technology           |
| ---------------------- | -------------------- |
| Frontend               | React                |
| Backend                | Node.js + Express.js |
| Database               | PostgreSQL           |
| Smart Contracts        | Solidity             |
| Blockchain Development | Hardhat              |
| Blockchain Integration | ethers.js            |
| API Testing            | Postman              |
| Version Control        | Git + GitHub         |

The final technology choices will be documented separately together with their alternatives, reasons for selection, and trade-offs.

---

# 16. MVP Definition

The MVP will be considered functional when the following workflow can be demonstrated:

1. A simulated e-commerce business authenticates with the BaaS platform.
2. The business sends a product registration request.
3. The BaaS backend validates the request.
4. The backend stores appropriate off-chain information.
5. The backend invokes the Product Registry smart contract.
6. The smart contract records the product on the local blockchain.
7. The backend receives a transaction hash.
8. The transaction status can be retrieved.
9. The business can verify the product through another REST API.
10. Ownership can be transferred.
11. Warranty or supply-chain events can be recorded.
12. The React dashboard can display the resulting information.

---

# 17. Core Project Statement

> We are building a Blockchain-as-a-Service platform that provides e-commerce businesses with simple APIs for blockchain-based services, acting as an abstraction layer that allows existing Web2 applications to adopt Web3 capabilities without having to build or manage their own blockchain infrastructure.