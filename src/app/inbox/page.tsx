'use client'

import { useState, useEffect, useRef } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Phone,
  Paperclip,
  Send,
  Smile,
  MoreVertical,
  Check,
  CheckCheck,
  Clock,
  Bot,
  User,
  Tag,
  FileText,
} from 'lucide-react'
import { formatRelativeTime, cn } from '@/lib/utils'

// Mock data for demo
const mockConversations = [
  {
    id: '1',
    contact: {
      id: 'c1',
      name: 'Ana Paula Mendes',
      phone: '5511999999999',
      avatar: null,
    },
    lastMessage: {
      content: 'Obrigada! Vou analisar a proposta e retorno em breve.',
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      status: 'READ',
    },
    unreadCount: 0,
    status: 'OPEN',
    aiEnabled: false,
  },
  {
    id: '2',
    contact: {
      id: 'c2',
      name: 'Bruno Costa',
      phone: '5511888888888',
      avatar: null,
    },
    lastMessage: {
      content: 'Qual o valor do plano Enterprise?',
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      status: 'DELIVERED',
    },
    unreadCount: 2,
    status: 'OPEN',
    aiEnabled: true,
  },
  {
    id: '3',
    contact: {
      id: 'c3',
      name: 'Carla Souza',
      phone: '5511777777777',
      avatar: null,
    },
    lastMessage: {
      content: 'Podemos agendar uma call para amanhã?',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      status: 'READ',
    },
    unreadCount: 0,
    status: 'PENDING',
    aiEnabled: false,
  },
  {
    id: '4',
    contact: {
      id: 'c4',
      name: 'Daniel Lima',
      phone: '5511666666666',
      avatar: null,
    },
    lastMessage: {
      content: 'Vou enviar o contrato assinado ainda hoje.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      status: 'READ',
    },
    unreadCount: 0,
    status: 'CLOSED',
    aiEnabled: false,
  },
]

const mockMessages = [
  {
    id: 'm1',
    direction: 'INBOUND',
    type: 'TEXT',
    content: 'Olá! Gostaria de saber mais sobre os planos de vocês.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    status: 'READ',
    aiGenerated: false,
  },
  {
    id: 'm2',
    direction: 'OUTBOUND',
    type: 'TEXT',
    content: 'Olá! Claro, ficarei feliz em ajudar. Temos três planos: Starter (R$ 99/mês), Pro (R$ 299/mês) e Enterprise (sob consulta). Qual atende melhor suas necessidades?',
    createdAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    status: 'READ',
    aiGenerated: true,
  },
  {
    id: 'm3',
    direction: 'INBOUND',
    type: 'TEXT',
    content: 'Interessante! Qual o valor do plano Enterprise?',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    status: 'READ',
    aiGenerated: false,
  },
]

