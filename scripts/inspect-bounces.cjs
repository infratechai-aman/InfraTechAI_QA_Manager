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
    sendCmd('FETCH 811,813,815 (BODY[TEXT])');
  } else if (step === 3 && buffer.includes('A3 OK')) {
    console.log('--- BOUNCE BODIES ---');
    console.log(buffer.slice(0, 2000));
    client.end();
  }
});

client.on('close', () => {
  process.exit(0);
});
