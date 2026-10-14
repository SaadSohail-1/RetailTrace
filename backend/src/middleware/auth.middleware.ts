import type { NextFunction, Request, Response } from "express";
import { createHash } from "node:crypto";
import { authService } from "../services/auth.service.js";
import type { ApiError } from "../types/api.types.js";

declare global {
    namespace Express {
        interface Request {
            auth: {
                businessId: string;
            };
        }
    }
}

function sendUnauthorized(response: Response, message: string) {
    const body: ApiError = {
        success: false,
        error: { code: "UNAUTHORIZED", message }
    };
    return response.status(401).json(body);
}

export async function authenticateApiKey(
    request: Request,
    response: Response,
    next: NextFunction
) {
    const apiKey = request.header("x-api-key");
    if (!apiKey || apiKey.trim().length === 0) {
        return sendUnauthorized(response, "An API key is required");
    }

    try {
        const apiKeyHash = createHash("sha256").update(apiKey).digest("hex");
        const business = await authService.findByApiKeyHash(apiKeyHash);
        if (!business) {
            return sendUnauthorized(response, "Invalid API key");
        }

        request.auth = { businessId: String(business._id) };
        return next();
    } catch (error) {
        return next(error);
    }
}
