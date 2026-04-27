import { Router, Request, Response } from "express";
import { getAllOrders, getOrderById } from "../services/orderService";
import { getOrderWithCustomer } from "../aggregator/orderAggregator";

const router = Router();

// GET /api/orders
router.get("/", async (_req: Request, res: Response) => {
  const orders = await getAllOrders();
  res.json({ data: orders, total: orders.length });
});

// GET /api/orders/:id
router.get("/:id", async (req: Request, res: Response) => {
  const order = await getOrderById(req.params.id);

  if (!order) {
    res.status(404).json({ error: "Pedido não encontrado" });
    return;
  }

  res.json({ data: order });
});

// GET /api/orders/:id/details
// Endpoint agregado: retorna pedido + dados completos do cliente em uma só chamada
router.get("/:id/details", async (req: Request, res: Response) => {
  const details = await getOrderWithCustomer(req.params.id);

  if (!details) {
    res.status(404).json({ error: "Pedido ou cliente não encontrado" });
    return;
  }

  res.json({ data: details });
});

export default router;
