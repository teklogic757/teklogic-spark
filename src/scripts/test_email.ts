
import { sendEmail } from '../lib/email';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testEmail() {
    console.log('Testing email configuration...');
    console.log('Provider:', process.env.NOTIFICATION_PROVIDER);
    console.log('User:', process.env.EMAIL_USER);

    const result = await sendEmail({
        to: 'justin@teklogic.net', // Target email
        subject: 'Test Email from Teklogic Spark AI',
        html: '<h1>It works!</h1><p>This is a test email from the development environment.</p>'
    });

    if (result.success) {
        console.log('✅ Email sent successfully!');
        console.log('Message ID:', result.id);
    } else {
        console.error('❌ Email failed:', result.error);
    }
}

testEmail().catch(console.error);
