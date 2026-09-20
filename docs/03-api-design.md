# API Design

## 1. Overview

The BaaS platform exposes a RESTful API that allows existing Web2 e-commerce businesses to consume blockchain-backed services without directly interacting with the underlying MultiChain network.

The API follows a conventional:

```text
HTTP + JSON + REST
```

architecture.

The business application communicates only with the BaaS API.

```text
Web2 Business
      │
      │ HTTP / JSON
      ▼
   BaaS API
      │
      ├── PostgreSQL
      │
      └── MultiChain
```

MultiChain-specific operations such as `publish`, stream queries, and permission management are internal implementation details and are **not exposed to API consumers**.

---

# 2. API Base URL

During development:

```text
http://localhost:5000/api
```

Production deployment may use a different base URL.

All endpoints described in this document are relative to:

```text
/api
```

---

# 3. API Conventions

## 3.1 Request Format

Requests containing data shall use:

```http
Content-Type: application/json
```

Example:

```json
{
  "productId": "P1001",
  "name": "Example Product"
}
```

## 3.2 Response Format

Responses shall use JSON.

Successful response example:

```json
{
  "success": true,
  "data": {}
}
```

Error response example:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Product ID is required"
  }
}
```

---

# 4. Authentication

Businesses shall authenticate with an API key.

The API key shall be supplied using the `X-API-Key` HTTP header.

Example:

```http
X-API-Key: baas_example_key
```

The backend shall:

1. Receive the API key.
2. Identify the associated business.
3. Verify that the credential is valid.
4. Attach the business identity to the request.
5. Continue to authorization and business logic.

Invalid credentials shall result in:

```http
401 Unauthorized
```

Example:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_API_KEY",
    "message": "Invalid or missing API key"
  }
}
```

---

# 5. Authorization

Authentication identifies **who** is making the request.

Authorization determines **what that business is allowed to do**.

Example:

```text
API Key
   ↓
Business B002
   ↓
Business Role / Permissions
   ↓
Allowed Operation
```

Authorization shall be enforced at the BaaS application layer.

Where applicable, the corresponding MultiChain permissions shall provide an additional blockchain-level authorization check.

---

# 6. API Resource Model

The primary resources are:

```text
Business
Product
Ownership
Warranty
Supply Chain Event
Blockchain Transaction
```

The primary relationship is:

```text
Business
   │
   └── Products
          │
          ├── Ownership History
          ├── Warranty History
          └── Supply-Chain History
```

---

# 7. Product API

## 7.1 Register Product

### Endpoint

```http
POST /api/products
```

### Purpose

Registers a product with the BaaS platform and creates a blockchain-backed product registration record.

### Authentication

Required.

### Request

```json
{
  "productId": "P1001",
  "name": "Example Product",
  "description": "Example product description"
}
```

### Request Fields

| Field         | Type   | Required | Description                        |
| ------------- | ------ | -------: | ---------------------------------- |
| `productId`   | string |      Yes | Unique business product identifier |
| `name`        | string |      Yes | Product name                       |
| `description` | string |       No | Product description                |

### Processing Flow

```text
POST /api/products
        │
        ▼
Authenticate Business
        │
        ▼
Validate Request
        │
        ▼
Create Product in PostgreSQL
        │
        ▼
Publish Registration Event
        │
        ▼
MultiChain products stream
        │
        ▼
Transaction ID
        │
        ▼
Store Transaction
        │
        ▼
Return Response
```

### Success Response

```http
201 Created
```

```json
{
  "success": true,
  "data": {
    "productId": "P1001",
    "transactionId": "abc123",
    "status": "confirmed"
  }
}
```

### Possible Errors

```text
400 INVALID_REQUEST
401 INVALID_API_KEY
403 INSUFFICIENT_PERMISSION
409 PRODUCT_ALREADY_EXISTS
500 BLOCKCHAIN_ERROR
```

---

# 8. Get Product

### Endpoint

```http
GET /api/products/:productId
```

### Purpose

Retrieves the application-level information for a registered product.

### Authentication

Required.

### Example

```http
GET /api/products/P1001
```

### Success Response

```json
{
  "success": true,
  "data": {
    "productId": "P1001",
    "name": "Example Product",
    "description": "Example product description",
    "businessId": "B001",
    "createdAt": "2026-09-20T12:00:00Z"
  }
}
```

### Possible Errors

```text
401 INVALID_API_KEY
404 PRODUCT_NOT_FOUND
```

---

# 9. Product Verification API

## 9.1 Verify Product

### Endpoint

```http
GET /api/products/:productId/verify
```

### Purpose

