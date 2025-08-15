import { NextRequest, NextResponse } from 'next/server';

// Lead schema interface
interface Lead {
  contact_name: string;
  contact_phone: string | null;
  contact_email: string | null;
  company_name: string;
  company_social: {
    linkedin: string | null;
    twitter: string | null;
  };
  job_title: string | null;
  industry: string | null;
  location: string | null;
  lead_score: number;
  source: string;
  scraped_at: string;
}

// Filter payload interface
interface FilterPayload {
  industry: string[];
  employeeMin: number;
  employeeMax: number;
  revenueMin: number;
  revenueMax: number;
  locations: string[];
  titles: string[];
}

// Scraping job status
interface ScrapingJob {
  jobId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  totalLeads: number;
  leads: Lead[];
  error?: string;
  startedAt: string;
  completedAt?: string;
}

// In-memory job storage (in production, use Redis or database)
const activeJobs = new Map<string, ScrapingJob>();

// Generate unique job ID
function generateJobId(): string {
  return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Build search queries from filter tags
function buildSearchQueries(filters: FilterPayload): string[] {
  const queries: string[] = [];
  
  // Base LinkedIn search
  if (filters.titles.length > 0 || filters.industry.length > 0 || filters.locations.length > 0) {
    let linkedinQuery = 'site:linkedin.com';
    
    if (filters.titles.length > 0) {
      linkedinQuery += ` "${filters.titles.join('" OR "')}"`;
    }
    
    if (filters.industry.length > 0) {
      linkedinQuery += ` "${filters.industry.join('" OR "')}"`;
    }
    
    if (filters.locations.length > 0) {
      const cities = filters.locations.map(loc => loc.split('|')[1]).filter(Boolean);
      if (cities.length > 0) {
        linkedinQuery += ` "${cities.join('" OR "')}"`;
      }
    }
    
    queries.push(linkedinQuery);
  }
  
  // Company website searches
  if (filters.industry.length > 0) {
    filters.industry.forEach(industry => {
      queries.push(`"${industry}" "contact us" "leadership team"`);
    });
  }
  
  // Executive search queries
  if (filters.titles.length > 0) {
    filters.titles.forEach(title => {
      if (filters.industry.length > 0) {
        filters.industry.forEach(industry => {
          queries.push(`"${title}" "${industry}" "contact"`);
        });
      }
    });
  }
  
  return queries;
}

// Simulate scraping with realistic delays and data
async function simulateScraping(filters: FilterPayload, jobId: string): Promise<Lead[]> {
  const leads: Lead[] = [];
  const maxLeads = 200; // Limit total results per request
  
  // Build search queries
  const searchQueries = buildSearchQueries(filters);
  
  // Simulate scraping different sources
  for (const query of searchQueries) {
    if (leads.length >= maxLeads) break;
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Generate realistic sample leads based on filters
    const leadsForQuery = Math.min(
      Math.floor(Math.random() * 50) + 10, // 10-60 leads per query
      maxLeads - leads.length
    );
    
    for (let i = 0; i < leadsForQuery; i++) {
      const industry = filters.industry[Math.floor(Math.random() * filters.industry.length)] || 'Technology';
      const location = filters.locations[Math.floor(Math.random() * filters.locations.length)] || 'USA|New York';
      const jobTitle = filters.titles[Math.floor(Math.random() * filters.titles.length)] || 'Manager';
      
      const lead: Lead = {
        contact_name: generateRandomName(),
        contact_phone: Math.random() > 0.3 ? generateRandomPhone() : null,
        contact_email: Math.random() > 0.2 ? generateRandomEmail() : null,
        company_name: generateRandomCompany(industry),
        company_social: {
          linkedin: Math.random() > 0.1 ? `https://linkedin.com/company/${generateRandomSlug()}` : null,
          twitter: Math.random() > 0.3 ? `https://twitter.com/${generateRandomSlug()}` : null,
        },
        job_title: jobTitle,
        industry: industry,
        location: location.split('|')[1] || location,
        lead_score: Math.floor(Math.random() * 40) + 60, // 60-100 score
        source: 'linkedin',
        scraped_at: new Date().toISOString()
      };
      
      leads.push(lead);
      
      // Update job progress
      const job = activeJobs.get(jobId);
      if (job) {
        job.progress = Math.min(100, (leads.length / maxLeads) * 100);
        job.totalLeads = leads.length;
        activeJobs.set(jobId, job);
      }
    }
  }
  
  return leads;
}

// Helper functions for generating realistic data
function generateRandomName(): string {
  const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa', 'James', 'Jennifer'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

function generateRandomPhone(): string {
  return `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
}

function generateRandomEmail(): string {
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'company.com', 'business.org'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const username = Math.random().toString(36).substr(2, 8);
  
  return `${username}@${domain}`;
}

function generateRandomCompany(industry: string): string {
  const companySuffixes = ['Corp', 'Inc', 'LLC', 'Ltd', 'Group', 'Solutions', 'Systems', 'Technologies'];
  const suffix = companySuffixes[Math.floor(Math.random() * companySuffixes.length)];
  const name = industry.charAt(0).toUpperCase() + industry.slice(1).toLowerCase();
  
  return `${name} ${suffix}`;
}

function generateRandomSlug(): string {
  return Math.random().toString(36).substr(2, 8);
}

// Main scraping function with retry logic and timeout
async function executeScraping(filters: FilterPayload, jobId: string): Promise<void> {
  const job = activeJobs.get(jobId);
  if (!job) return;
  
  try {
    // Update job status to running
    job.status = 'running';
    job.startedAt = new Date().toISOString();
    activeJobs.set(jobId, job);
    
    // Set timeout for entire scraping operation (5 minutes)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Scraping timeout after 5 minutes')), 5 * 60 * 1000);
    });
    
    // Execute scraping with timeout
    const scrapingPromise = simulateScraping(filters, jobId);
    const leads = await Promise.race([scrapingPromise, timeoutPromise]) as Lead[];
    
    // Update job with results
    job.status = 'completed';
    job.progress = 100;
    job.totalLeads = leads.length;
    job.leads = leads;
    job.completedAt = new Date().toISOString();
    activeJobs.set(jobId, job);
    
  } catch (error) {
    console.error(`Scraping job ${jobId} failed:`, error);
    
    // Update job with error
    job.status = 'failed';
    job.error = error instanceof Error ? error.message : 'Unknown error occurred';
    job.completedAt = new Date().toISOString();
    activeJobs.set(jobId, job);
  }
}

// POST endpoint to start scraping
export async function POST(request: NextRequest) {
  try {
    const filters: FilterPayload = await request.json();
    
    // Validate required filters
    if (!filters.industry || !filters.locations || !filters.titles) {
      return NextResponse.json(
        { error: 'Missing required filters: industry, locations, and titles are required' },
        { status: 400 }
      );
    }
    
    if (filters.industry.length === 0 && filters.locations.length === 0 && filters.titles.length === 0) {
      return NextResponse.json(
        { error: 'At least one filter must be set' },
        { status: 400 }
      );
    }
    
    // Generate job ID
    const jobId = generateJobId();
    
    // Create job record
    const job: ScrapingJob = {
      jobId,
      status: 'pending',
      progress: 0,
      totalLeads: 0,
      leads: [],
      startedAt: new Date().toISOString()
    };
    
    activeJobs.set(jobId, job);
    
    // Start scraping asynchronously (don't await)
    executeScraping(filters, jobId).catch(error => {
      console.error(`Background scraping failed for job ${jobId}:`, error);
    });
    
    // Return job ID immediately
    return NextResponse.json({
      jobId,
      status: 'started',
      message: 'Scraping job initiated successfully',
      estimatedTime: '2-5 minutes'
    });
    
  } catch (error) {
    console.error('Error in POST /api/scrape:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check job status
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
    
    // Return job status
    return NextResponse.json({
      jobId: job.jobId,
      status: job.status,
      progress: job.progress,
      totalLeads: job.totalLeads,
      leads: job.leads,
      error: job.error,
      startedAt: job.startedAt,
      completedAt: job.completedAt
    });
    
  } catch (error) {
    console.error('Error in GET /api/scrape:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
