# ops-ai-agent

Plataforma de automacao operacional com IA para empresas de servicos.

Desenvolvido como laboratorio pratico para explorar agentes de IA, automacao de processos e integracao entre APIs REST, banco de dados e ferramentas externas. O cenario ficticio e a ClimaTech, empresa de manutencao e instalacao de ar-condicionado.

## O problema

Empresas de servicos recebem dezenas de solicitacoes por dia e perdem tempo classificando manualmente cada uma, cadastrando clientes, criando tarefas e distribuindo os servicos. O objetivo deste projeto e automatizar esse fluxo usando IA.

## Tecnologias

**Backend:** Node.js, Express, TypeScript, Prisma ORM, PostgreSQL
**IA:** Google Gemini API, agente com ferramentas, OpenClaw skills
**Automacao:** n8n (webhook + condicional + HTTP)
**Infra:** Docker, Docker Compose, Git, GitHub

## API

| Metodo | Rota | Descricao |
|---|---|---|
| POST | /auth/register | Cadastro de usuario |
| POST | /auth/login | Login com JWT |
| GET | /customers | Lista clientes |
| POST | /customers | Cria cliente |
| GET | /tickets | Lista atendimentos |
| POST | /tickets | Cria atendimento com classificacao por IA |
| POST | /agent/chat | Conversa com o agente operacional |
| GET | /agent/logs | Historico de acoes do agente |
| GET | /health | Health check |

## Como executar

```bash
git clone https://github.com/fernandogrimello/ops-ai-agent.git
cd ops-ai-agent
cp .env.example .env
docker compose up postgres n8n -d
cd apps/api && npm install
npx prisma migrate dev
npx tsx src/server.ts
```

## Desafios encontrados

- Prisma 7 mudou completamente a forma de configurar datasource
- n8n dentro do Docker nao acessa localhost do host - necessario usar IP 172.17.0.1
- Google Gemini descontinuou modelos antigos - necessario listar modelos via API
- SDK @google/generative-ai incompativel com chaves AQ. - migrado para @google/genai

## Autor

Luiz Fernando Grimello
github.com/fernandogrimello
