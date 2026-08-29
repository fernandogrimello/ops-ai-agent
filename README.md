# ops-ai-agent
[![CI](https://github.com/fernandogrimello/ops-ai-agent/actions/workflows/ci.yml/badge.svg)](https://github.com/fernandogrimello/ops-ai-agent/actions/workflows/ci.yml)

Plataforma de automação operacional com IA para empresas de serviços.

Desenvolvido como laboratório prático para explorar agentes de IA, automação de processos e integração entre APIs REST, banco de dados e ferramentas externas. O cenário fictício é a ClimaTech, empresa de manutenção e instalação de ar-condicionado.

## Screenshots

### Login
![Login](docs/screenshots/login.png)

### Dashboard de Atendimentos
![Dashboard](docs/screenshots/dashboard.png)

### Agente IA
![Agente IA](docs/screenshots/agent.png)

### Logs do Agente
![Logs](docs/screenshots/logs.png)

## O problema

Empresas de serviços recebem dezenas de solicitações por dia e perdem tempo classificando manualmente cada uma, cadastrando clientes, criando tarefas e distribuindo os serviços. O objetivo deste projeto é automatizar esse fluxo usando IA.

## Arquitetura
Cliente envia mensagem no WhatsApp
|
WAHA recebe via webhook
|
n8n processa e chama API REST
|
API Node.js/Express
|
Google Gemini classifica: categoria, prioridade, resumo, ação
|
PostgreSQL salva o atendimento
|
OpenClaw gateway disponibiliza agente via HTTP
|
WAHA envia resposta automática ao cliente

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Backend | Node.js, Express, TypeScript, Prisma ORM |
| Banco | PostgreSQL 16 |
| IA | Google Gemini API, agente com ferramentas |
| Agente Gateway | OpenClaw (skills, memória, canais) |
| WhatsApp | WAHA (engine NOWEB) |
| Automação | n8n (webhook + HTTP requests) |
| Infra | Docker, Docker Compose |
| Testes | Jest, Supertest, k6 |
| Code Review | CodeRabbit (revisão de PR com IA) |

## API

| Método | Rota | Descrição |
|---|---|---|
| POST | /auth/register | Cadastro de usuário |
| POST | /auth/login | Login com JWT |
| GET | /customers | Lista clientes |
| POST | /customers | Cria cliente |
| GET | /tickets | Lista atendimentos (paginado: ?page=1&limit=20&status=OPEN&priority=CRITICAL) |
| POST | /tickets | Cria atendimento com classificação por IA |
| POST | /agent/chat | Conversa com o agente operacional |
| GET | /agent/logs | Histórico de ações do agente |
| GET | /health | Health check |
| POST | /public/quote | Solicitação de orçamento pública (sem autenticação) |

## Testes

### Suite de testes (Jest + Supertest)

```bash
cd apps/api && npm test
```

| Suite | Testes | Cobertura |
|---|---|---|
| auth.test.ts | 5 | Login, token JWT, /me |
| tickets.test.ts | 15 | CRUD + GET/:id + PUT/:id + mock IA |
| customers.test.ts | 16 | CRUD + GET/:id + PUT/:id + DELETE/:id |
| agent.test.ts | 5 | Chat + logs + mock IA |
| security.test.ts | 12 | Headers, auth, injeção, rate limit |
| ai.service.test.ts | 4 | Unitário — classificação IA, fallbacks |
| ops.agent.test.ts | 6 | Unitário — agente, tool calls, logs |
| components.test.tsx | 13 | Frontend — PriorityBadge, StatusBadge, StatsCard, TicketTable |
| auth.spec.ts | 4 | E2E — login, erro, redirecionamento |
| dashboard.spec.ts | 4 | E2E — métricas, tickets, abas, logout |
| contract.test.ts | 5 | Contrato — garante que a API não quebra o frontend |
| webhook.test.ts | 5 | Webhook — simula payloads reais da Meta WhatsApp |
| ticket.tools.test.ts | 9 | Unitário — ferramentas do agente |
| **Total** | **106** | **79%** |

### Teste de performance (k6)

```bash
k6 run tests/performance/load-test.js
```

| Métrica | Resultado | Threshold |
|---|---|---|
| p95 latência | 10ms | < 500ms |
| Taxa de erros | 0% | < 5% |
| Requisições/s | 22 | -- |
| Usuários simultâneos | 10 | -- |
| Checks passando | 6370/6370 | 100% |

## Como executar

```bash
git clone https://github.com/fernandogrimello/ops-ai-agent.git
cd ops-ai-agent
cp .env.example .env
docker compose up -d
cd apps/api && npm install
npx prisma migrate dev
npx tsx src/server.ts
```

## Serviços

| Serviço | Porta |
|---|---|
| API | 3001 |
| Frontend | 3000 |
| PostgreSQL | 5433 |
| n8n | 5678 |
| WAHA | 3002 |
| OpenClaw | 18789 |

## Documentação

- [Arquitetura](docs/01-arquitetura.md)
- [Banco de dados](docs/02-banco-de-dados.md)
- [Agente IA](docs/03-agente.md)
- [Decisões técnicas](docs/04-decisoes-tecnicas.md)
- [Problemas e soluções](docs/05-problemas-e-solucoes.md)
- [Testes](docs/06-testes.md)
- [Guia de instalação](docs/GETTING_STARTED.md)

## Code Review com CodeRabbit

O projeto usa [CodeRabbit](https://coderabbit.ai) para revisão automática de Pull Requests com IA.

A configuração fica em `.coderabbit.yaml` na raiz do projeto e inclui:
- Revisão em português
- Regras específicas por pasta (API, frontend, Prisma, agentes)
- Foco em segurança, integridade de dados e qualidade de código
- Ignora formatação (coberta pelo ESLint)

Problemas detectados e corrigidos pelo CodeRabbit no PR de implementação da landing page:
- Endpoint autenticado exposto no frontend sem token
- Race condition no `findFirst` + `create` para customers
- Campo `phone` sem constraint única causando duplicatas em produção
- Mensagem de erro `P2002` genérica para conflitos de email e phone
- `parsed.error.flatten()` retornando objeto em vez de string renderizável no React
- `service: ""` causando 400 na API quando usuário não seleciona opção
- Migration sem cleanup de duplicatas antes de adicionar índice único

## Novas funcionalidades (landing page)

### Página de captura de leads
Disponível em `/landing`, permite que visitantes solicitem orçamento sem precisar fazer login.

### Endpoint público
`POST /public/quote` — recebe nome, telefone e tipo de serviço, cria o cliente no banco e abre um ticket automaticamente com classificação por IA.

## Desafios encontrados

- Prisma 7 mudou completamente a forma de configurar datasource
- n8n dentro do Docker não acessa localhost do host — necessário usar IP 172.17.0.1
- Google Gemini descontinuou modelos antigos — migrado para gemini-3.5-flash
- SDK @google/generative-ai incompatível com chaves AQ. — migrado para @google/genai
- WAHA engine WEBJS apresentou erro No LID for user — migrado para NOWEB
- TypeScript 7 incompatível com ts-jest — downgrade para TS 5.8

## Roadmap de testes

O projeto está em fase de evolução para produção. Abaixo o status atual:

### Implementado

| Tipo | Ferramenta | Status |
|---|---|---|
| Integração (auth, tickets, customers, agent) | Jest + Supertest | 33 testes passando |
| Segurança (headers, auth, injeção) | Jest + Supertest | 10 testes passando |
| Performance - load test | k6 | p95=10ms, 0% erros, 10 VUs |

### Implementado recentemente

| Tipo | Ferramenta | Status |
|---|---|---|
| Cobertura de controllers | Jest + Supertest | GET/:id, PUT, DELETE cobertos |
| Testes unitários ai.service | Jest | 100% cobertura, fallbacks testados |
| Testes unitários ticket.tools | Jest | 100% cobertura, Prisma mockado |
| Performance - stress test | k6 | 100 VUs, p95=11ms, 0% erros |
| Performance - spike test | k6 | Pico 100 VUs, p95=15ms, 0% erros |
| Performance - soak test | k6 | 30min, p95=13ms, sem memory leak |
| Rate limiting | express-rate-limit | 100 req/15min por IP |
| CI/CD | GitHub Actions | Roda em todo push no main |

### Pendente

| Tipo | Descrição |
|---|---|
| Deploy em produção | Render (API + Frontend) |
| Testes E2E completos | Playwright cobrindo fluxo WhatsApp |

## Segurança e vulnerabilidades conhecidas

### CVE: deepmerge-ts (GHSA-ggr8-5vv4-36mx)

**Severidade:** High  
**Componente afetado:** deepmerge-ts < 8.0.0 (dependência interna do Prisma 7.x)  
**Status:** Aguardando correção upstream pelo time do Prisma

Esta vulnerabilidade está presente internamente no Prisma ORM e não é exposta diretamente pelo código da aplicação. O fix disponível via `npm audit fix --force` exigiria downgrade do Prisma de 7.x para 6.x, o que quebraria a arquitetura atual que usa `prisma.config.ts` e o adapter PrismaPg.

A aplicação será atualizada assim que o Prisma lançar uma versão 7.x com o fix incorporado.

Referência: https://github.com/advisories/GHSA-ggr8-5vv4-36mx

## Infraestrutura e Backbone

Este projeto vai além de um simples deploy de backend e frontend.

Para funcionar em produção com todas as funcionalidades — WhatsApp, agentes de IA, automação de workflows e gateway OpenClaw — ele requer uma infraestrutura dedicada com múltiplos serviços rodando simultaneamente:

| Serviço | Função | Porta |
|---|---|---|
| API | Backend Node.js com classificação por IA | 3001 |
| Frontend | Dashboard Next.js | 3000 |
| PostgreSQL | Banco de dados relacional | 5433 |
| n8n | Orquestrador de workflows e automações | 5678 |
| WAHA | Bridge HTTP para WhatsApp | 3002 |
| OpenClaw | Gateway de agentes de IA | 18789 |

Diferente de aplicações tradicionais onde o deploy resume-se a subir backend, frontend e banco de dados, este projeto exige um servidor dedicado (VPS) com Docker para manter todos os serviços ativos simultaneamente.

### Opções de hospedagem recomendadas

| Provedor | Plano | Preço aproximado | Observação |
|---|---|---|---|
| Hetzner Cloud | CX22 (2vCPU/4GB) | EUR 3,29/mês | Melhor custo-benefício |
| DigitalOcean | Droplet Basic | USD 6,00/mês | Interface simples, boa documentação |
| Vultr | Cloud Compute | USD 6,00/mês | Alta disponibilidade |

### Como fazer o deploy em VPS

```bash
# 1. Clone o repositório no servidor
git clone https://github.com/fernandogrimello/ops-ai-agent.git
cd ops-ai-agent

# 2. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais

# 3. Suba todos os serviços
docker compose up -d

# 4. Execute as migrations e seed
cd apps/api && npm install
npx prisma migrate deploy
npx prisma db seed
```

Com um único `docker compose up -d`, toda a infraestrutura sobe automaticamente — banco, API, frontend, n8n, WAHA e OpenClaw — pronta para receber mensagens do WhatsApp e processar atendimentos com IA.

## Autor

Luiz Fernando Grimello  
github.com/fernandogrimello  
linkedin.com/in/luiz-fernando-grimello-6568b4358
