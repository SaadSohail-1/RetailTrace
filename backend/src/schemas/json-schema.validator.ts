import { Ajv, type ErrorObject, type ValidateFunction } from "ajv";
import type { SchemaField, SchemaFieldType } from "../types/schema.types.js";

export interface SchemaDefinition {
    name: string;
    fields: SchemaField[];
}

export interface JsonSchemaValidationError {
    instancePath: string;
    field: string;
    keyword: string;
    message: string;
}

export interface ValidationResult {
    valid: boolean;
    errors: JsonSchemaValidationError[];
}

export type StoredJsonSchema = Record<string, unknown>;

const supportedFieldTypes: readonly SchemaFieldType[] = [
    "string",
    "number",
    "integer",
    "boolean"
];

const ajv = new Ajv({ allErrors: true, strict: true });

function formatErrors(
    errors: ErrorObject[] | null | undefined
): JsonSchemaValidationError[] {
    return (errors ?? []).map((error) => ({
        instancePath: error.instancePath,
        field: error.instancePath || "data",
        keyword: error.keyword,
        message: error.message ?? "is invalid"
    }));
}

function invalid(message: string): never {
    throw new Error(message);
}

export function validateSchemaDefinition(input: unknown): asserts input is SchemaDefinition {
    if (!input || typeof input !== "object") {
        invalid("Schema must be an object");
    }

    const definition = input as Partial<SchemaDefinition>;
    if (typeof definition.name !== "string" || definition.name.trim() === "") {
        invalid("Schema name is required");
    }

    if (!Array.isArray(definition.fields) || definition.fields.length === 0) {
        invalid("Schema must contain at least one field");
    }

    const fieldNames = new Set<string>();
    for (const field of definition.fields) {
        if (!field || typeof field !== "object") {
            invalid("Each field must be an object");
        }

        const candidate = field as Partial<SchemaField>;
        const fieldName = candidate.name?.trim();
        if (
            !fieldName ||
            fieldNames.has(fieldName) ||
            typeof candidate.required !== "boolean"
        ) {
            invalid("Fields must have unique, non-empty names and a required flag");
        }

        if (
            typeof candidate.type !== "string" ||
            !supportedFieldTypes.includes(candidate.type as SchemaFieldType)
        ) {
            invalid("Each field must have a supported type");
        }

        fieldNames.add(fieldName);
    }
}

export function fieldsToJsonSchema(fields: readonly SchemaField[]): StoredJsonSchema {
    const properties: Record<string, { type: SchemaFieldType }> = {};
    const required: string[] = [];

    for (const field of fields) {
        properties[field.name] = { type: field.type };
        if (field.required) {
            required.push(field.name);
        }
    }

    const schema: StoredJsonSchema = {
        type: "object",
        properties,
        additionalProperties: false
    };

    if (required.length > 0) {
        schema.required = required;
    }

    return schema;
}

export function validateRecordData(
    schema: StoredJsonSchema,
    data: unknown
): ValidationResult {
    let validator: ValidateFunction;
    try {
        validator = ajv.compile(schema);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Stored JSON Schema is invalid";
        return {
            valid: false,
            errors: [{
                instancePath: "",
                field: "schema",
                keyword: "schema",
                message
            }]
        };
    }

    const valid = validator(data);
    return {
        valid,
        errors: valid ? [] : formatErrors(validator.errors)
    };
}

export function assertValidRecordData(
    schema: StoredJsonSchema,
    data: unknown
): void {
    const result = validateRecordData(schema, data);
    if (!result.valid) {
        const details = result.errors
            .map((error) => `${error.field} ${error.message}`)
            .join("; ");
        throw new Error(`Record data failed schema validation: ${details}`);
    }
}