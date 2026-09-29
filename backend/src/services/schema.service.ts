import type { Schema } from "../types/schema.types.js";
import { schemaRepository } from "../repositories/schema.repository.js";
import {
    fieldsToJsonSchema,
    validateSchemaDefinition
} from "../schemas/json-schema.validator.js";

export interface CreateSchemaInput {
    name: string;
    fields: CreateSchemaField[];
}

interface CreateSchemaField {
    name: string;
    type: "string" | "number" | "integer" | "boolean";
    required: boolean;
}

export class SchemaServiceError extends Error {
    constructor(
        public readonly code: "INVALID_SCHEMA" | "SCHEMA_NOT_FOUND",
        message: string
    ) {
        super(message);
    }
}

function validateCreateInput(input: CreateSchemaInput): void {
    try {
        validateSchemaDefinition(input);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Invalid schema";
        throw new SchemaServiceError("INVALID_SCHEMA", message);
    }
}

function toSummary(schema: Schema) {
    return {
        schemaId: String(schema._id),
        name: schema.name,
        version: schema.version
    };
}

export class SchemaService {
    async create(businessId: string, input: CreateSchemaInput) {
        validateCreateInput(input);

        const schema = await schemaRepository.create({
            businessId,
            name: input.name.trim(),
            version: 1,
            fields: input.fields,
            schema: fieldsToJsonSchema(input.fields)
        });

        return toSummary(schema);
    }

    async list(businessId: string) {
        const schemas = await schemaRepository.findByBusinessId(businessId);
        return schemas.map(toSummary);
    }

    async getById(businessId: string, schemaId: string) {
        const schema = await schemaRepository.findByIdAndBusinessId(
            schemaId,
            businessId
        );

        if (!schema) {
            throw new SchemaServiceError("SCHEMA_NOT_FOUND", "Schema not found");
        }

        return {
            ...toSummary(schema),
            schema: schema.schema
        };
    }
}

export const schemaService = new SchemaService();