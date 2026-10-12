import { Router } from "express";
import { login, me, signup } from "../controllers/auth.controller.js";
import { authenticateApiKey } from "../middleware/auth.middleware.js";

const authRouter = Router();

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.get("/me", authenticateApiKey, me);

export default authRouter;
