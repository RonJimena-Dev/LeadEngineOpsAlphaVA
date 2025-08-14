import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { EnhancedLeadScraper } from '../../../scripts/scraper';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Store active scraping jobs (in production, use Redis or database)
const activeJobs = new Map();

// POST /api/scrape - Trigger lead scraping
export async function POST(request: NextRequest) {
  try {
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

    // Start scraping in background
    startScrapingJob(jobId, body);

    return NextResponse.json({
      jobId,
      status: 'started',
      message: 'Scraping job started successfully',
      estimatedDuration: '5-10 minutes',
      industry: body.industry,
      location: body.location,
      sources: body.sources || ['google_maps', 'linkedin']
    }, { status: 202 });

  } catch (error) {
    console.error('Error in POST /api/scrape:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Background scraping function
async function startScrapingJob(jobId: string, params: any) {
  try {
    const scraper = new EnhancedLeadScraper();
    
    // Store job info
    activeJobs.set(jobId, {
      status: 'running',
      progress: 0,
      startedAt: new Date(),
      params
    });

    // Run scraper
    const results = await scraper.scrapeIndustry(params.industry, params.location);
    
    // Update job status
    activeJobs.set(jobId, {
      status: 'completed',
      progress: 100,
      completedAt: new Date(),
      results
    });

    // Update scraping log
    await supabase
      .from('scraping_logs')
      .update({
        status: 'completed',
        leads_found: results.totalLeads,
        leads_saved: results.savedLeads,
        errors: results.errors
      })
      .eq('session_date', new Date().toISOString().split('T')[0]);

  } catch (error) {
    console.error(`Error in scraping job ${jobId}:`, error);
    
    // Update job status
    activeJobs.set(jobId, {
      status: 'failed',
      error: error.message,
      completedAt: new Date()
    });

    // Update scraping log
    await supabase
      .from('scraping_logs')
      .update({
        status: 'failed',
        errors: 1
      })
      .eq('session_date', new Date().toISOString().split('T')[0]);
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

    // Cancel job (in production, implement proper cancellation)
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
