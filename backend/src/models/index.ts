import { model, Schema, type Model } from "mongoose";
import type { BlockchainStatus } from "../types/blockchain.types.js";
import type { SchemaField } from "../types/schema.types.js";

interface TimestampFields {
    createdAt: Date;
    updatedAt: Date;
}

export interface BusinessModelType extends TimestampFields {
    name: string;
    email: string;
    passwordHash: string;
    apiKeyHash: string;
}

export interface BusinessIdentityModelType extends TimestampFields {
    businessId: string;
    blockchainAddress: string;
}

export interface SchemaModelType extends TimestampFields {
    businessId: string;
    name: string;
    version: number;
    fields: SchemaField[];
    schema: Record<string, unknown>;
}

export interface RecordModelType extends TimestampFields {
    businessId: string;
    schemaId: string;
    data: Record<string, unknown>;
    transactionId?: string;
    status: BlockchainStatus;
}

const timestampOptions = { timestamps: true } as const;

const businessSchema = new Schema<BusinessModelType>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        passwordHash: { type: String, required: true },
        apiKeyHash: { type: String, required: true }
    },
    { ...timestampOptions, collection: "businesses", versionKey: false }
);

const businessIdentitySchema = new Schema<BusinessIdentityModelType>(
    {
        businessId: { type: String, required: true },
        blockchainAddress: { type: String, required: true }
    },
    {
        ...timestampOptions,
        collection: "business_identities",
        versionKey: false
    }
);

const schemaSchema = new Schema<SchemaModelType>(
    {
        businessId: { type: String, required: true },
        name: { type: String, required: true },
        version: { type: Number, required: true, min: 1 },
        fields: {
            type: [
                {
                    name: { type: String, required: true },
                    type: {
                        type: String,
                        enum: ["string", "number", "integer", "boolean"],
                        required: true
                    },
                    required: { type: Boolean, required: true }
                }
            ],
            required: true
        },
        schema: { type: Schema.Types.Mixed, required: true }
    },
    { ...timestampOptions, collection: "schemas" }
);

const recordSchema = new Schema<RecordModelType>(
    {
        businessId: { type: String, required: true },
        schemaId: { type: String, required: true },
        data: { type: Schema.Types.Mixed, required: true },
        transactionId: { type: String },
        status: {
            type: String,
            enum: ["PENDING", "CONFIRMED", "FAILED"],
            required: true
        }
    },
    { ...timestampOptions, collection: "records" }
);

export const BusinessModel: Model<BusinessModelType> = model<BusinessModelType>(
    "Business",
    businessSchema
);

export const BusinessIdentityModel: Model<BusinessIdentityModelType> =
    model<BusinessIdentityModelType>("BusinessIdentity", businessIdentitySchema);

export const SchemaModel: Model<SchemaModelType> = model<SchemaModelType>(
    "Schema",
    schemaSchema
);

export const RecordModel: Model<RecordModelType> = model<RecordModelType>(
    "Record",
    recordSchema
);