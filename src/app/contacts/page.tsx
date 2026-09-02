import Link from 'next/link'
import { Prisma } from '@prisma/client'
import {
  Download,
  Filter,
  MoreVertical,
  Phone,
  Plus,
  Search,
  Upload,
} from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { prisma } from '@/lib/prisma'
import { formatRelativeTime } from '@/lib/utils'

const contactsQuery = Prisma.validator<Prisma.ContactFindManyArgs>()({
  include: {
    tags: {
      select: {
        id: true,
        name: true,
        color: true,
      },
    },
    conversations: {
      orderBy: {
        lastMessageAt: 'desc',
      },
      select: {
        id: true,
        lastMessageAt: true,
      },
    },
  },
  orderBy: {
    updatedAt: 'desc',
  },
})

type ContactListItem = Prisma.ContactGetPayload<typeof contactsQuery>

function getSearchValue(searchParams?: { q?: string }): string {
  return searchParams?.q?.trim() ?? ''
}

function getContactInitials(contact: ContactListItem): string {
  const name = contact.name?.trim()

  if (!name) {
    return 'SC'
  }

  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function getContactDisplayName(contact: ContactListItem): string {
  return contact.name?.trim() || 'Cliente sin nombre'
}

function getContactLink(contact: ContactListItem): string {
  return `/contacts/${contact.id}`
}

export default async function ContactsPage({
  searchParams,
}: {
  searchParams?: { q?: string }
}) {
  const searchValue = getSearchValue(searchParams)

  const contacts = await prisma.contact.findMany({
    ...contactsQuery,
    where: searchValue
      ? {
          OR: [
            {
              name: {
                contains: searchValue,
                mode: 'insensitive',
              },
            },
            {
              phoneNumber: {
                contains: searchValue,
              },
            },
          ],
        }
      : undefined,
  })

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Contactos</h1>
            <p className="text-muted-foreground">Gestiona tus contactos y leads reales</p>
          </div>
          <div className="flex gap-2">
            <Button disabled variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Importar
            </Button>
            <Button disabled variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button asChild>
              <Link href="/contacts/new">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Contacto
              </Link>
            </Button>
          </div>
        </div>

        <form className="flex gap-4" method="get">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-10"
              defaultValue={searchValue}
              name="q"
              placeholder="Buscar por nombre o teléfono..."
            />
          </div>
          <Button type="submit" variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filtrar
          </Button>
        </form>

        <div className="overflow-hidden rounded-lg border border-border bg-card">
          {contacts.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">Contacto</th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">Teléfono</th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">Empresa</th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">Origen</th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">Etiquetas</th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">Último Contacto</th>
                  <th className="p-4 text-right text-sm font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => {
                  const lastConversationAt = contact.conversations[0]?.lastMessageAt ?? contact.updatedAt

                  return (
                    <tr key={contact.id} className="border-b border-border hover:bg-secondary/50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={contact.avatar || ''} />
                            <AvatarFallback className="bg-primary/20 text-primary">
                              {getContactInitials(contact)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <Link
                              className="font-medium transition-colors hover:text-primary"
                              href={getContactLink(contact)}
                            >
                              {getContactDisplayName(contact)}
                            </Link>
                            <p className="text-sm text-muted-foreground">
                              {contact.email || 'Sin email'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{contact.phoneNumber}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm">{contact.company || 'Sin empresa'}</td>
                      <td className="p-4">
                        <Badge variant="outline">{contact.source || 'Sin origen'}</Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {contact.tags.length > 0 ? (
                            contact.tags.map((tag) => (
                              <span
                                key={tag.id}
                                className="rounded-full px-2 py-0.5 text-xs"
                                style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                              >
                                {tag.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">Sin etiquetas</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {formatRelativeTime(lastConversationAt)}
                      </td>
                      <td className="p-4 text-right">
                        <Link href={getContactLink(contact)}>
                          <Button size="icon" variant="ghost">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
              <h2 className="text-lg font-semibold">Sin contactos</h2>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Todavía no hay contactos en la base de datos o la búsqueda actual no devolvió
                resultados.
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
