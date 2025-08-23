import nodemailer from 'nodemailer';
import config from '../config';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.SMTP_HOST,
      port: config.SMTP_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASSWORD
      },
      tls: {
        ciphers: 'SSLv3'
      }
    });
  }

  // Email templates
  private getTemplate(templateName: string, data: any): string {
    const templates: Record<string, (data: any) => string> = {
      welcome: (data: any) => `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Attestify</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              margin: 0; 
              padding: 0; 
              background-color: #f5f5f5; 
            }
            .container { 
              max-width: 600px; 
              margin: 20px auto; 
              background: white; 
              border-radius: 10px; 
              overflow: hidden; 
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); 
            }
            .header { 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
              color: white; 
              padding: 40px 30px; 
              text-align: center; 
            }
            .header h1 { 
              margin: 0; 
              font-size: 28px; 
              font-weight: 300; 
            }
            .content { 
              padding: 40px 30px; 
            }
            .content h2 { 
              color: #333; 
              margin-top: 0; 
            }
            .button { 
              display: inline-block; 
              background: #667eea; 
              color: white; 
              padding: 14px 28px; 
              text-decoration: none; 
              border-radius: 6px; 
              margin: 20px 0; 
              font-weight: 500; 
              transition: background 0.3s ease; 
            }
            .button:hover { 
              background: #5a6fd8; 
            }
            .wallet-address { 
              background: #f8f9fa; 
              padding: 12px; 
              border-radius: 6px; 
              font-family: monospace; 
              word-break: break-all; 
              font-size: 14px; 
              margin: 15px 0; 
            }
            .features { 
              margin: 30px 0; 
            }
            .feature { 
              margin: 15px 0; 
              padding-left: 25px; 
              position: relative; 
            }
            .feature:before { 
              content: "✓"; 
              position: absolute; 
              left: 0; 
              color: #28a745; 
              font-weight: bold; 
            }
            .footer { 
              background: #f8f9fa; 
              padding: 30px; 
              text-align: center; 
              border-top: 1px solid #e9ecef; 
              color: #6c757d; 
              font-size: 14px; 
            }
            .footer a { 
              color: #667eea; 
              text-decoration: none; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to Attestify!</h1>
            </div>
            <div class="content">
              <h2>Hello ${data.username || 'there'}!</h2>
              <p>Welcome to <strong>Attestify</strong>, the future of verifiable attendance! We're excited to have you join our community of professionals building their verifiable career journey.</p>
              
              <p>Your wallet has been successfully connected:</p>
              <div class="wallet-address">${data.walletAddress}</div>
              
              <p>Here's what you can do with Attestify:</p>
              <div class="features">
                <div class="feature">Attend events and get blockchain-verified attendance records</div>
                <div class="feature">Earn peer validations from other attendees</div>
                <div class="feature">Collect tiered NFT certificates (Bronze, Silver, Gold)</div>
                <div class="feature">Build your verifiable professional reputation</div>
                <div class="feature">Create and organize your own events</div>
              </div>
              
              <a href="${config.FRONTEND_URL}" class="button">Start Your Journey</a>
              
              <p>Ready to attend your first event? Browse upcoming events and start building your verifiable attendance history!</p>
            </div>
            <div class="footer">
              <p>© 2025 Attestify. Building the future of verifiable attendance.</p>
              <p>
                <a href="${config.FRONTEND_URL}/events">Browse Events</a> | 
                <a href="${config.FRONTEND_URL}/profile">Your Profile</a> | 
                <a href="${config.FRONTEND_URL}/help">Help Center</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,

      peer_validation: (data: any) => `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Peer Validation Received</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 300; }
            .content { padding: 40px 30px; }
            .event-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .validation-count { background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
            .button { display: inline-block; background: #28a745; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 500; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef; color: #6c757d; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🤝 Peer Validation Received!</h1>
            </div>
            <div class="content">
              <h2>Great news!</h2>
              <p>Someone just validated your attendance at an event. This brings you one step closer to earning your certificate!</p>
              
              <div class="event-info">
                <h3>📅 Event Details</h3>
                <p><strong>Event:</strong> ${data.eventName}</p>
                <p><strong>Validator:</strong> ${data.validatorUsername || 'Anonymous Attendee'}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
              
              <div class="validation-count">
                <h3>🎯 Your Progress</h3>
                <p><strong>${data.currentValidations} validations received</strong></p>
                <p>Need ${Math.max(0, 3 - data.currentValidations)} more for Silver certificate</p>
              </div>
              
              <p>Keep networking and engaging with other attendees to collect more validations!</p>
              
              <a href="${config.FRONTEND_URL}/events/${data.eventId}" class="button">View Event Details</a>
            </div>
            <div class="footer">
              <p>© 2025 Attestify. Verified attendance, validated by peers.</p>
            </div>
          </div>
        </body>
        </html>
      `,

      certificate_ready: (data: any) => `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Certificate Ready to Claim</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 300; }
            .content { padding: 40px 30px; }
            .certificate-info { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; margin: 20px 0; }
            .tier-badge { font-size: 48px; margin: 10px 0; }
            .button { display: inline-block; background: #ffc107; color: #333; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 500; }
            .requirements { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef; color: #6c757d; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏆 Certificate Ready!</h1>
            </div>
            <div class="content">
              <h2>Congratulations!</h2>
              <p>You've met all the requirements and your <strong>${data.tier}</strong> certificate is ready to be claimed!</p>
              
              <div class="certificate-info">
                <div class="tier-badge">${data.tier === 'Gold' ? '🥇' : data.tier === 'Silver' ? '🥈' : '🥉'}</div>
                <h3>${data.tier} Certificate</h3>
                <p><strong>Event:</strong> ${data.eventName}</p>
                <p><strong>Achievement Level:</strong> ${data.tier}</p>
              </div>
              
              <div class="requirements">
                <h3>✅ Requirements Met</h3>
                <p>📍 Event attendance verified</p>
                <p>🤝 ${data.validationCount || 'Multiple'} peer validations received</p>
                <p>⏰ Validation window completed</p>
              </div>
              
              <p>This NFT certificate will be permanently stored on the blockchain and can be viewed in your profile or wallet.</p>
              
              <a href="${config.FRONTEND_URL}/certificates/mint?event=${data.eventId}&tier=${data.tier}" class="button">Claim Your Certificate</a>
              
              <p><small>Note: You'll need to pay a small gas fee to mint your certificate NFT on the blockchain.</small></p>
            </div>
            <div class="footer">
              <p>© 2025 Attestify. Your achievements, verified forever.</p>
            </div>
          </div>
        </body>
        </html>
      `,

      event_reminder: (data: any) => `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Event Starting Soon</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 300; }
            .content { padding: 40px 30px; }
            .countdown { background: #dc3545; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
            .event-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; background: #dc3545; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 500; }
            .checklist { margin: 20px 0; }
            .checklist li { margin: 10px 0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef; color: #6c757d; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ Event Starting Soon!</h1>
            </div>
            <div class="content">
              <h2>Don't miss out!</h2>
              <p>Your registered event is starting soon. Make sure you're ready to check in and start earning validations!</p>
              
              <div class="countdown">
                <h3>🚨 Starting in ${data.timeUntilStart}</h3>
              </div>
              
              <div class="event-details">
                <h3>📅 Event Information</h3>
                <p><strong>Event:</strong> ${data.eventName}</p>
                <p><strong>Time:</strong> ${data.startTime}</p>
                <p><strong>Location:</strong> ${data.location}</p>
                <p><strong>Organizer:</strong> ${data.organizer}</p>
              </div>
              
              <h3>📋 Pre-Event Checklist</h3>
              <ul class="checklist">
                <li>📱 Have your wallet app ready for check-in</li>
                <li>📍 Enable location services for accurate check-in</li>
                <li>🤝 Be ready to network and exchange validations</li>
                <li>📝 Bring business cards or contact info to share</li>
              </ul>
              
              <a href="${config.FRONTEND_URL}/events/${data.eventId}" class="button">View Event Details</a>
              
              <p>Remember: You need to be physically present at the event location to check in and start earning peer validations!</p>
            </div>
            <div class="footer">
              <p>© 2025 Attestify. Never miss a networking opportunity.</p>
            </div>
          </div>
        </body>
        </html>
      `,

      digest: (data: any) => `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Weekly Attestify Digest</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%); color: white; padding: 40px 30px; text-align: center; }
            .content { padding: 40px 30px; }
            .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
            .stat-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
            .stat-number { font-size: 24px; font-weight: bold; color: #667eea; }
            .upcoming-events { margin: 30px 0; }
            .event-item { background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 10px 0; }
            .button { display: inline-block; background: #6f42c1; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 500; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef; color: #6c757d; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Your Weekly Digest</h1>
            </div>
            <div class="content">
              <h2>Hey ${data.username}!</h2>
              <p>Here's your activity summary for this week on Attestify.</p>
              
              <div class="stat-grid">
                <div class="stat-card">
                  <div class="stat-number">${data.eventsAttended || 0}</div>
                  <p>Events Attended</p>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${data.validationsReceived || 0}</div>
                  <p>Validations Received</p>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${data.certificatesEarned || 0}</div>
                  <p>Certificates Earned</p>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${data.reputationGained || 0}</div>
                  <p>Reputation Points</p>
                </div>
              </div>
              
              <div class="upcoming-events">
                <h3>🎯 Upcoming Events You Might Like</h3>
                ${(data.upcomingEvents || []).map((event: any) => `
                  <div class="event-item">
                    <h4>${event.name}</h4>
                    <p>📅 ${event.date} | 📍 ${event.location}</p>
                  </div>
                `).join('')}
              </div>
              
              <a href="${config.FRONTEND_URL}/dashboard" class="button">View Full Dashboard</a>
              
              <p>Keep up the great networking! The more events you attend and validations you earn, the stronger your professional reputation becomes.</p>
            </div>
            <div class="footer">
              <p>© 2025 Attestify. Building professional relationships, one event at a time.</p>
              <p><a href="${config.FRONTEND_URL}/unsubscribe">Unsubscribe</a> from weekly digests</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    return templates[templateName] ? templates[templateName](data) : this.getDefaultTemplate(data);
  }

  private getDefaultTemplate(data: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #667eea; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Attestify Notification</h1>
          </div>
          <div class="content">
            <p>${data.message || 'You have a new notification from Attestify.'}</p>
            <p>Visit <a href="${config.FRONTEND_URL}">Attestify</a> to learn more.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Send email notification
  async sendEmailNotification(to: string, subject: string, htmlContent: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"Attestify" <${config.EMAIL_FROM || config.EMAIL_USER}>`,
        to,
        subject,
        html: htmlContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully to ${to}:`, result.messageId);
      return true;
    } catch (error) {
      console.error(`❌ Failed to send email to ${to}:`, error);
      return false;
    }
  }

  // Send template-based email
  async sendTemplateEmail(to: string, templateName: string, data: any, subject?: string): Promise<boolean> {
    try {
      const htmlContent = this.getTemplate(templateName, data);
      const emailSubject = subject || this.getDefaultSubject(templateName);
      
      return await this.sendEmailNotification(to, emailSubject, htmlContent);
    } catch (error) {
      console.error(`❌ Failed to send template email (${templateName}) to ${to}:`, error);
      return false;
    }
  }

  // Get default subject for template
  private getDefaultSubject(templateName: string): string {
    const subjects: Record<string, string> = {
      welcome: '🎉 Welcome to Attestify!',
      peer_validation: '🤝 You received a peer validation!',
      certificate_ready: '🏆 Your certificate is ready!',
      event_reminder: '⏰ Event starting soon!',
      digest: '📊 Your weekly Attestify digest'
    };

    return subjects[templateName] || '📬 Notification from Attestify';
  }

  // Send bulk emails
  async sendBulkEmails(emails: Array<{to: string, templateName: string, data: any, subject?: string}>): Promise<{sent: number, failed: number}> {
    let sent = 0;
    let failed = 0;

    for (const email of emails) {
      const success = await this.sendTemplateEmail(email.to, email.templateName, email.data, email.subject);
      if (success) {
        sent++;
      } else {
        failed++;
      }
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`📧 Bulk email results: ${sent} sent, ${failed} failed`);
    return { sent, failed };
  }

  // Test email configuration
  async testEmailConfiguration(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('✅ Email configuration is valid');
      return true;
    } catch (error) {
      console.error('❌ Email configuration test failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
