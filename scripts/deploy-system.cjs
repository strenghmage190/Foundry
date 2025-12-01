const fs = require('fs');
const path = require('path');

function usage() {
  console.log('Usage: node scripts/deploy-system.cjs <FoundryDataPath>');
  console.log('Or set FOUNDRY_DATA env var. Example:');
  console.log('  node scripts/deploy-system.cjs "C:\\FoundryVTT\\Data"');
}

const arg = process.argv[2] || process.env.FOUNDRY_DATA;
if (!arg) {
  console.error('Error: Foundry data path not provided.');
  usage();
  process.exit(1);
}

const foundryData = path.resolve(arg);
const src = path.resolve(__dirname, '..', 'dist', 'system');
const dest = path.join(foundryData, 'systems', 'beyonders-system');

if (!fs.existsSync(src)) {
  console.error('Source build not found at', src);
  process.exit(1);
}

console.log('Deploying Beyonders system');
console.log(' Source:', src);
console.log(' Dest:  ', dest);

try {
  // Remove existing dest
  if (fs.existsSync(dest)) {
    console.log('Removing existing folder:', dest);
    fs.rmSync(dest, { recursive: true, force: true });
  }
  // Ensure parent
  fs.mkdirSync(path.dirname(dest), { recursive: true });

  // Copy recursively
  const copyRecursive = (s, d) => {
    fs.mkdirSync(d, { recursive: true });
    for (const item of fs.readdirSync(s)) {
      const sPath = path.join(s, item);
      const dPath = path.join(d, item);
      const stat = fs.statSync(sPath);
      if (stat.isDirectory()) {
        copyRecursive(sPath, dPath);
      } else {
        fs.copyFileSync(sPath, dPath);
      }
    }
  };

  copyRecursive(src, dest);

  console.log('Copied files:');
  const top = fs.readdirSync(dest);
  top.forEach(f => console.log(' -', f));
  console.log('Deploy complete.');
} catch (e) {
  console.error('Deploy failed:', e);
  process.exit(1);
}
