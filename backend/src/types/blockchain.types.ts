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

export interface RecordVerificationResult {
    recordId: string;
    verified: boolean;
    transactionId: string | null;
}

export interface BlockchainService {
    publishRecord(
        record: BlockchainRecord
    ): Promise<BlockchainResult>;

    getRecord(
        recordId: string
    ): Promise<BlockchainRecord | null>;

    verifyRecord(
        recordId: string
    ) : Promise<RecordVerificationResult>
}