const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const { to, subject, text, fromName = 'Harvey Ross' } = req.body || {};
    const effectiveUser = req.body?.user || process.env.VITE_GMAIL_ADDRESS || 'aman.infratechai@gmail.com';
    const effectivePass = req.body?.pass || process.env.VITE_GMAIL_APP_PASSWORD || 'qerk bggh ysyk mrfg';

    if (!to || !subject || !text) {
      return res.status(400).json({ success: false, error: 'Missing required fields (to, subject, text)' });
    }

    const cleanPass = effectivePass.replace(/\s+/g, '');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: effectiveUser, pass: cleanPass },
      tls: { rejectUnauthorized: false }
    });

    // Make URL clickable HTML hyperlink + 1-click CTA button
    const htmlContent = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" style="color: #2563eb; font-weight: bold; text-decoration: underline;">$1</a>')
      .replace(/\n/g, '<br/>');

    const demoUrl = 'https://housecleaning-998d3.web.app/';
    const ctaButtonHtml = `
      <div style="margin: 18px 0;">
        <a href="${demoUrl}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 10px 20px; border-radius: 8px; font-weight: bold; font-size: 14px; text-decoration: none; box-shadow: 0 2px 4px rgba(37,99,235,0.25);">👉 View Live Working Demo (1-Click)</a>
      </div>
    `;

    const mailOptions = {
      from: `"${fromName}" <${effectiveUser}>`,
      to,
      subject,
      text,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #1e293b; max-width: 600px;">
          ${htmlContent}
          ${ctaButtonHtml}
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    return res.status(200).json({
      success: true,
      messageId: info.messageId,
      sentAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('[API Send Email Error]:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}