Verifies whether a product has a corresponding blockchain-backed registration.

### Authentication

Required.

### Example

```http
GET /api/products/P1001/verify
```

### Processing Flow

```text
Request
   │
   ▼
BaaS API
   │
   ▼
Product Service
   │
   ▼
MultiChain Service
   │
   ▼
Products Stream
   │
   ▼
Find Product Record
   │
   ▼
Verification Result
```

### Success Response

```json
{
  "success": true,
  "data": {
    "productId": "P1001",
    "verified": true,
    "transactionId": "abc123",
    "registeredAt": "2026-09-20T12:00:00Z"
  }
}
```

If no blockchain registration exists:

```json
{
  "success": true,
  "data": {
    "productId": "P1001",
    "verified": false
  }
}
```

### Important Design Decision

Verification shall query the blockchain-backed record rather than simply checking whether the product exists in PostgreSQL.

This ensures that the verification feature demonstrates an actual use of blockchain.

---

# 10. Ownership API

## 10.1 Transfer Ownership

### Endpoint

```http
POST /api/products/:productId/ownership
```

### Purpose

Transfers the ownership of a registered product to another participating business.

### Authentication

Required.

### Request

```json
{
  "newOwner": "B002"
}
```

### Processing Flow

```text
Business
   │
   │ POST ownership
   ▼
BaaS API
   │
   ▼
Authenticate
   │
   ▼
Authorize
   │
   ▼
Validate Product
   │
   ▼
Publish Ownership Event
   │
   ▼
MultiChain ownership stream
   │
   ▼
Transaction ID
   │
   ▼
PostgreSQL Transaction Record
```

### Success Response

```http
201 Created
```

```json
{
  "success": true,
  "data": {
    "productId": "P1001",
    "previousOwner": "B001",
    "newOwner": "B002",
    "transactionId": "def456",
    "status": "confirmed"
  }
}
```

### Possible Errors

```text
400 INVALID_REQUEST
401 INVALID_API_KEY
403 INSUFFICIENT_PERMISSION
404 PRODUCT_NOT_FOUND
409 INVALID_OWNERSHIP_TRANSFER
500 BLOCKCHAIN_ERROR
```

---

# 11. Ownership History API

### Endpoint

```http
GET /api/products/:productId/ownership/history
```

### Purpose

Returns the chronological ownership history of a product.

### Example

```http
GET /api/products/P1001/ownership/history
```

### Success Response

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
        "transactionId": "abc123",
        "timestamp": "2026-09-20T12:00:00Z"
      },
      {
        "previousOwner": "B001",
        "newOwner": "B002",
        "event": "OWNERSHIP_TRANSFERRED",
        "transactionId": "def456",
        "timestamp": "2026-09-21T10:00:00Z"
      }
    ]
  }
}
```

The history shall be obtained from the blockchain-backed ownership records.

---

# 12. Warranty API

## 12.1 Record Warranty Event

### Endpoint

```http
POST /api/products/:productId/warranty
```

### Purpose

Records a warranty-related event for a product.

### Request

```json
{
  "event": "WARRANTY_ACTIVATED",
  "startDate": "2026-09-20",
  "durationMonths": 12
}
```

### Supported Event Examples

```text
WARRANTY_ACTIVATED
WARRANTY_EXTENDED
WARRANTY_CLAIMED
WARRANTY_EXPIRED
WARRANTY_CANCELLED
```

The final event types may be refined during implementation.

### Success Response

```http
201 Created
```

```json
{
  "success": true,
  "data": {
    "productId": "P1001",
    "event": "WARRANTY_ACTIVATED",
    "transactionId": "ghi789",
    "status": "confirmed"
  }
}
```

---

# 13. Warranty History API

### Endpoint

```http
GET /api/products/:productId/warranty
```

### Purpose

Retrieves the warranty history of a product.

### Success Response

```json
{
  "success": true,
  "data": {
    "productId": "P1001",
    "events": [
      {
        "event": "WARRANTY_ACTIVATED",
        "startDate": "2026-09-20",
        "durationMonths": 12,
        "transactionId": "ghi789",
        "timestamp": "2026-09-20T12:10:00Z"
      }
    ]
  }
}
```

---

# 14. Supply-Chain API

## 14.1 Record Supply-Chain Event

### Endpoint

```http
POST /api/products/:productId/supply-chain/events
```

### Purpose

Records a new supply-chain event for a product.

### Request

```json
{
  "event": "SHIPPED",
  "location": "Warehouse-A"
}
```

A more detailed request may contain:

```json
{
  "event": "SHIPPED",
  "from": "Manufacturer",
  "to": "Warehouse-A",
  "location": "Karachi",
  "notes": "Shipment dispatched"
}
```

### Supported Event Examples

```text
MANUFACTURED
SHIPPED
WAREHOUSE_RECEIVED
DISTRIBUTOR_RECEIVED
RETAILER_RECEIVED
```

### Processing Flow

```text
Business
   │
   ▼
