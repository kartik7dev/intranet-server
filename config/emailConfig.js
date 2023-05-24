const nodemailer = require('nodemailer');

// Nodemailer configuration
const transporter = nodemailer.createTransport({
    host: 'mexc02.iirs.gov.in', // e.g., Gmail, Yahoo, etc.
    port : 2525,
    secure : false,
    auth: {
      user: 'no-reply@iirs.gov.in',
      pass: 'Lock@gitdl2016',
    },
  });
  
  module.exports = transporter;