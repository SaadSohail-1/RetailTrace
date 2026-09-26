import type { BlockchainStatus } from "./blockchain.types.js";

export interface RecordData {
    [key: string]: unknown;
}

export interface Record {
    id: string;
    businessId: string;
    schemaId: string;
    data: RecordData;
    transactionId: string;
    status: BlockchainStatus;
    createdAt: string;
}