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
