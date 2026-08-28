import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"
import dotenv from "dotenv"

dotenv.config()

const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Seeding database...")

  // Admin user
  const hashedPassword = await bcrypt.hash("admin123", 10)
  const admin = await prisma.user.upsert({
    where: { email: "admin@climatech.com" },
    update: {},
    create: {
      name: "Admin ClimaTech",
      email: "admin@climatech.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  })

  // Clientes
  const joao = await prisma.customer.upsert({
    where: { email: "joao.silva@email.com" },
    update: {},
    create: {
      name: "Joao Silva",
      email: "joao.silva@email.com",
      phone: "(61) 99999-0001",
      company: "Empresa ABC",
    },
  })

  const maria = await prisma.customer.upsert({
    where: { email: "maria.santos@email.com" },
    update: {},
    create: {
      name: "Maria Santos",
      email: "maria.santos@email.com",
      phone: "(61) 99999-0002",
      company: "Comercio XYZ",
    },
  })

  const carlos = await prisma.customer.upsert({
    where: { email: "carlos.oliveira@email.com" },
    update: {},
    create: {
      name: "Carlos Oliveira",
      email: "carlos.oliveira@email.com",
      phone: "(61) 99999-0003",
      company: "Escritorio Central",
    },
  })

  const ana = await prisma.customer.upsert({
    where: { email: "ana.costa@email.com" },
    update: {},
    create: {
      name: "Ana Costa",
      email: "ana.costa@email.com",
      phone: "(61) 99999-0004",
    },
  })

  // Tickets
  const t1 = await prisma.ticket.create({
    data: {
      title: "Ar-condicionado nao gela — bebe em casa",
      description: "Split 12000 BTUs parou de gelar. Ja limpei o filtro mas nao resolveu. Tenho bebe em casa, situacao urgente.",
      status: "OPEN",
      priority: "CRITICAL",
      category: "urgencia",
      summary: "Split 12000 BTUs parou de gelar. Filtro limpo. Urgente — bebe em casa.",
      customerId: joao.id,
    },
  })

  const t2 = await prisma.ticket.create({
    data: {
      title: "Instalacao de 3 aparelhos no escritorio",
      description: "Preciso instalar 3 aparelhos de ar-condicionado de 18000 BTUs no novo escritorio. Ambiente comercial, 80m2 cada sala.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      category: "instalacao",
      summary: "Instalacao de 3 splits 18000 BTUs em ambiente comercial.",
      customerId: carlos.id,
      assignedTo: admin.id,
    },
  })

  const t3 = await prisma.ticket.create({
    data: {
      title: "Orcamento manutencao preventiva anual",
      description: "Gostaria de receber orcamento para manutencao preventiva anual de 5 aparelhos split na minha empresa.",
      status: "OPEN",
      priority: "MEDIUM",
      category: "orcamento",
      summary: "Orcamento para manutencao preventiva anual de 5 splits.",
      customerId: maria.id,
    },
  })

  const t4 = await prisma.ticket.create({
    data: {
      title: "Ar fazendo barulho estranho",
      description: "O ar-condicionado do quarto esta fazendo um barulho de vibracao quando liga. Nao para de funcionar mas incomoda muito.",
      status: "OPEN",
      priority: "MEDIUM",
      category: "manutencao",
      summary: "Aparelho fazendo vibracao ao ligar. Funcionamento normal mas barulhento.",
      customerId: ana.id,
    },
  })

  const t5 = await prisma.ticket.create({
    data: {
      title: "Manutencao corretiva — nao liga",
      description: "Ar-condicionado da sala de reunioes parou de funcionar completamente. Aparelho tem 3 anos de uso.",
      status: "RESOLVED",
      priority: "HIGH",
      category: "manutencao",
      summary: "Aparelho de 3 anos parou de funcionar. Sala de reunioes.",
      customerId: carlos.id,
      assignedTo: admin.id,
    },
  })

  const t6 = await prisma.ticket.create({
    data: {
      title: "Duvida sobre limpeza do filtro",
      description: "Com que frequencia devo limpar o filtro do ar-condicionado? Tenho um split de 9000 BTUs em casa.",
      status: "CLOSED",
      priority: "LOW",
      category: "informacao",
      summary: "Duvida sobre frequencia de limpeza de filtro split 9000 BTUs.",
      customerId: maria.id,
    },
  })

  // Tarefas
  await prisma.task.create({
    data: {
      title: "Enviar tecnico em regime de urgencia",
      description: "Atendimento critico — bebe em casa. Prioridade maxima. Contato: (61) 99999-0001",
      status: "PENDING",
      ticketId: t1.id,
    },
  })

  await prisma.task.create({
    data: {
      title: "Realizar medicao das salas",
      description: "Medir as 3 salas para confirmar BTUs necessarios e tipo de instalacao",
      status: "IN_PROGRESS",
      ticketId: t2.id,
      assignedTo: admin.id,
    },
  })

  await prisma.task.create({
    data: {
      title: "Enviar orcamento por email",
      description: "Preparar orcamento detalhado para 5 aparelhos e enviar para maria.santos@email.com",
      status: "PENDING",
      ticketId: t3.id,
    },
  })

  // Logs do agente
  await prisma.agentLog.create({
    data: {
      action: "AI_CLASSIFICATION",
      input: "Split 12000 BTUs parou de gelar. Ja limpei o filtro mas nao resolveu. Tenho bebe em casa.",
      output: JSON.stringify({ category: "urgencia", priority: "CRITICAL", summary: "Split 12000 BTUs parou de gelar. Filtro limpo. Urgente — bebe em casa.", suggestedAction: "Enviar tecnico em regime de urgencia prioritaria." }),
      ticketId: t1.id,
      userId: admin.id,
    },
  })

  await prisma.agentLog.create({
    data: {
      action: "get_high_priority_tickets",
      input: "Quais sao os atendimentos criticos?",
      output: "Temos 1 atendimento critico: Joao Silva — Split 12000 BTUs parou de gelar, bebe em casa.",
      userId: admin.id,
    },
  })

  console.log("Seed concluido com sucesso!")
  console.log(`- ${await prisma.customer.count()} clientes`)
  console.log(`- ${await prisma.ticket.count()} atendimentos`)
  console.log(`- ${await prisma.task.count()} tarefas`)
  console.log(`- ${await prisma.agentLog.count()} logs do agente`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
