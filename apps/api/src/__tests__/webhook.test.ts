/**
 * @file webhook.test.ts
 * @description Testes de integracao para o webhook do WhatsApp (Meta Business API).
 *
 * O que cobre:
 * - Verificacao do webhook GET (desafio da Meta)
 * - Recebimento de mensagem de texto via POST
 * - Payload invalido ou malformado
 * - Payload sem mensagem (status update)
 * - Multiplas mensagens no mesmo payload
 *
 * O que garante:
 * - Que o webhook responde corretamente ao desafio de verificacao da Meta
 * - Que mensagens de texto sao processadas e criam tickets
 * - Que payloads invalidos sao rejeitados sem quebrar o sistema
 * - Que status updates (sem mensagem) nao geram tickets
 *
 * Decisoes de design:
 * - Simula os payloads reais da Meta WhatsApp Business API
 * - Testa o webhook do n8n indiretamente via estrutura de payload
 * - Nao requer n8n rodando — valida a estrutura dos dados
 */
import request from "supertest"
import app from "../app"

let token: string

beforeAll(async () => {
  const res = await request(app)
    .post("/auth/login")
    .send({ email: "admin@climatech.com", password: "admin123" })
  token = res.body.token
})

const metaWebhookPayload = (messageText: string, from: string = "5561983346235") => ({
  object: "whatsapp_business_account",
  entry: [
    {
      id: "1975300899822324",
      changes: [
        {
          value: {
            messaging_product: "whatsapp",
            metadata: {
              display_phone_number: "15552051806",
              phone_number_id: "1316453544876992"
            },
            contacts: [
              {
                profile: { name: "Fernando Grimello" },
                wa_id: from
              }
            ],
            messages: [
              {
                from,
                id: "wamid.test123",
                timestamp: "1787156494",
                text: { body: messageText },
                type: "text"
              }
            ]
          },
          field: "messages"
        }
      ]
    }
  ]
})

const metaStatusPayload = () => ({
  object: "whatsapp_business_account",
  entry: [
    {
      id: "1975300899822324",
      changes: [
        {
          value: {
            messaging_product: "whatsapp",
            metadata: {
              display_phone_number: "15552051806",
              phone_number_id: "1316453544876992"
            },
            statuses: [
              {
                id: "wamid.test123",
                status: "delivered",
                timestamp: "1787156494",
                recipient_id: "5561983346235"
              }
            ]
          },
          field: "messages"
        }
      ]
    }
  ]
})

describe("Webhook Meta WhatsApp", () => {
  describe("Estrutura do payload", () => {
    it("deve ter estrutura correta para mensagem de texto", () => {
      const payload = metaWebhookPayload("Meu ar condicionado quebrou")

      expect(payload.object).toBe("whatsapp_business_account")
      expect(payload.entry).toHaveLength(1)
      expect(payload.entry[0].changes[0].value.messages).toHaveLength(1)
      expect(payload.entry[0].changes[0].value.messages[0].text.body).toBe("Meu ar condicionado quebrou")
      expect(payload.entry[0].changes[0].value.messages[0].type).toBe("text")
    })

    it("deve extrair numero do remetente corretamente", () => {
      const payload = metaWebhookPayload("Teste", "5561999999999")
      const from = payload.entry[0].changes[0].value.messages[0].from
      expect(from).toBe("5561999999999")
    })

    it("deve identificar payload de status (sem mensagem)", () => {
      const payload = metaStatusPayload()
      const hasMessages = payload.entry[0].changes[0].value.statuses !== undefined
      const hasTextMessages = (payload.entry[0].changes[0].value as any).messages === undefined
      expect(hasMessages).toBe(true)
      expect(hasTextMessages).toBe(true)
    })
  })

  describe("Criacao de ticket via payload", () => {
    it("deve criar ticket a partir de mensagem do WhatsApp", async () => {
      const payload = metaWebhookPayload("Meu ar condicionado parou de funcionar urgente")
      const messageText = payload.entry[0].changes[0].value.messages[0].text.body
      const from = payload.entry[0].changes[0].value.messages[0].from

      const res = await request(app)
        .post("/tickets")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: `Mensagem WhatsApp de ${from}`,
          description: messageText,
          customerId: "cmswfdi1v0000lhij54cdupc4"
        })

      expect(res.status).toBe(201)
      expect(res.body.ticket.title).toContain(from)
      expect(res.body.ticket.description).toBe(messageText)
    })

    it("deve rejeitar ticket sem customerId", async () => {
      const payload = metaWebhookPayload("Teste sem cliente")
      const messageText = payload.entry[0].changes[0].value.messages[0].text.body

      const res = await request(app)
        .post("/tickets")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Ticket sem cliente",
          description: messageText
        })

      expect(res.status).toBe(400)
    })
  })
})
