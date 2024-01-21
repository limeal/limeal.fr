interface OrderEvent {
    type: 'approved' | 'waiting-payment' | 'payment-accepted' | 'payment-decline' | 'waiting-delivery' | 'delivered' | 'canceled';
    date: Date;
}

interface Order {
    id: string;
    stars: number;
    files: {
        name: string;
        type: string;
        url: string;
    }[];
    events: OrderEvent[];
}