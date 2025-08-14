const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Enhanced industry database with search terms
const INDUSTRY_DATABASE = {
  'Real Estate': {
    searchTerms: ['real estate agents', 'realtors', 'real estate brokers', 'property managers', 'real estate companies'],
    keywords: ['real estate', 'property', 'realtor', 'broker', 'agent'],
    sources: ['google_maps', 'linkedin', 'yellow_pages', 'zillow']
  },
  'Healthcare': {
    searchTerms: ['dentists', 'doctors', 'physicians', 'medical practices', 'healthcare providers', 'orthodontists', 'pediatricians'],
    keywords: ['healthcare', 'medical', 'dental', 'physician', 'doctor'],
    sources: ['google_maps', 'linkedin', 'healthgrades', 'vitals']
  },
  'Legal': {
    searchTerms: ['lawyers', 'attorneys', 'law firms', 'legal services', 'criminal defense', 'family law'],
    keywords: ['legal', 'law', 'attorney', 'lawyer', 'law firm'],
    sources: ['google_maps', 'linkedin', 'avvo', 'martindale']
  },
  'Finance': {
    searchTerms: ['financial advisors', 'accountants', 'cpa firms', 'investment advisors', 'wealth management'],
    keywords: ['finance', 'financial', 'accounting', 'investment', 'wealth'],
    sources: ['google_maps', 'linkedin', 'yellow_pages']
  },
  'Marketing': {
    searchTerms: ['marketing agencies', 'digital marketing', 'advertising agencies', 'pr firms', 'branding agencies'],
    keywords: ['marketing', 'advertising', 'branding', 'digital', 'pr'],
    sources: ['google_maps', 'linkedin', 'clutch', 'agency']
  },
  'Technology': {
    searchTerms: ['software companies', 'it services', 'tech startups', 'web development', 'app development'],
    keywords: ['technology', 'software', 'it', 'tech', 'development'],
    sources: ['google_maps', 'linkedin', 'crunchbase', 'angel']
  },
  'Construction': {
    searchTerms: ['contractors', 'construction companies', 'home builders', 'renovation', 'plumbers', 'electricians'],
    keywords: ['construction', 'contractor', 'builder', 'renovation', 'plumbing'],
    sources: ['google_maps', 'linkedin', 'homeadvisor', 'angie']
  },
  'Restaurant': {
    searchTerms: ['restaurants', 'cafes', 'food trucks', 'catering', 'bars', 'pubs'],
    keywords: ['restaurant', 'food', 'cafe', 'catering', 'bar'],
    sources: ['google_maps', 'yelp', 'tripadvisor', 'opentable']
  },
  'Retail': {
    searchTerms: ['retail stores', 'boutiques', 'shopping centers', 'online stores', 'ecommerce'],
    keywords: ['retail', 'store', 'boutique', 'shopping', 'ecommerce'],
    sources: ['google_maps', 'linkedin', 'yelp', 'yellow_pages']
  },
  'Education': {
    searchTerms: ['schools', 'universities', 'tutoring centers', 'training programs', 'online courses'],
    keywords: ['education', 'school', 'university', 'training', 'tutoring'],
    sources: ['google_maps', 'linkedin', 'yellow_pages']
  }
};

class EnhancedLeadScraper {
  constructor() {
    this.browser = null;
    this.delayMs = parseInt(process.env.SCRAPING_DELAY) || 2000;
    this.maxRetries = parseInt(process.env.MAX_RETRIES) || 3;
    this.currentSession = {
      industry: null,
      location: null,
      searchTerms: [],
      startTime: null,
      leadsFound: 0,
      leadsSaved: 0,
      errors: []
    };
  }

