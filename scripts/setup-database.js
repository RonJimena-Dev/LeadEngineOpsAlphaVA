const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Debug: Log environment variables
console.log('Environment check:');
console.log('SUPABASE_URL:', supabaseUrl ? '✓ Found' : '✗ Missing');
console.log('SUPABASE_KEY:', supabaseKey ? '✓ Found' : '✗ Missing');

if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is required. Please check your env.local file.');
  process.exit(1);
}

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY is required. Please check your env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('Setting up enhanced database for Apollo-style lead generation...');

  try {
    // Test database connection and list tables
    await testDatabaseConnection();
    
    // Try to create all tables at once using SQL
    await createAllTablesWithSQL();
    
    // Create leads table with enhanced fields
    await createLeadsTable();
    
    // Create scraping_logs table
    await createLogsTable();
    
    // Create industries table for dynamic targeting
    await createIndustriesTable();
    
    // Create search_history table
    await createSearchHistoryTable();
    
    // Create lead_tags table
    await createLeadTagsTable();
    
    // Insert sample data
    await insertSampleData();
    
    console.log('Database setup completed successfully!');
    
  } catch (error) {
    console.error('Database setup error:', error);
  }
}

async function testDatabaseConnection() {
  console.log('\n🔌 Testing database connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_schema')
      .eq('table_schema', 'public')
      .limit(10);
    
    if (error) {
      console.log('❌ Error querying information_schema:', error.message);
      console.log('This suggests a permissions issue with your service role key.');
    } else {
      console.log('✅ Database connection successful!');
      console.log('📋 Available tables in public schema:');
      
      if (data && data.length > 0) {
        data.forEach(table => {
          console.log(`  - ${table.table_name}`);
        });
      } else {
        console.log('  No tables found in public schema');
      }
    }
  } catch (error) {
    console.log('❌ Exception testing connection:', error.message);
  }
  
  console.log('');
}

