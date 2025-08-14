import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Only create Supabase client if environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase: any = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// GET /api/leads - Get all leads with optional filtering
export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const industry = searchParams.get('industry');
    const location = searchParams.get('location');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (industry) {
      query = query.eq('industry', industry);
    }

    if (location) {
      query = query.eq('location', location);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching leads:', error);
      return NextResponse.json(
        { error: 'Failed to fetch leads' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      leads: data,
      total: count,
      limit,
      offset
    });

  } catch (error) {
    console.error('Error in GET /api/leads:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/leads - Create a new lead
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.industry || !body.location) {
      return NextResponse.json(
        { error: 'Name, industry, and location are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('leads')
      .insert({
        name: body.name,
        category: body.category || body.industry,
        phone: body.phone,
        email: body.email,
        website: body.website,
        location: body.location,
        city: body.city || body.location.split(',')[0]?.trim(),
        state: body.state || body.location.split(',')[1]?.trim(),
        source: body.source || 'manual',
        industry: body.industry,
        enrichment_status: body.enrichment_status || 'pending',
        enrichment_method: body.enrichment_method,
        lead_score: body.lead_score || 50,
        rating: body.rating,
        review_count: body.review_count,
        linkedin_url: body.linkedin_url,
        source_url: body.source_url,
        search_term: body.search_term
      })
      .select();

    if (error) {
      console.error('Error creating lead:', error);
      return NextResponse.json(
        { error: 'Failed to create lead' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Lead created successfully',
      lead: data[0]
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/leads:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/leads/:id - Update a lead
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Lead ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    const { data, error } = await supabase
      .from('leads')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating lead:', error);
      return NextResponse.json(
        { error: 'Failed to update lead' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Lead updated successfully',
      lead: data[0]
    });

  } catch (error) {
    console.error('Error in PUT /api/leads:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/leads/:id - Delete a lead
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Lead ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting lead:', error);
      return NextResponse.json(
        { error: 'Failed to delete lead' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Lead deleted successfully'
    });

  } catch (error) {
    console.error('Error in DELETE /api/leads:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
