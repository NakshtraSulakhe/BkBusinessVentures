import { NextRequest, NextResponse } from "next/server"
import { runMonthlySuggestions } from "@/lib/suggestions"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { month, year } = body
    
    if (!month || !year) {
      return NextResponse.json(
        { error: 'Month and Year are required' },
        { status: 400 }
      )
    }

    const count = await runMonthlySuggestions(parseInt(month), parseInt(year))

    return NextResponse.json({ 
      message: `${count} suggestions generated successfully`,
      count
    })
  } catch (error) {
    console.error('Failed to run monthly suggestions:', error)
    return NextResponse.json(
      { error: 'Failed to run monthly suggestions' },
      { status: 500 }
    )
  }
}
