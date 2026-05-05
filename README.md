# project-bff

BFF (Backend for Frontend) com API Gateway e Aggregator Pattern — domínio de Pedidos e Clientes.

## Como rodar

```bash
npm install
npm run dev
```

O servidor sobe em `http://localhost:3000`.

## Autenticação

Todos os endpoints (exceto `/api/health`) exigem o header:

```
x-api-key: dev-secret-key
```

Em produção, defina a variável de ambiente `API_KEY` com uma chave segura.

## Endpoints

### Health

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/health` | Não | Status do servidor |

### Pedidos

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/orders` | Sim | Lista todos os pedidos |
| GET | `/api/orders/:id` | Sim | Busca pedido por ID |
| GET | `/api/orders/:id/details` | Sim | Pedido + dados do cliente (aggregated) |

### Clientes

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/customers` | Sim | Lista todos os clientes |
| GET | `/api/customers/:id` | Sim | Busca cliente por ID |
| GET | `/api/customers/:id/summary` | Sim | Cliente + pedidos + total gasto (aggregated) |

### Dados disponíveis

- Clientes: `c1` (Ana Souza), `c2` (Bruno Lima), `c3` (Carla Mendes)
- Pedidos: `o1` (c1, delivered), `o2` (c2, processing), `o3` (c1, pending)

## Exemplos com curl

```bash
# Health check
curl http://localhost:3000/api/health

# Listar pedidos
curl http://localhost:3000/api/orders \
  -H "x-api-key: dev-secret-key"

# Pedido por ID
curl http://localhost:3000/api/orders/o1 \
  -H "x-api-key: dev-secret-key"

# Pedido + cliente (aggregated)
curl http://localhost:3000/api/orders/o1/details \
  -H "x-api-key: dev-secret-key"

# Listar clientes
curl http://localhost:3000/api/customers \
  -H "x-api-key: dev-secret-key"

# Resumo do cliente com pedidos (aggregated)
curl http://localhost:3000/api/customers/c1/summary \
  -H "x-api-key: dev-secret-key"
```

## Arquitetura

```
Requisição
  └── index.ts             → sobe o servidor Express na porta 3000
        └── gateway/router.ts    → portão único de entrada para /api
              ├── middleware/logger.ts   → loga método e URL
              ├── /api/health            → responde sem auth
              ├── middleware/auth.ts     → valida x-api-key
              └── rotas
                    ├── routes/orders.ts      → endpoints de pedidos
                    ├── routes/customers.ts   → endpoints de clientes
                    └── aggregator/orderAggregator.ts  → combina dados em paralelo
```

### Padrões utilizados

**API Gateway** — todo o tráfego passa por um único ponto (`gateway/router.ts`) que aplica autenticação e logging antes de chegar nas rotas.

**Aggregator Pattern** — os endpoints `/details` e `/summary` disparam múltiplas chamadas a serviços em paralelo com `Promise.all` e retornam tudo em uma única resposta, evitando que o frontend precise fazer N chamadas separadas.

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Sobe o servidor em modo desenvolvimento com hot reload |
| `npm run build` | Compila TypeScript para `dist/` |
| `npm start` | Roda a versão compilada |
| `npm run lint` | Verifica o código com ESLint |
