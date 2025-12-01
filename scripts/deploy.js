const fs = require('fs');
const path = require('path');

// Usage: node scripts/deploy.js <destination_path>
// Or set DEST env var: DEST=C:\FoundryData\Data\modules\beyonders-integration node scripts/deploy.js

const destArg = process.argv[2] || process.env.DEST;
if (!destArg) {
  console.error('Destination path not provided. Usage: node scripts/deploy.js <destination_path>');
  process.exit(1);
}

const src = path.resolve(__dirname, '..', 'dist', 'module');
const dest = path.resolve(destArg);

if (!fs.existsSync(src)) {
  console.error('Source build folder not found:', src);
  process.exit(1);
}

function copyRecursive(srcDir, destDir) {
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('Copying', src, '->', dest);
copyRecursive(src, dest);
console.log('Deploy complete.');
