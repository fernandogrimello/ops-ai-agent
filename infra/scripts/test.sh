#!/bin/bash
# test.sh - Roda todos os testes do projeto

set -e

echo "=== Testes de integracao (Jest + Supertest) ==="
cd apps/api && npm test

echo ""
echo "=== Testes de performance (k6) ==="
cd $(git rev-parse --show-toplevel)
k6 run tests/performance/load-test.js

echo ""
echo "Todos os testes concluidos!"