import { NextResponse } from 'next/server';

const QUANTFLOW_API_BASE = process.env.QUANTFLOW_API_BASE || 'http://127.0.0.1:8000';

export async function GET() {
  try {
    console.log('Public workflow API called');
    
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
    
    return NextResponse.json({
      success: true,
      count: data.workflows?.length || 0,
      workflows: data.workflows || []
    });

  } catch (error) {
    console.error('Public Workflow API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch workflow data', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

