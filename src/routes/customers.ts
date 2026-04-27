import { Router, Request, Response } from "express";
import { getAllCustomers, getCustomerById } from "../services/customerService";
import { getCustomerSummary } from "../aggregator/orderAggregator";

const router = Router();

// GET /api/customers
router.get("/", async (_req: Request, res: Response) => {
  const customers = await getAllCustomers();
  res.json({ data: customers, total: customers.length });
});

// GET /api/customers/:id
router.get("/:id", async (req: Request, res: Response) => {
  const customer = await getCustomerById(req.params.id);

  if (!customer) {
    res.status(404).json({ error: "Cliente não encontrado" });
    return;
  }

  res.json({ data: customer });
});

// GET /api/customers/:id/summary
// Endpoint agregado: retorna cliente + todos os pedidos + total gasto
router.get("/:id/summary", async (req: Request, res: Response) => {
  const summary = await getCustomerSummary(req.params.id);

  if (!summary) {
    res.status(404).json({ error: "Cliente não encontrado" });
    return;
  }

  res.json({ data: summary });
});

export default router;
