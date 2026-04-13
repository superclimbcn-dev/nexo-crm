'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

function parseAutomationId(value: FormDataEntryValue | null): string {
  if (typeof value !== 'string') {
    throw new Error('Identificador de automatización inválido')
  }

  const automationId = value.trim()

  if (!automationId) {
    throw new Error('Identificador de automatización vacío')
  }

  return automationId
}

function parseNextState(value: FormDataEntryValue | null): boolean {
  if (typeof value !== 'string') {
    throw new Error('Estado de automatización inválido')
  }

  if (value === 'true') {
    return true
  }

  if (value === 'false') {
    return false
  }

  throw new Error('Estado de automatización no soportado')
}

export async function toggleAutomationAction(formData: FormData): Promise<void> {
  const automationId = parseAutomationId(formData.get('automationId'))
  const nextIsActive = parseNextState(formData.get('nextIsActive'))

  await prisma.automation.update({
    where: {
      id: automationId,
    },
    data: {
      isActive: nextIsActive,
    },
  })

  revalidatePath('/automations')
}
