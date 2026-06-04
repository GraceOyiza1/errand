// src/types/order.ts

export interface MarketItem {
    id: string;
    name: string;
    estimatedPrice: number; // in GHS
    category: 'vegetables' | 'grains' | 'oils' | 'meat-fish' | 'provisions';
}

export interface CartItem {
    product: MarketItem;
    quantity: number;
    customNotes?: string;
}

export interface ErrandOrder {
    id: string;
    customerId: string;
    marketId: string;
    items: CartItem[];
    status: 'pending' | 'shopping' | 'delivering' | 'completed' | 'cancelled';
    estimatedTotal: number;
    deliveryFee: number;
    deliveryAddress: string;
    customerPhone: string;
    createdAt: string;
}
