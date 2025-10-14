// src/app/api/test-email/route.ts
// Create this file to test if email is working
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function GET(req: NextRequest) {
  try {
    console.log('🧪 Testing email configuration...');

    // Check environment variables
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    const adminEmail = process.env.ADMIN_EMAIL;
    const mailHost = process.env.MAIL_HOST;
    const emailPort = process.env.EMAIL_PORT;

    console.log('Environment variables:');
    console.log('EMAIL_USER:', emailUser ? '✅ Set' : '❌ Not set');
    console.log('EMAIL_PASS:', emailPass ? '✅ Set' : '❌ Not set');
    console.log('ADMIN_EMAIL:', adminEmail || '❌ Not set');
    console.log('MAIL_HOST:', mailHost || 'Using Gmail');
    console.log('EMAIL_PORT:', emailPort || 'Default');

    if (!emailUser || !emailPass) {
      return NextResponse.json({
        success: false,
        error: 'EMAIL_USER or EMAIL_PASS not configured',
        config: {
          emailUser: !!emailUser,
          emailPass: !!emailPass,
          adminEmail: !!adminEmail,
          mailHost: mailHost || 'gmail',
          emailPort: emailPort || 'default'
        }
      }, { status: 500 });
    }

    // Create transporter
    const transporter = mailHost && emailPort
      ? nodemailer.createTransport({
          host: mailHost,
          port: parseInt(emailPort),
          secure: process.env.EMAIL_SECURE === 'true',
          auth: { user: emailUser, pass: emailPass },
          tls: { rejectUnauthorized: false, ciphers: 'SSLv3' }
        })
      : nodemailer.createTransport({
          service: 'gmail',
          auth: { user: emailUser, pass: emailPass }
        });

    // Get test email from query parameter
    const { searchParams } = new URL(req.url);
    const testEmail = searchParams.get('to') || adminEmail || emailUser;

    console.log(`📧 Sending test email to: ${testEmail}`);

    // Send test email
    const result = await transporter.sendMail({
      from: emailUser,
      to: testEmail,
      subject: '✅ Test Email - Zuree Bulk Orders',
      text: `
🧪 Email Configuration Test

This is a test email from your Zuree bulk order system.

If you received this email, your email configuration is working correctly!

Configuration Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
From: ${emailUser}
Host: ${mailHost || 'Gmail'}
Port: ${emailPort || 'Default'}
Test Sent: ${new Date().toLocaleString('en-IN')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Your bulk order email notifications will work!

Best regards,
Zuree System
      `
    });

    console.log('✅ Test email sent successfully:', result.messageId);

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      messageId: result.messageId,
      sentTo: testEmail,
      config: {
        from: emailUser,
        host: mailHost || 'gmail',
        port: emailPort || 'default'
      }
    });

  } catch (error) {
    console.error('❌ Email test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}