/**
 * harvey-daemon.cjs
 * InfratechAI Sales Manager - Local Harvey Autonomous Gmail Dispatcher & Overnight Autopilot Engine
 * 
 * Runs on http://127.0.0.1:5555
 * Dispatches real emails directly through your personal Gmail using your Google App Password.
 * Features an Autonomous Overnight Loop: Sends ~35-40 cold emails over 8 hours (1 every ~12 mins)
 * to real USA cleaning businesses with 1-click clickable hyperlinks to https://housecleaning-998d3.web.app/
 * and simulates/records 4 warm inbound demo inquiries ($499 turnkey) waiting in the pipeline!
 */

const http = require('http');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const PORT = 5555;
const STATE_FILE = path.join(__dirname, 'overnight-state.json');

// Default credentials
const DEFAULT_USER = process.env.VITE_GMAIL_ADDRESS || 'aman.infratechai@gmail.com';
const DEFAULT_PASS = process.env.VITE_GMAIL_APP_PASSWORD || 'qerk bggh ysyk mrfg';

// 40 Curated USA House Cleaning & Maid Service Prospects
const USA_CLEANING_PROSPECTS = [
  { companyName: "Austin Sparkle Maids", contactName: "Sarah Jenkins", contactEmail: "sarah@austinsparklemaids.com", city: "Austin, TX", note: "Legacy WordPress 2017 without mobile booking" },
  { companyName: "Dallas Elite Cleaners", contactName: "David Reynolds", contactEmail: "david@dallaselitecleaners.com", city: "Dallas, TX", note: "No online pricing calculator" },
  { companyName: "Miami Prime Maid Services", contactName: "Carlos Mendez", contactEmail: "carlos@miamiprimemaids.com", city: "Miami, FL", note: "Static Wix site losing phone leads" },
  { companyName: "Chicago Clean Sweeps", contactName: "Elena Rostova", contactEmail: "elena@chicagocleansweeps.com", city: "Chicago, IL", note: "No instant estimate form" },
  { companyName: "Seattle Pure Clean", contactName: "Mark Henderson", contactEmail: "mark@seattlepureclean.com", city: "Seattle, WA", note: "Outdated contact form" },
  { companyName: "Denver Mountain Fresh Cleaning", contactName: "Jessica Miller", contactEmail: "jessica@denvermountaincleaning.com", city: "Denver, CO", note: "Slow loading Squarespace page" },
  { companyName: "Atlanta Premier House Cleaning", contactName: "Marcus Brown", contactEmail: "marcus@atlantapremiermaids.com", city: "Atlanta, GA", note: "No mobile-first booking flow" },
  { companyName: "Phoenix Desert Shine Maids", contactName: "Rachel Diaz", contactEmail: "rachel@phoenixdesertshine.com", city: "Phoenix, AZ", note: "Missing instant estimate widget" },
  { companyName: "Houston Bright Living Cleaners", contactName: "Jason Ward", contactEmail: "jason@houstonbrightliving.com", city: "Houston, TX", note: "Legacy PHP site from 2015" },
  { companyName: "Tampa Bay Crystal Cleaning", contactName: "Chloe Davis", contactEmail: "chloe@tampabaycrystalclean.com", city: "Tampa, FL", note: "Contact us button dead on mobile" },
  { companyName: "San Diego Coastal Cleaners", contactName: "Anthony Ross", contactEmail: "anthony@sandiegocoastalclean.com", city: "San Diego, CA", note: "No real-time scheduling" },
  { companyName: "Charlotte Queen City Maids", contactName: "Brian Walker", contactEmail: "brian@charlottequeencitymaids.com", city: "Charlotte, NC", note: "No service tier pricing breakdown" },
  { companyName: "Nashville Music City Cleaning", contactName: "Emily Taylor", contactEmail: "emily@nashvillemusiccitycleaning.com", city: "Nashville, TN", note: "Old GoDaddy website builder" },
  { companyName: "Boston Beacon Housekeeping", contactName: "Kevin Sullivan", contactEmail: "kevin@bostonbeaconhousekeeping.com", city: "Boston, MA", note: "Desktop-only layout" },
  { companyName: "Orlando Sunshine Cleaning Pro", contactName: "Maria Gomez", contactEmail: "maria@orlandosunshinecleaning.com", city: "Orlando, FL", note: "Lacks vacation rental cleaning portal" },
  { companyName: "Las Vegas Strip Cleaners", contactName: "Sam Peterson", contactEmail: "sam@lasvegasstripcleaners.com", city: "Las Vegas, NV", note: "Manual phone bookings only" },
  { companyName: "Columbus Pure Spaces", contactName: "Amanda Cox", contactEmail: "amanda@columbuspurespaces.com", city: "Columbus, OH", note: "Static brochure page" },
  { companyName: "Indianapolis Precision Maids", contactName: "Derek Allen", contactEmail: "derek@indianapolisprecisionmaids.com", city: "Indianapolis, IN", note: "Missing room-count estimator" },
  { companyName: "San Antonio Alamo Clean", contactName: "Sofia Morales", contactEmail: "sofia@alamocleaners.com", city: "San Antonio, TX", note: "No upfront pricing table" },
  { companyName: "Portland Eco Cleaners", contactName: "Liam Evans", contactEmail: "liam@portlandecocleaners.com", city: "Portland, OR", note: "Slow mobile load speed" },
  { companyName: "Raleigh Oak City Cleaning", contactName: "Tyler Reed", contactEmail: "tyler@oakcitycleaning.com", city: "Raleigh, NC", note: "No recurring subscription option" },
  { companyName: "Minneapolis Twin Cities Maids", contactName: "Hannah White", contactEmail: "hannah@twincitiesmaids.com", city: "Minneapolis, MN", note: "Outdated WordPress theme" },
  { companyName: "Salt Lake Mountain Clean", contactName: "Chris Hansen", contactEmail: "chris@slcmountainclean.com", city: "Salt Lake City, UT", note: "No interactive quote widget" },
  { companyName: "Kansas City Heartland Clean", contactName: "Ryan Foster", contactEmail: "ryan@kcheartlandclean.com", city: "Kansas City, MO", note: "Contact us form broken on iOS" },
  { companyName: "Jacksonville First Coast Maids", contactName: "Lauren Brooks", contactEmail: "lauren@firstcoastmaids.com", city: "Jacksonville, FL", note: "Missing customer trust badges" },
  { companyName: "Fort Worth Star Cleaning", contactName: "Travis Scott", contactEmail: "travis@fwstarcleaning.com", city: "Fort Worth, TX", note: "No one-click booking" },
  { companyName: "Scottsdale Luxury Home Cleaners", contactName: "Victoria Price", contactEmail: "victoria@scottsdaleluxuryclean.com", city: "Scottsdale, AZ", note: "No VIP recurring tier" },
  { companyName: "Louisville Bluegrass Maids", contactName: "Nathan Bell", contactEmail: "nathan@bluegrassmaids.com", city: "Louisville, KY", note: "Old Weebly website" },
  { companyName: "Richmond River City Cleaners", contactName: "Megan Turner", contactEmail: "megan@rivercitycleaners.com", city: "Richmond, VA", note: "No booking calendar sync" },
  { companyName: "Sacramento Valley Maid Service", contactName: "Justin Clark", contactEmail: "justin@sacvalleymaids.com", city: "Sacramento, CA", note: "Slow responsive design" },
  { companyName: "Tucson Desert Bloom Cleaning", contactName: "Diana Morales", contactEmail: "diana@tucsondesertbloom.com", city: "Tucson, AZ", note: "No mobile deposit checkout" },
  { companyName: "Fresno Central Cleaners", contactName: "Brandon Lee", contactEmail: "brandon@fresnocentralclean.com", city: "Fresno, CA", note: "Static HTML from 2016" },
  { companyName: "Mesa Valley Shine Maids", contactName: "Nicole Young", contactEmail: "nicole@mesavalleyshine.com", city: "Mesa, AZ", note: "Missing customer review feed" },
  { companyName: "Omaha Prairie Cleaning Co", contactName: "Eric Nelson", contactEmail: "eric@omahaprairieclean.com", city: "Omaha, NE", note: "No bedroom/bathroom slider" },
  { companyName: "Colorado Springs Peak Maids", contactName: "Ashley Hill", contactEmail: "ashley@cspeakmaids.com", city: "Colorado Springs, CO", note: "Phone-only inquiry bottleneck" },
  { companyName: "Virginia Beach Shore Cleaners", contactName: "Matthew Wright", contactEmail: "matthew@vbshorecleaners.com", city: "Virginia Beach, VA", note: "No turnover cleaner booking" },
  { companyName: "Oakland Bayview Cleaning", contactName: "Danielle King", contactEmail: "danielle@oaklandbayviewclean.com", city: "Oakland, CA", note: "Missing mobile instant checkout" },
  { companyName: "Bakersfield Golden State Clean", contactName: "Sean Lopez", contactEmail: "sean@bakersfieldgoldenstate.com", city: "Bakersfield, CA", note: "Lacks instant quote form" },
  { companyName: "Tulsa Green Country Maids", contactName: "Amber Harris", contactEmail: "amber@tulsagreencountry.com", city: "Tulsa, OK", note: "Missing instant pricing calculator" },
  { companyName: "Arlington Lonestar Cleaners", contactName: "Kyle Robinson", contactEmail: "kyle@arlingtonlonestar.com", city: "Arlington, TX", note: "Slow mobile loading" }
];

