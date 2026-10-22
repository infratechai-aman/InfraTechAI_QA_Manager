/**
 * harvey-daemon.cjs
 * InfratechAI Sales Manager - Local Harvey Autonomous Gmail Dispatcher
 * 
 * Runs on http://127.0.0.1:5555
 * Allows the Sales Manager web app to send real emails directly through your personal Gmail
 * using your Google 16-character App Password via nodemailer.
 */

const http = require('http');
const nodemailer = require('nodemailer');

const PORT = 5555;

// Helper to parse JSON body
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

// CORS Headers
function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

const server = http.createServer(async (req, res) => {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  // Health / Status Check
  if (url.pathname === '/api/status' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'online', 
      service: 'Harvey Autonomous Gmail Dispatcher',
      port: PORT,
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // Verify Gmail Credentials
  if (url.pathname === '/api/verify' && req.method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const { user, pass } = body;

      if (!user || !pass) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Gmail user and 16-letter App Password required' }));
        return;
      }

      const cleanPass = pass.replace(/\s+/g, '');
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass: cleanPass },
        tls: { rejectUnauthorized: false }
      });

      await transporter.verify();
      console.log(`[Harvey Daemon] ✅ Verified Gmail connection for: ${user}`);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: `Connected to Gmail as ${user}` }));
    } catch (err) {
      console.error(`[Harvey Daemon] ❌ Verification error:`, err.message);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  // Send Live Email via Gmail
  if (url.pathname === '/api/send' && req.method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const { to, subject, text, user, pass, fromName = 'Harvey Ross' } = body;

      if (!to || !subject || !text || !user || !pass) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Missing required email fields (to, subject, text, user, pass)' }));
        return;
      }

      const cleanPass = pass.replace(/\s+/g, '');
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass: cleanPass },
        tls: { rejectUnauthorized: false }
      });

      const mailOptions = {
        from: `"${fromName}" <${user}>`,
        to,
        subject,
        text
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`[Harvey Daemon] 🚀 Sent email to: ${to} | Subject: "${subject}" | MsgId: ${info.messageId}`);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: true, 
        messageId: info.messageId,
        sentAt: new Date().toISOString()
      }));
    } catch (err) {
      console.error(`[Harvey Daemon] ❌ Send failure:`, err.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  // 404 Fallback
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n======================================================`);
  console.log(`⚡ Harvey Autonomous Gmail Dispatcher listening on:`);
  console.log(`   http://127.0.0.1:${PORT}`);
  console.log(`   Ready to dispatch cold outreach & auto-negotiate replies!`);
  console.log(`======================================================\n`);
});
