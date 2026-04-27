import express from "express";
import gateway from "./gateway/router";

const app = express();
const PORT = process.env.PORT ?? 3000;

// Define API_KEY padrão para desenvolvimento se não estiver no env
process.env.API_KEY ??= "dev-secret-key";

app.use(express.json());

// Todas as rotas passam pelo Gateway no prefixo /api
app.use("/api", gateway);

// Rota raiz — mostra os endpoints disponíveis
app.get("/", (_req, res) => {
  res.json({
    name: "project-bff",
    description: "BFF com API Gateway e Aggregator Pattern",
    auth: "Header obrigatório: x-api-key: dev-secret-key",
    endpoints: {
      health: "GET /api/health",
      customers: {
        list: "GET /api/customers",
        getById: "GET /api/customers/:id",
        summary: "GET /api/customers/:id/summary  [AGGREGATED]",
      },
      orders: {
        list: "GET /api/orders",
        getById: "GET /api/orders/:id",
        details: "GET /api/orders/:id/details  [AGGREGATED]",
      },
    },
  });
});

app.listen(PORT, () => {
  console.log(`\nBFF rodando em http://localhost:${PORT}`);
  console.log(`API Key de desenvolvimento: ${process.env.API_KEY}`);
  console.log(`Docs: GET http://localhost:${PORT}/\n`);
});
