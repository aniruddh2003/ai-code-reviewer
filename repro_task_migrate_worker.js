const fs = require('fs');
const path = require('path');

const backendSrcPath = path.join(process.cwd(), 'backend', 'src');
const expectedFiles = ['worker.js', 'dockerRunner.js', 'aiReviewer.js'];

if (!fs.existsSync(backendSrcPath)) {
  console.error('❌ FAIL: backend/src/ directory does not exist.');
  process.exit(1);
}

expectedFiles.forEach(file => {
  if (!fs.existsSync(path.join(backendSrcPath, file))) {
    console.error(`❌ FAIL: ${file} not found in backend/src/.`);
    process.exit(1);
  }
});

console.log('✅ PASS: All worker files migrated to backend/src/.');
process.exit(0);
