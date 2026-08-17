# Tools - Ops Agent

## get_high_priority_tickets
Retorna todos os atendimentos com prioridade HIGH ou CRITICAL que estao em aberto.

**Quando usar:** Usuario pergunta sobre atendimentos urgentes ou criticos.

**Retorna:** Lista de tickets com dados do cliente.

---

## get_ticket_by_id
Retorna detalhes completos de um atendimento especifico.

**Parametros:** ticketId (string)

**Quando usar:** Usuario menciona um ID de ticket especifico.

**Retorna:** Ticket com cliente, tarefas e logs.

---

## get_customer_by_id
Retorna dados de um cliente e seu historico de atendimentos.

**Parametros:** customerId (string)

**Quando usar:** Usuario pergunta sobre um cliente especifico.

**Retorna:** Cliente com ultimos 5 atendimentos.

---

## create_task
Cria uma tarefa associada a um atendimento.

**Parametros:** ticketId (string), title (string), description (string, opcional)

**Quando usar:** Usuario pede para criar uma tarefa ou acao para um ticket.

**Retorna:** Tarefa criada com ID e status.

---

## update_ticket_status
Atualiza o status de um atendimento.

**Parametros:** ticketId (string), status (OPEN | IN_PROGRESS | RESOLVED | CLOSED)

**Quando usar:** Usuario pede para atualizar o status de um ticket.

**Retorna:** Ticket atualizado.

---

## get_open_tickets_summary
Retorna um resumo dos atendimentos abertos agrupados por prioridade e status.

**Quando usar:** Usuario pede um resumo geral, dashboard ou visao geral do dia.

**Retorna:** Total, contagem por prioridade e por status.
