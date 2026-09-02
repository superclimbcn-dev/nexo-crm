import bcrypt from "bcryptjs"
import { PrismaClient, UserRole } from "@prisma/client"

const prisma = new PrismaClient()

class InputError extends Error {}

function requiredEnvironmentVariable(name: string): string {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new InputError(`La variable ${name} es obligatoria.`)
  }

  return value
}

async function main() {
  const email = requiredEnvironmentVariable("SUPERCLIM_ADMIN_EMAIL").toLowerCase()
  const password = requiredEnvironmentVariable("SUPERCLIM_ADMIN_PASSWORD")
  const name = requiredEnvironmentVariable("SUPERCLIM_ADMIN_NAME")

  if (password.length < 14) {
    throw new InputError("La contraseña debe tener al menos 14 caracteres.")
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  })

  if (existingUser) {
    console.log("El usuario administrador ya existe.")
    return
  }

  const passwordHash = await bcrypt.hash(password, 12)

  await prisma.user.create({
    data: {
      email,
      name,
      password: passwordHash,
      role: UserRole.ADMIN,
    },
    select: { id: true },
  })

  console.log("Usuario administrador creado correctamente.")
}

main()
  .catch((error: unknown) => {
    if (error instanceof InputError) {
      console.error(error.message)
    } else {
      console.error("No se pudo crear el usuario administrador.")
    }
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
