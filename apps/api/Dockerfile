FROM node:22-alpine

WORKDIR /app

# Instala dependencias
COPY package*.json ./
RUN npm install

# Copia o codigo
COPY . .

# Gera o client do Prisma
RUN npx prisma generate

# Expoe a porta da API
EXPOSE 3001

# Roda migrations e inicia o servidor
CMD ["sh", "-c", "npx prisma migrate deploy && npx tsx src/server.ts"]