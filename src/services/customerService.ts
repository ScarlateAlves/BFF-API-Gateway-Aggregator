import { Customer } from "../types";

// Simula o banco de dados do microserviço de Clientes
const customers: Customer[] = [
  {
    id: "c1",
    name: "Ana Souza",
    email: "ana@email.com",
    phone: "11999990001",
    createdAt: "2024-01-10T10:00:00Z",
  },
  {
    id: "c2",
    name: "Bruno Lima",
    email: "bruno@email.com",
    phone: "11999990002",
    createdAt: "2024-02-15T09:30:00Z",
  },
  {
    id: "c3",
    name: "Carla Mendes",
    email: "carla@email.com",
    phone: "11999990003",
    createdAt: "2024-03-20T14:00:00Z",
  },
];

// Simula latência de rede de um microserviço real
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function getAllCustomers(): Promise<Customer[]> {
  await delay(50);
  return customers;
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  await delay(50);
  return customers.find((c) => c.id === id) ?? null;
}
