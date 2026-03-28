import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const templates = await prisma.numberingTemplate.findMany({
      orderBy: { name: 'asc' }
    })
    return NextResponse.json({ templates })
  } catch (error) {
    console.error('Failed to fetch templates:', error)
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const template = await prisma.numberingTemplate.create({
      data: {
        name: body.name,
        template: body.template,
        description: body.description || null,
        accountType: body.accountType,
        sequenceStart: body.sequenceStart || 1,
        currentSequence: body.currentSequence || 0,
        requiredVariables: body.requiredVariables || null
      }
    })
    return NextResponse.json({ template }, { status: 201 })
  } catch (error) {
    console.error('Failed to create template:', error)
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
  }
}
