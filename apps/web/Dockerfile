FROM node:22-alpine

WORKDIR /app

# Instala dependencias
COPY package*.json ./
RUN npm install

# Copia o codigo
COPY . .

# Build do Next.js
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

# Expoe a porta do frontend
EXPOSE 3000

# Inicia o servidor Next.js
CMD ["npm", "start"]