'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { WhatsAppService } from '@/lib/whatsapp/service'

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

export async function sendConversationMessageAction(formData: FormData): Promise<void> {
  const conversationId = parseRequiredString(formData.get('conversationId'), 'conversationId')
  const message = parseRequiredString(formData.get('message'), 'message')

  const conversation = await prisma.conversation.findUnique({
    where: {
      id: conversationId,
    },
    select: {
      id: true,
      contact: {
        select: {
          phoneNumber: true,
        },
      },
    },
  })

  if (!conversation) {
    throw new Error('La conversación no existe')
  }

  const response = await WhatsAppService.sendWhatsAppMessage(conversation.contact.phoneNumber, message)
  const outboundMessageId = response.messages?.[0]?.id ?? null

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      direction: 'OUTBOUND',
      type: 'TEXT',
      content: message,
      whatsappId: outboundMessageId,
      status: 'SENT',
      sentAt: new Date(),
    },
  })

  await prisma.conversation.update({
    where: {
      id: conversation.id,
    },
    data: {
      lastMessageAt: new Date(),
    },
  })

  revalidatePath(`/conversations/${conversation.id}`)
  revalidatePath('/inbox')
}
