import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const openConversationsCount = await prisma.conversation.count({
    where: {
      status: 'OPEN',
    },
  })

  return NextResponse.json({
    openConversationsCount,
  })
}
