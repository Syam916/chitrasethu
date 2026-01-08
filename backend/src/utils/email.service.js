import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file from backend directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Create reusable transporter
const createTransporter = () => {
  // Support both old (EMAIL_*) and new (SMTP_*) environment variable names
  const smtpServer = process.env.SMTP_SERVER || process.env.EMAIL_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587');
  const smtpEmail = process.env.SMTP_EMAIL || process.env.EMAIL_USER;
  const smtpPassword = process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD;

  // Debug logging
  console.log('📧 SMTP Configuration Check:');
  console.log('  SMTP_SERVER:', smtpServer);
  console.log('  SMTP_PORT:', smtpPort);
  console.log('  SMTP_EMAIL:', smtpEmail ? `${smtpEmail.substring(0, 5)}***` : '❌ NOT SET');
  console.log('  SMTP_PASSWORD:', smtpPassword ? '***configured***' : '❌ NOT SET');
  console.log('  All env vars:', {
    SMTP_SERVER: process.env.SMTP_SERVER,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_EMAIL: process.env.SMTP_EMAIL ? 'SET' : 'NOT SET',
    SMTP_PASSWORD: process.env.SMTP_PASSWORD ? 'SET' : 'NOT SET'
  });

  return nodemailer.createTransport({
    host: smtpServer,
    port: smtpPort,
    secure: false, // true for 465, false for other ports
    auth: {
      user: smtpEmail,
      pass: smtpPassword,
    },
  });
};

