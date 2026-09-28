import { Router } from "express";
import {
    createSchema,
    getSchema,
    listSchemas
} from "../controllers/schema.controller.js";

declare global {
    namespace Express {
        interface Request {
            auth: {
                businessId: string;
            };
        }
    }
}

const schemaRouter = Router();

schemaRouter.post("/", createSchema);
schemaRouter.get("/", listSchemas);
schemaRouter.get("/:schemaID", getSchema);

export default schemaRouter;