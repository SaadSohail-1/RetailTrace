export interface BlockchainResult {
    transactionId: string;
    status: "PENDING" | "CONFIRMED" | "FAILED";
}

//event types
export type WarrantyEventType =
    | "WARRANTY_STARTED"
    | "WARRANTY_EXTENDED"
    | "WARRANTY_CLAIMED"
    | "WARRANTY_EXPIRED";

export type SupplyChainEventType = 
    |   "MANUFACTURED" 
    |    "PACKED" 
    |    "SHIPPED" 
    |   "RECEIVED" 
    |    "WAREHOUSED" 
    |    "DELIVERED";

//products
export interface RegisterProductBlockchainData {
    productId: string;
    businessId: string;
    event: "REGISTERED";
    name: string;
    description?: string | null;
}

export interface ProductVerificationResult {
    productId: string;
    verified: boolean;
    registration: {
        transactionId: string;
        event: "REGISTERED";
    } | null;
}

export interface ProductBlockchainService {
    registerProduct(
        data: RegisterProductBlockchainData
    ) : Promise<BlockchainResult>;

    verifyProduct(
        productId: string
    ) : Promise<ProductVerificationResult>;
}

//ownership

//http
export interface TransferOwnershipRequest {
    newOwner: string;
}

//blockchain
export interface TransferOwnershipBlockchainData {
    productId: string;
    previousOwner: string;
    newOwner: string;
    event: "OWNERSHIP_TRANSFERRED";
}

export interface OwnershipEvent {
    previousOwner: string;
    newOwner: string;
    event: "OWNERSHIP_TRANSFERRED";
    transactionId: string;
    timestamp: string;
}

export interface OwnershipHistoryResponse {
    productId: string;
    history: OwnershipEvent[];
}

export interface OwnershipBlockchainService {
    transferOwnership(
        data: TransferOwnershipBlockchainData
    ) : Promise<BlockchainResult>;

    getOwnershipHistory(
        productId: string
    ) : Promise<OwnershipHistoryResponse>;
}

//warranty

//http
export interface AddWarrantyRequest {
    event: WarrantyEventType;
    startDate: string;
    durationMonths: number;
}

//blockchain
export interface WarrantyBlockchainData {
    productId: string;
    event: WarrantyEventType;
    startDate: string;
    durationMonths: number;
}

export interface WarrantyEvent {
    event: WarrantyEventType;
    startDate: string;
    durationMonths: number;
    transactionId: string;
    timestamp: string;
}

export interface WarrantyHistoryResponse {
    productId: string;
    events: WarrantyEvent[];
}

export interface WarrantyBlockchainService {
    addWarrantyEvent(
        data: WarrantyBlockchainData
    ) : Promise<BlockchainResult>;

    getWarrantyHistory(
        productId: string
    ) : Promise<WarrantyHistoryResponse>;
}

//supply chain
//http
export interface AddSupplyChainEventRequest {
    event: SupplyChainEventType;
    from: string | null;
    to: string | null;
}

//blockchain
export interface SupplyChainBlockchainData {
    productId: string;
    event: SupplyChainEventType;
    from: string | null;
    to: string | null;
}

export interface SupplyChainEvent {
    event: SupplyChainEventType;
    from: string | null;
    to: string | null;
    transactionId: string;
    timestamp: string;
}

export interface SupplyChainHistoryResponse {
    productId: string;
    events: SupplyChainEvent[];
}

export interface SupplyChainBlockchainService {
    addSupplyChainEvent (
        data: SupplyChainBlockchainData
    ) : Promise<BlockchainResult>;

    getSupplyChainHistory (
        productId: string
    ) : Promise<SupplyChainHistoryResponse>;
}