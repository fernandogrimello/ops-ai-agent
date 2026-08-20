/**
 * @file auth.spec.ts
 * @description Testes E2E para o fluxo de autenticacao.
 *
 * O que cobre:
 * - Pagina de login renderiza corretamente
 * - Login com credenciais validas redireciona para dashboard
 * - Login com credenciais invalidas mostra erro
 * - Redirecionamento para login quando nao autenticado
 *
 * O que garante:
 * - Que o fluxo completo de autenticacao funciona no browser
 * - Que usuarios nao autenticados sao redirecionados para login
 * - Que erros de autenticacao sao exibidos corretamente
 */
import { test, expect } from "@playwright/test"

test.describe("Autenticacao", () => {
  test("deve exibir pagina de login", async ({ page }) => {
    await page.goto("/login")
    await expect(page).toHaveURL("/login")
    await expect(page.getByPlaceholder("seu@email.com")).toBeVisible()
    await expect(page.getByRole("heading", { name: "ClimaTech" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible()
  })

  test("deve fazer login com credenciais validas", async ({ page }) => {
    await page.goto("/login")
    await page.getByPlaceholder("seu@email.com").fill("admin@climatech.com")
    await page.locator("input[type='password']").fill("admin123")
    await page.getByRole("button", { name: "Entrar" }).click()
    await expect(page).toHaveURL("/dashboard")
    await expect(page.getByRole("heading", { name: "ClimaTech" })).toBeVisible()
  })

  test("deve mostrar erro com credenciais invalidas", async ({ page }) => {
    await page.goto("/login")
    await page.getByPlaceholder("seu@email.com").fill("admin@climatech.com")
    await page.locator("input[type='password']").fill("senhaerrada")
    await page.getByRole("button", { name: "Entrar" }).click()
    await expect(page.getByText("Email ou senha invalidos")).toBeVisible({ timeout: 10000 })
  })

  test("deve redirecionar para login ao acessar dashboard sem autenticacao", async ({ page }) => {
    await page.goto("/dashboard")
    await expect(page).toHaveURL("/login")
  })
})
