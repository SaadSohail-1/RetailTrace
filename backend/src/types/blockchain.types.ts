export type BlockchainStatus =
    | "PENDING"
    | "CONFIRMED"
    | "FAILED";

export interface BlockchainResult {
    transactionId: string;
    status: BlockchainStatus;
}

export interface BlockchainRecord {
    recordId: string;
    businessId: string;
    schemaId: string;
    data: Record<string, unknown>;
}

export interface BlockchainService {
    publishRecord(
        record: BlockchainRecord
    ): Promise<BlockchainResult>;

    getRecord(
        recordId: string
    ): Promise<BlockchainRecord | null>;
}