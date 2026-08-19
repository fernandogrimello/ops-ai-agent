#!/bin/bash
# setup.sh - Configura o ambiente de desenvolvimento do zero

set -e

echo "[1/5] Copiando .env.example para .env..."
cp -n .env.example .env 2>/dev/null || echo ".env ja existe, pulando..."

echo "[2/5] Subindo servicos Docker..."
docker compose up postgres n8n waha -d

echo "[3/5] Aguardando PostgreSQL ficar pronto..."
sleep 5

echo "[4/5] Instalando dependencias da API..."
cd apps/api && npm install

echo "[5/5] Rodando migrations do banco..."
npx prisma migrate dev

echo ""
echo "Setup concluido!"
echo "Para iniciar a API: cd apps/api && npx tsx src/server.ts"
echo "Para iniciar o frontend: cd apps/web && npm run dev"