import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/database"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const template = await prisma.numberingTemplate.update({
      where: { id },
      data: body
    })
    
    return NextResponse.json({ template })
  } catch (error) {
    console.error('Failed to update template:', error)
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 })
  }
}
