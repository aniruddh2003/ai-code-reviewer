const fs = require('fs');
const path = require('path');

const frontendPath = path.join(process.cwd(), 'frontend');

if (!fs.existsSync(frontendPath)) {
  console.error('❌ FAIL: frontend/ directory does not exist.');
  process.exit(1);
} else {
  console.log('✅ PASS: frontend/ directory exists.');
  process.exit(0);
}
