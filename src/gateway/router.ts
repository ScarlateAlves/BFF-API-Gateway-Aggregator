/**
 * API Gateway
 *
 * Ponto único de entrada da API. Responsável por:
 * - Aplicar middlewares globais (auth, logger)
 * - Rotear requisições para os handlers corretos
 * - Retornar erros padronizados
 *
 * O frontend só conhece este gateway — não chama serviços diretamente.
 */

import { Router, Request, Response } from "express";
import { requestLogger } from "./middleware/logger";
import { apiKeyAuth } from "./middleware/auth";
import customerRoutes from "../routes/customers";
import orderRoutes from "../routes/orders";

const gateway = Router();

gateway.use(requestLogger);

// Health check antes do auth — facilita monitoramento sem precisar de chave
gateway.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

gateway.use(apiKeyAuth);

gateway.use("/customers", customerRoutes);
gateway.use("/orders", orderRoutes);

export default gateway;
