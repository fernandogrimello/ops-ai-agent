# repositories/

Camada de repositorios — abstrai o acesso ao banco de dados dos controllers.

## Intencao

Esta camada existe para isolar a logica de acesso ao banco (Prisma) dos controllers,
facilitando testes unitarios com mocks e eventual troca de ORM ou banco de dados.

## Status

Atualmente os controllers acessam o Prisma diretamente.
A migracao para repositorios esta planejada como proxima evolucao arquitetural.

## Estrutura planejada

| Arquivo | Responsabilidade |
|---|---|
| ticket.repository.ts | CRUD de tickets |
| customer.repository.ts | CRUD de clientes |
| agent-log.repository.ts | Leitura e escrita de logs do agente |