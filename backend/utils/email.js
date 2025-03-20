// utils/email.js
const nodemailer = require('nodemailer');
require('dotenv').config();

// Configure mail transporter (using SMTP or a service like Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,      // your email address
    pass: process.env.EMAIL_PASS       // your email password or app password
  }
  // For production, consider using OAuth2 or a dedicated SMTP service
});

// Verify connection configuration (optional)
transporter.verify(function(error, success) {
  if (error) {
    console.error('Email server connection failed:', error);
  } else {
    console.log('Ready to send emails');
  }
});

// Generic function to send an email
async function sendEmail(to, subject, text) {
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: to,
    subject: subject,
    text: text
    // html: could be used to send HTML content
  };
  await transporter.sendMail(mailOptions);
}

module.exports = { sendEmail };
