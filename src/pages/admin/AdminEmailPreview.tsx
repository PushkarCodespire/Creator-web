// ===========================================
// ADMIN EMAIL PREVIEW PAGE
// Preview all email templates without sending
// ===========================================

import { useEffect, useState } from 'react';
import { Card, Select, Input, Button, Row, Col, Space, message, Divider, Tag } from 'antd';
import { MailOutlined, CopyOutlined, ReloadOutlined } from '@ant-design/icons';
import { adminApi } from '../../services/api';
import '../../styles/AdminPanel.css';

const { Option } = Select;
const { TextArea } = Input;

interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

const AdminEmailPreview = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('welcome');
  const [sampleData, setSampleData] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    role: 'USER',
    amount: 799,
    transactionId: 'pay_ABC123XYZ',
    plan: 'PREMIUM',
    creatorName: 'Ranveer Allahbadia AI',
    userName: 'Jane Smith',
    messagePreview: 'Hi, I need advice on fitness...',
    conversationId: 'conv_123',
    opportunityTitle: 'Tech Product Launch Campaign',
    companyName: 'TCS',
    opportunityId: 'opp_456',
    status: 'ACCEPTED',
    verifyUrl: 'http://localhost:3000/verify-email?token=abc123',
    resetUrl: 'http://localhost:3000/reset-password?token=xyz789',
    verified: true
  });

  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [previewSubject, setPreviewSubject] = useState<string>('');
  const labelStyle = { fontSize: '12px', color: '#888' } as const;

  const backendTypeMap: Record<string, 'welcome' | 'verification' | 'password-reset' | 'password-changed' | 'payment-receipt' | 'creator-verification'> = {
    welcome: 'welcome',
    emailVerification: 'verification',
    passwordReset: 'password-reset',
    passwordChanged: 'password-changed',
    paymentReceipt: 'payment-receipt',
    creatorVerification: 'creator-verification'
  };

  const isBackendTemplate = (template: string) => template in backendTypeMap;

  const fetchBackendPreview = async (template: string) => {
    const type = backendTypeMap[template];
    const params = {
      type,
      name: sampleData.name,
      role: sampleData.role,
      verifyUrl: sampleData.verifyUrl,
      resetUrl: sampleData.resetUrl,
      amount: sampleData.amount,
      transactionId: sampleData.transactionId,
      plan: sampleData.plan,
      verified: sampleData.verified
    };

    const response = await adminApi.getEmailPreview(params);
    const data = response.data.data;
    return { subject: data.subject, html: data.html, text: data.text };
  };

  // Email template generators (matching backend templates)
  const generateTemplate = (template: string): EmailTemplate => {
    const { name, email, role, amount, transactionId, plan, creatorName, userName,
            messagePreview, conversationId, opportunityTitle, companyName, opportunityId,
            status, verifyUrl, resetUrl, verified } = sampleData;

    const templates: Record<string, EmailTemplate> = {
      welcome: {
        subject: 'Welcome to AI Creator Platform! 🎉',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
              .footer { text-align: center; margin-top: 30px; color: #888; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to AI Creator Platform!</h1>
              </div>
              <div class="content">
                <h2>Hi ${name}! 👋</h2>
                <p>Thank you for joining the AI Creator Platform as a <strong>${role}</strong>!</p>
                ${role === 'CREATOR' ? `
                  <p>As a creator, you can now:</p>
                  <ul>
                    <li>Train your AI clone with your content</li>
                    <li>Let fans chat with your AI 24/7</li>
                    <li>Earn from subscriptions and brand deals</li>
                    <li>Track analytics and insights</li>
                  </ul>
                ` : role === 'COMPANY' ? `
                  <p>As a company, you can:</p>
                  <ul>
                    <li>Post brand deal opportunities</li>
                    <li>Discover and connect with creators</li>
                    <li>Manage collaborations</li>
                  </ul>
                ` : `
                  <p>Get started by browsing our amazing creators and chatting with their AI clones!</p>
                `}
                <a href="http://localhost:3000/dashboard" class="button">Go to Dashboard</a>
              </div>
              <div class="footer">
                <p>AI Creator Platform - Empowering the Creator Economy</p>
              </div>
            </div>
          </body>
          </html>
        `
      },

      paymentReceipt: {
        subject: `Payment Receipt - ${plan} Plan (₹${amount})`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #52c41a; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; }
              .receipt-box { background: white; padding: 20px; border: 2px solid #52c41a; border-radius: 8px; margin: 20px 0; }
              .amount { font-size: 32px; font-weight: bold; color: #52c41a; }
              .footer { text-align: center; margin-top: 30px; color: #888; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✅ Payment Successful!</h1>
              </div>
              <div class="content">
                <h2>Hi ${name},</h2>
                <p>Thank you for upgrading to <strong>${plan}</strong>!</p>

                <div class="receipt-box">
                  <h3>Payment Details</h3>
                  <p><strong>Amount:</strong> <span class="amount">₹${amount}</span></p>
                  <p><strong>Plan:</strong> ${plan}</p>
                  <p><strong>Transaction ID:</strong> ${transactionId}</p>
                  <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                  <p><strong>Status:</strong> <span style="color: #52c41a;">COMPLETED</span></p>
                </div>

                <p><strong>What's included in ${plan}:</strong></p>
                <ul>
                  <li>Unlimited AI chat messages</li>
                  <li>Access to all creators</li>
                  <li>Conversation history</li>
                  <li>Priority support</li>
                </ul>

                <p>Your subscription is now active and will renew monthly.</p>
              </div>
              <div class="footer">
                <p>AI Creator Platform - Invoice #${transactionId}</p>
              </div>
            </div>
          </body>
          </html>
        `
      },

      newMessage: {
        subject: `New message from ${creatorName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #1890ff; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; }
              .message-box { background: white; padding: 15px; border-left: 4px solid #1890ff; margin: 20px 0; }
              .button { display: inline-block; padding: 12px 30px; background: #1890ff; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>💬 You have a new message!</h2>
              </div>
              <div class="content">
                <p>Hi ${userName},</p>
                <p><strong>${creatorName}</strong> has replied to your message:</p>

                <div class="message-box">
                  <p style="margin: 0;">"${messagePreview}"</p>
                </div>

                <a href="http://localhost:3000/chat/${conversationId}" class="button">View Conversation</a>

                <p style="margin-top: 30px; font-size: 12px; color: #888;">
                  You're receiving this because you have notifications enabled.
                  <a href="http://localhost:3000/dashboard/notifications/settings">Manage preferences</a>
                </p>
              </div>
            </div>
          </body>
          </html>
        `
      },

      opportunityNotification: {
        subject: `New Brand Deal Opportunity: ${opportunityTitle}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #faad14; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; }
              .opportunity-box { background: white; padding: 20px; border: 2px solid #faad14; border-radius: 8px; margin: 20px 0; }
              .button { display: inline-block; padding: 12px 30px; background: #faad14; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎯 New Brand Deal Opportunity!</h1>
              </div>
              <div class="content">
                <h2>Hi ${creatorName}!</h2>
                <p>A new opportunity that matches your profile has been posted:</p>

                <div class="opportunity-box">
                  <h3>${opportunityTitle}</h3>
                  <p><strong>Company:</strong> ${companyName}</p>
                  <p><strong>Posted:</strong> ${new Date().toLocaleDateString()}</p>
                </div>

                <p>This could be a great collaboration opportunity for you!</p>

                <a href="http://localhost:3000/creator-dashboard/opportunities/${opportunityId}" class="button">View Details & Apply</a>
              </div>
            </div>
          </body>
          </html>
        `
      },

      applicationStatus: {
        subject: `Application ${status === 'ACCEPTED' ? 'Accepted' : 'Update'}: ${opportunityTitle}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: ${status === 'ACCEPTED' ? '#52c41a' : '#ff4d4f'}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; }
              .status-box { background: white; padding: 20px; border: 2px solid ${status === 'ACCEPTED' ? '#52c41a' : '#ff4d4f'}; border-radius: 8px; margin: 20px 0; text-align: center; }
              .button { display: inline-block; padding: 12px 30px; background: ${status === 'ACCEPTED' ? '#52c41a' : '#1890ff'}; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>${status === 'ACCEPTED' ? '🎉 Application Accepted!' : '📋 Application Update'}</h1>
              </div>
              <div class="content">
                <h2>Hi ${creatorName},</h2>

                <div class="status-box">
                  <h3>${opportunityTitle}</h3>
                  <p style="font-size: 24px; font-weight: bold; margin: 20px 0;">
                    Status: <span style="color: ${status === 'ACCEPTED' ? '#52c41a' : '#ff4d4f'};">${status}</span>
                  </p>
                </div>

                ${status === 'ACCEPTED' ? `
                  <p><strong>Congratulations!</strong> The company has accepted your application.</p>
                  <p>The next steps:</p>
                  <ul>
                    <li>Review the deal terms</li>
                    <li>Coordinate with the company on deliverables</li>
                    <li>Complete the project milestones</li>
                    <li>Receive your earnings (90% of deal amount)</li>
                  </ul>
                ` : `
                  <p>Unfortunately, your application was not selected for this opportunity.</p>
                  <p>Don't worry! There are many more opportunities waiting for you.</p>
                `}

                <a href="http://localhost:3000/creator-dashboard/opportunities" class="button">
                  ${status === 'ACCEPTED' ? 'View Deal Details' : 'Browse More Opportunities'}
                </a>
              </div>
            </div>
          </body>
          </html>
        `
      },

      emailVerification: {
        subject: 'Verify your email address',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #722ed1; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; }
              .button { display: inline-block; padding: 15px 40px; background: #722ed1; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; font-size: 16px; }
              .code-box { background: white; padding: 20px; border: 2px dashed #722ed1; border-radius: 8px; margin: 20px 0; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📧 Verify Your Email</h1>
              </div>
              <div class="content">
                <h2>Hi ${name},</h2>
                <p>Thank you for registering with AI Creator Platform! Please verify your email address to activate your account.</p>

                <a href="${verifyUrl}" class="button">Verify Email Address</a>

                <p style="margin-top: 30px;">Or copy and paste this link into your browser:</p>
                <div class="code-box">${verifyUrl}</div>

                <p style="color: #ff4d4f;"><strong>This link expires in 24 hours.</strong></p>

                <p style="margin-top: 30px; font-size: 12px; color: #888;">
                  If you didn't create an account, please ignore this email.
                </p>
              </div>
            </div>
          </body>
          </html>
        `
      },

      passwordReset: {
        subject: 'Reset your password',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #ff4d4f; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; }
              .button { display: inline-block; padding: 15px 40px; background: #ff4d4f; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; font-size: 16px; }
              .warning-box { background: #fff7e6; padding: 15px; border-left: 4px solid #faad14; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔐 Password Reset Request</h1>
              </div>
              <div class="content">
                <h2>Hi ${name},</h2>
                <p>We received a request to reset your password. Click the button below to create a new password:</p>

                <a href="${resetUrl}" class="button">Reset Password</a>

                <div class="warning-box">
                  <p style="margin: 0;"><strong>⚠️ Security Notice:</strong></p>
                  <p style="margin: 5px 0 0 0;">This link expires in 1 hour. If you didn't request this, please ignore this email and your password will remain unchanged.</p>
                </div>

                <p style="margin-top: 30px; font-size: 12px; color: #888;">
                  For security reasons, this link can only be used once.
                </p>
              </div>
            </div>
          </body>
          </html>
        `
      },

      passwordChanged: {
        subject: 'Your password was changed',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #52c41a; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; }
              .alert-box { background: #fff1f0; padding: 15px; border-left: 4px solid #ff4d4f; margin: 20px 0; }
              .button { display: inline-block; padding: 12px 30px; background: #1890ff; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✅ Password Changed Successfully</h1>
              </div>
              <div class="content">
                <h2>Hi ${name},</h2>
                <p>Your password has been successfully changed.</p>

                <p><strong>Changed on:</strong> ${new Date().toLocaleString()}</p>

                <div class="alert-box">
                  <p style="margin: 0;"><strong>⚠️ Didn't make this change?</strong></p>
                  <p style="margin: 5px 0 0 0;">If you didn't change your password, please contact our support team immediately and secure your account.</p>
                </div>

                <a href="http://localhost:3000/login" class="button">Login to Your Account</a>

                <p style="margin-top: 30px; font-size: 12px; color: #888;">
                  For your security, we recommend using a strong, unique password.
                </p>
              </div>
            </div>
          </body>
          </html>
        `
      },

      creatorVerification: {
        subject: verified ? 'Creator Profile Verified! ✓' : 'Action Required: Complete Your Creator Profile',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: ${verified ? '#52c41a' : '#faad14'}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; }
              .badge { display: inline-block; padding: 10px 20px; background: ${verified ? '#52c41a' : '#faad14'}; color: white; border-radius: 20px; font-weight: bold; margin: 20px 0; }
              .button { display: inline-block; padding: 12px 30px; background: ${verified ? '#52c41a' : '#1890ff'}; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>${verified ? '🎉 Congratulations!' : '📋 Action Required'}</h1>
              </div>
              <div class="content">
                <h2>Hi ${creatorName},</h2>

                ${verified ? `
                  <p><strong>Your creator profile has been verified!</strong></p>

                  <div style="text-align: center;">
                    <span class="badge">✓ VERIFIED CREATOR</span>
                  </div>

                  <p>You now have:</p>
                  <ul>
                    <li>✓ Verified badge on your profile</li>
                    <li>📈 Higher visibility in search</li>
                    <li>💼 Access to premium brand deals</li>
                    <li>🎯 Priority support</li>
                  </ul>

                  <p>Start earning by training your AI clone and inviting your fans!</p>

                  <a href="http://localhost:3000/creator-dashboard" class="button">Go to Dashboard</a>
                ` : `
                  <p>We need a bit more information to verify your creator profile:</p>

                  <ul>
                    <li>Social media links verification</li>
                    <li>Minimum follower count confirmation</li>
                    <li>Content samples</li>
                  </ul>

                  <p>Complete your profile to unlock:</p>
                  <ul>
                    <li>Verified creator badge</li>
                    <li>Access to brand deal marketplace</li>
                    <li>Higher profile visibility</li>
                  </ul>

                  <a href="http://localhost:3000/creator-dashboard/settings" class="button">Complete Profile</a>
                `}
              </div>
            </div>
          </body>
          </html>
        `
      }
    };

    return templates[template] || templates.welcome;
  };

  // Generate preview on template change
  const handleTemplateChange = (template: string) => {
    setSelectedTemplate(template);
    updatePreview(template);
  };

  const updatePreview = async (template?: string) => {
    const selected = template || selectedTemplate;
    try {
      if (isBackendTemplate(selected)) {
        const tmpl = await fetchBackendPreview(selected);
        setPreviewHtml(tmpl.html);
        setPreviewSubject(tmpl.subject);
        return;
      }
    } catch (err) {
      message.error('Failed to load preview from API. Showing local preview.');
    }

    const tmpl = generateTemplate(selected);
    setPreviewHtml(tmpl.html);
    setPreviewSubject(tmpl.subject);
  };

  // Initialize preview
  useEffect(() => {
    updatePreview('welcome');
  }, []);

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(previewHtml);
    message.success('HTML copied to clipboard!');
  };

  const handleRefresh = () => {
    updatePreview();
    message.success('Preview refreshed!');
  };

  return (
    <div className="admin-page">
      <div className="admin-hero">
        <div>
          <h2 className="admin-hero-title">Email Template Preview</h2>
          <p className="admin-hero-subtitle">Preview all email templates with customizable sample data.</p>
        </div>
        <Tag className="admin-pill">Deliverability Studio</Tag>
      </div>

      <Row gutter={[24, 24]}>
        {/* Left Panel: Controls */}
        <Col xs={24} lg={10}>
          <Card className="admin-card" title={<><MailOutlined /> Template Selector</>}>

            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {/* Template Selector */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                  Select Email Template
                </label>
                <Select
                  value={selectedTemplate}
                  onChange={handleTemplateChange}
                  style={{ width: '100%' }}
                  size="large"
                >
                  <Option value="welcome">1. Welcome Email</Option>
                  <Option value="paymentReceipt">2. Payment Receipt</Option>
                  <Option value="newMessage">3. New Message Notification</Option>
                  <Option value="opportunityNotification">4. Brand Deal Opportunity</Option>
                  <Option value="applicationStatus">5. Application Status</Option>
                  <Option value="emailVerification">6. Email Verification</Option>
                  <Option value="passwordReset">7. Password Reset</Option>
                  <Option value="passwordChanged">8. Password Changed</Option>
                  <Option value="creatorVerification">9. Creator Verification</Option>
                </Select>
              </div>

              <Divider />

              {/* Sample Data Inputs */}
              <div>
                <h4>Sample Data (customize as needed)</h4>

                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <div>
                    <label style={labelStyle}>Name</label>
                    <Input
                      value={sampleData.name}
                      onChange={(e) => setSampleData({...sampleData, name: e.target.value})}
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Email</label>
                    <Input
                      value={sampleData.email}
                      onChange={(e) => setSampleData({...sampleData, email: e.target.value})}
                      placeholder="john@example.com"
                    />
                  </div>

                  {selectedTemplate === 'welcome' && (
                    <div>
                      <label style={labelStyle}>Role</label>
                      <Select
                        value={sampleData.role}
                        onChange={(value) => setSampleData({...sampleData, role: value})}
                        style={{ width: '100%' }}
                      >
                        <Option value="USER">User</Option>
                        <Option value="CREATOR">Creator</Option>
                        <Option value="COMPANY">Company</Option>
                      </Select>
                    </div>
                  )}

                  {selectedTemplate === 'paymentReceipt' && (
                    <>
                      <div>
                        <label style={labelStyle}>Amount (₹)</label>
                        <Input
                          type="number"
                          value={sampleData.amount}
                          onChange={(e) => setSampleData({...sampleData, amount: parseInt(e.target.value)})}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Transaction ID</label>
                        <Input
                          value={sampleData.transactionId}
                          onChange={(e) => setSampleData({...sampleData, transactionId: e.target.value})}
                        />
                      </div>
                    </>
                  )}

                  {(selectedTemplate === 'newMessage' || selectedTemplate === 'opportunityNotification' ||
                    selectedTemplate === 'applicationStatus' || selectedTemplate === 'creatorVerification') && (
                    <div>
                      <label style={labelStyle}>Creator Name</label>
                      <Input
                        value={sampleData.creatorName}
                        onChange={(e) => setSampleData({...sampleData, creatorName: e.target.value})}
                      />
                    </div>
                  )}

                  {selectedTemplate === 'applicationStatus' && (
                    <div>
                      <label style={labelStyle}>Status</label>
                      <Select
                        value={sampleData.status}
                        onChange={(value) => setSampleData({...sampleData, status: value})}
                        style={{ width: '100%' }}
                      >
                        <Option value="ACCEPTED">Accepted</Option>
                        <Option value="REJECTED">Rejected</Option>
                      </Select>
                    </div>
                  )}

                  {selectedTemplate === 'creatorVerification' && (
                    <div>
                      <label style={labelStyle}>Verification Status</label>
                      <Select
                        value={sampleData.verified}
                        onChange={(value) => setSampleData({...sampleData, verified: value})}
                        style={{ width: '100%' }}
                      >
                        <Option value={true}>Verified</Option>
                        <Option value={false}>Pending</Option>
                      </Select>
                    </div>
                  )}
                </Space>
              </div>

              <Divider />

              {/* Actions */}
              <Space style={{ width: '100%' }}>
                <Button type="primary" className="admin-cta" icon={<ReloadOutlined />} onClick={handleRefresh}>
                  Refresh Preview
                </Button>
                <Button className="admin-cta-secondary" icon={<CopyOutlined />} onClick={handleCopyHtml}>
                  Copy HTML
                </Button>
              </Space>
            </Space>
          </Card>
        </Col>

        {/* Right Panel: Preview */}
        <Col xs={24} lg={14}>
          <Card
            className="admin-card"
            title={
              <Space>
                <span>Preview</span>
                <span style={{ color: '#888', fontWeight: 'normal', fontSize: '14px' }}>
                  Subject: {previewSubject}
                </span>
              </Space>
            }
          >
            {/* Email Preview iframe */}
            <div
              style={{
                border: '1px solid rgba(102, 126, 234, 0.2)',
                borderRadius: '12px',
                overflow: 'hidden',
                background: 'white'
              }}
            >
              <iframe
                srcDoc={previewHtml}
                style={{
                  width: '100%',
                  height: '800px',
                  border: 'none'
                }}
                title="Email Preview"
              />
            </div>

            {/* Info Box */}
            <div
              style={{
                marginTop: '16px',
                padding: '12px',
                background: 'rgba(102, 126, 234, 0.08)',
                borderRadius: '12px',
                fontSize: '12px',
                color: '#4b5563'
              }}
            >
              <p style={{ margin: 0 }}>
                <strong>📌 Demo Mode:</strong> In production, these emails are sent via SendGrid.
                In demo mode, they log to console. This preview lets investors see your professional email design without real sending.
              </p>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminEmailPreview;
