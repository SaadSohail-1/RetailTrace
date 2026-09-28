import type { Request, Response } from "express";
import type { ApiError, ApiSuccess } from "../types/api.types.js";
import {
    schemaService,
    SchemaServiceError,
    type CreateSchemaInput
} from "../services/schema.service.js";

type AuthenticatedRequest = Request & {
    auth: {
        businessId: string;
    };
};

function sendError(
    response: Response,
    status: number,
    code: ApiError["error"]["code"],
    message: string
) {
    const body: ApiError = {
        success: false,
        error: { code, message }
    };
    return response.status(status).json(body);
}

function handleServiceError(response: Response, error: unknown) {
    if (!(error instanceof SchemaServiceError)) {
        return sendError(response, 500, "INTERNAL_SERVER_ERROR", "Internal server error");
    }

    if (error.code === "SCHEMA_NOT_FOUND") {
        return sendError(response, 404, error.code, error.message);
    }

    return sendError(response, 400, error.code, error.message);
}

export async function createSchema(request: AuthenticatedRequest, response: Response) {
    try {
        const result = await schemaService.create(
            request.auth.businessId,
            request.body as CreateSchemaInput
        );
        const body: ApiSuccess<typeof result> = { success: true, data: result };
        return response.status(201).json(body);
    } catch (error) {
        return handleServiceError(response, error);
    }
}

export async function listSchemas(request: AuthenticatedRequest, response: Response) {
    const result = await schemaService.list(request.auth.businessId);
    const body: ApiSuccess<typeof result> = { success: true, data: result };
    return response.json(body);
}

export async function getSchema(request: AuthenticatedRequest, response: Response) {
    try {
        const { schemaID } = request.params;
        if (typeof schemaID !== "string" || schemaID.length === 0) {
            return sendError(
                response,
                400,
                "INVALID_SCHEMA_ID",
                "A valid schemaID is required"
            );
        }

        const result = await schemaService.getById(
            request.auth.businessId,
            schemaID
        );
        const body: ApiSuccess<typeof result> = { success: true, data: result };
        return response.json(body);
    } catch (error) {
        return handleServiceError(response, error);
    }
}