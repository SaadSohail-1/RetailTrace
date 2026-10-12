import express from "express";
import schemaRouter from "./routes/schema.routes.js";
import authRouter from "./routes/auth.routes.js";
import recordRouter from "./routes/record.routes.js";

const app = express();

app.use(express.json());
app.use("/api/schemas", schemaRouter);
app.use("/api/auth", authRouter);
app.use("/api/records", recordRouter);

export default app;