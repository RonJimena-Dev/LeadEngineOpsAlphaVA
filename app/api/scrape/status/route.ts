import { NextRequest, NextResponse } from 'next/server';

// Store active scraping jobs (in production, use Redis or database)
// This is shared between /api/scrape and /api/scrape/status
declare global {
  var activeJobs: Map<string, any>;
}

if (!global.activeJobs) {
  global.activeJobs = new Map();
}

const activeJobs = global.activeJobs;

// GET /api/scrape/status - Get scraping job status
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

    const job = activeJobs.get(jobId);
    
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Simulate progress updates for demo
    if (job.status === 'queued') {
      job.status = 'running';
      job.progress = 25;
    } else if (job.status === 'running' && job.progress < 100) {
      job.progress = Math.min(job.progress + 25, 100);
      if (job.progress === 100) {
        job.status = 'completed';
        job.completedAt = new Date();
        job.results = {
          totalLeads: Math.floor(Math.random() * 50) + 10,
          savedLeads: Math.floor(Math.random() * 45) + 8,
          errors: Math.floor(Math.random() * 3)
        };
      }
    }

    return NextResponse.json(job);

  } catch (error) {
    console.error('Error in GET /api/scrape/status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
