const tls = require('tls');

const USER = 'aman.infratechai@gmail.com';
const PASS = 'qerk bggh ysyk mrfg';

const client = tls.connect(993, 'imap.gmail.com', { rejectUnauthorized: false }, () => {
  console.log('Connected to imap.gmail.com');
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
  console.log('<<', str.trim());
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
    sendCmd('SEARCH ALL');
  } else if (step === 3 && buffer.includes('A3 OK')) {
    step = 4;
    const match = buffer.match(/\* SEARCH (.*)/);
    const ids = match ? match[1].trim().split(/\s+/).filter(Boolean) : [];
    console.log(`Total messages in Inbox: ${ids.length}`);
    if (ids.length > 0) {
      const recentIds = ids.slice(-5).join(',');
      buffer = '';
      sendCmd(`FETCH ${recentIds} (BODY[HEADER.FIELDS (FROM SUBJECT DATE)])`);
    } else {
      console.log('Inbox is completely empty!');
      client.end();
    }
  } else if (step === 4 && buffer.includes('A4 OK')) {
    console.log('\n--- RECENT INBOX HEADERS ---');
    console.log(buffer);
    client.end();
  } else if (buffer.includes('NO') || buffer.includes('BAD')) {
    console.error('Error encountered:', buffer);
    client.end();
  }
});

client.on('error', (err) => {
  console.error('Socket error:', err.message);
});

client.on('close', () => {
  console.log('Connection closed');
  process.exit(0);
});
