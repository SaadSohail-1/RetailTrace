export type SchemaFieldType = 
    | "string"
    | "number"
    | "integer"
    | "boolean";

export interface SchemaField {
    name: string;
    type: SchemaFieldType;
    required: boolean;
}

export interface Schema {
    id: string;
    businessId: string;
    name: string;
    version: number;
    fields: SchemaField[];
    schema: Record<string, unknown>;
    createdAt: string;
}