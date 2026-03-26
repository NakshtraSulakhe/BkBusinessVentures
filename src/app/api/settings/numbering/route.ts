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
        prefix: body.prefix,
        suffix: body.suffix || null,
        padding: body.padding || 6,
        currentNumber: body.currentNumber || 1,
        yearlyReset: body.yearlyReset || false
      }
    })
    return NextResponse.json({ template }, { status: 201 })
  } catch (error) {
    console.error('Failed to create template:', error)
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
  }
}
