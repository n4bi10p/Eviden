const { emailService } = require('./dist/services/EmailService');
const config = require('./dist/config/index').default;

async function testEmail() {
  console.log('🧪 Testing Outlook Email Configuration...');
  console.log(`📧 Email User: ${config.EMAIL_USER}`);
  console.log(`📧 SMTP Host: ${config.SMTP_HOST}`);
  console.log(`📧 SMTP Port: ${config.SMTP_PORT}`);
  
  try {
    // Test email configuration
    console.log('\n1️⃣ Testing email service configuration...');
    const isValid = await emailService.testEmailConfiguration();
    
    if (isValid) {
      console.log('✅ Email configuration is valid!');
      
      // Send test email
      console.log('\n2️⃣ Sending test email...');
      const testResult = await emailService.sendTemplateEmail(
        config.EMAIL_USER, // Send to yourself
        'welcome',
        {
          username: 'Test User',
          walletAddress: '0x1234...5678'
        },
        '🧪 Test Email from Attestify'
      );
      
      if (testResult) {
        console.log('✅ Test email sent successfully!');
        console.log('📬 Check your inbox for the welcome email.');
      } else {
        console.log('❌ Failed to send test email');
      }
    } else {
      console.log('❌ Email configuration test failed');
    }
  } catch (error) {
    console.error('❌ Email test error:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n💡 Authentication failed. Please check:');
      console.log('   1. Your email address is correct');
      console.log('   2. You\'re using an App Password, not your regular password');
      console.log('   3. Two-factor authentication is enabled');
      console.log('   4. The App Password has the right permissions');
    }
  }
}

testEmail().then(() => process.exit(0)).catch(console.error);
