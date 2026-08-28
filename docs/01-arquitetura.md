# Arquitetura do Sistema

## Visao Geral

Frontend (Next.js) -> API REST (Node.js) -> PostgreSQL
                                         -> Google Gemini API
                                         -> n8n (Automacao)

## Componentes

### Frontend (apps/web)
- Next.js 16 com App Router
- Tailwind CSS para estilizacao
- Paginas: Login, Dashboard (tickets, agente, logs)

### API (apps/api)
- Node.js + Express + TypeScript
- Autenticacao JWT com bcrypt
- Validacao com Zod
- ORM: Prisma 7 com adapter pg

### Agente de IA
- Google Gemini via SDK @google/genai
- 6 ferramentas operacionais
- Logs persistidos no banco
- Skills documentadas no formato OpenClaw

### Automacao (n8n)
- Webhook: POST /webhook/novo-atendimento
- Condicional: IF prioridade = CRITICAL
- Acao: chama agente para criar tarefa automaticamente

## Fluxo de um atendimento

1. Cliente envia solicitacao
2. POST /tickets com titulo, descricao e customerId
3. API chama Gemini para classificar
4. Gemini retorna: categoria, prioridade, resumo, acao sugerida
5. Ticket salvo com classificacao
6. Se CRITICAL: n8n cria tarefa automaticamente
7. Dashboard exibe ticket classificado


## Fluxo WhatsApp (integracao completa)

1. Cliente envia mensagem no WhatsApp
2. WAHA (porta 3002) recebe via webhook
3. n8n (porta 5678) processa o payload
4. HTTP Request chama POST http://172.17.0.1:3001/tickets
5. API Node.js classifica com Google Gemini
6. Ticket salvo no PostgreSQL com categoria e prioridade
7. n8n chama WAHA POST /api/sendText
8. Cliente recebe resposta automatica com ID do ticket

## OpenClaw Gateway

O OpenClaw roda na porta 18789 como gateway de agentes, expondo:
- Endpoint OpenAI-compativel: POST /v1/chat/completions
- Modelo: google/gemini-3.5-flash
- Autenticacao: Bearer token
- SKILL.md da ClimaTech define o comportamento do agente

Para producao, o n8n pode chamar o OpenClaw diretamente em vez da API,
delegando toda a logica de classificacao e resposta ao agente.
