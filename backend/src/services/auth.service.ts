import {
    createHash,
    randomBytes,
    scrypt as scryptCallback,
    timingSafeEqual
} from "node:crypto";
import { promisify } from "node:util";
import { businessRepository } from "../repositories/business.repository.js";

const scrypt = promisify(scryptCallback);
const PASSWORD_KEY_LENGTH = 64;
const API_KEY_LENGTH = 32;

export interface SignupInput {
    name: string;
    email: string;
    password: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface PublicBusiness {
    businessId: string;
    name: string;
    email: string;
    createdAt: string;
}

export interface SignupResult {
    business: PublicBusiness;
    apiKey: string;
}

export class AuthServiceError extends Error {
    constructor(
        public readonly code:
            | "INVALID_INPUT"
            | "EMAIL_ALREADY_EXISTS"
            | "INVALID_CREDENTIALS"
            | "BUSINESS_NOT_FOUND",
        message: string
    ) {
        super(message);
        this.name = "AuthServiceError";
    }
}

function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

function toPublicBusiness(business: {
    _id: unknown;
    name: string;
    email: string;
    createdAt: Date;
}): PublicBusiness {
    return {
        businessId: String(business._id),
        name: business.name,
        email: business.email,
        createdAt: business.createdAt.toISOString()
    };
}

async function hashSecret(secret: string): Promise<string> {
    const salt = randomBytes(16);
    const derivedKey = (await scrypt(secret, salt, PASSWORD_KEY_LENGTH)) as Buffer;
    return `${salt.toString("hex")}:${derivedKey.toString("hex")}`;
}

async function verifySecret(secret: string, storedHash: string): Promise<boolean> {
    const [saltHex, hashHex] = storedHash.split(":");
    if (!saltHex || !hashHex) {
        return false;
    }

    const salt = Buffer.from(saltHex, "hex");
    const expectedHash = Buffer.from(hashHex, "hex");
    if (salt.length === 0 || expectedHash.length === 0) {
        return false;
    }

    const derivedKey = (await scrypt(secret, salt, expectedHash.length)) as Buffer;
    return derivedKey.length === expectedHash.length &&
        timingSafeEqual(derivedKey, expectedHash);
}

function validateCredentials(input: SignupInput | LoginInput): void {
    if (
        !input ||
        typeof input !== "object" ||
        typeof input.email !== "string" ||
        typeof input.password !== "string" ||
        normalizeEmail(input.email).length === 0 ||
        input.password.length === 0
    ) {
        throw new AuthServiceError(
            "INVALID_INPUT",
            "A valid email and password are required"
        );
    }
}

export class AuthService {
    async signup(input: SignupInput): Promise<SignupResult> {
        if (
            !input ||
            typeof input !== "object" ||
            typeof input.name !== "string" ||
            input.name.trim().length === 0
        ) {
            throw new AuthServiceError("INVALID_INPUT", "A valid business name is required");
        }
        validateCredentials(input);

        const email = normalizeEmail(input.email);
        const existingBusiness = await businessRepository.findByEmail(email);
        if (existingBusiness) {
            throw new AuthServiceError(
                "EMAIL_ALREADY_EXISTS",
                "A business with this email already exists"
            );
        }

        const apiKey = `rt_${randomBytes(API_KEY_LENGTH).toString("hex")}`;
        const passwordHash = await hashSecret(input.password);
        const apiKeyHash = createHash("sha256").update(apiKey).digest("hex");

        try {
            const business = await businessRepository.create({
                name: input.name.trim(),
                email,
                passwordHash,
                apiKeyHash
            });

            return {
                business: toPublicBusiness(business),
                apiKey
            };
        } catch (error) {
            if (
                error instanceof Error &&
                "code" in error &&
                error.code === 11000
            ) {
                throw new AuthServiceError(
                    "EMAIL_ALREADY_EXISTS",
                    "A business with this email already exists"
                );
            }
            throw error;
        }
    }

    async login(input: LoginInput): Promise<PublicBusiness> {
        validateCredentials(input);

        const business = await businessRepository.findByEmail(normalizeEmail(input.email));
        if (!business || !(await verifySecret(input.password, business.passwordHash))) {
            throw new AuthServiceError(
                "INVALID_CREDENTIALS",
                "Invalid email or password"
            );
        }

        return toPublicBusiness(business);
    }

    async getBusinessById(businessId: string): Promise<PublicBusiness> {
        const business = await businessRepository.findById(businessId);
        if (!business) {
            throw new AuthServiceError("BUSINESS_NOT_FOUND", "Business not found");
        }

        return toPublicBusiness(business);
    }

    findByApiKeyHash(apiKeyHash: string) {
        return businessRepository.findByApiKeyHash(apiKeyHash);
    }

    hashApiKey(apiKey: string): Promise<string> {
        return Promise.resolve(createHash("sha256").update(apiKey).digest("hex"));
    }
}

export const authService = new AuthService();
