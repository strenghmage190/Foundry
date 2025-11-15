const fs = require('fs');
const pdf = require('pdf-parse');

const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: node scripts/extract-rules.js <absolute-pdf-path>');
  process.exit(1);
}

function pickLines(text, keywords) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const res = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (keywords.some(k => l.toLowerCase().includes(k))) {
      const start = Math.max(0, i - 2);
      const end = Math.min(lines.length, i + 3);
      res.push('---');
      res.push(...lines.slice(start, end));
    }
  }
  return res.join('\n');
}

(async () => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    const keywords = [
      'defesa', 'absorç', 'iniciativa', 'sanidade', 'pa ', 'pontos de aprimoramento', 'sequênc', 'digest', 'avanç', 'recupera', 'armadura', 'esquiva'
    ].map(k => k.toLowerCase());

    const extracted = pickLines(data.text.toLowerCase(), keywords);
    const outPath = 'docs/extracted-rules.txt';
    fs.mkdirSync('docs', { recursive: true });
    fs.writeFileSync(outPath, extracted, 'utf8');
    console.log('Extracted rules saved to', outPath);
    console.log('--- Preview ---');
    console.log(extracted.slice(0, 2000));
  } catch (err) {
    console.error('Failed to parse PDF:', err.message);
    process.exit(2);
  }
})();