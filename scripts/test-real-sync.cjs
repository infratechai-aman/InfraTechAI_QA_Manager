const tls = require('tls');

const USER = 'aman.infratechai@gmail.com';
const PASS = 'qerk bggh ysyk mrfg';

function fetchRealGmailStatus() {
  return new Promise((resolve, reject) => {
    const client = tls.connect(993, 'imap.gmail.com', { rejectUnauthorized: false });

    let tag = 1;
    function sendCmd(cmd) {
      const currentTag = `A${tag++}`;
      client.write(`${currentTag} ${cmd}\r\n`);
      return currentTag;
    }

    let buffer = '';
    let step = 0;
    let bounceIds = [];
    let recentIds = [];
    let bounces = [];
    let replies = [];

    client.on('data', (data) => {
      const str = data.toString();
      buffer += str;

      if (step === 0 && buffer.includes('* OK')) {
        step = 1;
        sendCmd(`LOGIN "${USER}" "${PASS.replace(/\s+/g, '')}"`);
      } else if (step === 1 && buffer.includes('A1 OK')) {
        step = 2;
        buffer = '';
        sendCmd('SELECT INBOX');
      } else if (step === 2 && buffer.includes('A2 OK')) {
        step = 3;
        buffer = '';
        sendCmd('SEARCH FROM "mailer-daemon"');
      } else if (step === 3 && buffer.includes('A3 OK')) {
        step = 4;
        const match = buffer.match(/\* SEARCH (.*)/);
        bounceIds = match ? match[1].trim().split(/\s+/).filter(Boolean) : [];
        buffer = '';
        // Now search all recent messages
        sendCmd('SEARCH ALL');
      } else if (step === 4 && buffer.includes('A4 OK')) {
        step = 5;
        const match = buffer.match(/\* SEARCH (.*)/);
        const allIds = match ? match[1].trim().split(/\s+/).filter(Boolean) : [];
        // Look at the latest 10 messages that are NOT bounces
        recentIds = allIds.slice(-20).filter(id => !bounceIds.includes(id));
        
        buffer = '';
        if (bounceIds.length > 0) {
          sendCmd(`FETCH ${bounceIds.slice(-15).join(',')} (BODY[TEXT])`);
        } else {
          step = 6;
          checkReplies();
        }
      } else if (step === 5 && buffer.includes('A5 OK')) {
        // Extract bounced emails from text
        const matches = buffer.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
        bounces = [...new Set(matches)].filter(e => 
          !e.includes('google') && 
          !e.includes('infratechai') && 
          !e.includes('gmail') && 
          !e.includes('w3.org')
        );
        step = 6;
        buffer = '';
        checkReplies();
      } else if (step === 6 && buffer.includes('A6 OK')) {
        // Parse headers of recent non-bounce messages
        console.log('--- RECENT INBOX NON-BOUNCE HEADERS ---');
        console.log(buffer);
        client.end();
        resolve({ bounces, replies });
      }
    });

    function checkReplies() {
      if (recentIds.length > 0) {
        sendCmd(`FETCH ${recentIds.slice(-10).join(',')} (BODY[HEADER.FIELDS (FROM SUBJECT DATE)])`);
      } else {
        client.end();
        resolve({ bounces, replies });
      }
    }

    client.on('error', (err) => {
      reject(err);
    });
  });
}

fetchRealGmailStatus().then(res => {
  console.log('Result:', JSON.stringify(res, null, 2));
}).catch(console.error);
