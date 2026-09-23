export interface Product{
    id: string;
    productId: string;
    businessId: string;
    name: string;
    description?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface RegisterProductRequest {
    productId: string;
    name: string;
    description?: string | null;
}