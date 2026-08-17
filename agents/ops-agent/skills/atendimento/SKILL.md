# Skill: Atendimento Operacional

## Descricao
Gerencia o fluxo completo de atendimentos de servicos de ar-condicionado.

## Quando aplicar
Sempre que o usuario mencionar atendimentos, chamados, tickets ou solicitacoes de clientes.

## Fluxo recomendado

1. Identificar o cliente pelo nome ou ID
2. Classificar o tipo de solicitacao:
   - manutencao: aparelho com defeito ou funcionando mal
   - instalacao: instalacao de novo equipamento
   - orcamento: solicitacao de preco
   - urgencia: situacao critica (crianca, idoso, problema de saude)
   - informacao: duvidas gerais
3. Determinar prioridade:
   - CRITICAL: situacao de risco ou urgencia extrema
   - HIGH: impacto significativo no cliente
   - MEDIUM: atendimento padrao
   - LOW: informativo ou sem urgencia
4. Registrar o atendimento no sistema
5. Criar tarefa quando necessario
6. Informar o resultado ao operador

## Exemplo de interacao
Usuario: "Joao Silva ligou reclamando que o ar nao gela e tem um bebe em casa"
Agente:
1. Consulta cliente Joao Silva
2. Classifica como urgencia / CRITICAL
3. Cria tarefa: "Atendimento urgente - presenca de bebe"
4. Informa: "Tarefa criada. Recomendo envio de tecnico hoje."
