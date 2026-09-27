import type { BlockchainIdentity } from "../types/blockchain.types.js";
import { call } from "./multichain.client.js";

const STREAM_NAME = "records"

export async function createBusinessIdentity(): Promise<BlockchainIdentity> {

    const address: string = await call("getnewaddress", []);
    await call("grant", [address, `${STREAM_NAME}.write`]);
    return {
        blockchainAddress: address
    }

}
