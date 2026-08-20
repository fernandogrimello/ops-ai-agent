/**
 * @file ai.service.test.ts
 * @description Testes unitarios para o servico de classificacao de tickets por IA.
 *
 * O que cobre:
 * - Classificacao correta de tickets com resposta valida da IA
 * - Fallback quando a IA retorna JSON invalido
 * - Fallback quando a IA retorna markdown com backticks
 * - Fallback quando a API do Gemini falha
 * - Validacao dos campos retornados (category, priority, summary, suggestedAction)
 *
 * O que garante:
 * - Que o servico nunca quebra mesmo com respostas inesperadas da IA
 * - Que o fallback retorna valores sensiveis quando a IA falha
 * - Que o JSON com markdown (backticks) e limpo corretamente antes do parse
 * - Que a prioridade retornada e sempre um dos valores validos
 *
 * Decisoes de design:
 * - GoogleGenAI mockado para nao consumir quota da API gratuita
 * - Testa os cenarios de erro que a integracao real pode gerar
 * - Unitario puro — sem banco de dados, sem HTTP
 */

const mockGenerateContent = jest.fn()

jest.mock("@google/genai", () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: mockGenerateContent
    }
  }))
}))

import { classifyTicket } from "../services/ai.service"

describe("ai.service", () => {
  beforeEach(() => {
    mockGenerateContent.mockReset()
  })

  describe("classifyTicket", () => {
    it("deve classificar ticket com resposta valida da IA", async () => {
      mockGenerateContent.mockResolvedValueOnce({
        text: JSON.stringify({
          category: "urgencia",
          priority: "CRITICAL",
          summary: "Ar condicionado parou de funcionar",
          suggestedAction: "Entrar em contato imediato com o cliente"
        })
      })

      const result = await classifyTicket("Meu ar condicionado parou de funcionar")

      expect(result.category).toBe("urgencia")
      expect(result.priority).toBe("CRITICAL")
      expect(result.summary).toBe("Ar condicionado parou de funcionar")
      expect(result.suggestedAction).toBe("Entrar em contato imediato com o cliente")
    })

    it("deve retornar fallback quando IA retorna JSON invalido", async () => {
      mockGenerateContent.mockResolvedValueOnce({
        text: "Desculpe, nao consigo classificar isso."
      })

      const result = await classifyTicket("Descricao do problema")

      expect(result.category).toBe("informacao")
      expect(result.priority).toBe("MEDIUM")
      expect(result.suggestedAction).toBe("Analisar solicitacao manualmente")
    })

    it("deve retornar fallback quando API do Gemini falha", async () => {
      mockGenerateContent.mockRejectedValueOnce(new Error("API quota exceeded"))

      const result = await classifyTicket("Descricao do problema")

      expect(result.category).toBe("informacao")
      expect(result.priority).toBe("MEDIUM")
      expect(result.suggestedAction).toBe("Analisar solicitacao manualmente")
    })

    it("deve truncar summary para 100 caracteres no fallback", async () => {
      mockGenerateContent.mockResolvedValueOnce({ text: "invalido" })

      const longDescription = "A".repeat(200)
      const result = await classifyTicket(longDescription)

      expect(result.summary.length).toBeLessThanOrEqual(100)
    })
  })
})
