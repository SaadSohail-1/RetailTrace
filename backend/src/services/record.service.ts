import { env } from "../config/env.js";
import {
    publishRecord,
    verifyRecord as verifyBlockchainRecord
} from "../blockchain/record.service.js";
import { recordRepository } from "../repositories/record.repository.js";
import { schemaRepository } from "../repositories/schema.repository.js";
import { validateRecordData } from "../schemas/json-schema.validator.js";
import type { BlockchainStatus } from "../types/blockchain.types.js";

export interface CreateRecordInput {
    schemaId: string;
    data: Record<string, unknown>;
}

export class RecordServiceError extends Error {
    constructor(
        public readonly code:
            | "INVALID_INPUT"
            | "SCHEMA_NOT_FOUND"
            | "INVALID_RECORD"
            | "RECORD_NOT_FOUND"
            | "BLOCKCHAIN_NOT_CONFIGURED",
        message: string,
        public readonly details?: unknown
    ) {
        super(message);
        this.name = "RecordServiceError";
    }
}

function toRecordResponse(record: {
    _id: unknown;
    businessId: string;
    schemaId: string;
    data: Record<string, unknown>;
    transactionId?: string;
    status: BlockchainStatus;
    createdAt: Date;
}) {
    return {
        recordId: String(record._id),
        businessId: record.businessId,
        schemaId: record.schemaId,
        data: record.data,
        transactionId: record.transactionId ?? null,
        status: record.status,
        createdAt: record.createdAt.toISOString()
    };
}

function validateInput(input: CreateRecordInput): void {
    if (
        !input ||
        typeof input !== "object" ||
        typeof input.schemaId !== "string" ||
        input.schemaId.trim().length === 0 ||
        !input.data ||
        typeof input.data !== "object" ||
        Array.isArray(input.data)
    ) {
        throw new RecordServiceError(
            "INVALID_INPUT",
            "schemaId and an object-valued data field are required"
        );
    }
}

function validateRecordId(recordId: string): void {
    if (typeof recordId !== "string" || recordId.trim().length === 0) {
        throw new RecordServiceError("INVALID_INPUT", "A valid recordId is required");
    }
}

export class RecordService {
    async create(businessId: string, input: CreateRecordInput) {
        validateInput(input);

        const schema = await schemaRepository.findByIdAndBusinessId(
            input.schemaId.trim(),
            businessId
        );
        if (!schema) {
            throw new RecordServiceError("SCHEMA_NOT_FOUND", "Schema not found");
        }

        const validation = validateRecordData(schema.schema, input.data);
        if (!validation.valid) {
            throw new RecordServiceError(
                "INVALID_RECORD",
                "Record data failed schema validation",
                validation.errors
            );
        }

        if (!env.MULTICHAIN_ADDRESS) {
            throw new RecordServiceError(
                "BLOCKCHAIN_NOT_CONFIGURED",
                "Blockchain publishing address is not configured"
            );
        }

        const record = await recordRepository.create({
            businessId,
            schemaId: input.schemaId.trim(),
            data: input.data,
            status: "PENDING"
        });

        const recordId = String(record._id);
        try {
            const blockchainResult = await publishRecord(
                {
                    recordId,
                    businessId,
                    schemaId: input.schemaId.trim(),
                    data: input.data
                },
                env.MULTICHAIN_ADDRESS
            );

            const updatedRecord = await recordRepository.updateById(recordId, {
                transactionId: blockchainResult.transactionId,
                status: blockchainResult.status
            });
            return toRecordResponse(updatedRecord ?? {
                ...record,
                transactionId: blockchainResult.transactionId,
                status: blockchainResult.status
            });
        } catch (error) {
            await recordRepository.deleteById(recordId);
            throw error;
        }
    }

    async getById(businessId: string, recordId: string) {
        validateRecordId(recordId);

        const record = await recordRepository.findById(recordId);
        if (!record || record.businessId !== businessId) {
            throw new RecordServiceError("RECORD_NOT_FOUND", "Record not found");
        }

        return toRecordResponse(record);
    }

    async verify(businessId: string, recordId: string) {
        validateRecordId(recordId);

        const record = await recordRepository.findById(recordId);
        if (!record || record.businessId !== businessId) {
            throw new RecordServiceError("RECORD_NOT_FOUND", "Record not found");
        }

        return verifyBlockchainRecord(recordId);
    }

}

export const recordService = new RecordService();
