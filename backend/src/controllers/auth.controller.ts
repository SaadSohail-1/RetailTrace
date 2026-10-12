import type { Request, Response } from "express";
import type { ApiError, ApiSuccess } from "../types/api.types.js";
import {
    authService,
    AuthServiceError,
    type LoginInput,
    type SignupInput
} from "../services/auth.service.js";

function sendError(
    response: Response,
    status: number,
    code: ApiError["error"]["code"],
    message: string
) {
    const body: ApiError = { success: false, error: { code, message } };
    return response.status(status).json(body);
}

function handleError(response: Response, error: unknown) {
    if (!(error instanceof AuthServiceError)) {
        return sendError(response, 500, "INTERNAL_SERVER_ERROR", "Internal server error");
    }

    const status = error.code === "INVALID_CREDENTIALS" ? 401 :
        error.code === "BUSINESS_NOT_FOUND" ? 404 :
        error.code === "EMAIL_ALREADY_EXISTS" ? 409 : 400;
    return sendError(response, status, error.code, error.message);
}

export async function signup(request: Request, response: Response) {
    try {
        const result = await authService.signup(request.body as SignupInput);
        const body: ApiSuccess<typeof result> = { success: true, data: result };
        return response.status(201).json(body);
    } catch (error) {
        return handleError(response, error);
    }
}

export async function login(request: Request, response: Response) {
    try {
        const result = await authService.login(request.body as LoginInput);
        const body: ApiSuccess<typeof result> = { success: true, data: result };
        return response.json(body);
    } catch (error) {
        return handleError(response, error);
    }
}

export async function me(request: Request, response: Response) {
    try {
        const result = await authService.getBusinessById(request.auth.businessId);
        const body: ApiSuccess<typeof result> = { success: true, data: result };
        return response.json(body);
    } catch (error) {
        return handleError(response, error);
    }
}
