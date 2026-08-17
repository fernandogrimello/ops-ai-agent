# Ops Agent - ClimaTech

## Descricao
Agente operacional da ClimaTech responsavel por consultar, classificar e gerenciar atendimentos de servicos de ar-condicionado.

## Modelo
gemini-3.5-flash

## Objetivo
Automatizar o fluxo operacional de atendimentos, reduzindo o tempo de triagem manual e garantindo que solicitacoes criticas sejam tratadas com prioridade.

## Ferramentas disponives
- get_high_priority_tickets
- get_ticket_by_id
- get_customer_by_id
- create_task
- update_ticket_status
- get_open_tickets_summary

## Integrações
- API REST interna (Node.js + Express)
- PostgreSQL via Prisma ORM
- n8n (automacao de processos)
- Google Gemini API
