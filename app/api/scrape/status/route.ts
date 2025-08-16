import { NextRequest, NextResponse } from 'next/server';

// This route handles /api/scrape/status requests
// It redirects to the main /api/scrape route with the jobId parameter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    
    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }
    
    // Forward the request to the main scrape route
    const response = await fetch(`${request.nextUrl.origin}/api/scrape?jobId=${jobId}`);
    const data = await response.json();
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error in GET /api/scrape/status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
