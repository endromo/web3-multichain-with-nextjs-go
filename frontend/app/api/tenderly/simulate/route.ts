import { NextRequest, NextResponse } from 'next/server'

const TENDERLY_API = 'https://api.tenderly.co/api/v1'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const response = await fetch(`${TENDERLY_API}/account/${process.env.TENDERLY_USER}/project/${process.env.TENDERLY_PROJECT}/simulate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Key': process.env.TENDERLY_ACCESS_KEY as string,
      },
      body: JSON.stringify({
        ...body,
        save: true,
        save_if_fails: true
      })
    })

    const data = await response.json()
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Tenderly API error:', error)
    return NextResponse.json(
      { error: 'Simulation failed' },
      { status: 500 }
    )
  }
}