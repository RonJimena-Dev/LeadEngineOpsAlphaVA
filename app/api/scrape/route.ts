import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Only create Supabase client if environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase: any = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// Store active scraping jobs (in production, use Redis or database)
const activeJobs = new Map();

// POST /api/scrape - Trigger lead scraping
export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.industry || !body.location) {
      return NextResponse.json(
        { error: 'Industry and location are required' },
        { status: 400 }
      );
    }

    // Create job ID
    const jobId = `scrape_${Date.now()}`;
    
    // Log scraping request
    const { error: logError } = await supabase
      .from('scraping_logs')
      .insert({
        session_date: new Date().toISOString(),
        industry: body.industry,
        location: body.location,
        search_terms: body.customSearchTerms || [],
        status: 'started',
        leads_found: 0,
        leads_saved: 0,
        errors: 0
      });

    if (logError) {
      console.error('Error logging scraping session:', logError);
    }

    // For now, simulate scraping (in production, this would trigger a background job)
    // The actual scraping will be handled by GitHub Actions or a separate service
    const mockResults = {
      jobId,
      status: 'queued',
      message: 'Scraping job queued for background processing',
      estimatedDuration: '5-10 minutes',
      industry: body.industry,
      location: body.location,
      sources: body.sources || ['google_maps', 'linkedin']
    };

    // Store job info
    activeJobs.set(jobId, {
      status: 'queued',
      progress: 0,
      startedAt: new Date(),
      params: body,
      results: mockResults
    });

    return NextResponse.json(mockResults, { status: 202 });

  } catch (error) {
    console.error('Error in POST /api/scrape:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/scrape/status/:jobId - Get scraping job status
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

// DELETE /api/scrape/:jobId - Cancel scraping job
export async function DELETE(request: NextRequest) {
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

    // Cancel job
    activeJobs.delete(jobId);

    return NextResponse.json({
      message: 'Scraping job cancelled successfully',
      jobId
    });

  } catch (error) {
    console.error('Error in DELETE /api/scrape:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
