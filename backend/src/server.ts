import "dotenv/config";
import app from "./app.js";
import {
    connectToDatabase,
    disconnectFromDatabase
} from "./config/database.js";

const PORT = process.env.PORT || 5000;

async function startServer() {
    await connectToDatabase();

    const server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });

    const shutdown = () => {
        server.close((error) => {
            if (error) {
                console.error("Failed to close the HTTP server", error);
                process.exitCode = 1;
            }

            void disconnectFromDatabase().catch((disconnectError: unknown) => {
                console.error("Failed to disconnect from MongoDB", disconnectError);
                process.exitCode = 1;
            });
        });
    };

    process.once("SIGINT", shutdown);
    process.once("SIGTERM", shutdown);
}

startServer().catch((error: unknown) => {
    console.error("Failed to start server", error);
    process.exitCode = 1;
});