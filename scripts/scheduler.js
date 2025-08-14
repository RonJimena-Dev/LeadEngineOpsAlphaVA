const cron = require('node-cron');
const nodemailer = require('nodemailer');
const { WebClient } = require('@slack/web-api');
const EnhancedLeadScraper = require('./scraper');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

class LeadGenerationScheduler {
  constructor() {
    this.scraper = null;
    this.emailTransporter = null;
    this.slackClient = null;
    this.isRunning = false;
    
    this.initializeServices();
  }

  async initializeServices() {
    // Initialize email service
    this.emailTransporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Initialize Slack client
    if (process.env.SLACK_BOT_TOKEN) {
      this.slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);
    }

    console.log('✅ Scheduler services initialized');
  }

  async sendEmailNotification(subject, content) {
    try {
      if (!this.emailTransporter) {
        console.log('Email service not configured');
        return;
      }

      const mailOptions = {
        from: process.env.SMTP_USER,
        to: process.env.NOTIFICATION_EMAIL,
        subject: `Lead Engine - ${subject}`,
        html: content
      };

      await this.emailTransporter.sendMail(mailOptions);
      console.log('✅ Email notification sent');
    } catch (error) {
      console.error('❌ Error sending email notification:', error.message);
    }
  }

  async sendSlackNotification(message) {
    try {
      if (!this.slackClient || !process.env.SLACK_CHANNEL_ID) {
        console.log('Slack service not configured');
        return;
      }

      await this.slackClient.chat.postMessage({
        channel: process.env.SLACK_CHANNEL_ID,
        text: message,
        unfurl_links: false
      });

      console.log('✅ Slack notification sent');
    } catch (error) {
      console.error('❌ Error sending Slack notification:', error.message);
    }
  }

  async runWeeklyScraping() {
    if (this.isRunning) {
      console.log('⚠️ Scraping already in progress, skipping...');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting weekly lead generation session...');

    try {
      // Initialize scraper
      this.scraper = new EnhancedLeadScraper();
      
      // Get available industries
      const industries = this.scraper.getAvailableIndustries();
      
      let totalResults = {
        totalFound: 0,
        totalSaved: 0,
        totalErrors: 0,
        industryResults: []
      };

      // Run scraping for each industry (limit to 3 per session to avoid rate limits)
      const targetIndustries = industries.slice(0, 3);
      
      for (const industry of targetIndustries) {
        try {
          console.log(`🎯 Processing industry: ${industry}`);
          
          const result = await this.scraper.scrapeIndustry(industry, 'Florida');
          
          totalResults.totalFound += result.totalFound;
          totalResults.totalSaved += result.totalSaved;
          totalResults.totalErrors += result.errors;
          totalResults.industryResults.push({
            industry,
            found: result.totalFound,
            saved: result.totalSaved,
            errors: result.errors
          });

          // Delay between industries
          await new Promise(resolve => setTimeout(resolve, 10000));
          
        } catch (error) {
          console.error(`❌ Error processing industry ${industry}:`, error.message);
          totalResults.totalErrors++;
        }
      }

      // Send notifications
      await this.sendNotifications(totalResults);
      
      console.log('✅ Weekly scraping session completed successfully');
      
    } catch (error) {
      console.error('❌ Weekly scraping session failed:', error);
      await this.sendErrorNotification(error);
    } finally {
      this.isRunning = false;
      if (this.scraper) {
        await this.scraper.close();
      }
    }
  }

  async sendNotifications(results) {
    // Email notification
    const emailContent = this.generateEmailContent(results);
    await this.sendEmailNotification('Weekly Lead Generation Report', emailContent);

    // Slack notification
    const slackMessage = this.generateSlackMessage(results);
    await this.sendSlackNotification(slackMessage);
  }

  generateEmailContent(results) {
    const date = new Date().toLocaleDateString();
    
    let content = `
      <h2>🚀 Lead Engine Weekly Report</h2>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Total Leads Found:</strong> ${results.totalFound}</p>
      <p><strong>Total Leads Saved:</strong> ${results.totalSaved}</p>
      <p><strong>Total Errors:</strong> ${results.totalErrors}</p>
      
      <h3>Industry Breakdown:</h3>
      <table style="border-collapse: collapse; width: 100%;">
        <tr style="background-color: #f2f2f2;">
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Industry</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Found</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Saved</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Errors</th>
        </tr>
    `;

    results.industryResults.forEach(result => {
      content += `
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">${result.industry}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${result.found}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${result.saved}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${result.errors}</td>
        </tr>
      `;
    });

    content += `
      </table>
      <br>
      <p><em>Powered by OpsAlpha VA Lead Engine</em></p>
    `;

    return content;
  }

  generateSlackMessage(results) {
    const date = new Date().toLocaleDateString();
    
    let message = `🚀 *Lead Engine Weekly Report* - ${date}\n\n`;
    message += `📊 *Summary:*\n`;
    message += `• Total Leads Found: ${results.totalFound}\n`;
    message += `• Total Leads Saved: ${results.totalSaved}\n`;
    message += `• Total Errors: ${results.totalErrors}\n\n`;
    
    message += `🏭 *Industry Breakdown:*\n`;
    results.industryResults.forEach(result => {
      message += `• ${result.industry}: ${result.found} found, ${result.saved} saved\n`;
    });
    
    message += `\n_Powered by OpsAlpha VA Lead Engine_`;
    
    return message;
  }

  async sendErrorNotification(error) {
    const errorMessage = `❌ *Lead Engine Error*\n\nError: ${error.message}\n\nTime: ${new Date().toLocaleString()}`;
    
    await this.sendSlackNotification(errorMessage);
    await this.sendEmailNotification('Lead Engine Error', `<h2>❌ Lead Engine Error</h2><p>${error.message}</p>`);
  }

  // Start scheduled scraping
  startScheduledScraping() {
    console.log('⏰ Starting scheduled lead generation...');
    
    // Run every Monday at 9:00 AM
    cron.schedule('0 9 * * 1', async () => {
      console.log('🕘 Monday 9:00 AM - Starting scheduled scraping...');
      await this.runWeeklyScraping();
    }, {
      scheduled: true,
      timezone: "America/New_York"
    });

    // Run every Wednesday at 2:00 PM
    cron.schedule('0 14 * * 3', async () => {
      console.log('🕑 Wednesday 2:00 PM - Starting scheduled scraping...');
      await this.runWeeklyScraping();
    }, {
      scheduled: true,
      timezone: "America/New_York"
    });

    // Run every Friday at 11:00 AM
    cron.schedule('0 11 * * 5', async () => {
      console.log('🕚 Friday 11:00 AM - Starting scheduled scraping...');
      await this.runWeeklyScraping();
    }, {
      scheduled: true,
      timezone: "America/New_York"
    });

    console.log('✅ Scheduled scraping started (Monday 9AM, Wednesday 2PM, Friday 11AM)');
  }

  // Manual trigger for testing
  async runManualScraping(industry = 'Real Estate', location = 'Florida') {
    console.log(`🔧 Manual scraping triggered for: ${industry} in ${location}`);
    
    try {
      this.scraper = new EnhancedLeadScraper();
      const result = await this.scraper.scrapeIndustry(industry, location);
      
      console.log('✅ Manual scraping completed:', result);
      
      // Send notification
      await this.sendNotifications({
        totalFound: result.totalFound,
        totalSaved: result.totalSaved,
        totalErrors: result.errors,
        industryResults: [{
          industry,
          found: result.totalFound,
          saved: result.totalSaved,
          errors: result.errors
        }]
      });
      
      return result;
      
    } catch (error) {
      console.error('❌ Manual scraping failed:', error);
      await this.sendErrorNotification(error);
      throw error;
    } finally {
      if (this.scraper) {
        await this.scraper.close();
      }
    }
  }

  // Stop scheduler
  stop() {
    console.log('🛑 Stopping lead generation scheduler...');
    // Cron jobs will be automatically cleaned up
  }
}

// Export for use in other modules
module.exports = LeadGenerationScheduler;

// Run if called directly
if (require.main === module) {
  const scheduler = new LeadGenerationScheduler();
  
  // Start scheduled scraping
  scheduler.startScheduledScraping();
  
  // Keep process alive
  process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down gracefully...');
    scheduler.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    scheduler.stop();
    process.exit(0);
  });
}
