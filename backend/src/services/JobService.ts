import { db } from '../config/database';
import { BlockchainService } from './BlockchainService';
import { createNotification } from '../routes/notifications';

// Create blockchain service instance
const blockchainService = new BlockchainService();

export interface Job {
  id?: number;
  job_type: string;
  job_data: any;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  priority?: number;
  attempts?: number;
  max_attempts?: number;
  scheduled_at?: Date;
  error_message?: string;
}

export class JobService {
  private isProcessing = false;
  private processingInterval: NodeJS.Timeout | null = null;

  // Start the job processor
  start() {
    if (!this.processingInterval) {
      console.log('🔄 Starting background job processor...');
      this.processingInterval = setInterval(() => {
        this.processJobs();
      }, 5000); // Process jobs every 5 seconds
    }
  }

  // Stop the job processor
  stop() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
      console.log('⏹️ Background job processor stopped');
    }
  }

  // Add a job to the queue
  async addJob(job: Job): Promise<number> {
    // In production, this would insert into the database
    // For now, process immediately in development mode
    console.log(`📝 Processing job immediately: ${job.job_type}`);
    
    try {
      await this.processJobData(job);
      console.log(`✅ Job completed: ${job.job_type}`);
      return Math.floor(Math.random() * 10000);
    } catch (error) {
      console.error(`❌ Job failed: ${job.job_type}`, error);
      throw error;
    }
  }

  // Process pending jobs
  private async processJobs() {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    
    try {
      // In production, this would query the database for pending jobs
      // For now, we'll just log that the processor is running
      // console.log('🔄 Job processor tick...');
    } catch (error) {
      console.error('❌ Error processing jobs:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  // Process individual job
  private async processJobData(job: Job) {
    const jobData = job.job_data;
    
    switch (job.job_type) {
      case 'SYNC_BLOCKCHAIN_EVENTS':
        await this.syncBlockchainEvents(jobData);
        break;
        
      case 'SEND_NOTIFICATION_EMAIL':
        await this.sendNotificationEmail(jobData);
        break;
        
      case 'UPDATE_USER_STATS':
        await this.updateUserStats(jobData);
        break;
        
      case 'PROCESS_CERTIFICATE_ELIGIBILITY':
        await this.processCertificateEligibility(jobData);
        break;
        
      case 'CLEANUP_EXPIRED_DATA':
        await this.cleanupExpiredData(jobData);
        break;
        
      default:
        throw new Error(`Unknown job type: ${job.job_type}`);
    }
  }

  // Sync blockchain events
  private async syncBlockchainEvents(data: any) {
    console.log('🔗 Syncing blockchain events...');
    
    try {
      // Mock event processing for development
      const mockEvents = [
        { type: 'EventCreated', data: { event_id: '123' } },
        { type: 'UserCheckedIn', data: { user_address: '0x123', event_id: '123' } }
      ];
      
      for (const event of mockEvents) {
        await this.processBlockchainEvent(event);
      }
      
      console.log(`✅ Synced ${mockEvents.length} blockchain events`);
    } catch (error) {
      console.error('❌ Blockchain sync failed:', error);
      throw error;
    }
  }

  // Process blockchain event
  private async processBlockchainEvent(event: any) {
    switch (event.type) {
      case 'EventCreated':
        console.log(`📅 Event created on blockchain: ${event.data.event_id}`);
        break;
        
      case 'UserCheckedIn':
        console.log(`✅ User checked in: ${event.data.user_address} -> Event ${event.data.event_id}`);
        await this.handleCheckIn(event.data);
        break;
        
      case 'PeerValidation':
        console.log(`👥 Peer validation: ${event.data.validator} validated ${event.data.attendee}`);
        await this.handlePeerValidation(event.data);
        break;
        
      case 'CertificateMinted':
        console.log(`🏆 Certificate minted: ${event.data.recipient} for Event ${event.data.event_id}`);
        await this.handleCertificateMinted(event.data);
        break;
    }
  }

  // Handle check-in
  private async handleCheckIn(data: any) {
    const { user_address, event_id } = data;
    
    // Create notification
    createNotification(
      user_address,
      'check_in_success',
      'Check-in Successful! ✅',
      'You have successfully checked into the event. Start networking and don\'t forget to get peer validations!',
      { event_id },
      'medium',
      'event'
    );
    
    // Check certificate eligibility
    await this.addJob({
      job_type: 'PROCESS_CERTIFICATE_ELIGIBILITY',
      job_data: { event_id, user_address },
      priority: 5
    });
  }

  // Handle peer validation
  private async handlePeerValidation(data: any) {
    const { validator, attendee, event_id } = data;
    
    // Create notification for validated user
    createNotification(
      attendee,
      'validation_received',
      'Peer Validation Received! 🤝',
      'Someone validated your attendance. You\'re one step closer to earning your certificate!',
      { validator, event_id },
      'high',
      'validation'
    );
    
    // Check certificate eligibility
    await this.addJob({
      job_type: 'PROCESS_CERTIFICATE_ELIGIBILITY',
      job_data: { event_id, user_address: attendee },
      priority: 5
    });
  }

  // Handle certificate minted
  private async handleCertificateMinted(data: any) {
    const { recipient, event_id, tier } = data;
    
    // Create notification
    createNotification(
      recipient,
      'certificate_earned',
      `${tier} Certificate Earned! 🏆`,
      `Congratulations! You earned a ${tier} certificate for this event.`,
      { event_id, tier },
      'high',
      'certificate'
    );
    
    // Update user stats
    await this.addJob({
      job_type: 'UPDATE_USER_STATS',
      job_data: { user_address: recipient },
      priority: 3
    });
  }

  // Send notification email
  private async sendNotificationEmail(data: any) {
    const { user_address, subject, template, template_data } = data;
    console.log(`📧 Sending email to ${user_address}: ${subject}`);
    
    // In production, this would send actual emails
    // For now, just log the action
    console.log(`✉️ Email sent successfully to ${user_address}`);
  }

  // Update user statistics
  private async updateUserStats(data: any) {
    const { user_address } = data;
    console.log(`📊 Updating stats for ${user_address}`);
    
    // In production, this would update database user stats
    // For now, just log the action
    console.log(`📈 Stats updated for ${user_address}`);
  }

  // Process certificate eligibility
  private async processCertificateEligibility(data: any) {
    const { event_id, user_address } = data;
    
    try {
      // Mock validation count for development
      const validationCount = Math.floor(Math.random() * 6) + 1; // 1-6 validations
      
      // Determine tier eligibility
      let tier = '';
      if (validationCount >= 5) tier = 'Gold';
      else if (validationCount >= 3) tier = 'Silver';
      else if (validationCount >= 1) tier = 'Bronze';
      
      if (tier) {
        console.log(`🎖️ User ${user_address} eligible for ${tier} certificate`);
        
        // Create notification
        createNotification(
          user_address,
          'certificate_earned',
          `${tier} Certificate Ready! 🎯`,
          `You have enough validations to claim your ${tier} certificate!`,
          { event_id, tier, validations: validationCount },
          'high',
          'certificate'
        );
        
        // Schedule email notification
        await this.addJob({
          job_type: 'SEND_NOTIFICATION_EMAIL',
          job_data: {
            user_address,
            subject: `🏆 ${tier} Certificate Ready!`,
            template: 'certificate_ready',
            template_data: { tier, event_id }
          },
          priority: 7
        });
      }
    } catch (error) {
      console.error('❌ Error checking certificate eligibility:', error);
    }
  }

  // Cleanup expired data
  private async cleanupExpiredData(data: any) {
    console.log('🧹 Cleaning up expired data...');
    
    // In production, this would clean up database records
    const cleanupTasks = [
      'Removing expired email verifications',
      'Cleaning old job records',
      'Archiving old analytics events'
    ];
    
    for (const task of cleanupTasks) {
      console.log(`🗑️ ${task}`);
    }
    
    console.log('✅ Cleanup completed');
  }

  // Schedule recurring jobs
  async scheduleRecurringJobs() {
    console.log('📅 Scheduling recurring jobs...');
    
    // Blockchain sync job every 30 seconds
    setInterval(async () => {
      await this.addJob({
        job_type: 'SYNC_BLOCKCHAIN_EVENTS',
        job_data: {},
        priority: 10
      });
    }, 30000);
    
    // Cleanup job every hour
    setInterval(async () => {
      await this.addJob({
        job_type: 'CLEANUP_EXPIRED_DATA',
        job_data: {},
        priority: 1
      });
    }, 3600000);
    
    console.log('✅ Recurring jobs scheduled');
  }
}

export const jobService = new JobService();
