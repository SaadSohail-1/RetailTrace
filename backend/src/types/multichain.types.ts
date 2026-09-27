export interface MultichainStreamItem<T = unknown> {
    publishers: string[];
    keys: string[];
    offchain: boolean;
    available: boolean;
    data: {
        json?: T;
    };
    confirmations: number;
    blocktime: number;
    txid: string;
}

export interface MultichainTransactionItem<T = unknown> {
    hex: string;
    txid: string;
    version: number;
    locktime: number;

    vin: {
        txid: string;
        vout: number;
        scriptSig: {
            asm: string;
            hex: string;
        };
        sequence: number;
    }[];

    vout: {
        value: number;
        n: number;
        scriptPubKey: {
            asm: string;
            hex: string;
            type: string;
            reqSigs?: number;
            addresses?: string[];
        };
        items?: {
            type: string;
            name: string;
            createtxid: string;
            publishRef: string;
            publishers: string[];
            keys: string[];
            offchain: boolean;
            data: {
                json: T;
            };
        }[];
    }[];

    blockhash: string;
    confirmations: number;
    time: number;
    blocktime: number;
}