# Memory - Ops Agent

## Estrategia de memoria
O agente nao possui memoria persistente entre sessoes. Cada interacao e independente.

O contexto da conversa e mantido dentro de uma unica requisicao HTTP.

## Contexto disponivel por requisicao
- Mensagem do usuario
- ID do ticket (opcional, quando fornecido)
- ID do usuario autenticado

## Dados persistidos
Todas as acoes do agente sao registradas na tabela `AgentLog` do banco de dados com:
- Acao executada
- Input recebido
- Output gerado
- Ticket relacionado (quando aplicavel)
- Usuario que acionou
- Timestamp

## Observabilidade
Os logs podem ser consultados via GET /agent/logs (requer autenticacao).
