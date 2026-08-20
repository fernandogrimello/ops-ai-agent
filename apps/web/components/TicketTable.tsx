import React from "react"
import { Ticket } from "@/lib/types"
import { PriorityBadge } from "./PriorityBadge"
import { StatusBadge } from "./StatusBadge"

interface TicketTableProps {
  tickets: Ticket[]
}

export function TicketTable({ tickets }: TicketTableProps) {
  if (tickets.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center text-gray-500 text-sm">
        Nenhum atendimento encontrado
      </div>
    )
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="text-left text-xs text-gray-400 px-4 py-3">Titulo</th>
            <th className="text-left text-xs text-gray-400 px-4 py-3">Cliente</th>
            <th className="text-left text-xs text-gray-400 px-4 py-3">Prioridade</th>
            <th className="text-left text-xs text-gray-400 px-4 py-3">Status</th>
            <th className="text-left text-xs text-gray-400 px-4 py-3">Categoria</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map(ticket => (
            <tr key={ticket.id} className="border-b border-gray-800 hover:bg-gray-800/50">
              <td className="px-4 py-3">
                <p className="text-sm font-medium">{ticket.title}</p>
                {ticket.summary && (
                  <p className="text-xs text-gray-400 mt-0.5">{ticket.summary}</p>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-gray-300">
                {ticket.customer.name}
                {ticket.customer.company && (
                  <span className="text-gray-500"> / {ticket.customer.company}</span>
                )}
              </td>
              <td className="px-4 py-3">
                <PriorityBadge priority={ticket.priority} />
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={ticket.status} />
              </td>
              <td className="px-4 py-3 text-sm text-gray-400">
                {ticket.category || "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
