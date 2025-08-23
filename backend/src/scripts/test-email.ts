import { emailService } from '../services/EmailService';

// Test email configuration
async function testEmail() {
  console.log('🧪 Testing email configuration...');
  
  try {
    // Test configuration
    const isValid = await emailService.testEmailConfiguration();
    if (!isValid) {
      console.log('❌ Email configuration test failed');
      return;
    }
    
    console.log('✅ Email configuration is valid');
    
    // Test sending a welcome email
    const testData = {
      username: 'Test User',
      walletAddress: '0x1234...5678'
    };
    
    // You can replace this with your actual email address
    const testEmail = process.env.EMAIL_USER || 'test@example.com';
    
    console.log(`📧 Sending test welcome email to: ${testEmail}`);
    
    const emailSent = await emailService.sendTemplateEmail(
      testEmail,
      'welcome',
      testData,
      '🎉 Welcome to Attestify - Test Email'
    );
    
    if (emailSent) {
      console.log('✅ Test email sent successfully!');
    } else {
      console.log('❌ Failed to send test email');
    }
    
  } catch (error) {
    console.error('❌ Email test failed:', error);
  }
}

// Run the test
if (require.main === module) {
  testEmail().then(() => {
    console.log('📧 Email test completed');
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Email test error:', error);
    process.exit(1);
  });
}

export { testEmail };