  async initialize() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  // Add proper delay method
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Dynamic industry targeting
  async scrapeIndustry(industry, location, customSearchTerms = []) {
    console.log(`🎯 Starting enhanced scraping for: ${industry} in ${location}`);
    
    this.currentSession.industry = industry;
    this.currentSession.location = location;
    this.currentSession.startTime = new Date();
    
    const industryData = INDUSTRY_DATABASE[industry] || {
      searchTerms: customSearchTerms.length > 0 ? customSearchTerms : [industry.toLowerCase()],
      keywords: [industry.toLowerCase()],
      sources: ['google_maps', 'linkedin']
    };
    
    this.currentSession.searchTerms = industryData.searchTerms;
    
    let allLeads = [];
    
    // Scrape from multiple sources
    for (const source of industryData.sources) {
      try {
        let sourceLeads = [];
        
        switch (source) {
          case 'google_maps':
            sourceLeads = await this.scrapeGoogleMaps(industry, industryData.searchTerms, location);
            break;
          case 'linkedin':
            sourceLeads = await this.scrapeLinkedIn(industry, industryData.searchTerms, location);
            break;
          case 'yellow_pages':
            sourceLeads = await this.scrapeYellowPages(industry, industryData.searchTerms, location);
            break;
          case 'yelp':
            sourceLeads = await this.scrapeYelp(industry, industryData.searchTerms, location);
            break;
          default:
            console.log(`Source ${source} not implemented yet`);
        }
        
        allLeads = allLeads.concat(sourceLeads);
        console.log(`✅ ${source}: Found ${sourceLeads.length} leads`);
        
        await this.delay(3000); // Delay between sources
        
      } catch (error) {
        console.error(`❌ Error scraping ${source}:`, error.message);
        this.currentSession.errors.push(`${source}: ${error.message}`);
      }
    }
    
    // Enhanced email enrichment
    const enrichedLeads = await this.enhancedEmailEnrichment(allLeads);
    
    // Lead scoring
    const scoredLeads = enrichedLeads.map(lead => ({
      ...lead,
      lead_score: this.calculateLeadScore(lead)
    }));
    
    // Save to database
    const savedLeads = await this.saveLeads(scoredLeads);
    
    // Log session
    await this.logScrapingSession(allLeads.length, savedLeads.length);
    
    this.currentSession.leadsFound = allLeads.length;
    this.currentSession.leadsSaved = savedLeads.length;
    
    return {
      totalFound: allLeads.length,
      totalSaved: savedLeads.length,
      errors: this.currentSession.errors.length,
      session: this.currentSession
    };
  }

  async scrapeGoogleMaps(industry, searchTerms, location) {
    console.log(`🗺️ Scraping Google Maps for: ${industry} in ${location}`);
    
    const page = await this.browser.newPage();
    const leads = [];
    
    try {
      // Set user agent to avoid detection
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      for (const searchTerm of searchTerms.slice(0, 3)) {
        try {
          const searchQuery = `${searchTerm} ${location}`;
          console.log(`🔍 Searching for: ${searchQuery}`);
          
          // Go to Google Maps
          await page.goto('https://www.google.com/maps');
          await this.delay(2000);
          
          // Type search query
          const searchInput = await page.$('#searchboxinput');
          if (searchInput) {
            await searchInput.click();
            await page.keyboard.type(searchQuery);
            await page.keyboard.press('Enter');
            await this.delay(3000);
          }
          
          // Wait for results to load - try multiple selectors
          let resultsLoaded = false;
          const selectors = [
            '[role="article"]',
            '.section-result',
            '.section-layout-root',
            '[data-value]',
            '.section-result-content'
          ];
          
          for (const selector of selectors) {
            try {
              await page.waitForSelector(selector, { timeout: 5000 });
              resultsLoaded = true;
              break;
            } catch (e) {
              console.log(`Selector ${selector} not found, trying next...`);
            }
          }
          
          if (!resultsLoaded) {
            console.log(`No results found for "${searchTerm}", trying alternative approach...`);
            
            // Try to find any business listings
            const businessElements = await page.$$('div[role="button"], .section-result, [data-value]');
            console.log(`Found ${businessElements.length} potential business elements`);
            
            for (let i = 0; i < Math.min(businessElements.length, 5); i++) {
              try {
                const element = businessElements[i];
                
                // Click on the element to load details
                await element.click();
                await this.delay(2000);
                
                const businessInfo = await this.extractEnhancedBusinessInfo(page);
                
                if (businessInfo.name) {
                  leads.push({
                    ...businessInfo,
                    industry,
                    source: 'google_maps',
                    source_url: page.url(),
                    search_term: searchTerm
                  });
                  console.log(`✅ Found: ${businessInfo.name}`);
                }
                
                await this.delay(this.delayMs);
              } catch (error) {
                console.log(`Error extracting business ${i}:`, error.message);
              }
            }
          } else {
            // Results loaded successfully, extract business info
            const businessElements = await page.$$('[role="article"], .section-result, [data-value]');
            console.log(`Found ${businessElements.length} business results`);
            
            for (let i = 0; i < Math.min(businessElements.length, 5); i++) {
              try {
                const element = businessElements[i];
                
                // Click on the element to load details
                await element.click();
                await this.delay(2000);
                
                const businessInfo = await this.extractEnhancedBusinessInfo(page);
                
                if (businessInfo.name) {
                  leads.push({
                    ...businessInfo,
                    industry,
                    source: 'google_maps',
                    source_url: page.url(),
                    search_term: searchTerm
                  });
                  console.log(`✅ Found: ${businessInfo.name}`);
                }
                
                await this.delay(this.delayMs);
              } catch (error) {
                console.log(`Error extracting business ${i}:`, error.message);
              }
            }
          }
          
          await this.delay(5000); // Delay between search terms
          
        } catch (error) {
          console.log(`Error with search term "${searchTerm}":`, error.message);
        }
      }
      
    } catch (error) {
      console.error(`Google Maps scraping error:`, error.message);
    } finally {
      await page.close();
    }
    
    return leads;
  }

