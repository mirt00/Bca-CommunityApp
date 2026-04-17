const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendApprovalEmail = async (email, token) => {
  const resetLink = `https://yourcommunity.app/reset-password?token=${token}`;
  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
    to: email,
    subject: 'Your Account Has Been Approved!',
    html: `
      <h1>Welcome to IT Community!</h1>
      <p>Your account has been approved by the organization admin. You can now log in and access all community features.</p>
      <p><a href="${resetLink}">Click here to set your password and login</a></p>
      <p>This link expires in 15 minutes.</p>
    `,
  };
  await transporter.sendMail(mailOptions);
};

const sendResetEmail = async (email, resetToken) => {
  const resetLink = `https://yourcommunity.app/reset-password?token=${resetToken}`;
  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <h1>Password Reset</h1>
      <p>You requested a password reset. Click the link below to set a new password:</p>
      <p><a href="${resetLink}">Reset Password</a></p>
      <p>This link expires in 15 minutes. If you didn't request this, ignore this email.</p>
    `,
  };
  await transporter.sendMail(mailOptions);
};

const sendNewStudentNotification = async (adminEmail, student) => {
  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
    to: adminEmail,
    subject: 'New Student Registration Pending Approval',
    html: `
      <h1>New Student Registration</h1>
      <p>A new student has registered and is pending your approval:</p>
      <ul>
        <li><strong>Name:</strong> ${student.fullName}</li>
        <li><strong>Email:</strong> ${student.email}</li>
        <li><strong>Batch:</strong> ${student.batch}</li>
        <li><strong>Faculty:</strong> ${student.faculty}</li>
        <li><strong>LinkedIn:</strong> <a href="${student.linkedin}">${student.linkedin}</a></li>
        <li><strong>GitHub:</strong> <a href="${student.github}">${student.github}</a></li>
      </ul>
      <p>Please review their profile and approve or reject their registration.</p>
    `,
  };
  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendApprovalEmail,
  sendResetEmail,
  sendNewStudentNotification,
};
