import { MongoClient, type Db, type Document } from "mongodb";
import { env } from "../config/env.js";

const COLLECTIONS = {
    businesses: "businesses",
    businessIdentities: "business_identities",
    schemas: "schemas",
    records: "records"
} as const;

const validators: Record<string, Document> = {
    businesses: {
        $jsonSchema: {
            bsonType: "object",
            required: ["name", "email", "passwordHash", "apiKeyHash", "createdAt"],
            additionalProperties: false,
            properties: {
                name: { bsonType: "string" },
                email: { bsonType: "string" },
                passwordHash: { bsonType: "string" },
                apiKeyHash: { bsonType: "string" },
                createdAt: { bsonType: "date" },
                updatedAt: { bsonType: "date" }
            }
        }
    },
    business_identities: {
        $jsonSchema: {
            bsonType: "object",
            required: ["businessId", "blockchainAddress", "createdAt", "updatedAt"],
            additionalProperties: false,
            properties: {
                businessId: { bsonType: "string" },
                blockchainAddress: { bsonType: "string" },
                createdAt: { bsonType: "date" },
                updatedAt: { bsonType: "date" }
            }
        }
    },
    schemas: {
        $jsonSchema: {
            bsonType: "object",
            required: ["businessId", "name", "version", "fields", "schema", "createdAt"],
            properties: {
                businessId: { bsonType: "string" },
                name: { bsonType: "string" },
                version: { bsonType: "int", minimum: 1 },
                fields: { bsonType: "array" },
                schema: { bsonType: "object" },
                createdAt: { bsonType: "date" }
            }
        }
    },
    records: {
        $jsonSchema: {
            bsonType: "object",
            required: ["businessId", "schemaId", "data", "status", "createdAt"],
            properties: {
                businessId: { bsonType: "string" },
                schemaId: { bsonType: "string" },
                data: { bsonType: "object" },
                transactionId: { bsonType: "string" },
                status: { enum: ["PENDING", "CONFIRMED", "FAILED"] },
                createdAt: { bsonType: "date" }
            }
        }
    }
};

async function ensureCollection(db: Db, name: string) {
    const validator = validators[name];
    if (!validator) throw new Error(`Missing validator for collection: ${name}`);

    const existing = await db.listCollections({ name }, { nameOnly: true }).hasNext();

    if (!existing) {
        await db.createCollection(name, {
            validator,
            validationLevel: "strict",
            validationAction: "error"
        });
        return;
    }

    await db.command({
        collMod: name,
        validator,
        validationLevel: "strict",
        validationAction: "error"
    });
}

async function migrate() {
    if (!env.MONGODB_URI || !env.MONGODB_DATABASE) {
        throw new Error("MONGODB_URI and MONGODB_DATABASE must be configured");
    }

    const client = new MongoClient(env.MONGODB_URI);

    try {
        await client.connect();
        const db = client.db(env.MONGODB_DATABASE);

        await ensureCollection(db, COLLECTIONS.businesses);
        await ensureCollection(db, COLLECTIONS.businessIdentities);
        await ensureCollection(db, COLLECTIONS.schemas);
        await ensureCollection(db, COLLECTIONS.records);

        await db.collection(COLLECTIONS.businesses).createIndex(
            { email: 1 },
            { unique: true, name: "business_email_unique" }
        );

        await db.collection(COLLECTIONS.businessIdentities).createIndex(
            { businessId: 1 },
            { unique: true, name: "identity_business_unique" }
        );
        await db.collection(COLLECTIONS.businessIdentities).createIndex(
            { blockchainAddress: 1 },
            { unique: true, name: "identity_blockchain_address_unique" }
        );

        await db.collection(COLLECTIONS.schemas).createIndex(
            { businessId: 1, name: 1, version: 1 },
            { unique: true, name: "schema_business_name_version_unique" }
        );
        await db.collection(COLLECTIONS.schemas).createIndex(
            { businessId: 1 },
            { name: "schema_business" }
        );

        await db.collection(COLLECTIONS.records).createIndex(
            { businessId: 1 },
            { name: "record_business" }
        );
        await db.collection(COLLECTIONS.records).createIndex(
            { businessId: 1, schemaId: 1 },
            { name: "record_business_schema" }
        );
        await db.collection(COLLECTIONS.records).createIndex(
            { transactionId: 1 },
            { unique: true, sparse: true, name: "record_transaction_unique" }
        );

        console.log("MongoDB collections, validators, and indexes are ready");
    } finally {
        await client.close();
    }
}

await migrate();