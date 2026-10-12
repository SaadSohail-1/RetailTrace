import { Router } from "express";
import { authenticateApiKey } from "../middleware/auth.middleware.js";
import {
    createRecord,
    getRecord,
    verifyRecord
} from "../controllers/record.controller.js";

const recordRouter = Router();

recordRouter.use(authenticateApiKey);
recordRouter.post("/", createRecord);
recordRouter.get("/:recordId", getRecord);
recordRouter.get("/:recordId/verify", verifyRecord);

export default recordRouter;
