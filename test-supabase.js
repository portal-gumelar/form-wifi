import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Baca file .env
const envFile = fs.readFileSync('.env', 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val) {
    env[key.trim()] = val.join('=').trim().replace(/['"]/g, '');
  }
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function checkTable() {
  const { data, error } = await supabase.from('registrations').select('*').limit(1);
  if (error) {
    console.error("Error querying registrations:", error);
  } else {
    console.log("Found registrations data:", data.length);
  }
}
checkTable();
