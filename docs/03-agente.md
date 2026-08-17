# Agente de IA

## Ciclo de execucao

1. Usuario envia mensagem para POST /agent/chat
2. API monta prompt com descricao das ferramentas
3. Gemini responde com JSON: {"tool": "nome", "params": {}}
4. API executa a ferramenta no banco
5. API envia resultado para o Gemini gerar resposta em portugues
6. Resposta retornada ao usuario
7. Toda a interacao salva no AgentLog

## Ferramentas

| Ferramenta | O que faz |
|---|---|
| get_high_priority_tickets | Lista tickets CRITICAL e HIGH em aberto |
| get_ticket_by_id | Detalhes completos do ticket |
| get_customer_by_id | Dados do cliente e historico |
| create_task | Cria tarefa para o ticket |
| update_ticket_status | Atualiza status do ticket |
| get_open_tickets_summary | Resumo por prioridade e status |

## Classificacao automatica

Ao criar um ticket via POST /tickets, a IA classifica automaticamente:
- category: manutencao, instalacao, orcamento, urgencia, informacao
- priority: LOW, MEDIUM, HIGH, CRITICAL
- summary: resumo em portugues (max 100 chars)
- suggestedAction: acao recomendada
