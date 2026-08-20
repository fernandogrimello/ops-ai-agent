import React from "react"

const statusColor: Record<string, string> = {
  OPEN: "text-blue-400 bg-blue-400/10",
  IN_PROGRESS: "text-yellow-400 bg-yellow-400/10",
  RESOLVED: "text-green-400 bg-green-400/10",
  CLOSED: "text-gray-400 bg-gray-400/10",
}

const statusLabel: Record<string, string> = {
  OPEN: "Aberto",
  IN_PROGRESS: "Em Andamento",
  RESOLVED: "Resolvido",
  CLOSED: "Fechado",
}

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`text-xs px-2 py-1 rounded font-medium ${statusColor[status] || "text-gray-400 bg-gray-400/10"}`}>
      {statusLabel[status] || status}
    </span>
  )
}