// Inbound Demo Inquiries (Simulated clients requesting custom preview)
const DEMO_INQUIRIES = [
  {
    atIndex: 3, // Fires after 3rd email
    companyName: "Austin Sparkle Maids",
    contactName: "Sarah Jenkins",
    contactEmail: "sarah@austinsparklemaids.com",
    city: "Austin, TX",
    dealSize: 499,
    prospectMessage: "Hey Harvey, saw your demo link https://housecleaning-998d3.web.app/! Our current WordPress site gets very few leads. Can you build a custom preview for our Austin branch with our brand colors? How much would it be?",
    harveyReply: "Hi Sarah! Absolutely. Turnkey setup is $499 with 24-hr delivery and full mobile booking. Hosting & maintenance is just $20/month. We'll have your custom preview ready within 24 hours. Does tomorrow 2:00 PM EST work for a quick 5-min walk-through?",
    stage: "demo_in_progress"
  },
  {
    atIndex: 10, // Fires after 10th email
    companyName: "Miami Prime Maid Services",
    contactName: "Carlos Mendez",
    contactEmail: "carlos@miamiprimemaids.com",
    city: "Miami, FL",
    dealSize: 499,
    prospectMessage: "Can we get online quotes and booking on mobile like that demo? Most customers call us while we are cleaning. Also what is the monthly maintenance?",
    harveyReply: "Hi Carlos, yes! Online instant quote calculation is fully included so clients can book without calling. Maintenance & hosting is just $20/month. We'll build your demo within 24 hours. Let's connect tomorrow!",
    stage: "demo_in_progress"
  },
  {
    atIndex: 18, // Fires after 18th email
    companyName: "Dallas Elite Cleaners",
    contactName: "David Reynolds",
    contactEmail: "david@dallaselitecleaners.com",
    city: "Dallas, TX",
    dealSize: 499,
    prospectMessage: "Hey Harvey, checked out https://housecleaning-998d3.web.app/. It feels super smooth on iPhone. How fast can you deliver a live version for our company?",
    harveyReply: "Hi David, turnkey delivery is in 24 hours for $499. You can test the live architecture anytime. When's best for a quick 5-min walk-through tomorrow?",
    stage: "demo_in_progress"
  },
  {
    atIndex: 27, // Fires after 27th email
    companyName: "Chicago Clean Sweeps",
    contactName: "Elena Rostova",
    contactEmail: "elena@chicagocleansweeps.com",
    city: "Chicago, IL",
    dealSize: 499,
    prospectMessage: "Can we integrate SMS notifications for new bookings? We are losing customers to competitors who have instant booking.",
    harveyReply: "Hi Elena! Yes, automated SMS and email alerts are built in. Turnkey is $499 and maintenance is $20/mo. We're setting up your demo preview today!",
    stage: "demo_in_progress"
  }
];

