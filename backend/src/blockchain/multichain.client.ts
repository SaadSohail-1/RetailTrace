import { env } from "../config/env.js";

interface JsonRpcResponse<T> {
    result: T;
    error: {
        code: number;
        message: string;
    } | null;
    id: number;
}

const RPC_URL = env.MULTICHAIN_RPC_URL!;
const RPC_USER = env.MULTICHAIN_RPC_USER!;
const RPC_PASSWORD = env.MULTICHAIN_RPC_PASSWORD!;
let requestId = 0;

export async function call<T>(
    method: string,
    params: unknown[]
) {
    const response = await fetch (RPC_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Basic " + Buffer.from(`${RPC_USER}:${RPC_PASSWORD}`).toString("base64")
        },
        body: JSON.stringify({
            method,
            params,
            id: ++requestId
        })
    })

    const responseText = await response.text();
    if(!response.ok) throw new Error(`Multichain HTTP ${response.status}: ${responseText}`);

    const rpcResponse = JSON.parse(responseText) as JsonRpcResponse<T>;
    if(rpcResponse.error) {
        throw new Error(`Multichain RPC ${rpcResponse.error.code}: ${rpcResponse.error.message}`);
    }

    return rpcResponse.result;
}
