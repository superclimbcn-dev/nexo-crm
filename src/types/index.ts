export interface User {
  id: string
  name: string | null
  email: string
  image: string | null
  role: 'ADMIN' | 'MANAGER' | 'AGENT'
}

export interface Contact {
  id: string
  phone: string
  name: string | null
  email: string | null
  avatar: string | null
  company: string | null
  jobTitle: string | null
  source: string | null
  customFields: Record<string, any> | null
  tags: Tag[]
  createdAt: string
}

export interface Tag {
  id: string
  name: string
  color: string
}

export interface Conversation {
  id: string
  contact: Contact
  agent: User | null
  status: 'OPEN' | 'CLOSED' | 'PENDING' | 'SPAM'
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  lastMessageAt: string
  unreadCount: number
  aiEnabled: boolean
}

export interface Message {
  id: string
  direction: 'INBOUND' | 'OUTBOUND'
  type: 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'AUDIO' | 'VIDEO' | 'TEMPLATE'
  content: string
  mediaUrl: string | null
  status: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED'
  createdAt: string
  aiGenerated: boolean
}

export interface Deal {
  id: string
  title: string
  contact: Contact
  value: number | null
  stage: 'NEW' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST'
  probability: number
  expectedClose: string | null
  assignedTo: User | null
}

export interface Campaign {
  id: string
  name: string
  status: 'DRAFT' | 'SCHEDULED' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'
  templateName: string
  audienceCount: number
  stats: {
    sent: number
    delivered: number
    read: number
    failed: number
  }
  scheduledAt: string | null
}

export interface Template {
  id: string
  name: string
  whatsappName: string
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION'
  bodyText: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
}
