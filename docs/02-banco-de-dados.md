# Banco de Dados

## Tabelas

### User
id, name, email, password, role (ADMIN|OPERATOR)

### Customer
id, name, email, phone, company

### Ticket
id, title, description
status: OPEN | IN_PROGRESS | RESOLVED | CLOSED
priority: LOW | MEDIUM | HIGH | CRITICAL
category, summary (gerados pela IA)
customerId (FK -> Customer)
assignedTo (FK -> User)

### Task
id, title, description
status: PENDING | IN_PROGRESS | DONE
ticketId (FK -> Ticket)

### AgentLog
id, action, input, output
ticketId (FK -> Ticket)
userId (FK -> User)
createdAt

## Decisoes de design

- IDs com CUID para evitar enumeracao sequencial
- AgentLog registra todas as acoes do agente para observabilidade
- Campo summary armazena o resumo da IA para exibicao rapida
- Banco separado do n8n (ops_api vs ops_ai_agent)
