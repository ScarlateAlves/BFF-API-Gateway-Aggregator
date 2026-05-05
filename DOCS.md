# Documentação dos Arquivos — project-bff

Guia de referência explicando o papel de cada arquivo, suas responsabilidades e como eles se conectam.

---

## Índice

- [src/index.ts](#srcindexts)
- [src/types/index.ts](#srctypesindexts)
- [src/gateway/router.ts](#srcgatewayrouterts)
- [src/gateway/middleware/logger.ts](#srcgatewaymiddlewareloggerts)
- [src/gateway/middleware/auth.ts](#srcgatewaymiddlewareauthtss)
- [src/routes/orders.ts](#srcroutesordersts)
- [src/routes/customers.ts](#srcroutescustomersts)
- [src/services/orderService.ts](#srcservicesorderservicets)
- [src/services/customerService.ts](#srcservicescustomerservicets)
- [src/aggregator/orderAggregator.ts](#srcaggregatororderaggregatorts)

---

## `src/index.ts`

**Ponto de entrada da aplicação.** É o primeiro arquivo executado.

**O que faz:**
- Cria a instância do Express
- Define a porta via variável de ambiente `PORT` (padrão: `3000`)
- Define a chave de API via variável de ambiente `API_KEY` (padrão: `dev-secret-key`)
- Registra o middleware de parse de JSON (`express.json()`)
- Monta o router do gateway em `/api` — todo tráfego de API passa por lá
- Expõe uma rota raiz `GET /` que lista os endpoints disponíveis

**Depende de:**
- `express`
- `src/gateway/router.ts`

**Nenhum outro arquivo depende dele** — é o topo da árvore.

---

## `src/types/index.ts`

**Contrato de tipos de toda a aplicação.** Define as estruturas de dados compartilhadas.

**Tipos exportados:**

| Tipo | Descrição |
|------|-----------|
| `Customer` | Dados de um cliente: `id`, `name`, `email`, `phone`, `createdAt` |
| `OrderItem` | Item dentro de um pedido: `productId`, `productName`, `quantity`, `unitPrice` |
| `Order` | Pedido completo: `id`, `customerId`, `status`, `items`, `totalAmount`, `createdAt` |
| `OrderDetails` | Tipo agregado: junta `Order` + `customer: Customer` |

**Status possíveis de `Order`:** `pending` | `processing` | `shipped` | `delivered` | `cancelled`

**Usado por:** todos os arquivos da aplicação que manipulam dados de pedidos ou clientes.

---

## `src/gateway/router.ts`

**API Gateway — portão único de entrada para todas as requisições `/api`.**

**O que faz:**
- Aplica o middleware de logging em todas as requisições
- Expõe `GET /health` sem autenticação (retorna `{ status: "ok", timestamp }`)
- Aplica o middleware de autenticação em todas as rotas seguintes
- Delega as requisições para os routers de pedidos e clientes

**Pipeline de middlewares:**
```
Requisição → logger → (se /health → responde) → apiKeyAuth → routes
```

**Depende de:**
- `src/gateway/middleware/logger.ts`
- `src/gateway/middleware/auth.ts`
- `src/routes/orders.ts`
- `src/routes/customers.ts`

**Usado por:** `src/index.ts`

---

## `src/gateway/middleware/logger.ts`

**Middleware de logging.** Registra todas as requisições que passam pelo gateway.

**O que faz:**
- Captura o tempo de início da requisição
- Escuta o evento `finish` da resposta para calcular a duração
- Imprime no console no formato:
  ```
  [2024-04-01T08:00:00.000Z] GET /api/orders → 200 (45ms)
  ```

**Não bloqueia a requisição** — sempre chama `next()` e apenas observa o ciclo.

**Usado por:** `src/gateway/router.ts`

---

## `src/gateway/middleware/auth.ts`

**Middleware de autenticação por API Key.**

**O que faz:**
- Lê o header `x-api-key` da requisição
- Compara com `process.env.API_KEY`
- Retorna `401 Unauthorized` se o header estiver ausente ou incorreto
- Chama `next()` se a chave for válida, permitindo a requisição continuar

**Importante:** aplicado depois do `/health` no router, então o health check nunca precisa de auth.

**Usado por:** `src/gateway/router.ts`

---

## `src/routes/orders.ts`

**Handlers de rota para o domínio de pedidos.**

**Endpoints registrados:**

| Método | Rota | Handler | Descrição |
|--------|------|---------|-----------|
| `GET` | `/` | `getAllOrders()` | Lista todos os pedidos |
| `GET` | `/:id` | `getOrderById(id)` | Busca pedido por ID, retorna 404 se não existir |
| `GET` | `/:id/details` | `getOrderWithCustomer(id)` | Pedido + dados do cliente em uma única resposta |

**Formato de resposta:**
- Lista: `{ data: Order[], total: number }`
- Item único: `{ data: Order }`
- Aggregated: `{ data: OrderDetails }`

**Depende de:**
- `src/services/orderService.ts` (para os dois primeiros endpoints)
- `src/aggregator/orderAggregator.ts` (para `/details`)

**Usado por:** `src/gateway/router.ts`

---

## `src/routes/customers.ts`

**Handlers de rota para o domínio de clientes.**

**Endpoints registrados:**

| Método | Rota | Handler | Descrição |
|--------|------|---------|-----------|
| `GET` | `/` | `getAllCustomers()` | Lista todos os clientes |
| `GET` | `/:id` | `getCustomerById(id)` | Busca cliente por ID, retorna 404 se não existir |
| `GET` | `/:id/summary` | `getCustomerSummary(id)` | Cliente + todos os pedidos + total gasto |

**Formato de resposta:**
- Lista: `{ data: Customer[], total: number }`
- Item único: `{ data: Customer }`
- Aggregated: `{ data: CustomerSummary }`

**Depende de:**
- `src/services/customerService.ts` (para os dois primeiros endpoints)
- `src/aggregator/orderAggregator.ts` (para `/summary`)

**Usado por:** `src/gateway/router.ts`

---

## `src/services/orderService.ts`

**Camada de acesso a dados de pedidos.** Simula um microserviço externo.

**Mock data disponível:**

| ID | Cliente | Status | Total |
|----|---------|--------|-------|
| `o1` | `c1` (Ana Souza) | `delivered` | R$ 3.740 |
| `o2` | `c2` (Bruno Lima) | `processing` | R$ 250 |
| `o3` | `c1` (Ana Souza) | `pending` | R$ 2.100 |

**Funções exportadas:**

| Função | Retorno | Latência simulada |
|--------|---------|-------------------|
| `getAllOrders()` | `Promise<Order[]>` | 50ms |
| `getOrderById(id)` | `Promise<Order \| null>` | 50ms |
| `getOrdersByCustomerId(customerId)` | `Promise<Order[]>` | 50ms |

A latência simulada com `setTimeout` representa o tempo de rede de uma chamada real a um microserviço.

**Usado por:** `src/routes/orders.ts` e `src/aggregator/orderAggregator.ts`

---

## `src/services/customerService.ts`

**Camada de acesso a dados de clientes.** Simula um microserviço externo.

**Mock data disponível:**

| ID | Nome | Email |
|----|------|-------|
| `c1` | Ana Souza | ana@email.com |
| `c2` | Bruno Lima | bruno@email.com |
| `c3` | Carla Mendes | carla@email.com |

**Funções exportadas:**

| Função | Retorno | Latência simulada |
|--------|---------|-------------------|
| `getAllCustomers()` | `Promise<Customer[]>` | 50ms |
| `getCustomerById(id)` | `Promise<Customer \| null>` | 50ms |

**Usado por:** `src/routes/customers.ts` e `src/aggregator/orderAggregator.ts`

---

## `src/aggregator/orderAggregator.ts`

**Implementação do Aggregator Pattern.** Combina dados de múltiplos serviços em uma única resposta.

**Por que existe:** sem o aggregator, o frontend precisaria fazer N chamadas separadas (ex: buscar o pedido, depois buscar o cliente). O aggregator centraliza isso no servidor.

**Interface local:**
```ts
interface CustomerSummary {
  customer: Customer
  orders: Order[]
  totalSpent: number
  orderCount: number
}
```

**Funções exportadas:**

### `getOrderWithCustomer(orderId)`
- Busca o pedido por ID
- Busca o cliente daquele pedido (`order.customerId`)
- Retorna `OrderDetails` (pedido + cliente juntos) ou `null`
- **Usado por:** `GET /api/orders/:id/details`

### `getCustomerSummary(customerId)`
- Dispara em **paralelo** (via `Promise.all`) a busca do cliente e de todos os seus pedidos
- Calcula `totalSpent` somando o `totalAmount` de cada pedido
- Retorna `CustomerSummary` ou `null`
- **Usado por:** `GET /api/customers/:id/summary`

O uso de `Promise.all` é intencional: as duas chamadas são independentes, então rodam ao mesmo tempo, reduzindo a latência total.

**Depende de:**
- `src/services/orderService.ts`
- `src/services/customerService.ts`
- `src/types/index.ts`

---

## Mapa de dependências

```
index.ts
└── gateway/router.ts
      ├── middleware/logger.ts
      ├── middleware/auth.ts
      ├── routes/orders.ts
      │     ├── services/orderService.ts
      │     └── aggregator/orderAggregator.ts
      │           ├── services/orderService.ts
      │           └── services/customerService.ts
      └── routes/customers.ts
            ├── services/customerService.ts
            └── aggregator/orderAggregator.ts
                  ├── services/orderService.ts
                  └── services/customerService.ts

types/index.ts  ← usado por todos os arquivos acima
```
