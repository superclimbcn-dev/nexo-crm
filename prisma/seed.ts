import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('El seed de desarrollo no puede ejecutarse en producción.')
  }

  const seedPassword = process.env.DEV_SEED_PASSWORD
  if (!seedPassword || seedPassword.length < 12) {
    throw new Error('Define DEV_SEED_PASSWORD con al menos 12 caracteres para ejecutar el seed.')
  }

  // Create admin user
  const adminPassword = await bcrypt.hash(seedPassword, 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@nexo.com' },
    update: {},
    create: {
      email: 'admin@nexo.com',
      name: 'Administrador',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  // Create agent user
  const agentPassword = await bcrypt.hash(seedPassword, 10)
  const agent = await prisma.user.upsert({
    where: { email: 'agent@nexo.com' },
    update: {},
    create: {
      email: 'agent@nexo.com',
      name: 'Carlos Silva',
      password: agentPassword,
      role: 'AGENT',
    },
  })

  // Create tags
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { id: '1' },
      update: {},
      create: { id: '1', name: 'VIP', color: '#f59e0b' },
    }),
    prisma.tag.upsert({
      where: { id: '2' },
      update: {},
      create: { id: '2', name: 'Nuevo', color: '#3b82f6' },
    }),
    prisma.tag.upsert({
      where: { id: '3' },
      update: {},
      create: { id: '3', name: 'Cliente', color: '#10b981' },
    }),
  ])

  // Create templates
  const templates = await Promise.all([
    prisma.template.upsert({
      where: { whatsappName: 'boas_vindas' },
      update: {},
      create: {
        name: 'Bienvenida',
        whatsappName: 'bienvenida',
        category: 'UTILITY',
        headerType: 'NONE',
        bodyText: '¡Hola {{1}}! Te damos la bienvenida a Superclim Servicios. ¿Cómo podemos ayudarte?',
        footerText: 'Superclim Servicios',
        language: 'es_ES',
        status: 'APPROVED',
      },
    }),
    prisma.template.upsert({
      where: { whatsappName: 'promocao_black_friday' },
      update: {},
      create: {
        name: 'Información del servicio',
        whatsappName: 'informacion_servicio',
        category: 'MARKETING',
        headerType: 'IMAGE',
        bodyText: 'Hola {{1}}. Te enviamos la información solicitada sobre {{2}}.',
        footerText: 'Superclim Servicios',
        language: 'es_ES',
        status: 'APPROVED',
      },
    }),
    prisma.template.upsert({
      where: { whatsappName: 'follow_up_pos_venda' },
      update: {},
      create: {
        name: 'Seguimiento del servicio',
        whatsappName: 'seguimiento_servicio',
        category: 'UTILITY',
        headerType: 'NONE',
        bodyText: 'Hola {{1}}. ¿Qué tal ha ido el servicio de {{2}}? Estamos a tu disposición.',
        footerText: 'Superclim Servicios',
        language: 'es_ES',
        status: 'APPROVED',
      },
    }),
  ])

  // Create automations
  const automations = await Promise.all([
    prisma.automation.upsert({
      where: { id: '1' },
      update: {},
      create: {
        id: '1',
        name: 'Respuesta automática - Información',
        triggerType: 'KEYWORD',
        triggerConfig: { keywords: ['precio', 'presupuesto', 'coste'] },
        flow: {
          nodes: [
            {
              id: 'start',
              type: 'message',
              content: 'Un asesor de Superclim revisará tu solicitud y te responderá con un presupuesto.',
            },
          ],
        },
        isActive: false,
      },
    }),
    prisma.automation.upsert({
      where: { id: '2' },
      update: {},
      create: {
        id: '2',
        name: 'Bienvenida de nuevo contacto',
        triggerType: 'NEW_CONVERSATION',
        triggerConfig: {},
        flow: {
          nodes: [
            {
              id: 'start',
              type: 'message',
              content: '¡Hola! Te damos la bienvenida a Superclim Servicios.',
            },
          ],
        },
        isActive: false,
      },
    }),
  ])

  // Create settings
  await prisma.settings.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      aiEnabled: false,
      aiModel: 'gpt-4-turbo-preview',
      aiSystemPrompt:
        'Asistente comercial interno de Superclim Servicios. Responde siempre en español.',
      aiTemperature: 0.7,
      aiMaxTokens: 500,
    },
  })

  console.log('Seed completed successfully!')
  console.log({
    admin: admin.email,
    agent: agent.email,
    tags: tags.length,
    templates: templates.length,
    automations: automations.length,
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
