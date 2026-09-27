
# MultiChain Streams

## Overview

RetailTrace uses MultiChain streams to store generic application
records on the blockchain.

The application currently uses a single `records` stream.

```text
retailtrace
│
├── root
│
└── records
    ├── record:P1001
    ├── record:P1002
    └── ...
```

## Records

Each record uses the following stream key:

```text
record:<recordId>
```

Example:

```text
record:P1001
```

The stream payload contains a generic RetailTrace record:

```json
{
  "json": {
    "recordId": "P1001",
    "businessId": "B1001",
    "schemaId": "SCHEMA001",
    "data": {
      "name": "Laptop X",
      "price": 250000
    }
  }
}
```

MultiChain stores the record without interpreting its business meaning.

Business-specific logic remains in the RetailTrace application layer.

## Configuration

| Property                   | Value         |
| -------------------------- | ------------- |
| Stream                     | `records`     |
| Write access               | Restricted    |
| Read access                | Unrestricted |
| Subscription               | Enabled       |
| Item/key/publisher indexes | Enabled       |

Publishing requires the stream-specific permission:

```text
records.write
```

Business-specific blockchain identities and permissions will be handled in issue #37.

## Verification

The stream was verified by publishing and retrieving a test record:

```bash
multichain-cli retailtrace publishfrom \
  "<address>" \
  records \
  "record:P1001" \
  '<json-payload>'
```

The record was retrieved with:

```bash
multichain-cli retailtrace liststreamkeyitems \
  records \
  "record:P1001"
```

