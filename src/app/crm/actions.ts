'use server'

import { DealStage } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

function parseRequiredString(value: FormDataEntryValue | null, fieldName: string): string {
  if (typeof value !== 'string') {
    throw new Error(`El campo ${fieldName} es inválido`)
  }

  const parsedValue = value.trim()

  if (!parsedValue) {
    throw new Error(`El campo ${fieldName} es obligatorio`)
  }

  return parsedValue
}

function parseOptionalString(value: FormDataEntryValue | null): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const parsedValue = value.trim()
  return parsedValue ? parsedValue : null
}

function parseStage(value: FormDataEntryValue | null): DealStage {
  const rawStage = parseRequiredString(value, 'etapa')
  const allowedStages: DealStage[] = [
    'NEW',
    'QUALIFIED',
    'PROPOSAL',
    'NEGOTIATION',
    'CLOSED_WON',
    'CLOSED_LOST',
  ]

  if (!allowedStages.includes(rawStage as DealStage)) {
    throw new Error('La etapa seleccionada no es válida')
  }

  return rawStage as DealStage
}

function parseProbability(value: FormDataEntryValue | null): number {
  const rawProbability = parseRequiredString(value, 'probabilidad')
  const probability = Number(rawProbability)

  if (!Number.isFinite(probability) || probability < 0 || probability > 100) {
    throw new Error('La probabilidad debe estar entre 0 y 100')
  }

  return Math.round(probability)
}

function parseAmount(value: FormDataEntryValue | null): string {
  const rawAmount = parseRequiredString(value, 'valor')
  const normalizedValue = rawAmount.replace(',', '.')
  const amount = Number(normalizedValue)

  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error('El valor de la oportunidad es inválido')
  }

  return amount.toFixed(2)
}

function parseOptionalDate(value: FormDataEntryValue | null): Date | null {
  const rawDate = parseOptionalString(value)

  if (!rawDate) {
    return null
  }

  const parsedDate = new Date(`${rawDate}T00:00:00`)

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error('La fecha estimada de cierre es inválida')
  }

  return parsedDate
}

export async function createDealAction(formData: FormData): Promise<void> {
  const contactId = parseRequiredString(formData.get('contactId'), 'contacto')
  const title = parseRequiredString(formData.get('title'), 'título')
  const value = parseAmount(formData.get('value'))
  const stage = parseStage(formData.get('stage'))
  const probability = parseProbability(formData.get('probability'))
  const expectedClose = parseOptionalDate(formData.get('expectedClose'))
  const notes = parseOptionalString(formData.get('notes'))
  const source = parseOptionalString(formData.get('source'))

  await prisma.deal.create({
    data: {
      contactId,
      title,
      value,
      stage,
      probability,
      expectedClose,
      notes,
      source,
      status: stage === 'CLOSED_WON' ? 'WON' : stage === 'CLOSED_LOST' ? 'LOST' : 'OPEN',
    },
  })

  revalidatePath('/crm')
  redirect('/crm')
}
