import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' })

export interface TicketClassification {
  category: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  summary: string
  suggestedAction: string
}

export async function classifyTicket(description: string): Promise<TicketClassification> {
  const prompt = `You are an operational assistant for ClimaTech, an air conditioning maintenance and installation company.

Analyze the following customer request and respond ONLY with a valid JSON object, no markdown, no explanation:

Request: "${description}"

Respond with this exact JSON structure:
{
  "category": "one of: manutencao, instalacao, orcamento, urgencia, informacao",
  "priority": "one of: LOW, MEDIUM, HIGH, CRITICAL",
  "summary": "brief summary in Portuguese (max 100 chars)",
  "suggestedAction": "recommended action in Portuguese (max 150 chars)"
}`

  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: prompt,
  })

  const text = response.text?.trim() || ''

  try {
    const clean = text.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  } catch {
    return {
      category: 'informacao',
      priority: 'MEDIUM',
      summary: description.slice(0, 100),
      suggestedAction: 'Analisar solicitacao manualmente'
    }
  }
}
