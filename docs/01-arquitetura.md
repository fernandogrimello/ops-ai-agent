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
