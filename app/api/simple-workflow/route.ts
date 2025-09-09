import { NextRequest, NextResponse } from 'next/server';

const QUANTFLOW_API_BASE = process.env.QUANTFLOW_API_BASE || 'http://127.0.0.1:8000';

export async function GET() {
  try {
    console.log('Simple workflow API called');
    
    const response = await fetch(`${QUANTFLOW_API_BASE}/api/workflow/all?limit=100&page=1`, {
      headers: {
        'uid': '0'
      }
    });

    if (!response.ok) {
      throw new Error(`QuantFlow API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('QuantFlow data received:', data);
    
    return NextResponse.json(data);

  } catch (error) {
    console.error('Simple Workflow API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflow data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