  async extractEnhancedBusinessInfo(page) {
    try {
      const businessInfo = {};
      
      // Extract name
      const nameElement = await page.$('h1');
      if (nameElement) {
        businessInfo.name = await page.evaluate(el => el.textContent.trim(), nameElement);
      }
      
      // Extract phone
      const phoneElement = await page.$('[data-item-id="phone:tel:"]');
      if (phoneElement) {
        businessInfo.phone = await page.evaluate(el => el.textContent.trim(), phoneElement);
      }
      
      // Extract website
      const websiteElement = await page.$('[data-item-id="authority"]');
      if (websiteElement) {
        businessInfo.website = await page.evaluate(el => el.getAttribute('href'), websiteElement);
      }
      
      // Extract address
      const addressElement = await page.$('[data-item-id="address"]');
      if (addressElement) {
        const address = await page.evaluate(el => el.textContent.trim(), addressElement);
        businessInfo.location = address;
        
        // Parse city and state
        const addressParts = address.split(',').map(part => part.trim());
        if (addressParts.length >= 2) {
          businessInfo.city = addressParts[addressParts.length - 2];
          businessInfo.state = addressParts[addressParts.length - 1];
        }
      }
      
      // Extract category
      const categoryElement = await page.$('[data-item-id="category"]');
      if (categoryElement) {
        businessInfo.category = await page.evaluate(el => el.textContent.trim(), categoryElement);
      }
      
      // Extract rating
      const ratingElement = await page.$('[aria-label*="stars"]');
      if (ratingElement) {
        const ratingText = await page.evaluate(el => el.getAttribute('aria-label'), ratingElement);
        const ratingMatch = ratingText.match(/(\d+(?:\.\d+)?)/);
        if (ratingMatch) {
          businessInfo.rating = parseFloat(ratingMatch[1]);
        }
      }
      
      // Extract review count
      const reviewElement = await page.$('[aria-label*="reviews"]');
      if (reviewElement) {
        const reviewText = await page.evaluate(el => el.textContent.trim(), reviewElement);
        const reviewMatch = reviewText.match(/(\d+)/);
        if (reviewMatch) {
          businessInfo.review_count = parseInt(reviewMatch[1]);
        }
      }
      
      return businessInfo;
    } catch (error) {
      console.log('Error extracting business info:', error.message);
      return {};
    }
  }