Supply Chain API
   │
   ▼
Authentication
   │
   ▼
Authorization
   │
   ▼
Validate Event
   │
   ▼
Supply Chain Service
   │
   ▼
MultiChain Service
   │
   ▼
supply_chain stream
```

### Success Response

```http
201 Created
```

```json
{
  "success": true,
  "data": {
    "productId": "P1001",
    "event": "SHIPPED",
    "transactionId": "jkl012",
    "status": "confirmed"
  }
}
```

---

# 15. Supply-Chain History API

### Endpoint

```http
GET /api/products/:productId/supply-chain/history
```

### Purpose

Retrieves the complete blockchain-backed supply-chain history of a product.

### Success Response

```json
{
  "success": true,
  "data": {
    "productId": "P1001",
    "events": [
      {
        "event": "MANUFACTURED",
        "location": "Factory-A",
        "timestamp": "2026-09-20T08:00:00Z",
        "transactionId": "tx001"
      },
      {
        "event": "SHIPPED",
        "location": "Warehouse-A",
        "timestamp": "2026-09-20T10:00:00Z",
        "transactionId": "tx002"
      },
      {
        "event": "WAREHOUSE_RECEIVED",
        "location": "Warehouse-A",
        "timestamp": "2026-09-20T14:00:00Z",
        "transactionId": "tx003"
      }
    ]
  }
}
```

---

# 16. API Endpoint Summary

| Method | Endpoint                                 | Purpose                        |
| ------ | ---------------------------------------- | ------------------------------ |
| `POST` | `/api/products`                          | Register product               |
| `GET`  | `/api/products/:id`                      | Get product                    |
| `GET`  | `/api/products/:id/verify`               | Verify blockchain registration |
| `POST` | `/api/products/:id/ownership`            | Transfer ownership             |
| `GET`  | `/api/products/:id/ownership/history`    | Get ownership history          |
| `POST` | `/api/products/:id/warranty`             | Record warranty event          |
| `GET`  | `/api/products/:id/warranty`             | Get warranty history           |
| `POST` | `/api/products/:id/supply-chain/events`  | Record supply-chain event      |
| `GET`  | `/api/products/:id/supply-chain/history` | Get supply-chain history       |

---

# 17. HTTP Status Codes

The API shall use standard HTTP status codes.

| Status                      | Meaning                                  |
| --------------------------- | ---------------------------------------- |
| `200 OK`                    | Successful retrieval or operation        |
| `201 Created`               | Resource/event successfully created      |
| `400 Bad Request`           | Invalid request data                     |
| `401 Unauthorized`          | Missing or invalid API credentials       |
| `403 Forbidden`             | Authenticated business lacks permission  |
| `404 Not Found`             | Requested resource does not exist        |
| `409 Conflict`              | Request conflicts with current state     |
| `500 Internal Server Error` | Unexpected server error                  |
| `502 Bad Gateway`           | Blockchain service unavailable or failed |

---

# 18. Error Format

All errors shall use a consistent structure.

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description"
  }
}
```

Example:

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_PERMISSION",
    "message": "Business is not authorized to perform this operation"
  }
}
```

---

# 19. Blockchain Abstraction

The API must not expose MultiChain-specific implementation details.

### Business sees:

```http
POST /api/products/P1001/supply-chain/events
```

### Business does NOT see:

```text
MultiChain RPC
publish
supply_chain
txid
stream permissions
node addresses
```

Internally, the BaaS platform may perform operations conceptually equivalent to:

```text
REST Request
     ↓
SupplyChainService
     ↓
MultiChainClient
     ↓
JSON-RPC
     ↓
MultiChain
     ↓
Stream Publication
```

This separation is essential to the BaaS architecture.

---

# 20. API-to-Blockchain Mapping

| API Operation             | MultiChain Operation                               |
| ------------------------- | -------------------------------------------------- |
| Register product          | Publish to `products` stream                       |
| Verify product            | Query `products` stream                            |
| Transfer ownership        | Publish to `ownership` stream                      |
| Get ownership history     | Query `ownership` stream                           |
| Record warranty           | Publish to `warranty` stream                       |
| Get warranty history      | Query `warranty` stream                            |
| Record supply-chain event | Publish to `supply_chain` stream                   |
| Get supply-chain history  | Query `supply_chain` stream                        |
| Business authorization    | Application authorization + MultiChain permissions |

The exact MultiChain RPC commands will be defined inside the blockchain integration layer and shall not form part of the public API contract.

---

# 21. API and Database Interaction

The API may interact with both PostgreSQL and MultiChain depending on the operation.

### Product registration

```text
API
 │
 ├── PostgreSQL → Store product
 │
 └── MultiChain → Store registration event
