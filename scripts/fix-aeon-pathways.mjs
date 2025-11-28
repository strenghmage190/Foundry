import { createClient } from '@supabase/supabase-js';

// Usage:
// PowerShell (dry-run):
//    $env:SUPABASE_URL="https://..."; $env:SUPABASE_KEY="your-key"; node .\scripts\fix-aeon-pathways.mjs
// PowerShell (apply):
//    $env:SUPABASE_URL="https://..."; $env:SUPABASE_KEY="service-role-key"; node .\scripts\fix-aeon-pathways.mjs --apply

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY. Set environment variables before running.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const APPLY = process.argv.includes('--apply');

const stripAccents = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();

const normalizePath = (p) => {
  if (!p) return p;
  const key = stripAccents(p);
  if (key.includes('AEON') || key.includes('EON')) return 'CAMINHO DO ÉON ETERNO';
  if (key === 'CAMINHO DO AEON ETERNO') return 'CAMINHO DO ÉON ETERNO';
  return p;
};

async function fetchAllAgents() {
  // try to fetch a large range; if DB is huge, adjust pagination
  const { data, error } = await supabase
    .from('agents')
    .select('id, data')
    .range(0, 99999);

  if (error) throw error;
  return data || [];
}

function normalizeAgentData(agentData) {
  let changed = false;
  const copy = JSON.parse(JSON.stringify(agentData));

  if (copy.character) {
    // New structure
    if (copy.character.pathways) {
      const p = copy.character.pathways.primary;
      const fixedPrimary = normalizePath(p);
      if (fixedPrimary !== p) {
        copy.character.pathways.primary = fixedPrimary;
        changed = true;
      }

      if (Array.isArray(copy.character.pathways.secondary)) {
        const newSec = copy.character.pathways.secondary.map((s) => normalizePath(s));
        if (JSON.stringify(newSec) !== JSON.stringify(copy.character.pathways.secondary)) {
          copy.character.pathways.secondary = newSec;
          changed = true;
        }
      }
    }

    // Legacy field
    if (copy.character.pathway) {
      if (Array.isArray(copy.character.pathway)) {
        const newArr = copy.character.pathway.map((s) => normalizePath(s));
        if (JSON.stringify(newArr) !== JSON.stringify(copy.character.pathway)) {
          copy.character.pathway = newArr;
          changed = true;
        }
      } else {
        const newVal = normalizePath(copy.character.pathway);
        if (newVal !== copy.character.pathway) {
          copy.character.pathway = newVal;
          changed = true;
        }
      }
    }
  }

  return { copy, changed };
}

(async function main() {
  try {
    console.log('Fetching agents...');
    const rows = await fetchAllAgents();
    console.log(`Found ${rows.length} agents.`);

    const changes = [];

    for (const row of rows) {
      const id = row.id;
      const data = row.data;
      if (!data) continue;

      const { copy, changed } = normalizeAgentData(data);
      if (changed) {
        changes.push({ id, original: data, updated: copy });
      }
    }

    console.log(`Detected ${changes.length} agents that would be changed.`);

    if (changes.length === 0) process.exit(0);

    // Print summary
    for (const ch of changes) {
      const before = ch.original.character && (ch.original.character.pathways || ch.original.character.pathway);
      const after = ch.updated.character && (ch.updated.character.pathways || ch.updated.character.pathway);
      console.log('---');
      console.log(`agent id: ${ch.id}`);
      console.log('before:', JSON.stringify(before));
      console.log('after :', JSON.stringify(after));
    }

    if (!APPLY) {
      console.log('\nDry run complete. To apply changes run with --apply and provide SUPABASE_URL and SUPABASE_KEY (service role recommended).');
      process.exit(0);
    }

    console.log('\nApplying changes...');
    let applied = 0;
    for (const ch of changes) {
      const payload = { ...ch.updated };
      // Ensure we don't send id/isPrivate
      delete payload.id;
      delete payload.isPrivate;

      const { error } = await supabase.from('agents').update({ data: payload }).eq('id', ch.id);
      if (error) {
        console.error('Failed to update agent', ch.id, error);
      } else {
        applied++;
        console.log('Updated agent', ch.id);
      }
    }

    console.log(`Done. Applied ${applied} / ${changes.length} updates.`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