// Send job application notification email to job creator
export const sendJobApplicationEmail = async (jobCreatorEmail, jobCreatorName, applicantData, jobData) => {
  try {
    const transporter = createTransporter();

    const smtpEmail = process.env.SMTP_EMAIL || process.env.EMAIL_USER;
    const smtpPassword = process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD;

    if (!smtpEmail || !smtpPassword) {
      console.warn('Email credentials not configured. Skipping email send.');
      console.warn('Please set SMTP_EMAIL and SMTP_PASSWORD (or EMAIL_USER and EMAIL_PASSWORD) in your .env file');
      return { success: false, message: 'Email not configured' };
    }

    const mailOptions = {
      from: `"ChitraSethu" <${smtpEmail}>`,
      to: jobCreatorEmail,
      subject: `New Application for Your Job: ${jobData.jobTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .info-box { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #667eea; }
            .label { font-weight: bold; color: #667eea; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>New Job Application Received</h2>
            </div>
            <div class="content">
              <p>Hello ${jobCreatorName},</p>
              <p>You have received a new application for your job posting: <strong>${jobData.jobTitle}</strong></p>
              
              <div class="info-box">
                <h3>Applicant Information</h3>
                <p><span class="label">Name:</span> ${applicantData.applicantName}</p>
                <p><span class="label">Email:</span> ${applicantData.applicantEmail}</p>
                ${applicantData.applicantPhone ? `<p><span class="label">Phone:</span> ${applicantData.applicantPhone}</p>` : ''}
                ${applicantData.experienceYears ? `<p><span class="label">Experience:</span> ${applicantData.experienceYears} years</p>` : ''}
                ${applicantData.expectedRate ? `<p><span class="label">Expected Rate:</span> ₹${applicantData.expectedRate}</p>` : ''}
              </div>

              ${applicantData.coverLetter ? `
              <div class="info-box">
                <h3>Cover Letter</h3>
                <p>${applicantData.coverLetter.replace(/\n/g, '<br>')}</p>
              </div>
              ` : ''}

              ${applicantData.portfolioUrl ? `
              <div class="info-box">
                <p><span class="label">Portfolio:</span> <a href="${applicantData.portfolioUrl}" target="_blank">${applicantData.portfolioUrl}</a></p>
              </div>
              ` : ''}

              ${applicantData.additionalInfo ? `
              <div class="info-box">
                <h3>Additional Information</h3>
                <p>${applicantData.additionalInfo.replace(/\n/g, '<br>')}</p>
              </div>
              ` : ''}

              <div class="footer">
                <p>This is an automated email from ChitraSethu PhotoStudio Pro</p>
                <p>Please log in to your account to view and manage applications.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Job application email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending job application email:', error);
    return { success: false, error: error.message };
  }
};

// Send confirmation email to applicant
export const sendApplicationConfirmationEmail = async (applicantEmail, applicantName, jobData) => {
  try {
    const transporter = createTransporter();

    const smtpEmail = process.env.SMTP_EMAIL || process.env.EMAIL_USER;
    const smtpPassword = process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD;

    if (!smtpEmail || !smtpPassword) {
      console.warn('Email credentials not configured. Skipping email send.');
      console.warn('Please set SMTP_EMAIL and SMTP_PASSWORD (or EMAIL_USER and EMAIL_PASSWORD) in your .env file');
      return { success: false, message: 'Email not configured' };
    }

    const mailOptions = {
      from: `"ChitraSethu" <${smtpEmail}>`,
      to: applicantEmail,
      subject: `Application Submitted: ${jobData.jobTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Application Submitted Successfully</h2>
            </div>
            <div class="content">
              <p>Hello ${applicantName},</p>
              <p>Your application for the job <strong>${jobData.jobTitle}</strong> has been submitted successfully!</p>
              <p>The job creator will review your application and get back to you soon.</p>
              <div class="footer">
                <p>This is an automated email from ChitraSethu PhotoStudio Pro</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Application confirmation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return { success: false, error: error.message };
  }
};

// Send application accepted email to applicant
export const sendApplicationAcceptedEmail = async (applicantEmail, applicantName, jobData) => {
  try {
    const transporter = createTransporter();

    const smtpEmail = process.env.SMTP_EMAIL || process.env.EMAIL_USER;
    const smtpPassword = process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD;

    if (!smtpEmail || !smtpPassword) {
      console.warn('Email credentials not configured. Skipping email send.');
      return { success: false, message: 'Email not configured' };
    }

    const mailOptions = {
      from: `"ChitraSethu" <${smtpEmail}>`,
      to: applicantEmail,
      subject: `🎉 Application Accepted: ${jobData.jobTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .success-box { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🎉 Congratulations! Your Application Has Been Accepted</h2>
            </div>
            <div class="content">
              <p>Hello ${applicantName},</p>
              <div class="success-box">
                <p><strong>Great news!</strong> Your application for the job <strong>${jobData.jobTitle}</strong> has been accepted!</p>
              </div>
              <p>The job creator is interested in working with you. They will contact you soon to discuss the next steps.</p>
              <p>Please keep an eye on your email and be ready to respond promptly.</p>
              <div class="footer">
                <p>This is an automated email from ChitraSethu PhotoStudio Pro</p>
                <p>We wish you the best of luck with this opportunity!</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Application accepted email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending application accepted email:', error);
    return { success: false, error: error.message };
  }
};

// Send application rejected email to applicant
export const sendApplicationRejectedEmail = async (applicantEmail, applicantName, jobData, rejectionReason) => {
  try {
    const transporter = createTransporter();

    const smtpEmail = process.env.SMTP_EMAIL || process.env.EMAIL_USER;
    const smtpPassword = process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD;

    if (!smtpEmail || !smtpPassword) {
      console.warn('Email credentials not configured. Skipping email send.');
      return { success: false, message: 'Email not configured' };
    }

    const mailOptions = {
      from: `"ChitraSethu" <${smtpEmail}>`,
      to: applicantEmail,
      subject: `Application Update: ${jobData.jobTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .info-box { background: #f3f4f6; border-left: 4px solid #6b7280; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Application Update</h2>
            </div>
            <div class="content">
              <p>Hello ${applicantName},</p>
              <p>Thank you for your interest in the job <strong>${jobData.jobTitle}</strong>.</p>
              <div class="info-box">
                <p>After careful consideration, we regret to inform you that we have decided to move forward with other candidates for this position.</p>
                ${rejectionReason ? `<p><strong>Note from the job creator:</strong></p><p>${rejectionReason.replace(/\n/g, '<br>')}</p>` : ''}
              </div>
              <p>We appreciate the time you took to apply and encourage you to keep an eye on our platform for other opportunities that may be a better fit.</p>
              <p>We wish you the best in your job search.</p>
              <div class="footer">
                <p>This is an automated email from ChitraSethu PhotoStudio Pro</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Application rejected email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending application rejected email:', error);
    return { success: false, error: error.message };
  }
};

// Send booking accepted email to customer
export const sendBookingAcceptedEmail = async ({ customerEmail, customerName, eventType, eventDate, eventTime, location, photographerName }) => {
  try {
    const transporter = createTransporter();
    const smtpEmail = process.env.SMTP_EMAIL || process.env.EMAIL_USER;
    const smtpPassword = process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD;

    if (!smtpEmail || !smtpPassword) {
      console.log('Email credentials not configured. Skipping email send.');
      return;
    }

    const formattedDate = eventDate ? new Date(eventDate).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) : 'TBD';

    const mailOptions = {
      from: `"ChitraSethu" <${smtpEmail}>`,
      to: customerEmail,
      subject: `🎉 Your Booking Request Has Been Accepted!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .info-box { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #667eea; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Booking Confirmed!</h1>
            </div>
            <div class="content">
              <p>Dear ${customerName},</p>
              <p>Great news! Your booking request has been accepted by <strong>${photographerName}</strong>.</p>
              
              <div class="info-box">
                <h3 style="margin-top: 0;">Event Details:</h3>
                <p><strong>Event Type:</strong> ${eventType}</p>
                <p><strong>Date:</strong> ${formattedDate}</p>
                <p><strong>Time:</strong> ${eventTime || 'TBD'}</p>
                <p><strong>Location:</strong> ${location}</p>
              </div>

              <p>Your photographer will be in touch with you soon to discuss the final details and answer any questions you may have.</p>
              
              <p>We're excited to help make your event memorable!</p>
              
              <p>Best regards,<br>The ChitraSethu Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply directly to this message.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Booking acceptance email sent to ${customerEmail}`);
  } catch (error) {
    console.error('Error sending booking acceptance email:', error);
    throw error;
  }
};

// Send booking declined email to customer
export const sendBookingDeclinedEmail = async ({ customerEmail, customerName, eventType, eventDate, reason }) => {
  try {
    const transporter = createTransporter();
    const smtpEmail = process.env.SMTP_EMAIL || process.env.EMAIL_USER;
    const smtpPassword = process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD;

    if (!smtpEmail || !smtpPassword) {
      console.log('Email credentials not configured. Skipping email send.');
      return;
    }

    const formattedDate = eventDate ? new Date(eventDate).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) : 'TBD';

    const mailOptions = {
      from: `"ChitraSethu" <${smtpEmail}>`,
      to: customerEmail,
      subject: `Update on Your Booking Request`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f5576c; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Booking Request Update</h1>
            </div>
            <div class="content">
              <p>Dear ${customerName},</p>
              <p>We regret to inform you that your booking request for the following event could not be accommodated:</p>
              
              <div class="info-box">
                <h3 style="margin-top: 0;">Event Details:</h3>
                <p><strong>Event Type:</strong> ${eventType}</p>
                <p><strong>Date:</strong> ${formattedDate}</p>
              </div>

              <p><strong>Reason:</strong> ${reason}</p>
              
              <p>We encourage you to explore other photographers on ChitraSethu who may be available for your event. We're here to help you find the perfect match!</p>
              
              <p>Thank you for considering our platform.</p>
              
              <p>Best regards,<br>The ChitraSethu Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply directly to this message.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Booking decline email sent to ${customerEmail}`);
  } catch (error) {
    console.error('Error sending booking decline email:', error);
    throw error;
  }
};

// Send message from photographer to customer
export const sendPhotographerMessageEmail = async ({ customerEmail, customerName, photographerName, photographerEmail, message, eventType, eventDate }) => {
  try {
    const transporter = createTransporter();
    const smtpEmail = process.env.SMTP_EMAIL || process.env.EMAIL_USER;
    const smtpPassword = process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD;

    if (!smtpEmail || !smtpPassword) {
      console.log('Email credentials not configured. Skipping email send.');
      return;
    }

    const formattedDate = eventDate ? new Date(eventDate).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) : 'TBD';

    const mailOptions = {
      from: `"${photographerName} via ChitraSethu" <${smtpEmail}>`,
      to: customerEmail,
      replyTo: photographerEmail || smtpEmail,
      subject: `Message from ${photographerName} - ${eventType} Photography`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .message-box { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #667eea; }
            .info-box { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #667eea; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            .photographer-info { background: #e8f4f8; padding: 15px; border-radius: 5px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📧 Message from Your Photographer</h1>
            </div>
            <div class="content">
              <p>Dear ${customerName},</p>
              <p>You have received a message from <strong>${photographerName}</strong> regarding your ${eventType} photography booking.</p>
              
              <div class="info-box">
                <h3 style="margin-top: 0;">Booking Details:</h3>
                <p><strong>Event Type:</strong> ${eventType}</p>
                <p><strong>Event Date:</strong> ${formattedDate}</p>
              </div>

              <div class="message-box">
                <h3 style="margin-top: 0; color: #667eea;">Message:</h3>
                <p style="white-space: pre-wrap;">${message.replace(/\n/g, '<br>')}</p>
              </div>

              <div class="photographer-info">
                <p style="margin: 0;"><strong>From:</strong> ${photographerName}</p>
                ${photographerEmail ? `<p style="margin: 5px 0 0 0;"><strong>Email:</strong> ${photographerEmail}</p>` : ''}
              </div>

              <p>You can reply directly to this email to contact ${photographerName}.</p>
              
              <p>Best regards,<br>The ChitraSethu Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply directly to this message if you want to contact the photographer.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Photographer message email sent to ${customerEmail}`);
  } catch (error) {
    console.error('Error sending photographer message email:', error);
    throw error;
  }
};

// Send photo booth gallery email with QR code to customers
export const sendPhotoBoothGalleryEmail = async ({ 
  customerEmails, 
  customerNames, 
  photographerName, 
  eventName, 
  galleryUrl, 
  qrCodeUrl, 
  qrCode,
  description,
  expiryDate,
  password 
}) => {
  try {
    const transporter = createTransporter();
    const smtpEmail = process.env.SMTP_EMAIL || process.env.EMAIL_USER;
    const smtpPassword = process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD;

    if (!smtpEmail || !smtpPassword) {
      console.log('Email credentials not configured. Skipping email send.');
      return { success: false, message: 'Email not configured' };
    }

    // Convert customerEmails to array if it's a string
    const emailList = Array.isArray(customerEmails) ? customerEmails : [customerEmails];
    const nameList = Array.isArray(customerNames) ? customerNames : (customerNames ? [customerNames] : emailList.map(() => 'Guest'));

    const formattedExpiryDate = expiryDate ? new Date(expiryDate).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) : null;

    // Send email to each customer
    const emailPromises = emailList.map(async (customerEmail, index) => {
      const customerName = nameList[index] || 'Guest';

      const mailOptions = {
        from: `"${photographerName} via ChitraSethu" <${smtpEmail}>`,
        to: customerEmail,
        replyTo: smtpEmail,
        subject: `📸 Your Photo Gallery: ${eventName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .qr-section { background: white; padding: 30px; border-radius: 10px; margin: 20px 0; text-align: center; }
              .qr-code { max-width: 300px; margin: 20px auto; display: block; border: 3px solid #667eea; border-radius: 10px; padding: 10px; background: white; }
              .info-box { background: white; padding: 20px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #667eea; }
              .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
              .password-note { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 15px 0; }
              .instructions { background: #e8f4f8; padding: 20px; border-radius: 5px; margin: 20px 0; }
              .instructions ol { margin: 10px 0; padding-left: 20px; }
              .instructions li { margin: 8px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📸 Your Photo Gallery is Ready!</h1>
                <p style="margin: 10px 0 0 0; font-size: 18px;">${eventName}</p>
              </div>
              <div class="content">
                <p>Dear ${customerName},</p>
                <p>Great news! Your photographer <strong>${photographerName}</strong> has created a photo gallery for your event. You can now access all your photos using the QR code below or by clicking the link.</p>

                ${description ? `
                <div class="info-box">
                  <h3 style="margin-top: 0;">Event Details:</h3>
                  <p>${description}</p>
                </div>
                ` : ''}

                <div class="qr-section">
                  <h2 style="margin-top: 0; color: #667eea;">Scan QR Code to View Gallery</h2>
                  <img src="${qrCodeUrl}" alt="QR Code for ${eventName}" class="qr-code" />
                  <p style="margin: 15px 0 0 0; color: #666; font-size: 14px;">
                    <strong>QR Code:</strong> ${qrCode}
                  </p>
                </div>

                <div style="text-align: center;">
                  <a href="${galleryUrl}" class="button">View Gallery Online</a>
                </div>

                <div class="instructions">
                  <h3 style="margin-top: 0;">How to Access Your Photos:</h3>
                  <ol>
                    <li><strong>Using QR Code:</strong> Open your phone's camera app and point it at the QR code above, then tap the notification that appears.</li>
                    <li><strong>Using Link:</strong> Click the "View Gallery Online" button above or copy this link: <br><code style="background: #f0f0f0; padding: 5px; border-radius: 3px; word-break: break-all;">${galleryUrl}</code></li>
                    ${password ? '<li><strong>Password Required:</strong> You will need to enter a password to access the gallery (provided separately by your photographer).</li>' : ''}
                    <li><strong>Download Photos:</strong> Once in the gallery, you can view and download your favorite photos!</li>
                  </ol>
                </div>

                ${password ? `
                <div class="password-note">
                  <strong>🔒 Password Protected Gallery</strong><br>
                  This gallery is password protected. Your photographer will provide you with the password separately.
                </div>
                ` : ''}

                ${formattedExpiryDate ? `
                <div class="info-box">
                  <p><strong>⏰ Gallery Expires:</strong> ${formattedExpiryDate}</p>
                  <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">Make sure to download your photos before this date!</p>
                </div>
                ` : ''}

                <div class="info-box" style="background: #e8f4f8;">
                  <p style="margin: 0;"><strong>📷 Photographer:</strong> ${photographerName}</p>
                  <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">Questions? Contact your photographer directly.</p>
                </div>

                <p>We hope you enjoy your photos! 📸✨</p>
                
                <p>Best regards,<br>The ChitraSethu Team</p>
              </div>
              <div class="footer">
                <p>This is an automated email from ChitraSethu PhotoStudio Pro</p>
                <p>You received this email because your photographer shared this gallery with you.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Photo booth gallery email sent to ${customerEmail}`);
        return { email: customerEmail, success: true };
      } catch (error) {
        console.error(`❌ Error sending email to ${customerEmail}:`, error);
        return { email: customerEmail, success: false, error: error.message };
      }
    });

    const results = await Promise.all(emailPromises);
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    return {
      success: failed.length === 0,
      sent: successful.length,
      failed: failed.length,
      results: results
    };
  } catch (error) {
    console.error('Error sending photo booth gallery emails:', error);
    throw error;
  }
};
