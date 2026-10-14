import type { Request, Response } from "express";
import type { ApiError, ApiSuccess } from "../types/api.types.js";
import {
    RecordServiceError,
    recordService,
    type CreateRecordInput
} from "../services/record.service.js";

function sendError(
    response: Response,
    status: number,
    code: ApiError["error"]["code"],
    message: string,
    details?: unknown
) {
    const error: ApiError["error"] & { details?: unknown } = {
        code,
        message
    };
    if (details !== undefined) {
        error.details = details;
    }
    return response.status(status).json({ success: false, error });
}

function handleError(response: Response, error: unknown) {
    if (!(error instanceof RecordServiceError)) {
        return sendError(response, 500, "INTERNAL_SERVER_ERROR", "Internal server error");
    }

    const status =
        error.code === "SCHEMA_NOT_FOUND" || error.code === "RECORD_NOT_FOUND"
            ? 404
            : error.code === "BLOCKCHAIN_NOT_CONFIGURED"
                ? 500
                : error.code === "PROCESSING_FAILED"
                    ? 502
                : error.code === "INVALID_INPUT" || error.code === "INVALID_RECORD"
                    ? 400
                    : 500;

    return sendError(response, status, error.code, error.message, error.details);
}

export async function createRecord(request: Request, response: Response) {
    try {
        const result = await recordService.create(
            request.auth.businessId,
            request.body as CreateRecordInput
        );
        const body: ApiSuccess<typeof result> = { success: true, data: result };
        return response.status(201).json(body);
    } catch (error) {
        return handleError(response, error);
    }
}

export async function getRecord(request: Request, response: Response) {
    try {
        const result = await recordService.getById(
            request.auth.businessId,
            typeof request.params.recordId === "string"
                ? request.params.recordId
                : ""
        );
        const body: ApiSuccess<typeof result> = { success: true, data: result };
        return response.json(body);
    } catch (error) {
        return handleError(response, error);
    }
}

export async function verifyRecord(request: Request, response: Response) {
    try {
        const result = await recordService.verify(
            request.auth.businessId,
            typeof request.params.recordId === "string"
                ? request.params.recordId
                : ""
        );
        const body: ApiSuccess<typeof result> = { success: true, data: result };
        return response.json(body);
    } catch (error) {
        return handleError(response, error);
    }
}
