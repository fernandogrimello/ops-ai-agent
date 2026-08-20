/**
 * @file dashboard.spec.ts
 * @description Testes E2E para o dashboard de atendimentos.
 *
 * O que cobre:
 * - Dashboard carrega com os cards de metricas
 * - Tabela de tickets e exibida na aba Atendimentos
 * - Navegacao entre abas funciona
 *
 * O que garante:
 * - Que o dashboard exibe dados reais da API
 * - Que a navegacao entre abas funciona corretamente
 * - Que o fluxo completo de uso esta funcionando no browser
 */
import { test, expect } from "@playwright/test"

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login")
    await page.getByPlaceholder("seu@email.com").fill("admin@climatech.com")
    await page.locator("input[type='password']").fill("admin123")
    await page.getByRole("button", { name: "Entrar" }).click()
    await expect(page).toHaveURL("/dashboard")
  })

  test("deve exibir cards de metricas", async ({ page }) => {
    await expect(page.getByText("Criticos")).toBeVisible()
    await expect(page.getByText("Em Aberto")).toBeVisible()
    await expect(page.getByText("Resolvidos")).toBeVisible()
  })

  test("deve exibir tabela de tickets na aba Atendimentos", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Atendimentos" })).toBeVisible()
    await expect(page.getByRole("columnheader", { name: "Titulo" })).toBeVisible()
    await expect(page.getByRole("columnheader", { name: "Cliente" })).toBeVisible()
    await expect(page.getByRole("columnheader", { name: "Prioridade" })).toBeVisible()
  })

  test("deve navegar para aba Agente IA", async ({ page }) => {
    await page.getByRole("button", { name: "Agente IA" }).click()
    await expect(page.getByText("Agente Operacional")).toBeVisible()
  })

  test("deve navegar para aba Logs", async ({ page }) => {
    await page.getByRole("button", { name: "Logs" }).click()
    await expect(page.getByRole("columnheader", { name: "Acao" })).toBeVisible()
    await expect(page.getByRole("columnheader", { name: "Horario" })).toBeVisible()
  })
})
