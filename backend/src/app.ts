import express from "express";
import schemaRouter from "./routes/schema.routes.js";

const app = express();

app.use(express.json());
app.use("/api/schemas", schemaRouter);

export default app;