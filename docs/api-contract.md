# RetailTrace API Contract

## 1. Base

Base path:

```text
/api
```

Business API requests use:

```http
X-API-Key: <api-key>
```

Standard success:

```json
{
  "success": true,
  "data": {}
}
```

Standard error:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message"
  }
}
```

---

# 2. Business Authentication

## POST `/api/auth/signup`

Create a business account.

Request:

```json
{
  "name": "TechStore",
  "email": "admin@techstore.com",
  "password": "password123"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "businessId": "BUS001",
    "name": "TechStore",
    "email": "admin@techstore.com",
    "apiKey": "rt_live_********"
  }
}
```

The API key is generated during signup and shown to the business once. Only its hash is stored.

### Controller

```text
auth.controller.ts
```

### Service

```text
auth.service.ts
```

---

## POST `/api/auth/login`

Authenticate a business account.

Request:

```json
{
  "email": "admin@techstore.com",
  "password": "password123"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "businessId": "BUS001",
    "name": "TechStore",
    "email": "admin@techstore.com"
  }
}
```

### Controller

```text
auth.controller.ts
```

### Service

```text
auth.service.ts
```

---

## GET `/api/auth/me`

Return the currently authenticated business.

Response:

```json
{
  "success": true,
  "data": {
    "businessId": "BUS001",
    "name": "TechStore",
    "email": "admin@techstore.com"
  }
}
```

### Controller

```text
auth.controller.ts
```

### Service

```text
auth.service.ts
```

---

# 3. Schema API

A business can have multiple schemas.

The frontend provides a schema-builder form. The backend converts the submitted field definitions into JSON Schema and stores it.

## POST `/api/schemas`

Create a schema for the authenticated business.

Request:

```json
{
  "name": "LaptopProduct",
  "fields": [
    {
      "name": "productId",
      "type": "string",
      "required": true
    },
    {
      "name": "name",
      "type": "string",
      "required": true
    },
    {
      "name": "price",
      "type": "number",
      "required": true
    }
  ]
}
```

Response:

```json
{
  "success": true,
  "data": {
    "schemaId": "SCHEMA001",
    "name": "LaptopProduct",
    "version": 1
  }
}
```

### Controller

```text
schema.controller.ts
```

### Service

```text
schema.service.ts
```

---

## GET `/api/schemas`

Return all schemas belonging to the authenticated business.

Response:

```json
{
  "success": true,
  "data": [
    {
      "schemaId": "SCHEMA001",
      "name": "LaptopProduct",
      "version": 1
    },
    {
      "schemaId": "SCHEMA002",
      "name": "SmartphoneProduct",
      "version": 1
    }
  ]
}
```

### Controller

```text
schema.controller.ts
```

### Service

```text
schema.service.ts
```

---

## GET `/api/schemas/:schemaId`

Return a specific schema belonging to the authenticated business.

Response:

```json
{
  "success": true,
  "data": {
    "schemaId": "SCHEMA001",
    "name": "LaptopProduct",
    "version": 1,
    "schema": {
      "type": "object",
      "properties": {
        "productId": {
          "type": "string"
        },
        "name": {
          "type": "string"
        },
        "price": {
          "type": "number"
        }
      },
      "required": [
        "productId",
        "name",
        "price"
      ]
    }
  }
}
```

### Controller

```text
schema.controller.ts
```

### Service

```text
schema.service.ts
```

---

# 4. Record API

A record is business data validated against one of the business's schemas and written to MultiChain.

## POST `/api/records`

Create a blockchain record.

Request:

```json
{
  "schemaId": "SCHEMA001",
  "data": {
    "productId": "P1001",
    "name": "ThinkPad X1",
    "price": 250000
  }
}
```

The backend:

1. Authenticates the business using the API key.
2. Finds the requested schema.
3. Verifies that the schema belongs to the authenticated business.
4. Validates `data` against the schema.
5. Submits the valid data to MultiChain.
6. Generates and stores an internal `recordId`.

Response:

```json
{
  "success": true,
  "data": {
    "recordId": "REC001",
    "transactionId": "abc123...",
    "status": "CONFIRMED"
  }
}
```

### Controller

```text
record.controller.ts
```

### Service

```text
record.service.ts
```

---

## GET `/api/records/:recordId`

Return a record belonging to the authenticated business.

Response:

```json
{
  "success": true,
  "data": {
    "recordId": "REC001",
    "schemaId": "SCHEMA001",
    "data": {
      "productId": "P1001",
      "name": "ThinkPad X1",
      "price": 250000
    },
    "transactionId": "abc123...",
    "status": "CONFIRMED"
  }
}
```

### Controller

```text
record.controller.ts
```

### Service

```text
record.service.ts
```

---

# 5. Verification API

## GET `/api/records/:recordId/verify`

Verify the record against its blockchain transaction.

Response:

```json
{
  "success": true,
  "data": {
    "recordId": "REC001",
    "verified": true,
    "transactionId": "abc123..."
  }
}
```

### Controller

```text
verification.controller.ts
```

### Service

```text
verification.service.ts
```

---

# 6. Backend Components

```text
routes/
├── auth.routes.ts
├── schema.routes.ts
├── record.routes.ts
└── verification.routes.ts
```

```text
controllers/
├── auth.controller.ts
├── schema.controller.ts
├── record.controller.ts
└── verification.controller.ts
```

```text
services/
├── auth.service.ts
├── schema.service.ts
├── record.service.ts
└── verification.service.ts
```

Blockchain interaction remains separate:

```text
blockchain/
├── multichain-client.ts
└── blockchain.service.ts
```

Request flow:

```text
Route
  ↓
Controller
  ↓
Service
  ↓
MongoDB / Blockchain Service
```
