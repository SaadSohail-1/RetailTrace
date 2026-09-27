# Blockchain Services

These services provide the application layer for interacting with the RetailTrace blockchain.

## `record.service.ts`

Handles generic blockchain records using the `records` MultiChain stream.

### `publishRecord`

Publishes a record to the blockchain.

```ts
publishRecord(record, fromAddress)
```

* `record`: `BlockchainRecord`
* `fromAddress`: Business's MultiChain address
* Returns: `BlockchainResult`
* The returned status is initially `PENDING`.

Example:

```ts
const result = await publishRecord(record, businessAddress);
```

### `getRecord`

Retrieves the latest blockchain record by `recordId`.

```ts
getRecord(recordId)
```

Returns the `BlockchainRecord` or `null` if not found.

### `verifyRecord`

Checks whether a record exists on the blockchain.

```ts
verifyRecord(recordId)
```

Returns:

```ts
{
    recordId,
    verified,
    transactionId
}
```

### `getRecordHistory`

Returns all blockchain versions of a record.

```ts
getRecordHistory(recordId)
```

Each history item includes the record, transaction ID, block time, and confirmations.

### `getRecordByTransaction`

Retrieves a record using its MultiChain transaction ID.

```ts
getRecordByTransaction(transactionId)
```

Returns the `BlockchainRecord` or `null`.

---

## `identity.service.ts`

Handles creation and configuration of a business's MultiChain identity.

### `createBusinessIdentity`

Creates a new MultiChain address and grants it the required `records.write` permission.

```ts
const identity = await createBusinessIdentity();
```

Returns:

```ts
{
    blockchainAddress: string
}
```

The returned address should later be associated with the business by the application/database layer.

The identity service does **not** handle:

* Business accounts
* API keys
* MongoDB
* Business IDs
* Authentication

Those responsibilities belong to the application/authentication layer.
