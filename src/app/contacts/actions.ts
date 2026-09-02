'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

function required(formData: FormData, name: string): string {
  const value = formData.get(name)
  if (typeof value !== 'string' || !value.trim()) throw new Error(`El campo ${name} es obligatorio`)
  return value.trim()
}

function optional(formData: FormData, name: string): string | null {
  const value = formData.get(name)
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

export async function createContactAction(formData: FormData): Promise<void> {
  const contact = await prisma.contact.create({
    data: {
      phoneNumber: required(formData, 'phoneNumber').replace(/\s+/g, ''),
      name: optional(formData, 'name'),
      email: optional(formData, 'email'),
      company: optional(formData, 'company'),
      source: optional(formData, 'source') ?? 'manual',
    },
  })
  revalidatePath('/contacts')
  redirect(`/contacts/${contact.id}`)
}

export async function updateContactAction(formData: FormData): Promise<void> {
  const id = required(formData, 'id')
  await prisma.contact.update({
    where: { id },
    data: {
      phoneNumber: required(formData, 'phoneNumber').replace(/\s+/g, ''),
      name: optional(formData, 'name'),
      email: optional(formData, 'email'),
      company: optional(formData, 'company'),
      source: optional(formData, 'source'),
    },
  })
  revalidatePath('/contacts')
  revalidatePath(`/contacts/${id}`)
}

export async function addContactNoteAction(formData: FormData): Promise<void> {
  const contactId = required(formData, 'contactId')
  await prisma.note.create({
    data: { contactId, content: required(formData, 'content'), createdBy: 'CRM' },
  })
  revalidatePath(`/contacts/${contactId}`)
}