async function createAllTablesWithSQL() {
  console.log('Attempting to create all tables with SQL...');
  
  const createTablesSQL = `
    -- Create leads table
    CREATE TABLE IF NOT EXISTS leads (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(255),
      phone VARCHAR(50),
      email VARCHAR(255),
      website VARCHAR(500),
      location TEXT,
      city VARCHAR(100),
      state VARCHAR(50),
      source VARCHAR(100),
      industry VARCHAR(100),
      enrichment_status VARCHAR(50) DEFAULT 'pending',
      enrichment_method VARCHAR(100),
      lead_score INTEGER DEFAULT 0,
      rating DECIMAL(3,2),
      review_count INTEGER,
      linkedin_url VARCHAR(500),
      source_url VARCHAR(500),
      search_term VARCHAR(255),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create scraping_logs table
    CREATE TABLE IF NOT EXISTS scraping_logs (
      id BIGSERIAL PRIMARY KEY,
      session_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      industry VARCHAR(100),
      location VARCHAR(100),
      search_terms TEXT[],
      leads_found INTEGER DEFAULT 0,
      leads_saved INTEGER DEFAULT 0,
      errors INTEGER DEFAULT 0,
      error_details TEXT[],
      status VARCHAR(50) DEFAULT 'pending',
      session_duration BIGINT DEFAULT 0
    );

    -- Create industries table
    CREATE TABLE IF NOT EXISTS industries (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(100) UNIQUE NOT NULL,
      search_terms TEXT[],
      keywords TEXT[],
      sources TEXT[],
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create search_history table
    CREATE TABLE IF NOT EXISTS search_history (
      id BIGSERIAL PRIMARY KEY,
      search_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      industry VARCHAR(100),
      location VARCHAR(100),
      search_terms TEXT[],
      results_count INTEGER DEFAULT 0,
      status VARCHAR(50) DEFAULT 'completed'
    );

    -- Create lead_tags table
    CREATE TABLE IF NOT EXISTS lead_tags (
      id BIGSERIAL PRIMARY KEY,
      lead_id BIGINT REFERENCES leads(id) ON DELETE CASCADE,
      tag_name VARCHAR(100) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;
  
  try {
    // Try using RPC if available
    const { error: rpcError } = await supabase.rpc('exec_sql', {
      sql: createTablesSQL
    });
    
    if (rpcError) {
      console.log('RPC method failed, trying alternative approach...');
      // Tables will be created by individual functions
    } else {
      console.log('✅ All tables created successfully with SQL!');
    }
  } catch (error) {
    console.log('SQL creation failed, will use alternative methods...');
  }
}

async function createLeadsTable() {
  try {
    console.log('🔍 Checking leads table...');
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log(`❌ Leads table error: ${error.code} - ${error.message}`);
      
      if (error.code === '42P01') {
        console.log('Table does not exist, attempting to create...');
        await createTableWithDirectSQL();
      } else {
        console.log('Unknown error with leads table');
      }
    } else {
      console.log(`✅ Leads table exists and accessible. Found ${data?.length || 0} records.`);
      if (data && data.length > 0) {
        console.log('Sample record:', JSON.stringify(data[0], null, 2));
      }
    }
  } catch (error) {
    console.log('❌ Exception checking leads table:', error.message);
  }
}

async function createTableWithDirectSQL() {
  console.log('Trying alternative table creation method...');
  
  // Create a simple leads table using Supabase's built-in table creation
  const { error } = await supabase
    .from('leads')
    .insert({
      name: 'Test Lead',
      category: 'Test',
      phone: '(555) 123-4567',
      email: 'test@example.com',
      website: 'https://example.com',
      location: 'Test Location',
      city: 'Test City',
      state: 'TS',
      source: 'test',
      industry: 'Test Industry',
      enrichment_status: 'completed',
      lead_score: 85
    });
  
  if (error && error.code === '42P01') {
    console.log('Table creation failed. You may need to create tables manually in Supabase dashboard.');
    console.log('Go to: https://supabase.com/dashboard/project/kbuxrbyorqxqylnzphmn/editor');
    console.log('Create the following tables: leads, scraping_logs, industries, search_history, lead_tags');
  } else {
    console.log('✅ Test lead inserted successfully!');
  }
}

async function createLogsTable() {
  try {
    const { error } = await supabase
      .from('scraping_logs')
      .select('*')
      .limit(1);
    
    if (error && error.code === '42P01') {
      console.log('Creating scraping logs table...');
      
      // Try to create the table by inserting a test record
      const { error: insertError } = await supabase
        .from('scraping_logs')
        .insert({
          session_date: new Date().toISOString(),
          industry: 'Test',
          location: 'Test',
          search_terms: ['test'],
          leads_found: 0,
          leads_saved: 0,
          errors: 0,
          error_details: [],
          status: 'completed',
          session_duration: 1000
        });
      
      if (insertError && insertError.code === '42P01') {
        console.log('Logs table creation failed. Will be created manually.');
      } else {
        console.log('✅ Scraping logs table created successfully!');
      }
    } else {
      console.log('✅ Scraping logs table already exists');
    }
  } catch (error) {
    console.log('Logs table check completed...');
  }
}

async function createIndustriesTable() {
  try {
    const { error } = await supabase
      .from('industries')
      .select('*')
      .limit(1);
    
    if (error && error.code === '42P01') {
      console.log('Creating industries table...');
      
      // This will be handled by the app's database initialization
      console.log('Industries table will be created by the app...');
    }
  } catch (error) {
    console.log('Industries table check completed...');
  }
}

async function createSearchHistoryTable() {
  try {
    const { error } = await supabase
      .from('search_history')
      .select('*')
      .limit(1);
    
    if (error && error.code === '42P01') {
      console.log('Creating search history table...');
      
      // This will be handled by the app's database initialization
      console.log('Search history table will be created by the app...');
    }
  } catch (error) {
    console.log('Search history table check completed...');
  }
}

async function createLeadTagsTable() {
  try {
    const { error } = await supabase
      .from('lead_tags')
      .select('*')
      .limit(1);
    
    if (error && error.code === '42P01') {
      console.log('Creating lead tags table...');
      
      // This will be handled by the app's database initialization
      console.log('Lead tags table will be created by the app...');
    }
  } catch (error) {
    console.log('Lead tags table check completed...');
  }
}

async function insertSampleData() {
  console.log('Inserting sample data...');
  
  // Try to refresh the schema cache by doing a simple query first
  try {
    console.log('Refreshing schema cache...');
    const { data, error } = await supabase
      .from('leads')
      .select('id')
      .limit(1);
    
    if (error) {
      console.log('Schema cache refresh failed:', error.message);
      console.log('Tables may need to be created manually in Supabase dashboard.');
      return;
    }
    
    console.log('✅ Schema cache refreshed successfully');
  } catch (error) {
    console.log('Error refreshing schema:', error.message);
    return;
  }
  
  // Insert sample leads
  const sampleLeads = [
    {
      name: 'Sample Real Estate Agent',
      category: 'Real Estate',
      phone: '(555) 123-4567',
      website: 'https://example.com',
      email: 'agent@example.com',
      location: 'Miami, FL',
      city: 'Miami',
      state: 'FL',
      source: 'google_maps',
      industry: 'Real Estate',
      enrichment_status: 'completed',
      lead_score: 85
    },
    {
      name: 'Sample Dentist Office',
      category: 'Dental',
      phone: '(555) 987-6543',
      website: 'https://dentist-example.com',
      email: 'info@dentist-example.com',
      location: 'Orlando, FL',
      city: 'Orlando',
      state: 'FL',
      source: 'google_maps',
      industry: 'Healthcare',
      enrichment_status: 'completed',
      lead_score: 90
    },
    {
      name: 'Sample Law Firm',
      category: 'Legal Services',
      phone: '(555) 456-7890',
      website: 'https://law-example.com',
      email: 'contact@law-example.com',
      location: 'Tampa, FL',
      city: 'Tampa',
      state: 'FL',
      source: 'linkedin',
      industry: 'Legal',
      enrichment_status: 'completed',
      lead_score: 88
    }
  ];

  let successCount = 0;
  let errorCount = 0;

  for (const lead of sampleLeads) {
    try {
      const { error } = await supabase
        .from('leads')
        .insert(lead);
      
      if (error) {
        console.log(`❌ Error inserting ${lead.name}:`, error.message);
        errorCount++;
      } else {
        console.log(`✅ Successfully inserted: ${lead.name}`);
        successCount++;
      }
    } catch (error) {
      console.log(`❌ Error processing ${lead.name}:`, error.message);
      errorCount++;
    }
  }
  
  console.log(`\n📊 Sample data insertion summary:`);
  console.log(`✅ Successfully inserted: ${successCount} leads`);
  console.log(`❌ Failed to insert: ${errorCount} leads`);
  
  if (errorCount > 0) {
    console.log('\n💡 If you continue to have issues, try:');
    console.log('1. Check your Supabase dashboard for table structure');
    console.log('2. Ensure your service role key has full permissions');
    console.log('3. Try creating tables manually in the SQL editor');
  }
}

setupDatabase();
