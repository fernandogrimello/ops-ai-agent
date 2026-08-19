# Infraestrutura

## Docker

O projeto usa Docker Compose para orquestrar os servicos. O arquivo principal esta na raiz do projeto (docker-compose.yml).

### Servicos

| Servico | Imagem | Porta | Descricao |
|---|---|---|---|
| postgres | postgres:16-alpine | 5433 | Banco de dados da API |
| n8n | n8nio/n8n:latest | 5678 | Plataforma de automacao de workflows |
| waha | devlikeapro/waha | 3002 | API HTTP para WhatsApp (engine NOWEB) |

### Volumes

| Volume | Servico | Descricao |
|---|---|---|
| postgres_data | postgres | Dados persistentes do banco |
| n8n_data | n8n | Workflows e configuracoes do n8n |
| waha_data | waha | Sessoes do WhatsApp |

### Variaveis de ambiente

Copie o arquivo .env.example para .env e preencha as variaveis:

- DATABASE_URL: string de conexao com o PostgreSQL
- JWT_SECRET: chave secreta para assinar tokens JWT
- GEMINI_API_KEY: chave da API do Google Gemini
- WAHA_API_KEY: chave de autenticacao do WAHA

### Notas tecnicas

- PostgreSQL usa porta 5433 (nao 5432) para evitar conflito com instancias locais
- n8n acessa a API via IP do gateway Docker 172.17.0.1 (nao localhost)
- WAHA usa engine NOWEB por compatibilidade com o sistema LID do WhatsApp