export default function InboxPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [messages, setMessages] = useState(mockMessages)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (!messageInput.trim()) return

    const newMessage = {
      id: `m${Date.now()}`,
      direction: 'OUTBOUND',
      type: 'TEXT',
      content: messageInput,
      createdAt: new Date().toISOString(),
      status: 'SENT',
      aiGenerated: false,
    }

    setMessages([...messages, newMessage])
    setMessageInput('')

    // Simulate AI response after 2 seconds
    setTimeout(() => {
      const aiResponse = {
        id: `m${Date.now() + 1}`,
        direction: 'OUTBOUND',
        type: 'TEXT',
        content: 'O plano Enterprise é personalizado de acordo com suas necessidades. Geralmente começa em R$ 999/mês e inclui suporte prioritário, SLA garantido e recursos avançados. Posso agendar uma call com nosso time comercial para discutir os detalhes?',
        createdAt: new Date().toISOString(),
        status: 'SENT',
        aiGenerated: true,
      }
      setMessages((prev) => [...prev, aiResponse])
    }, 2000)
  }

  const activeConversation = mockConversations.find((c) => c.id === selectedConversation)

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-7rem)] -m-6">
        {/* Conversations List */}
        <div className="w-80 border-r border-border bg-card flex flex-col">
          {/* Filters */}
          <div className="p-4 border-b border-border space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar conversas..."
                className="pl-10 bg-background"
              />
            </div>
            <div className="flex gap-2">
              <Badge variant="default" className="cursor-pointer">Todas</Badge>
              <Badge variant="outline" className="cursor-pointer">Não lidas</Badge>
              <Badge variant="outline" className="cursor-pointer">Minhas</Badge>
            </div>
          </div>

          {/* Conversation Items */}
          <div className="flex-1 overflow-y-auto">
            {mockConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation.id)}
                className={cn(
                  'w-full p-4 flex items-start gap-3 hover:bg-secondary transition-colors border-b border-border text-left',
                  selectedConversation === conversation.id && 'bg-secondary'
                )}
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage src={conversation.contact.avatar || ''} />
                  <AvatarFallback className="bg-primary/20 text-primary">
                    {conversation.contact.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">{conversation.contact.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(conversation.lastMessage.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {conversation.lastMessage.content}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {conversation.aiEnabled && (
                      <Bot className="w-3 h-3 text-primary" />
                    )}
                    {conversation.unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 text-xs bg-primary text-white rounded-full">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        {selectedConversation && activeConversation ? (
          <div className="flex-1 flex flex-col bg-background">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={activeConversation.contact.avatar || ''} />
                  <AvatarFallback className="bg-primary/20 text-primary">
                    {activeConversation.contact.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{activeConversation.contact.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {activeConversation.contact.phone}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Phone className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Tag className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <FileText className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex',
                    message.direction === 'OUTBOUND' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[70%] rounded-lg px-4 py-2',
                      message.direction === 'OUTBOUND'
                        ? 'bg-primary text-white'
                        : 'bg-card'
                    )}
                  >
                    <p>{message.content}</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-xs opacity-70">
                        {formatRelativeTime(message.createdAt)}
                      </span>
                      {message.direction === 'OUTBOUND' && (
                        <>
                          {message.status === 'SENT' && <Check className="w-3 h-3" />}
                          {message.status === 'DELIVERED' && <CheckCheck className="w-3 h-3" />}
                          {message.status === 'READ' && <CheckCheck className="w-3 h-3 text-blue-300" />}
                          {message.aiGenerated && <Bot className="w-3 h-3 ml-1" />}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Paperclip className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Smile className="w-5 h-5" />
                </Button>
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Digite sua mensagem..."
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} size="icon">
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-background">
            <div className="text-center text-muted-foreground">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Selecione uma conversa</p>
              <p className="text-sm">Escolha uma conversa para começar</p>
            </div>
          </div>
        )}

        {/* Contact Panel */}
        {selectedConversation && activeConversation && (
          <div className="w-80 border-l border-border bg-card p-4">
            <div className="text-center mb-6">
              <Avatar className="w-20 h-20 mx-auto mb-3">
                <AvatarImage src={activeConversation.contact.avatar || ''} />
                <AvatarFallback className="bg-primary/20 text-primary text-2xl">
                  {activeConversation.contact.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-semibold">{activeConversation.contact.name}</h3>
              <p className="text-sm text-muted-foreground">{activeConversation.contact.phone}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground uppercase">Status no Pipeline</label>
                <select className="w-full mt-1 p-2 rounded-md bg-background border border-border text-sm">
                  <option>Novo</option>
                  <option>Qualificado</option>
                  <option>Proposta</option>
                  <option>Negociação</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase">Valor Estimado</label>
                <Input placeholder="R$ 0,00" className="mt-1" />
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase">Notas Internas</label>
                <textarea
                  className="w-full mt-1 p-2 rounded-md bg-background border border-border text-sm min-h-[100px]"
                  placeholder="Adicione notas sobre este contato..."
                />
              </div>

              <div className="pt-4 border-t border-border">
                <h4 className="text-sm font-medium mb-2">Ações Rápidas</h4>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Clock className="w-4 h-4 mr-2" />
                    Agendar Follow-up
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Enviar Orçamento
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <User className="w-4 h-4 mr-2" />
                    Transferir
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

import { MessageSquare } from 'lucide-react'
