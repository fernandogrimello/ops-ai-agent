# Workflow: Novo Atendimento Critico

## Descricao
Automatiza o tratamento de atendimentos criticos recebidos via webhook.

## Fluxo
1. Webhook POST /novo-atendimento recebe dados do atendimento
2. IF verifica se prioridade = CRITICAL
3. Se verdadeiro: chama o agente de IA para criar tarefa urgente automaticamente
4. Se falso: encerra sem acao

## Como usar
Production URL: http://localhost:5678/webhook/novo-atendimento

## Payload esperado
{
  "ticketId": "id-do-ticket",
  "title": "titulo do atendimento",
  "priority": "CRITICAL",
  "customer": "nome do cliente",
  "phone": "(xx) xxxxx-xxxx"
}
