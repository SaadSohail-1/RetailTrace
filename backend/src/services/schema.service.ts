import type { SchemaField, Schema } from "../types/schema.types.js";
import { schemaRepository } from "../repositories/schema.repository.js";

export interface CreateSchemaInput {
    name: string;
    fields: SchemaField[];
}

export class SchemaServiceError extends Error {
    constructor(
        public readonly code: "INVALID_SCHEMA" | "SCHEMA_NOT_FOUND",
        message: string
    ) {
        super(message);
    }
}

function buildJsonSchema(fields: SchemaField[]): Record<string, unknown> {
    const properties: Record<string, { type: SchemaField["type"] }> = {};
    const required: string[] = [];

    for (const field of fields) {
        properties[field.name] = { type: field.type };
        if (field.required) {
            required.push(field.name);
        }
    }

    const jsonSchema: Record<string, unknown> = {
        type: "object",
        properties
    };

    if (required.length > 0) {
        jsonSchema.required = required;
    }

    return jsonSchema;
}

function validateCreateInput(input: CreateSchemaInput): void {
    if (!input || typeof input.name !== "string" || input.name.trim() === "") {
        throw new SchemaServiceError("INVALID_SCHEMA", "Schema name is required");
    }

    if (!Array.isArray(input.fields) || input.fields.length === 0) {
        throw new SchemaServiceError(
            "INVALID_SCHEMA",
            "Schema must contain at least one field"
        );
    }

    const fieldNames = new Set<string>();
    for (const field of input.fields) {
        if (
            !field ||
            typeof field.name !== "string" ||
            field.name.trim() === "" ||
            fieldNames.has(field.name) ||
            typeof field.required !== "boolean"
        ) {
            throw new SchemaServiceError(
                "INVALID_SCHEMA",
                "Fields must have unique, non-empty names and a required flag"
            );
        }

        if (!["string", "number", "integer", "boolean"].includes(field.type)) {
            throw new SchemaServiceError(
                "INVALID_SCHEMA",
                "Each field must have a supported type"
            );
        }

        fieldNames.add(field.name);
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
            schema: buildJsonSchema(input.fields)
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