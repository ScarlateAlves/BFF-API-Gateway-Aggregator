/**
 * Aggregator Pattern
 *
 * Chama múltiplos serviços em paralelo e combina os resultados em uma única
 * resposta. Evita que o frontend precise fazer N chamadas separadas.
 *
 * Neste caso: busca Order + Customer ao mesmo tempo e une os dois.
 */

import { getOrderById } from "../services/orderService";
import { getCustomerById } from "../services/customerService";
import { getOrdersByCustomerId } from "../services/orderService";
import { OrderDetails, Order, Customer } from "../types";

export async function getOrderWithCustomer(orderId: string): Promise<OrderDetails | null> {
  const order = await getOrderById(orderId);
  if (!order) return null;

  // Busca paralela — não precisa esperar uma para começar a outra
  const customer = await getCustomerById(order.customerId);
  if (!customer) return null;

  return { order, customer };
}

export interface CustomerSummary {
  customer: Customer;
  orders: Order[];
  totalSpent: number;
  orderCount: number;
}

export async function getCustomerSummary(customerId: string): Promise<CustomerSummary | null> {
  // Dispara as duas chamadas ao mesmo tempo (paralelo)
  const [customer, orders] = await Promise.all([
    getCustomerById(customerId),
    getOrdersByCustomerId(customerId),
  ]);

  if (!customer) return null;

  const totalSpent = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  return {
    customer,
    orders,
    totalSpent,
    orderCount: orders.length,
  };
}
