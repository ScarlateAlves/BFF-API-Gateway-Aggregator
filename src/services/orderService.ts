import { Order } from "../types";

const orders: Order[] = [
  {
    id: "o1",
    customerId: "c1",
    status: "delivered",
    items: [
      { productId: "p1", productName: "Notebook", quantity: 1, unitPrice: 3500 },
      { productId: "p2", productName: "Mouse", quantity: 2, unitPrice: 120 },
    ],
    totalAmount: 3740,
    createdAt: "2024-04-01T08:00:00Z",
  },
  {
    id: "o2",
    customerId: "c2",
    status: "processing",
    items: [
      { productId: "p3", productName: "Teclado", quantity: 1, unitPrice: 250 },
    ],
    totalAmount: 250,
    createdAt: "2024-04-05T11:00:00Z",
  },
  {
    id: "o3",
    customerId: "c1",
    status: "pending",
    items: [
      { productId: "p4", productName: "Monitor", quantity: 1, unitPrice: 1800 },
      { productId: "p5", productName: "Webcam", quantity: 1, unitPrice: 300 },
    ],
    totalAmount: 2100,
    createdAt: "2024-04-10T15:30:00Z",
  },
];

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function getAllOrders(): Promise<Order[]> {
  await delay(50);
  return orders;
}

export async function getOrderById(id: string): Promise<Order | null> {
  await delay(50);
  return orders.find((o) => o.id === id) ?? null;
}

export async function getOrdersByCustomerId(customerId: string): Promise<Order[]> {
  await delay(50);
  return orders.filter((o) => o.customerId === customerId);
}
