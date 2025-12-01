const fs = require('fs');
const path = require('path');

// This postbuild copies both ES and IIFE bundles into prepared module/system folders
const distDir = path.resolve(__dirname, '..', 'dist');
const bundles = [
  'beyonders.bundle.es.js',
  'beyonders.bundle.iife.js'
];

const targets = [
  path.resolve(distDir, 'module'),
  path.resolve(distDir, 'system')
];

bundles.forEach((b) => {
  const src = path.join(distDir, b);
  if (!fs.existsSync(src)) {
    console.warn('Build bundle not found (skipping):', src);
    return;
  }
  targets.forEach((t) => {
    if (!fs.existsSync(t)) fs.mkdirSync(t, { recursive: true });
    const dest = path.join(t, b);
    fs.copyFileSync(src, dest);
    console.log('Copied', src, '->', dest);
  });
});
