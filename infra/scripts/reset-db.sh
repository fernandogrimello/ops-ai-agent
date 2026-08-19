#!/bin/bash
# reset-db.sh - Reseta o banco de dados (cuidado: apaga todos os dados)

set -e

echo "ATENCAO: Este script apaga todos os dados do banco!"
read -p "Tem certeza? (s/N): " confirm

if [ "$confirm" != "s" ]; then
    echo "Operacao cancelada."
    exit 0
fi

echo "[1/3] Derrubando containers..."
docker compose down -v

echo "[2/3] Subindo banco limpo..."
docker compose up postgres -d
sleep 5

echo "[3/3] Rodando migrations..."
cd apps/api && npx prisma migrate dev

echo "Banco resetado com sucesso!"