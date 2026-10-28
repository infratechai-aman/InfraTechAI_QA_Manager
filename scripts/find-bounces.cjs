const tls = require('tls');

const USER = 'aman.infratechai@gmail.com';
const PASS = 'qerk bggh ysyk mrfg';

const client = tls.connect(993, 'imap.gmail.com', { rejectUnauthorized: false }, () => {
  console.log('Connected');
});

let tag = 1;
function sendCmd(cmd) {
  const currentTag = `A${tag++}`;
  client.write(`${currentTag} ${cmd}\r\n`);
  return currentTag;
}

let buffer = '';
let step = 0;

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
    // Search for all mailer-daemon emails
    sendCmd('SEARCH FROM "mailer-daemon"');
  } else if (step === 3 && buffer.includes('A3 OK')) {
    step = 4;
    const match = buffer.match(/\* SEARCH (.*)/);
    const ids = match ? match[1].trim().split(/\s+/).filter(Boolean) : [];
    console.log(`Total bounce emails found: ${ids.length}`);
    if (ids.length > 0) {
      const recentIds = ids.slice(-15).join(',');
      buffer = '';
      sendCmd(`FETCH ${recentIds} (BODY[HEADER.FIELDS (SUBJECT DATE)] BODY[TEXT])`);
    } else {
      console.log('No bounces found.');
      client.end();
    }
  } else if (step === 4 && buffer.includes('A4 OK')) {
    // Parse which email addresses failed
    const matches = buffer.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
    const uniqueEmails = [...new Set(matches)].filter(e => !e.includes('google') && !e.includes('infratechai') && !e.includes('gmail'));
    console.log('--- FAILED / BOUNCED RECIPIENTS ---');
    console.log(uniqueEmails);
    client.end();
  }
});

client.on('close', () => {
  process.exit(0);
});
