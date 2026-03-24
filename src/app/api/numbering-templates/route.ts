import { NextRequest, NextResponse } from "next/server"

// Mock data for development when database is not available
const mockTemplates = [
  {
    id: "1",
    name: "FD Default",
    prefix: "FD",
    accountType: "fd",
    format: "{{prefix}}{{sequence}}",
    sequence: 1,
    sequenceLength: 6,
    isActive: true,
    createdAt: new Date("2024-01-01").toISOString(),
    updatedAt: new Date("2024-01-01").toISOString()
  },
  {
    id: "2", 
    name: "RD Default",
    prefix: "RD",
    accountType: "rd",
    format: "{{prefix}}{{sequence}}",
    sequence: 1,
    sequenceLength: 6,
    isActive: true,
    createdAt: new Date("2024-01-01").toISOString(),
    updatedAt: new Date("2024-01-01").toISOString()
  },
  {
    id: "3",
    name: "LOAN Default", 
    prefix: "LN",
    accountType: "loan",
    format: "{{prefix}}{{sequence}}",
    sequence: 1,
    sequenceLength: 6,
    isActive: true,
    createdAt: new Date("2024-01-01").toISOString(),
    updatedAt: new Date("2024-01-01").toISOString()
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const accountType = searchParams.get('accountType') || ''
    const isActive = searchParams.get('isActive')

    // Try to get data from database first
    try {
      const { prisma } = await import("@/lib/database")
      
      // Build where clause
      const where: any = {}
      
      if (accountType) {
        where.accountType = accountType
      }
      
      if (isActive !== null) {
        where.isActive = isActive === 'true'
      }

      const templates = await prisma.numberingTemplate.findMany({
        where,
        orderBy: { createdAt: 'desc' }
      })

      return NextResponse.json({ templates })
    } catch (dbError) {
      console.log('Database not available, using mock data:', dbError)
      
      // Filter mock data based on search parameters
      let filteredTemplates = mockTemplates
      
      if (accountType) {
        filteredTemplates = filteredTemplates.filter(template => template.accountType === accountType)
      }
      
      if (isActive !== null) {
        filteredTemplates = filteredTemplates.filter(template => 
          template.isActive === (isActive === 'true')
        )
      }

      return NextResponse.json({ templates: filteredTemplates })
    }
  } catch (error) {
    console.error('Failed to fetch numbering templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch numbering templates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['name', 'prefix', 'accountType', 'format']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    // Validate account type
    const validAccountTypes = ['fd', 'rd', 'loan']
    if (!validAccountTypes.includes(body.accountType)) {
      return NextResponse.json(
        { error: `Invalid account type. Must be one of: ${validAccountTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Try to use database first
    try {
      const { prisma } = await import("@/lib/database")
      
      const template = await prisma.numberingTemplate.create({
        data: {
          name: body.name,
          accountType: body.accountType,
          format: body.format,
          sequence: body.sequence || 1,
          sequenceLength: body.sequenceLength || 6,
          isActive: body.isActive !== undefined ? true : body.isActive
        }
      })

      return NextResponse.json({ template }, { status: 201 })
    } catch (dbError) {
      console.log('Database not available, using mock response:', dbError)
      
      // Mock response for development
      const mockTemplate = {
        id: Math.random().toString(36).substr(2, 9),
        name: body.name,
        accountType: body.accountType,
        format: body.format,
        sequence: body.sequence || 1,
        sequenceLength: body.sequenceLength || 6,
        isActive: body.isActive !== undefined ? true : body.isActive,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      return NextResponse.json({ template: mockTemplate }, { status: 201 })
    }
  } catch (error) {
    console.error('Failed to create numbering template:', error)
    return NextResponse.json(
      { error: 'Failed to create numbering template' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { searchParams } = new URL(request.url)
    const templateId = searchParams.get('id')
    
    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      )
    }

    // Validate required fields
    const requiredFields = ['name', 'prefix', 'accountType', 'format']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    // Try to use database first
    try {
      const { prisma } = await import("@/lib/database")
      
      const template = await prisma.numberingTemplate.update({
        where: { id: templateId },
        data: {
          name: body.name,
          accountType: body.accountType,
          format: body.format,
          sequence: body.sequence,
          sequenceLength: body.sequenceLength,
          isActive: body.isActive
        }
      })

      return NextResponse.json({ template })
    } catch (dbError) {
      console.log('Database not available, using mock response:', dbError)
      
      // Mock response for development
      const mockTemplate = {
        id: templateId,
        name: body.name,
        accountType: body.accountType,
        format: body.format,
        sequence: body.sequence,
        sequenceLength: body.sequenceLength,
        isActive: body.isActive,
        updatedAt: new Date().toISOString()
      }

      return NextResponse.json({ template: mockTemplate })
    }
  } catch (error) {
    console.error('Failed to update numbering template:', error)
    return NextResponse.json(
      { error: 'Failed to update numbering template' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const templateId = searchParams.get('id')
    
    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      )
    }

    // Try to use database first
    try {
      const { prisma } = await import("@/lib/database")
      
      await prisma.numberingTemplate.delete({
        where: { id: templateId }
      })

      return NextResponse.json({ 
        message: 'Numbering template deleted successfully' 
      })
    } catch (dbError) {
      console.log('Database not available, using mock response:', dbError)
      
      // Mock response for development
      return NextResponse.json({ 
        message: 'Numbering template deleted successfully' 
      })
    }
  } catch (error) {
    console.error('Failed to delete numbering template:', error)
    return NextResponse.json(
      { error: 'Failed to delete numbering template' },
      { status: 500 }
    )
  }
}
