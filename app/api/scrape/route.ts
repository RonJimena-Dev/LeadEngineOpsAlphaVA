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
// This is shared between /api/scrape and /api/scrape/status
declare global {
  var activeJobs: Map<string, any>;
}

if (!global.activeJobs) {
  global.activeJobs = new Map();
}

const activeJobs = global.activeJobs;

// Real scraping function that uses your existing scraper
async function startRealScraping(industries: string[], locations: string[], jobTitles: string[], companySizes: string[]) {
  try {
    // Import and use your real scraper
    const { EnhancedLeadScraper } = require('../../../scripts/scraper.js');
    
    const scraper = new EnhancedLeadScraper();
    await scraper.initialize();
    
    let totalLeads = 0;
    let savedLeads = 0;
    let errors = 0;
    let allLeads: any[] = [];
    
    // Scrape each industry-location combination
    for (const industry of industries) {
      for (const location of locations) {
        try {
          console.log(`Scraping ${industry} in ${location}...`);
          
          // Use your real scraper methods
          const results = await scraper.scrapeGoogleMaps(`${industry} ${location}`);
          const linkedinResults = await scraper.scrapeLinkedIn(`${industry} ${location}`);
          
          // Combine and process results
          const combinedResults = [...(results || []), ...(linkedinResults || [])];
          
          for (const lead of combinedResults) {
            if (lead.name && lead.email) {
              // Save to database
              if (supabase) {
                try {
                  const { error } = await supabase
                    .from('leads')
                    .insert({
                      name: lead.name,
                      email: lead.email,
                      phone: lead.phone || '',
                      company: lead.company || '',
                      industry: industry,
                      location: location,
                      job_title: lead.jobTitle || lead.category || '',
                      lead_score: lead.leadScore || 50,
                      source: lead.source || 'scraped',
                      created_at: new Date().toISOString()
                    });
                  
                  if (!error) {
                    savedLeads++;
                    allLeads.push({
                      name: lead.name,
                      jobTitle: lead.jobTitle || lead.category || 'Unknown',
                      company: lead.company || lead.name || 'Unknown',
                      industry: industry,
                      location: location,
                      email: lead.email,
                      phone: lead.phone || 'Not available',
                      leadScore: lead.leadScore || 50
                    });
                  }
                } catch (dbError) {
                  console.error('Error saving lead to database:', dbError);
                  errors++;
                }
              }
              
              totalLeads++;
            }
          }
          
          // Add delay between requests
          await new Promise(resolve => setTimeout(resolve, 2000));
          
        } catch (scrapingError) {
          console.error(`Error scraping ${industry} in ${location}:`, scrapingError);
          errors++;
        }
      }
    }
    
    await scraper.close();
    
    return {
      totalLeads,
      savedLeads,
      errors,
      leads: allLeads
    };
    
  } catch (error) {
    console.error('Error in real scraping:', error);
    return {
      totalLeads: 0,
      savedLeads: 0,
      errors: 1,
      leads: []
    };
  }
}

// POST /api/scrape - Trigger lead scraping
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields - support both old format and new array format
    const industries = body.industries || (body.industry ? [body.industry] : []);
    const locations = body.locations || (body.location ? [body.location] : []);
    const jobTitles = body.jobTitles || [];
    const companySizes = body.companySizes || [];
    
    if (industries.length === 0 && locations.length === 0 && jobTitles.length === 0 && companySizes.length === 0) {
      return NextResponse.json(
        { error: 'At least one filter option is required (industries, locations, jobTitles, or companySizes)' },
        { status: 400 }
      );
    }

    // Create job ID
    const jobId = `scrape_${Date.now()}`;
    
    // Try to log to database if available
    if (supabase) {
      try {
        const { error: logError } = await supabase
          .from('scraping_logs')
          .insert({
            session_date: new Date().toISOString(),
            industry: industries.join(', '),
            location: locations.join(', '),
            search_terms: [...jobTitles, ...companySizes],
            status: 'started',
            leads_found: 0,
            leads_saved: 0,
            errors: 0
          });

        if (logError) {
          console.error('Error logging scraping session:', logError);
        }
      } catch (dbError) {
        console.error('Database logging failed:', dbError);
        // Continue without database logging
      }
    }



    // Start real scraping process
    const scrapingResults = await startRealScraping(industries, locations, jobTitles, companySizes);
    
    const mockResults = {
      jobId,
      status: 'completed',
      message: 'Real scraping completed successfully',
      estimatedDuration: '2-5 minutes',
      industries: industries,
      locations: locations,
      jobTitles: jobTitles,
      companySizes: companySizes,
      sources: body.sources || ['google_maps', 'linkedin'],
      totalLeads: scrapingResults.totalLeads,
      savedLeads: scrapingResults.savedLeads,
      errors: scrapingResults.errors,
      leads: scrapingResults.leads
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
