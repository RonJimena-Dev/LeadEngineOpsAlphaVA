# 🚀 Lead Engine - OpsAlpha VA

A professional, Apollo-style lead generation platform that automatically scrapes, enriches, and manages business leads from multiple sources.

## ✨ Features

- **🎯 Multi-Industry Targeting**: Support for 20+ industries with custom search terms
- **🌍 Multi-Source Scraping**: Google Maps, LinkedIn, Yellow Pages, Yelp, and more
- **🔍 Smart Email Enrichment**: Website extraction + pattern guessing algorithms
- **📊 Lead Scoring**: Quality rating system (0-100) based on data completeness
- **⚡ Automated Workflows**: Weekly scraping sessions with email/Slack notifications
- **📱 Modern UI**: Responsive dashboard with filtering, sorting, and export capabilities
- **🔄 Real-time Updates**: Live progress tracking and status monitoring
- **📈 Analytics**: Performance metrics and source effectiveness tracking

## 🏗️ Architecture

- **Frontend**: Next.js 14 + React + TypeScript
- **Backend**: Node.js + Express API routes
- **Database**: Supabase (PostgreSQL)
- **Scraping**: Puppeteer + Cheerio + Axios
- **Hosting**: Vercel (free tier)
- **Scheduling**: GitHub Actions (free tier)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Vercel account (optional, for deployment)

### 1. Clone & Install

```bash
git clone https://github.com/RonJimena-Dev/LeadEngineOpsAlphaVA.git
cd LeadEngineOpsAlphaVA
npm install
```

### 2. Environment Setup

Copy the environment file and configure your settings:

```bash
cp env.local .env.local
```

Update `.env.local` with your credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Slack Configuration (optional)
SLACK_BOT_TOKEN=your_slack_bot_token
SLACK_CHANNEL_ID=your_channel_id

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
NOTIFICATION_EMAIL=your_email@domain.com

# Company Information
COMPANY_NAME=OpsAlpha VA
COMPANY_DESCRIPTION=Professional virtual assistant services
COMPANY_WEBSITE=https://opsalpha-va.com
```

### 3. Database Setup

Run the database initialization script:

```bash
npm run setup-db
```

This will create the necessary tables and insert sample data.

### 4. Development

Start the development server:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your app.

### 5. Test Scraping

Test the scraping functionality:

```bash
npm run scrape
```

## 🗄️ Database Schema

### Leads Table
```sql
CREATE TABLE leads (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  phone VARCHAR(50),
  website VARCHAR(255),
  email VARCHAR(255),
  location VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  source VARCHAR(100) NOT NULL,
  source_url TEXT,
  enrichment_status VARCHAR(50) DEFAULT 'pending',
  enrichment_method VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_verified BOOLEAN DEFAULT FALSE,
  notes TEXT,
  industry VARCHAR(100),
  company_size VARCHAR(50),
  linkedin_url TEXT,
  google_maps_url TEXT,
  lead_score INTEGER DEFAULT 0,
  rating DECIMAL(3,2),
  review_count INTEGER
);
```

### Scraping Logs Table
```sql
CREATE TABLE scraping_logs (
  id SERIAL PRIMARY KEY,
  session_date TIMESTAMP DEFAULT NOW(),
  industry VARCHAR(100),
  location VARCHAR(100),
  search_terms TEXT[],
  leads_found INTEGER DEFAULT 0,
  leads_saved INTEGER DEFAULT 0,
  errors INTEGER DEFAULT 0,
  error_details TEXT[],
  status VARCHAR(50),
  session_duration BIGINT
);
```

## 🔧 Configuration

### Industry Targeting

The system supports 20+ industries out of the box. Each industry has:

- **Search Terms**: Optimized keywords for scraping
- **Data Sources**: Available scraping platforms
- **Keywords**: Industry-specific terminology

### Custom Industries

Add custom industries by modifying `scripts/scraper.js`:

```javascript
const INDUSTRY_DATABASE = {
  'Your Industry': {
    searchTerms: ['custom term 1', 'custom term 2'],
    keywords: ['keyword1', 'keyword2'],
    sources: ['google_maps', 'linkedin']
  }
};
```

### Scraping Sources

Available data sources:
- **Google Maps**: Business listings and reviews
- **LinkedIn**: Professional profiles and companies
- **Yellow Pages**: Traditional business directory
- **Yelp**: Business reviews and information
- **Crunchbase**: Company and startup data

## 📊 Usage

### 1. Generate Leads

1. Navigate to the dashboard
2. Select target industry and location
3. Choose data sources
4. Add custom search terms (optional)
5. Click "Generate Leads"

### 2. Monitor Progress

- Real-time scraping status
- Progress indicators
- Error reporting
- Completion notifications

### 3. Manage Leads

- Filter by industry, source, score
- Sort by any field
- Export to CSV
- Bulk actions
- Lead scoring insights

### 4. Automation

The system runs automatically:
- **Monday 9:00 AM**: Weekly scraping session
- **Wednesday 2:00 PM**: Mid-week update
- **Friday 11:00 AM**: End-of-week session

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Manual Deployment

```bash
npm run build
npm start
```

### GitHub Actions Automation

The system includes GitHub Actions workflows for:
- Automated testing
- Database migrations
- Scheduled scraping
- Performance monitoring

## 🔒 Security & Compliance

### Rate Limiting
- Configurable delays between requests
- Respectful scraping practices
- User-agent rotation

### Data Privacy
- No personal data storage
- Business information only
- GDPR compliant

### Terms of Service
- Respects robots.txt
- Follows platform guidelines
- Ethical scraping practices

## 📈 Performance

### Optimization Features
- **Parallel Processing**: Multiple sources simultaneously
- **Smart Caching**: Avoid duplicate requests
- **Efficient Parsing**: Optimized data extraction
- **Memory Management**: Resource cleanup

### Scalability
- **Horizontal Scaling**: Multiple scraping instances
- **Queue Management**: Job queuing system
- **Load Balancing**: Distributed processing

## 🛠️ Development

### Project Structure
```
LeadEngineOpsAlphaVA/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── components/        # React components
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── scripts/               # Node.js scripts
│   ├── scraper.js         # Main scraping engine
│   ├── scheduler.js       # Automation scheduler
│   └── setup-database.js  # Database initialization
├── components/            # Shared components
├── env.local              # Environment configuration
├── package.json           # Dependencies
└── README.md              # This file
```

### Adding New Features

1. **New Scraping Source**:
   - Add source to `INDUSTRY_DATABASE`
   - Implement scraping method in `LeadScraper` class
   - Add to source selection UI

2. **New Industry**:
   - Define search terms and keywords
   - Configure data sources
   - Test with sample data

3. **New Export Format**:
   - Implement export function
   - Add to dashboard UI
   - Update API endpoints

## 🧪 Testing

### Manual Testing
```bash
# Test scraping engine
npm run scrape