  async scrapeLinkedIn(industry, searchTerms, location) {
    console.log(`💼 Scraping LinkedIn for: ${industry} in ${location}`);
    
    const page = await this.browser.newPage();
    const leads = [];
    
    try {
      for (const searchTerm of searchTerms.slice(0, 2)) { // Limit to 2 search terms
        try {
          // Search LinkedIn via Google
          const searchQuery = `site:linkedin.com/in ${searchTerm} ${location}`;
          await page.goto(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`);
          await this.delay(2000);
          
          // Extract LinkedIn profile URLs
          const profileLinks = await page.$$eval('a[href*="linkedin.com/in/"]', links => 
            links.map(link => link.href).slice(0, 8)
          );
          
          for (const profileUrl of profileLinks) {
            try {
              const lead = await this.extractLinkedInProfile(page, profileUrl, industry);
              if (lead.name) {
                leads.push(lead);
              }
              await this.delay(this.delayMs);
            } catch (error) {
              console.log(`Error extracting LinkedIn profile:`, error.message);
            }
          }
          
          await this.delay(4000); // Delay between search terms
          
        } catch (error) {
          console.log(`Error with LinkedIn search term "${searchTerm}":`, error.message);
        }
      }
      
    } catch (error) {
      console.error(`LinkedIn scraping error:`, error.message);
    } finally {
      await page.close();
    }
    
    return leads;
  }

  async extractLinkedInProfile(page, profileUrl, industry) {
    try {
      await page.goto(profileUrl);
      await this.delay(2000);
      
      const lead = {
        source: 'linkedin',
        source_url: profileUrl,
        industry,
        linkedin_url: profileUrl
      };
      
      // Extract name
      const nameElement = await page.$('h1');
      if (nameElement) {
        lead.name = await page.evaluate(el => el.textContent.trim(), nameElement);
      }
      
      // Extract title/headline
      const titleElement = await page.$('.text-body-medium, .pv-text-details__left-panel .text-body-medium');
      if (titleElement) {
        lead.category = await page.evaluate(el => el.textContent.trim(), titleElement);
      }
      
      // Extract location
      const locationElement = await page.$('.text-body-small, .pv-text-details__left-panel .text-body-small');
      if (locationElement) {
        lead.location = await page.evaluate(el => el.textContent.trim(), locationElement);
      }
      
      // Extract company
      const companyElement = await page.$('[aria-label*="company"]');
      if (companyElement) {
        lead.company = await page.evaluate(el => el.textContent.trim(), companyElement);
      }
      
      return lead;
    } catch (error) {
      console.log('Error extracting LinkedIn profile:', error.message);
      return {};
    }
  }

  async scrapeYellowPages(industry, searchTerms, location) {
    console.log(`📚 Scraping Yellow Pages for: ${industry} in ${location}`);
    
    const page = await this.browser.newPage();
    const leads = [];
    
    try {
      for (const searchTerm of searchTerms.slice(0, 2)) {
        try {
          const searchQuery = `${searchTerm} ${location}`;
          await page.goto(`https://www.yellowpages.com/search?search_terms=${encodeURIComponent(searchTerm)}&geo_location_terms=${encodeURIComponent(location)}`);
          await this.delay(3000);
          
          // Extract business listings
          const businessElements = await page.$$('.result');
          
          for (let i = 0; i < Math.min(businessElements.length, 10); i++) {
            try {
              const element = businessElements[i];
              
              const businessInfo = await this.extractYellowPagesInfo(page, element);
              
              if (businessInfo.name) {
                leads.push({
                  ...businessInfo,
                  industry,
                  source: 'yellow_pages',
                  search_term: searchTerm
                });
              }
              
            } catch (error) {
              console.log(`Error extracting Yellow Pages business ${i}:`, error.message);
            }
          }
          
          await this.delay(3000);
          
        } catch (error) {
          console.log(`Error with Yellow Pages search term "${searchTerm}":`, error.message);
        }
      }
      
    } catch (error) {
      console.error(`Yellow Pages scraping error:`, error.message);
    } finally {
      await page.close();
    }
    
    return leads;
  }

  async extractYellowPagesInfo(page, element) {
    try {
      const businessInfo = {};
      
      // Extract name
      const nameElement = await element.$('.business-name');
      if (nameElement) {
        businessInfo.name = await page.evaluate(el => el.textContent.trim(), nameElement);
      }
      
      // Extract phone
      const phoneElement = await element.$('.phones');
      if (phoneElement) {
        businessInfo.phone = await page.evaluate(el => el.textContent.trim(), phoneElement);
      }
      
      // Extract website
      const websiteElement = await element.$('.track-visit-website');
      if (websiteElement) {
        businessInfo.website = await page.evaluate(el => el.getAttribute('href'), websiteElement);
      }
      
      // Extract address
      const addressElement = await element.$('.street-address');
      if (addressElement) {
        businessInfo.location = await page.evaluate(el => el.textContent.trim(), addressElement);
      }
      
      return businessInfo;
    } catch (error) {
      console.log('Error extracting Yellow Pages info:', error.message);
      return {};
    }
  }

  async enhancedEmailEnrichment(leads) {
    console.log('🔍 Starting enhanced email enrichment...');
    
    for (const lead of leads) {
      if (lead.website && !lead.email) {
        try {
          // Try multiple enrichment methods
          const email = await this.extractEmailFromWebsite(lead.website);
          if (email) {
            lead.email = email;
            lead.enrichment_status = 'completed';
            lead.enrichment_method = 'website_extraction';
          } else {
            // Try pattern guessing with multiple patterns
            const guessedEmail = this.guessEmailPatterns(lead.name, lead.website);
            if (guessedEmail) {
              lead.email = guessedEmail;
              lead.enrichment_status = 'pattern_guessed';
              lead.enrichment_method = 'pattern_guessing';
            }
          }
          
          await this.delay(1000);
        } catch (error) {
          console.log(`Error enriching email for ${lead.name}:`, error.message);
        }
      }
    }
    
    return leads;
  }

  guessEmailPatterns(name, website) {
    try {
      if (!name || !website) return null;
      
      const domain = new URL(website).hostname.replace('www.', '');
      const nameParts = name.toLowerCase().split(' ').filter(part => part.length > 0);
      
      if (nameParts.length >= 2) {
        const firstName = nameParts[0];
        const lastName = nameParts[nameParts.length - 1];
        
        const patterns = [
          `${firstName}.${lastName}@${domain}`,
          `${firstName}${lastName}@${domain}`,
          `${firstName[0]}${lastName}@${domain}`,
          `${firstName}@${domain}`,
          `${lastName}@${domain}`,
          `${firstName}_${lastName}@${domain}`,
          `${firstName}-${lastName}@${domain}`,
          `info@${domain}`,
          `contact@${domain}`,
          `hello@${domain}`
        ];
        
        return patterns[0]; // Return first pattern
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  calculateLeadScore(lead) {
    let score = 0;
    
    // Basic info (40 points)
    if (lead.name) score += 10;
    if (lead.phone) score += 10;
    if (lead.email) score += 15;
    if (lead.website) score += 5;
    
    // Location info (20 points)
    if (lead.location) score += 10;
    if (lead.city && lead.state) score += 10;
    
    // Enrichment status (20 points)
    if (lead.enrichment_status === 'completed') score += 20;
    else if (lead.enrichment_status === 'pattern_guessed') score += 15;
    else if (lead.enrichment_status === 'pending') score += 5;
    
    // Source quality (10 points)
    if (lead.source === 'google_maps') score += 10;
    else if (lead.source === 'linkedin') score += 8;
    else if (lead.source === 'yellow_pages') score += 6;
    
    // Additional data (10 points)
    if (lead.rating) score += 5;
    if (lead.review_count) score += 5;
    
    return Math.min(score, 100);
  }

  async saveLeads(leads) {
    console.log(`💾 Saving ${leads.length} leads to database...`);
    
    const savedLeads = [];
    
    for (const lead of leads) {
      try {
        // Check if lead already exists
        const { data: existing } = await supabase
          .from('leads')
          .select('id')
          .eq('name', lead.name)
          .eq('source', lead.source)
          .limit(1);
        
        if (existing && existing.length > 0) {
          console.log(`Lead ${lead.name} already exists, skipping...`);
          continue;
        }
        
        // Insert new lead
        const { data, error } = await supabase
          .from('leads')
          .insert(lead)
          .select();
        
        if (error) {
          console.log(`Error saving lead ${lead.name}:`, error.message);
        } else {
          savedLeads.push(data[0]);
          console.log(`✅ Saved lead: ${lead.name} (Score: ${lead.lead_score})`);
        }
        
        await this.delay(500);
      } catch (error) {
        console.log(`Error processing lead ${lead.name}:`, error.message);
      }
    }
    
    return savedLeads;
  }

  async logScrapingSession(leadsFound, leadsSaved) {
    try {
      const logEntry = {
        session_date: new Date().toISOString(),
        industry: this.currentSession.industry,
        location: this.currentSession.location,
        search_terms: this.currentSession.searchTerms,
        leads_found: leadsFound,
        leads_saved: leadsSaved,
        errors: this.currentSession.errors.length,
        error_details: this.currentSession.errors,
        status: this.currentSession.errors.length > 0 ? 'completed_with_errors' : 'completed',
        session_duration: Date.now() - this.currentSession.startTime.getTime()
      };
      
      await supabase
        .from('scraping_logs')
        .insert(logEntry);
        
    } catch (error) {
      console.log('Error logging scraping session:', error.message);
    }
  }

  // Get available industries
  getAvailableIndustries() {
    return Object.keys(INDUSTRY_DATABASE);
  }

  // Get industry details
  getIndustryDetails(industry) {
    return INDUSTRY_DATABASE[industry] || null;
  }

  // Custom scraping for any industry
  async scrapeCustomIndustry(industry, location, searchTerms) {
    return await this.scrapeIndustry(industry, location, searchTerms);
  }

  async run() {
    console.log('🚀 Starting enhanced lead scraping session...');
    
    try {
      await this.initialize();
      
      // Example: Scrape real estate in Florida
      const result = await this.scrapeIndustry('Real Estate', 'Florida');
      
      console.log(`✅ Enhanced scraping completed!`, result);
      
      return result;
      
    } catch (error) {
      console.error('❌ Enhanced scraping session failed:', error);
      throw error;
    } finally {
      await this.close();
    }
  }
}

// Run scraper if called directly
if (require.main === module) {
  const scraper = new EnhancedLeadScraper();
  scraper.run()
    .then(result => {
      console.log('Enhanced scraping completed successfully:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('Enhanced scraping failed:', error);
      process.exit(1);
    });
}

module.exports = EnhancedLeadScraper;
