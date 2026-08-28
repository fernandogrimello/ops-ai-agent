# Decisoes Tecnicas

## ADR-001: Monorepo com npm workspaces
Facilita compartilhamento de tipos entre frontend e API.

## ADR-002: Prisma 7 com adapter pg
Prisma 7 moveu a URL de conexao do schema.prisma para prisma.config.ts.
Solucao: configurar datasource com provider e url no prisma.config.ts.

## ADR-003: @google/genai em vez de @google/generative-ai
Chaves no formato AQ. sao incompativeis com o SDK antigo.
Solucao: migrar para @google/genai que suporta o novo formato.

## ADR-004: IP 172.17.0.1 para n8n -> API
n8n roda dentro do Docker; localhost aponta para o proprio container.
Solucao: usar o IP do gateway Docker 172.17.0.1.

## ADR-005: gemini-3.5-flash como modelo principal
Varios modelos foram descontinuados durante o desenvolvimento.
Solucao: listar modelos disponiveis via API antes de escolher.

## ADR-006: Logs persistidos no banco
Toda acao do agente salva na tabela AgentLog para auditoria e debug.

## ADR-007: OpenClaw como gateway de agentes
O projeto usa OpenClaw como gateway de agentes de IA, rodando na porta 18789 via Docker com Node 24.
Motivo: compatibilidade com o formato de skills que a LOCSAT utiliza, suporte nativo a canais de mensagens e endpoint OpenAI-compativel.
Desafio: Node 22.23.1 do host tem bug no SQLite — solucao foi rodar OpenClaw em container Docker com Node 24.
Configuracao necessaria: gateway.http.endpoints.chatCompletions.enabled=true e models.providers.google.apiKey.

## ADR-008: WAHA engine NOWEB para WhatsApp
Engine WEBJS apresentou erro "No LID for user" ao tentar conectar sessao.
Solucao: migrar para engine NOWEB que nao depende do Chrome/Puppeteer e e mais estavel em ambiente Docker.
WAHA roda na porta 3002 com autenticacao via X-API-Key.

## ADR-009: Meta WhatsApp Business API para producao
WAHA e adequado para desenvolvimento e demonstracao mas nao e oficial.
Para producao, a integracao deve ser feita via Meta WhatsApp Cloud API com numero verificado.
O projeto ja tem o app climatech-api configurado no Meta for Developers com numero de teste +1 (555) 205-1806.

## ADR-010: n8n como orquestrador de workflows
Workflow principal: webhook recebe mensagem WhatsApp -> API cria ticket com classificacao por IA -> WAHA envia resposta ao cliente.
IP 172.17.0.1 usado para comunicacao do container n8n com a API no host.
Token JWT fixo no workflow — para producao deve ser substituido por variavel de ambiente do n8n.
