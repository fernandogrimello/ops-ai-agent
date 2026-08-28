"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { Ticket, AgentLog, Summary } from "@/lib/types"
import { AlertTriangle, CheckCircle, Clock, MessageSquare, LogOut } from "lucide-react"
import { StatsCard } from "@/components/StatsCard"
import { TicketTable } from "@/components/TicketTable"

const priorityColor: Record<string, string> = {
  CRITICAL: "text-red-400 bg-red-400/10",
  HIGH: "text-orange-400 bg-orange-400/10",
  MEDIUM: "text-yellow-400 bg-yellow-400/10",
  LOW: "text-green-400 bg-green-400/10",
}

const statusColor: Record<string, string> = {
  OPEN: "text-blue-400 bg-blue-400/10",
  IN_PROGRESS: "text-yellow-400 bg-yellow-400/10",
  RESOLVED: "text-green-400 bg-green-400/10",
  CLOSED: "text-gray-400 bg-gray-400/10",
}

export default function DashboardPage() {
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [logs, setLogs] = useState<AgentLog[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [agentMessage, setAgentMessage] = useState("")
  const [agentResponse, setAgentResponse] = useState("")
  const [agentLoading, setAgentLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"tickets" | "logs" | "agent">("tickets")
  const [userName, setUserName] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) { router.push("/login"); return }
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    setUserName(user.name || "")
    loadData()
  }, [])

  async function loadData() {
    try {
      const [ticketsRes, logsRes] = await Promise.all([
        api.get("/tickets"),
        api.get("/agent/logs"),
      ])
      setTickets(Array.isArray(ticketsRes.data) ? ticketsRes.data : ticketsRes.data.data || ticketsRes.data.tickets || [])
      setLogs(logsRes.data)
    } catch (err: any) {
      if (err?.response?.status === 401) router.push("/login")
    }
  }

  async function sendAgentMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!agentMessage.trim()) return
    setAgentLoading(true)
    setAgentResponse("")
    try {
      const res = await api.post("/agent/chat", { message: agentMessage })
      setAgentResponse(res.data.response)
      setAgentMessage("")
      loadData()
    } catch {
      setAgentResponse("Erro ao conectar com o agente.")
    } finally {
      setAgentLoading(false)
    }
  }

  function logout() {
    localStorage.clear()
    router.push("/login")
  }

  const criticalCount = tickets.filter(t => t.priority === "CRITICAL" && t.status !== "CLOSED").length
  const openCount = tickets.filter(t => t.status === "OPEN").length
  const resolvedCount = tickets.filter(t => t.status === "RESOLVED" || t.status === "CLOSED").length

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">ClimaTech</h1>
          <p className="text-xs text-gray-400">Sistema Operacional de Atendimentos</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">{userName}</span>
          <button onClick={logout} className="text-gray-400 hover:text-white">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatsCard icon={<AlertTriangle size={16} className="text-red-400" />} label="Criticos" value={criticalCount} color="text-red-400" />
          <StatsCard icon={<Clock size={16} className="text-blue-400" />} label="Em Aberto" value={openCount} color="text-blue-400" />
          <StatsCard icon={<CheckCircle size={16} className="text-green-400" />} label="Resolvidos" value={resolvedCount} color="text-green-400" />
        </div>

        <div className="flex gap-2 mb-4">
          {(["tickets", "agent", "logs"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "bg-gray-900 text-gray-400 hover:text-white border border-gray-800"
              }`}
            >
              {tab === "tickets" ? "Atendimentos" : tab === "agent" ? "Agente IA" : "Logs"}
            </button>
          ))}
        </div>

        {activeTab === "tickets" && (
          <TicketTable tickets={tickets} />
        )}

        {activeTab === "agent" && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare size={16} className="text-blue-400" />
              <h2 className="text-sm font-medium">Agente Operacional</h2>
            </div>

            {agentResponse && (
              <div className="bg-gray-800 rounded-lg p-4 mb-4 text-sm text-gray-200 whitespace-pre-wrap">
                {agentResponse}
              </div>
            )}

            <form onSubmit={sendAgentMessage} className="flex gap-2">
              <input
                type="text"
                value={agentMessage}
                onChange={(e) => setAgentMessage(e.target.value)}
                placeholder="Ex: Quais sao os atendimentos criticos?"
                className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                disabled={agentLoading}
              />
              <button
                type="submit"
                disabled={agentLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded px-4 py-2 text-sm font-medium"
              >
                {agentLoading ? "..." : "Enviar"}
              </button>
            </form>

            <div className="mt-3 flex flex-wrap gap-2">
              {[
                "Quais sao os atendimentos criticos?",
                "Me da um resumo geral",
                "Crie uma tarefa urgente para o ticket mais critico",
              ].map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => setAgentMessage(suggestion)}
                  className="text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded px-2 py-1 border border-gray-700"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === "logs" && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-xs text-gray-400 px-4 py-3">Acao</th>
                  <th className="text-left text-xs text-gray-400 px-4 py-3">Input</th>
                  <th className="text-left text-xs text-gray-400 px-4 py-3">Output</th>
                  <th className="text-left text-xs text-gray-400 px-4 py-3">Horario</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-blue-400">{log.action}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 max-w-xs truncate">{log.input}</td>
                    <td className="px-4 py-3 text-xs text-gray-300 max-w-xs truncate">{log.output}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(log.createdAt).toLocaleTimeString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
