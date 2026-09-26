import "dotenv/config";

export const env = {
    PORT: process.env.PORT,
    MONGODB_URI: process.env.MONGODB_URI,
    MONGODB_DATABASE: process.env.MONGODB_URI,
    MULTICHAIN_RPC_URL: process.env.MULTICHAIN_RPC_URL,
    MULTICHAIN_RPC_USER: process.env.MULTICHAIN_RPC_USER,
    MULTICHAIN_RPC_PASSWORD: process.env.MULTICHAIN_RPC_PASSWORD,
    MULTICHAIN_CHAIN: process.env.MULTICHAIN_CHAIN,
    MULTICHAIN_ADDRESS: process.env.MULTICHAIN_ADDRESS
}