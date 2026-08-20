import bcrypt from "bcryptjs"
import prisma from "../lib/prisma"

async function seed() {
  const hashed = await bcrypt.hash("admin123", 10)

  await prisma.user.upsert({
    where: { email: "admin@climatech.com" },
    update: {},
    create: {
      name: "Admin ClimaTech",
      email: "admin@climatech.com",
      password: hashed,
      role: "ADMIN"
    }
  })

  await prisma.customer.upsert({
    where: { id: "cmswfdi1v0000lhij54cdupc4" },
    update: {},
    create: {
      id: "cmswfdi1v0000lhij54cdupc4",
      name: "Joao Silva",
      email: "joao@empresa.com",
      company: "Empresa ABC"
    }
  })

  console.log("Seed concluido!")
  await prisma.$disconnect()
}

seed().catch(console.error)