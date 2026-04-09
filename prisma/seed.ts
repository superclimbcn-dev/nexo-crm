import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
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
  const agentPassword = await bcrypt.hash('agent123', 10)
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
      create: { id: '2', name: 'Novo', color: '#3b82f6' },
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
        name: 'Boas-vindas',
        whatsappName: 'boas_vindas',
        category: 'UTILITY',
        headerType: 'NONE',
        bodyText: 'Olá {{1}}! Bem-vindo à Nexo Digital. Como podemos ajudar você hoje?',
        footerText: 'Equipe Nexo Digital',
        status: 'APPROVED',
      },
    }),
    prisma.template.upsert({
      where: { whatsappName: 'promocao_black_friday' },
      update: {},
      create: {
        name: 'Promoção Black Friday',
        whatsappName: 'promocao_black_friday',
        category: 'MARKETING',
        headerType: 'IMAGE',
        bodyText: '🎉 Black Friday! Aproveite {{1}}% de desconto em todos os planos. Válido até {{2}}.',
        footerText: 'Não perca!',
        status: 'APPROVED',
      },
    }),
    prisma.template.upsert({
      where: { whatsappName: 'follow_up_pos_venda' },
      update: {},
      create: {
        name: 'Follow-up Pós-venda',
        whatsappName: 'follow_up_pos_venda',
        category: 'UTILITY',
        headerType: 'NONE',
        bodyText: 'Olá {{1}}! Tudo bem com o {{2}}? Precisa de algum suporte?',
        footerText: 'Estamos aqui para ajudar!',
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
        name: 'Resposta Automática - Preço',
        triggerType: 'KEYWORD',
        triggerConfig: { keywords: ['preço', 'valor', 'custo', 'quanto'] },
        flow: {
          nodes: [
            {
              id: 'start',
              type: 'message',
              content:
                'Olá! Nossos planos são:\n\nStarter: R$ 99/mês\nPro: R$ 299/mês\nEnterprise: Sob consulta\n\nQual você tem interesse?',
            },
          ],
        },
        isActive: true,
      },
    }),
    prisma.automation.upsert({
      where: { id: '2' },
      update: {},
      create: {
        id: '2',
        name: 'Boas-vindas Novo Contato',
        triggerType: 'NEW_CONVERSATION',
        triggerConfig: {},
        flow: {
          nodes: [
            {
              id: 'start',
              type: 'message',
              content:
                'Olá! Bem-vindo à Nexo Digital! 🎉\n\nSou seu assistente virtual e estou aqui para ajudar. Como posso ser útil hoje?',
            },
          ],
        },
        isActive: true,
      },
    }),
  ])

  // Create settings
  await prisma.settings.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      aiEnabled: true,
      aiModel: 'gpt-4-turbo-preview',
      aiSystemPrompt:
        'Você é um assistente de vendas da Nexo Digital. Seja cordial, profissional e objetivo. Se não souber a resposta, sugira falar com um humano.',
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
