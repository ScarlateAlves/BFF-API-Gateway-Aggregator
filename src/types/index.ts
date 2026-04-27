export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  customerId: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
}

// Tipo agregado — retornado pelo Aggregator (une Order + Customer)
export interface OrderDetails {
  order: Order;
  customer: Customer;
}
