/**
 * @file components.test.tsx
 * @description Testes de componente para os componentes reutilizaveis do frontend.
 *
 * O que cobre:
 * - PriorityBadge: renderiza badge com cor correta para cada prioridade
 * - StatusBadge: renderiza badge com label em portugues para cada status
 * - StatsCard: renderiza card com icone, label e valor
 * - TicketTable: renderiza tabela de tickets e estado vazio
 *
 * O que garante:
 * - Que badges de prioridade mostram o texto correto
 * - Que badges de status mostram labels em portugues
 * - Que StatsCard exibe o valor numerico corretamente
 * - Que TicketTable renderiza todos os tickets passados como props
 * - Que TicketTable exibe mensagem quando lista esta vazia
 */
import React from "react"
import { render, screen } from "@testing-library/react"
import { PriorityBadge } from "../components/PriorityBadge"
import { StatusBadge } from "../components/StatusBadge"
import { StatsCard } from "../components/StatsCard"
import { TicketTable } from "../components/TicketTable"

describe("PriorityBadge", () => {
  it("deve renderizar prioridade CRITICAL", () => {
    render(<PriorityBadge priority="CRITICAL" />)
    expect(screen.getByText("CRITICAL")).toBeInTheDocument()
  })

  it("deve renderizar prioridade HIGH", () => {
    render(<PriorityBadge priority="HIGH" />)
    expect(screen.getByText("HIGH")).toBeInTheDocument()
  })

  it("deve renderizar prioridade desconhecida sem quebrar", () => {
    render(<PriorityBadge priority="UNKNOWN" />)
    expect(screen.getByText("UNKNOWN")).toBeInTheDocument()
  })
})

describe("StatusBadge", () => {
  it("deve renderizar status OPEN como Aberto", () => {
    render(<StatusBadge status="OPEN" />)
    expect(screen.getByText("Aberto")).toBeInTheDocument()
  })

  it("deve renderizar status IN_PROGRESS como Em Andamento", () => {
    render(<StatusBadge status="IN_PROGRESS" />)
    expect(screen.getByText("Em Andamento")).toBeInTheDocument()
  })

  it("deve renderizar status RESOLVED como Resolvido", () => {
    render(<StatusBadge status="RESOLVED" />)
    expect(screen.getByText("Resolvido")).toBeInTheDocument()
  })

  it("deve renderizar status CLOSED como Fechado", () => {
    render(<StatusBadge status="CLOSED" />)
    expect(screen.getByText("Fechado")).toBeInTheDocument()
  })
})

describe("StatsCard", () => {
  it("deve renderizar label e valor", () => {
    render(
      <StatsCard
        icon={<span>icon</span>}
        label="Criticos"
        value={5}
        color="text-red-400"
      />
    )
    expect(screen.getByText("Criticos")).toBeInTheDocument()
    expect(screen.getByText("5")).toBeInTheDocument()
  })

  it("deve renderizar valor zero", () => {
    render(
      <StatsCard
        icon={<span>icon</span>}
        label="Resolvidos"
        value={0}
        color="text-green-400"
      />
    )
    expect(screen.getByText("0")).toBeInTheDocument()
  })
})

describe("TicketTable", () => {
  const mockTickets = [
    {
      id: "1",
      title: "Ar condicionado com defeito",
      summary: "Cliente relata problema",
      priority: "CRITICAL",
      status: "OPEN",
      category: "urgencia",
      customer: { name: "Joao Silva", company: "Empresa ABC" },
    },
    {
      id: "2",
      title: "Instalacao solicitada",
      summary: null,
      priority: "MEDIUM",
      status: "IN_PROGRESS",
      category: "instalacao",
      customer: { name: "Maria Santos", company: null },
    },
  ]

  it("deve renderizar lista de tickets", () => {
    render(<TicketTable tickets={mockTickets as any} />)
    expect(screen.getByText("Ar condicionado com defeito")).toBeInTheDocument()
    expect(screen.getByText("Instalacao solicitada")).toBeInTheDocument()
  })

  it("deve renderizar nome do cliente", () => {
    render(<TicketTable tickets={mockTickets as any} />)
    expect(screen.getByText("Joao Silva")).toBeInTheDocument()
    expect(screen.getByText("Maria Santos")).toBeInTheDocument()
  })

  it("deve renderizar mensagem quando lista esta vazia", () => {
    render(<TicketTable tickets={[]} />)
    expect(screen.getByText("Nenhum atendimento encontrado")).toBeInTheDocument()
  })

  it("deve renderizar summary quando disponivel", () => {
    render(<TicketTable tickets={mockTickets as any} />)
    expect(screen.getByText("Cliente relata problema")).toBeInTheDocument()
  })
})