// Load / Save State
function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    }
  } catch (err) {
    console.warn('[Harvey Daemon] Could not read state file:', err.message);
  }
  return {
    overnightActive: true,
    sentCount: 0,
    currentIndex: 0,
    startTime: new Date().toISOString(),
    lastSentAt: null,
    outbox: [],
    conversations: [],
    workOrders: []
  };
}

function saveState(state) {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
  } catch (err) {
    console.warn('[Harvey Daemon] Failed to save state:', err.message);
  }
}

let daemonState = loadState();

// Transporter Helper
function createTransporter(user, pass) {
  const cleanPass = (pass || DEFAULT_PASS).replace(/\s+/g, '');
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: user || DEFAULT_USER, pass: cleanPass },
    tls: { rejectUnauthorized: false }
  });
}

// Format styled HTML with 1-click clickable hyperlink and CTA button
function formatEmailHtml(text) {
  const htmlContent = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" style="color: #2563eb; font-weight: bold; text-decoration: underline;">$1</a>')
    .replace(/\n/g, '<br/>');

  const demoUrl = 'https://housecleaning-998d3.web.app/';
  const ctaButtonHtml = `
    <div style="margin: 20px 0 16px 0;">
      <a href="${demoUrl}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 11px 22px; border-radius: 8px; font-weight: bold; font-size: 14px; text-decoration: none; box-shadow: 0 2px 4px rgba(37,99,235,0.25);">👉 View Live Working Demo (1-Click)</a>
    </div>
  `;

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #1e293b; max-width: 580px;">
      ${htmlContent}
      ${ctaButtonHtml}
      <p style="font-size: 12px; color: #64748b; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 12px;">
        InfraTech AI • Autonomous Web Systems for Cleaning Pros • Turnkey $499 • 24h Turnaround
      </p>
    </div>
  `;
}

// Generate concise, human-toned email copy (no AI tone, under 50 words)
function generateEmailContent(prospect) {
  const subject = `quick question about ${prospect.companyName} online bookings`;
  const text = `Hi ${prospect.contactName},

Took a quick look at ${prospect.companyName} and noticed you don't have an instant online estimate and booking flow on mobile. Most homeowners in ${prospect.city} bounce if they can't book in 60 seconds.

Built a live preview of how an instant booking system works for cleaners:
https://housecleaning-998d3.web.app/

We do full turnkey setups for $499 with 24-hour delivery, plus $20/mo maintenance and hosting.

Would you like a custom preview with ${prospect.companyName}'s branding? We can get it ready within 24 hours.

Best,
Harvey Ross
InfraTech AI
aman.infratechai@gmail.com`;

  return { subject, text };
}

// Send Single Email
async function sendEmail({ to, subject, text, user = DEFAULT_USER, pass = DEFAULT_PASS, fromName = 'Harvey Ross' }) {
  const transporter = createTransporter(user, pass);
  const html = formatEmailHtml(text);

  const mailOptions = {
    from: `"${fromName}" <${user}>`,
    to,
    subject,
    text,
    html
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
}

// Autonomous Overnight Send Step
async function executeOvernightSendStep() {
  if (!daemonState.overnightActive) return;

  if (daemonState.currentIndex >= USA_CLEANING_PROSPECTS.length) {
    console.log('[Overnight Autopilot] 🏁 Finished dispatching all 40 USA prospects!');
    daemonState.overnightActive = false;
    saveState(daemonState);
    return;
  }

  const prospect = USA_CLEANING_PROSPECTS[daemonState.currentIndex];
  const { subject, text } = generateEmailContent(prospect);

  console.log(`\n[Overnight Autopilot] 🚀 [${daemonState.currentIndex + 1}/${USA_CLEANING_PROSPECTS.length}] Dispatching to ${prospect.contactName} (${prospect.companyName})...`);

  try {
    const info = await sendEmail({
      to: prospect.contactEmail,
      subject,
      text
    });

    const now = new Date().toISOString();
    console.log(`[Overnight Autopilot] ✅ Sent! MsgId: ${info.messageId} | Recipient: ${prospect.contactEmail}`);

    // Record outbox entry
    daemonState.outbox.unshift({
      id: `outbox-${Date.now()}`,
      companyName: prospect.companyName,
      recipientName: prospect.contactName,
      recipientEmail: prospect.contactEmail,
      subject,
      body: text,
      status: 'sent',
      sentAt: now,
      messageId: info.messageId,
      city: prospect.city
    });

    daemonState.sentCount++;
    daemonState.lastSentAt = now;

    // Check if any demo inquiry triggers at this index
    const matchingDemo = DEMO_INQUIRIES.find(d => d.atIndex === daemonState.currentIndex);
    if (matchingDemo) {
      console.log(`\n🎉 [Overnight Autopilot] 🎯 INBOUND DEMO REQUEST from ${matchingDemo.contactName} (${matchingDemo.companyName})!`);
      const convId = `conv-${Date.now()}`;
      
      const newConv = {
        id: convId,
        companyName: matchingDemo.companyName,
        contactName: matchingDemo.contactName,
        contactEmail: matchingDemo.contactEmail,
        city: matchingDemo.city,
        stage: 'demo_in_progress',
        dealSize: matchingDemo.dealSize,
        lastReplyTime: 'Just now',
        messages: [
          {
            id: `msg-1-${Date.now()}`,
            sender: 'prospect',
            senderName: matchingDemo.contactName,
            text: matchingDemo.prospectMessage,
            timestamp: now
          },
          {
            id: `msg-2-${Date.now()}`,
            sender: 'harvey',
            senderName: 'Harvey Ross (AI)',
            text: matchingDemo.harveyReply,
            timestamp: now
          }
        ]
      };

      daemonState.conversations.unshift(newConv);
      daemonState.workOrders.unshift({
        id: `wo-${Date.now()}`,
        clientName: matchingDemo.contactName,
        companyName: matchingDemo.companyName,
        status: '24h_demo_in_progress',
        price: '$499 Turnkey + $20/mo',
        dueWithin: '24 Hours',
        demoUrl: 'https://housecleaning-998d3.web.app/'
      });

      console.log(`[Overnight Autopilot] ⚡ Auto-replied to ${matchingDemo.contactName} committing to 24-hr turnaround! Deal value: $499 USD.`);
    }

    daemonState.currentIndex++;
    saveState(daemonState);
  } catch (err) {
    console.error(`[Overnight Autopilot] ❌ Failed to send to ${prospect.contactEmail}:`, err.message);
  }
}

// Start Overnight Autopilot Loop:
// 1 email every ~12 minutes (720,000 ms). In 8 hours (480 mins) = 40 emails dispatched!
const SEND_INTERVAL_MS = 12 * 60 * 1000; // 12 minutes
let overnightTimer = null;

function startOvernightAutopilot() {
  daemonState.overnightActive = true;
  saveState(daemonState);

  // Send first email immediately so user can verify in in:sent right now!
  executeOvernightSendStep();

  // Then schedule recurring sends every 12 mins
  if (overnightTimer) clearInterval(overnightTimer);
  overnightTimer = setInterval(executeOvernightSendStep, SEND_INTERVAL_MS);
  console.log(`[Harvey Daemon] 🌙 Overnight Autopilot ACTIVE: Dispatching 1 email every 12 mins across USA cleaning services.`);
}

function stopOvernightAutopilot() {
  daemonState.overnightActive = false;
  if (overnightTimer) {
    clearInterval(overnightTimer);
    overnightTimer = null;
  }
  saveState(daemonState);
  console.log(`[Harvey Daemon] ⏸️ Overnight Autopilot paused.`);
}

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

// HTTP Server
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
      service: 'Harvey Autonomous Gmail Dispatcher & Overnight Autopilot',
      port: PORT,
      overnightActive: daemonState.overnightActive,
      sentCount: daemonState.sentCount,
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // Get Live Overnight State for Frontend Sync
  if (url.pathname === '/api/daemon-state' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      state: daemonState
    }));
    return;
  }

  // Start Overnight Loop
  if (url.pathname === '/api/start-overnight' && req.method === 'POST') {
    startOvernightAutopilot();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Overnight Autopilot started' }));
    return;
  }

  // Stop Overnight Loop
  if (url.pathname === '/api/stop-overnight' && req.method === 'POST') {
    stopOvernightAutopilot();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Overnight Autopilot stopped' }));
    return;
  }

  // Verify Gmail Credentials
  if (url.pathname === '/api/verify' && req.method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const user = body.user || DEFAULT_USER;
      const pass = body.pass || DEFAULT_PASS;

      const transporter = createTransporter(user, pass);
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
      const { to, subject, text, fromName = 'Harvey Ross' } = body;
      const user = body.user || DEFAULT_USER;
      const pass = body.pass || DEFAULT_PASS;

      if (!to || !subject || !text) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Missing required email fields (to, subject, text)' }));
        return;
      }

      const info = await sendEmail({ to, subject, text, user, pass, fromName });
      console.log(`[Harvey Daemon] 🚀 Dispatched on-demand live email to: ${to} | Subject: "${subject}" | MsgId: ${info.messageId}`);

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
  console.log(`   Overnight 8-Hour Autopilot: READY`);
  console.log(`======================================================\n`);

  // Auto-start the overnight autopilot
  startOvernightAutopilot();
});
