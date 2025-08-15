import { NextRequest, NextResponse } from 'next/server';

// This endpoint will be handled by the main route.ts file
// The GET method in the main route handles both /api/scrape and /api/scrape/status
export async function GET(request: NextRequest) {
  // Redirect to main scrape endpoint for status checks
  const url = new URL(request.url);
  const jobId = url.searchParams.get('jobId');
  
  if (!jobId) {
    return NextResponse.json(
      { error: 'Job ID is required' },
      { status: 400 }
    );
  }
  
  // This endpoint is a fallback - the main route.ts handles status checks
  return NextResponse.json(
    { error: 'Use /api/scrape?jobId=... for status checks' },
    { status: 400 }
  );
}
