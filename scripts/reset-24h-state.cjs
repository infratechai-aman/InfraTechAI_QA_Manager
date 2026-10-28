const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, 'overnight-state.json');
const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));

state.currentIndex = 0;
state.overnightActive = true;
state.startTime = new Date().toISOString();

fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
console.log('State reset for 24-hour campaign: currentIndex = 0, overnightActive = true');
