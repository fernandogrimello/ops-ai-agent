# Guia de Instalacao — ops-ai-agent

Este guia explica como rodar o projeto do zero na sua maquina.

## Pre-requisitos

Antes de comecar, certifique-se de ter instalado:

| Ferramenta | Versao minima | Como instalar |
|---|---|---|
| Node.js | 22.x | https://nodejs.org |
| Docker | 24.x | https://docs.docker.com/get-docker |
| Docker Compose | 2.x | Incluido no Docker Desktop |
| Git | qualquer | https://git-scm.com |

Para verificar se esta tudo instalado:

    node --version
    docker --version
    git --version

## Passo 1 — Clone o repositorio

    git clone https://github.com/fernandogrimello/ops-ai-agent.git
    cd ops-ai-agent

## Passo 2 — Configure as variaveis de ambiente

    cp .env.example .env

Abra o arquivo `.env` e preencha as variaveis obrigatorias:

**GEMINI_API_KEY** — chave da API do Google Gemini
Obtenha gratuitamente em: https://aistudio.google.com/app/apikey

**JWT_SECRET** — string longa e aleatoria para assinar tokens

As demais variaveis ja tem valores padrao que funcionam em desenvolvimento.

## Passo 3 — Suba os servicos com Docker

    docker compose up postgres n8n waha -d

Aguarde alguns segundos e verifique se os containers subiram:

    docker compose ps

Deve aparecer os servicos ops-postgres, ops-n8n e ops-waha com status Up.

## Passo 4 — Configure o banco de dados

    cd apps/api
    npm install
    npx prisma migrate dev

Para popular o banco com dados de exemplo:

    npx tsx src/seed.ts

## Passo 5 — Inicie a API

    npx tsx src/server.ts

A API estara disponivel em http://localhost:3001
Para verificar: http://localhost:3001/health deve retornar status ok

## Passo 6 — Inicie o Frontend

Em um novo terminal:

    cd apps/web
    npm install
    npm run dev

O dashboard estara disponivel em http://localhost:3000

## Passo 7 — Acesse o sistema

Abra o browser em http://localhost:3000 e faca login com:

- Email: admin@climatech.com
- Senha: admin123

## Servicos disponiveis

| Servico | URL | Descricao |
|---|---|---|
| Frontend | http://localhost:3000 | Dashboard de atendimentos |
| API | http://localhost:3001 | API REST |
| n8n | http://localhost:5678 | Automacao de workflows |
| WAHA | http://localhost:3002/dashboard | Dashboard do WhatsApp |

## Rodando os testes

### Testes de integracao e unitarios (Jest)

    cd apps/api
    npm test
    npm run test:coverage

### Testes de componente frontend (React Testing Library)

    cd apps/web
    npm test

### Testes E2E (Playwright)

Com o frontend e a API rodando:

    cd apps/web
    npx playwright test
    npx playwright test --headed

### Testes de performance (k6)

Com a API rodando:

    k6 run tests/performance/load-test.js
    k6 run tests/performance/stress-test.js
    k6 run tests/performance/spike-test.js
    k6 run tests/performance/soak-test.js

## Solucao de problemas

### Porta 5432 ja em uso
O projeto usa a porta 5433 para evitar conflito com PostgreSQL local.

### Erro de conexao com o banco
    docker compose ps
    docker compose logs postgres

### n8n nao consegue chamar a API
Dentro do Docker, localhost aponta para o proprio container.
Use o IP do gateway Docker: 172.17.0.1 em vez de localhost.

### GEMINI_API_KEY invalida
Obtenha uma nova chave em https://aistudio.google.com/app/apikey
O plano gratuito tem limite de 20 requisicoes por minuto.

## Estrutura do projeto

    ops-ai-agent/
    apps/
        api/          Backend Node.js/Express/Prisma
        web/          Frontend Next.js
    tests/
        performance/  Testes k6
    docs/             Documentacao tecnica
    infra/
        docker/       Documentacao Docker
        scripts/      Scripts utilitarios
    docker-compose.yml
