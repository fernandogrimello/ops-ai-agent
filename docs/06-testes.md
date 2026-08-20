# 06. Testes

## Stack de testes

| Ferramenta | Uso |
|---|---|
| Jest | Framework de testes |
| Supertest | Testes de integracao HTTP |
| k6 | Testes de performance e carga |

## Testes de integracao (Jest + Supertest)

### Como rodar

cd apps/api && npm test
cd apps/api && npm run test:coverage

### Suites

#### auth.test.ts (5 testes)
- POST /auth/login com credenciais validas -> 200 + token
- POST /auth/login com credenciais invalidas -> 401
- POST /auth/login com body invalido -> 400
- GET /auth/me autenticado -> 200 + dados do usuario
- GET /auth/me sem token -> 401

#### tickets.test.ts (6 testes)
- GET /tickets autenticado -> 200 + array
- GET /tickets sem token -> 401
- POST /tickets com dados validos -> 201 + ticket com classificacao IA (mockada)
- POST /tickets sem titulo -> 400
- POST /tickets sem token -> 401
- GET /health -> 200 + status ok

#### customers.test.ts (7 testes)
- GET /customers autenticado -> 200 + array
- GET /customers sem token -> 401
- POST /customers com dados validos -> 201 + cliente
- POST /customers sem nome -> 400
- POST /customers com email duplicado -> 409
- POST /customers sem token -> 401

#### agent.test.ts (5 testes)
- POST /agent/chat com mensagem -> 200 + response (agente mockado)
- POST /agent/chat sem mensagem -> 400
- POST /agent/chat sem token -> 401
- GET /agent/logs autenticado -> 200 + array
- GET /agent/logs sem token -> 401

#### security.test.ts (10 testes)
- Header X-Content-Type-Options: nosniff
- Header X-Frame-Options: SAMEORIGIN
- Header X-DNS-Prefetch-Control: off
- Sem header X-Powered-By
- Token malformado -> 401
- Token com assinatura incorreta -> 401
- Sem header Authorization -> 401
- Authorization com formato Basic -> 401
- Input malicioso (SQL injection) bloqueado pelo Zod -> 400/401
- Sem stack trace exposto em erros
- Payload muito grande -> 400/413

### Cobertura

| Arquivo | Statements | Branches | Functions | Lines |
|---|---|---|---|---|
| app.ts | 100% | 100% | 100% | 100% |
| routes/ | 100% | 100% | 100% | 100% |
| schemas/ | 100% | 100% | 100% | 100% |
| middleware/auth.ts | 92% | 100% | 100% | 92% |
| controllers/ | 48% | 42% | 57% | 48% |
| services/ai.service.ts | 100% | 50% | 100% | 100% |
| **Total** | **72%** | **48%** | **82%** | **72%** |

## Testes de performance (k6)

### Como rodar

k6 run tests/performance/load-test.js

### Cenario

- Ramp up: 0 -> 10 usuarios em 30s
- Carga: 10 usuarios simultaneos por 1 minuto
- Ramp down: 10 -> 0 usuarios em 30s

### Endpoints testados

- GET /health
- GET /tickets (autenticado)
- GET /customers (autenticado)

### Resultados

| Metrica | Resultado | Threshold | Status |
|---|---|---|---|
| p95 latencia | 10ms | < 500ms | PASSOU |
| Taxa de erros | 0% | < 5% | PASSOU |
| Falhas HTTP | 0% | < 5% | PASSOU |
| Requisicoes/s | 22 | -- | -- |
| Checks passando | 6370/6370 | 100% | PASSOU |
| Tempo medio | 3.7ms | -- | -- |

## Decisoes de design

- Mock do Google Gemini nos testes para nao consumir quota da API gratuita
- Mock do agente IA para isolar logica de negocio da dependencia externa
- Testes rodam contra banco PostgreSQL real (nao in-memory) para maior fidelidade
- Teardown do Prisma no setup.ts para fechar conexoes apos os testes
- TypeScript downgrade de 7.0 para 5.8 por incompatibilidade com ts-jest
## Stress test (k6)

### Como rodar

k6 run tests/performance/stress-test.js

### Cenario

- Ramp up: 0 -> 10 -> 50 -> 100 usuarios
- Duracao total: 3 minutos
- Threshold: p95 < 2000ms, erros < 10%

### Resultados

| Metrica | Resultado | Threshold | Status |
|---|---|---|---|
| p95 latencia | 11.94ms | < 2000ms | PASSOU |
| Taxa de erros | 0% | < 10% | PASSOU |
| Requisicoes/s | 172 | -- | -- |
| Usuarios simultaneos | 100 | -- | -- |
| Checks passando | 46710/46710 | 100% | PASSOU |

## Spike test (k6)

### Como rodar

k6 run tests/performance/spike-test.js

### Cenario

- Pico repentino: 5 -> 100 usuarios em 10s
- Sustenta 100 usuarios por 30s
- Retorna a 0 em 10s
- Threshold: p95 < 3000ms, erros < 15%

### Resultados

| Metrica | Resultado | Threshold | Status |
|---|---|---|---|
| p95 latencia | 15.56ms | < 3000ms | PASSOU |
| Taxa de erros | 0% | < 15% | PASSOU |
| Requisicoes/s | 378 | -- | -- |
| Checks passando | 39927/39927 | 100% | PASSOU |