```

### Product verification

```text
API
 │
 └── MultiChain → Verify blockchain record
```

### Ownership transfer

```text
API
 │
 ├── MultiChain → Store ownership event
 │
 └── PostgreSQL → Store transaction information
```

### History retrieval

```text
API
 │
 └── MultiChain → Retrieve event history
```

---

# 22. Idempotency and Duplicate Requests

The API should prevent accidental duplicate blockchain operations.

For operations such as product registration, the system shall verify whether the product has already been registered before publishing another registration event.

For future production versions, an idempotency-key mechanism may be introduced for operations that can safely be retried.

This is not required for the initial MVP unless implementation experience demonstrates a need for it.

---

# 23. API Versioning

The initial API shall use:

```text
/api
```

If future breaking changes are required, versioning can be introduced:

```text
/api/v1
/api/v2
```

API versioning is not required for the MVP.

---

# 24. Security Requirements

The API shall:

* Require authentication for business operations.
* Never expose API keys in responses.
* Validate all request bodies.
* Validate product identifiers.
* Validate event types.
* Enforce business-level authorization.
* Enforce blockchain-level permissions.
* Avoid trusting client-provided business identity information.
* Record blockchain transaction IDs.
* Return generic error messages where exposing internal details would create a security risk.

The API shall never accept a blockchain address from the client as proof of identity.

Instead:

```text
API Key
   ↓
Authenticated Business
   ↓
Associated Blockchain Identity
```

---

# 25. Example Complete Workflow

A complete product lifecycle through the API may look like:

### Step 1 — Register Product

```http
POST /api/products
```

```json
{
  "productId": "P1001",
  "name": "Laptop X"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "productId": "P1001",
    "transactionId": "tx001",
    "status": "confirmed"
  }
}
```

### Step 2 — Verify Product

```http
GET /api/products/P1001/verify
```

Response:

```json
{
  "success": true,
  "data": {
    "productId": "P1001",
    "verified": true,
    "transactionId": "tx001"
  }
}
```

### Step 3 — Transfer Ownership

```http
POST /api/products/P1001/ownership
```

```json
{
  "newOwner": "B002"
}
```

### Step 4 — Record Supply-Chain Event

```http
POST /api/products/P1001/supply-chain/events
```

```json
{
  "event": "SHIPPED",
  "location": "Warehouse-A"
}
```

### Step 5 — Retrieve Supply-Chain History

```http
GET /api/products/P1001/supply-chain/history
```

The response contains the blockchain-backed product lifecycle.

---

# 26. API Design Principles

The API follows these principles:

### 26.1 Simple for Web2 Developers

A developer should only need knowledge of:

```text
HTTP
JSON
REST
API Keys
```

They should not need to understand MultiChain.

### 26.2 Blockchain-Agnostic Public Interface

The public API describes **business operations**, not blockchain operations.

Good:

```text
POST /products/:id/ownership
```

Not:

```text
POST /multichain/publish/ownership
```

### 26.3 Consistent Responses

All endpoints use consistent success and error structures.

### 26.4 Business-Oriented Resources

Endpoints represent meaningful e-commerce operations rather than exposing internal infrastructure.

### 26.5 Separation of Concerns

```text
REST API
    ↓
Business Services
    ↓
Blockchain Service
    ↓
MultiChain
```

The API layer must not contain raw MultiChain RPC logic.

---

# 27. MVP API

The minimum API required for the first working demonstration is:

```text
POST /api/products
GET  /api/products/:id/verify
POST /api/products/:id/ownership
GET  /api/products/:id/ownership/history
```

After these are working, the following can be added:

```text
POST /api/products/:id/warranty
GET  /api/products/:id/warranty

POST /api/products/:id/supply-chain/events
GET  /api/products/:id/supply-chain/history
```

The MVP demonstration should therefore prove:

```text
Web2 Business
      ↓
REST API
      ↓
BaaS Backend
      ↓
MultiChain
      ↓
Blockchain Record
      ↓
Verification / History
```

This directly demonstrates the core purpose of the project: **providing blockchain capabilities to an existing Web2 business through a simple API without requiring the business to manage or understand the underlying blockchain infrastructure.**