# Test database setup
npm run setup-db

# Test scheduler
node scripts/scheduler.js
```

### Automated Testing
```bash
npm run test
npm run test:watch
```

## 📝 API Documentation

### Leads API

#### GET /api/leads
Fetch leads with filtering and pagination.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `industry`: Filter by industry
- `source`: Filter by data source
- `enrichment_status`: Filter by enrichment status
- `minScore`: Minimum lead score
- `search`: Search term
- `sortBy`: Sort field
- `sortOrder`: Sort direction (asc/desc)

#### POST /api/leads
Create a new lead.

**Body:**
```json
{
  "name": "Business Name",
  "industry": "Real Estate",
  "source": "google_maps",
  "location": "Miami, FL"
}
```

### Scraping API

#### POST /api/scrape
Trigger a new scraping job.

**Body:**
```json
{
  "industry": "Real Estate",
  "location": "Florida",
  "sources": ["google_maps", "linkedin"],
  "customSearchTerms": ["realtors", "agents"]
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues

1. **Database Connection Error**
   - Verify Supabase credentials
   - Check network connectivity
   - Ensure database is active

2. **Scraping Fails**
   - Check rate limiting
   - Verify source accessibility
   - Review error logs

3. **Build Errors**
   - Clear node_modules and reinstall
   - Check Node.js version
   - Verify TypeScript configuration

### Getting Help

- **Documentation**: Check this README
- **Issues**: GitHub Issues page
- **Discussions**: GitHub Discussions
- **Email**: info@opsaplha-va.com

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Multi-source scraping
- ✅ Lead enrichment
- ✅ Basic dashboard
- ✅ Export functionality

### Phase 2 (Next)
- 🔄 CRM integrations
- 🔄 Advanced analytics
- 🔄 Lead nurturing workflows
- 🔄 API rate limit management

### Phase 3 (Future)
- 📋 AI-powered lead scoring
- 📋 Predictive analytics
- 📋 Advanced automation
- 📋 Enterprise features

## 🙏 Acknowledgments

- **OpsAlpha VA** - Professional virtual assistant services
- **Supabase** - Database and backend services
- **Vercel** - Hosting and deployment platform
- **Open Source Community** - Libraries and tools

---

**Built with ❤️ by OpsAlpha VA**

*Professional virtual assistant services for modern businesses*
