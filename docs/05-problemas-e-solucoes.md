# Problemas Encontrados e Solucoes

## 001: Prisma 7 quebrou configuracao de datasource
Sintoma: error: The datasource property url is no longer supported
Causa: Prisma 7 moveu URL do schema.prisma para prisma.config.ts
Solucao: configurar datasource completo no prisma.config.ts

## 002: n8n nao acessava a API
Sintoma: The service refused the connection
Causa: localhost dentro do Docker aponta para o proprio container
Solucao: usar IP do gateway Docker 172.17.0.1

## 003: Modelos Gemini descontinuados
Sintoma: 404 NOT_FOUND - This model is no longer available
Causa: Google descontinuou gemini-2.0-flash e gemini-1.5-flash
Solucao: listar modelos via API e usar gemini-3.5-flash

## 004: SDK incompativel com chaves AQ.
Sintoma: 400 API_KEY_INVALID com @google/generative-ai
Causa: chaves AQ. sao incompativeis com SDK antigo
Solucao: migrar para @google/genai

## 005: Porta 5432 em uso
Sintoma: Docker nao subia PostgreSQL na porta 5432
Causa: PostgreSQL local do RouletApp ja ocupava a porta
Solucao: mapear para porta 5433 no docker-compose.yml

## 006: n8n usou o mesmo banco da API
Sintoma: Drift detected - banco tinha 100+ tabelas do n8n
Causa: n8n e API compartilhavam o banco ops_ai_agent
Solucao: criar banco separado ops_api exclusivo para a API
