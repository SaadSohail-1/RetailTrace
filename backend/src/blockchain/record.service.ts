import { call } from "./multichain.client.js";

import type { 
    BlockchainRecord, 
    BlockchainRecordHistoryItem, 
    BlockchainResult,
    RecordVerificationResult 
} from "../types/blockchain.types.js";

import type {
    MultichainStreamItem,
    MultichainTransactionItem
} from "../types/multichain.types.js";
import { env } from "../config/env.js";

const STREAM_NAME = "records";

function recordKey(recordId: string) {
    return `record:${recordId}`
}

export async function publishRecord(
    record: BlockchainRecord,
    fromAddress: string
) : Promise<BlockchainResult> {

    const transactionId = await call<string> (
        "publishfrom",
        [
            fromAddress,
            STREAM_NAME,
            recordKey(record.recordId),
            {
                json: record
            }
        ]
    );

    return {
        transactionId,
        status: "PENDING"
    }
}

export async function getRecord(
    recordId: string
) : Promise<BlockchainRecord | null> {

    const items = await call<MultichainStreamItem<BlockchainRecord>[]> (
        "liststreamkeyitems",
        [
            STREAM_NAME,
            recordKey(recordId)
        ]
    );

    const recordItems = items.filter(item => item.data?.json !== undefined);
    
    if(recordItems.length===0) return null;

    const latestItem = recordItems.at(-1);

    if(!latestItem?.data.json) return null;

    return latestItem.data.json!;
}

export async function verifyRecord (
    recordId: string
) : Promise<RecordVerificationResult> {

    const items = await call<MultichainStreamItem[]>(
        "liststreamkeyitems",
        [
            STREAM_NAME,
            recordKey(recordId)
        ]
    );

    if(items.length===0) {
        return {
            recordId,
            verified: false,
            transactionId: null
        }
    }

    const recordItem = items
    .filter(item => item.data?.json !== undefined)
    .at(-1);

    if(!recordItem?.data.json) {
        return {
            recordId,
            verified: false,
            transactionId: null
        }
    }

    return {
        recordId,
        verified: true,
        transactionId: recordItem.txid
    }

}

export async function getRecordHistory (
    recordId: string
) : Promise<BlockchainRecordHistoryItem[]> {

    const items = await call<MultichainStreamItem<BlockchainRecord>[]>(
        "liststreamkeyitems",
        [
            STREAM_NAME,
            recordKey(recordId)
        ]
    );

    return items
        .filter(item => item.data?.json !== undefined)
        .map(item => ({
            record: item.data.json!,
            transactionId: item.txid,
            blocktime: item.blocktime,
            confirmations: item.confirmations
        }));
    
}

export async function getRecordByTransaction(
    txId: string
) : Promise<BlockchainRecord | null> {

    const item = await call<MultichainTransactionItem<BlockchainRecord> | null> (
        "getrawtransaction",
        [
            txId,
            1
        ]
    );

    if(!item) return null;

    const streamItem = item.vout
        .flatMap(output => output.items ?? [])
        .find(streamItem => streamItem.data?.json !== undefined)

    if(!streamItem?.data.json) return null;

    return streamItem.data.json;
} 