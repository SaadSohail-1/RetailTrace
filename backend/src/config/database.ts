import mongoose from "mongoose";
import { env } from "./env.js";

let connectionPromise: Promise<typeof mongoose> | undefined;

export function connectToDatabase(): Promise<typeof mongoose> {
    if (!env.MONGODB_URI || !env.MONGODB_DATABASE) {
        return Promise.reject(
            new Error("MONGODB_URI and MONGODB_DATABASE must be configured")
        );
    }

    if (mongoose.connection.readyState === 1) {
        return Promise.resolve(mongoose);
    }

    if (!connectionPromise) {
        connectionPromise = mongoose
            .connect(env.MONGODB_URI, { dbName: env.MONGODB_DATABASE })
            .catch((error: unknown) => {
                connectionPromise = undefined;
                throw error;
            });
    }

    return connectionPromise;
}

export async function disconnectFromDatabase(): Promise<void> {
    await mongoose.disconnect();
    connectionPromise = undefined;
}