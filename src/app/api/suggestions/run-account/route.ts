import { NextRequest, NextResponse } from "next/server"
import { runAccountSuggestions } from "@/lib/suggestions"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { accountId, startDate, endDate } = body
    
    if (!accountId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Account ID, start date, and end date are required' },
        { status: 400 }
      )
    }

    const count = await runAccountSuggestions(
      accountId, 
      new Date(startDate), 
      new Date(endDate)
    )

    return NextResponse.json({ 
      message: `${count} suggestions generated successfully`,
      count
    })
  } catch (error) {
    console.error('Failed to run account suggestions:', error)
    return NextResponse.json(
      { error: 'Failed to run account suggestions' },
      { status: 500 }
    )
  }
}
