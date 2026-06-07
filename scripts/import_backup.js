import fs from 'fs';
import csv from 'csv-parser';
import fetch from 'node-fetch'; 

const API_BASE = 'https://api.armedia.id';
const CSV_FILE = '/Users/lcs/Downloads/armedia.id-registrasi-2026-05-22.csv';

const VILLAGE_MAP = {
  'GUMELAR': 1,
  'CIHONJE': 2,
  'TLAGA': 3,
  'SAMUDRA': 4,
  'SAMUDRA KULON': 5,
  'CILANGKAP': 6,
  'PANINGKABAN': 7,
  'KARANG KEMOJING': 8,
  'GANCANG': 9,
  'KEDUNG URANG': 10
};

const PACKAGE_MAP = {
  '20.Mbps': 1,
  'GUYUB_1 (20 Mbps) - Rp 115.000/Bln': 1,
  '30.Mbps': 2,
  '50.Mbps': 3,
  '75.Mbps': 4,
  '100.Mbps': 5
};

const ALREADY_IMPORTED = [
  "CARWAN", "TARWONO", "KISNO", "SUMARNO NARKUM", "MUHAMMAD BAHRUL ULUM", "ADI JUNAEDI",
  "EVA PRISTIANA", "ARI WINDARTI", "RAPIN", "NARSO", "SUSI/DARTO", "WARGIYATI",
  "TAMIARJO TARSIWAN", "MIFTAHUL UMAM", "DARTAM", "ESTININGSIH", "RASUM", "WATIM WALUYO",
  "IPUNG PURWANINGSIH", "ADITIA", "SUPRIYANTO", "SURIPTO/RIDHO", "SRI MULYONO", "SUSANTO",
  "JONI SAPUTRA", "CARSUM", "DESTI DWI HARIYANTO", "SUDIRMAN"
];

async function login() {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'superadmin@armedia.id', password: 'superadmin2026' })
  });
  if (!res.ok) throw new Error('Login failed');
  const data = await res.json();
  return data.accessToken;
}

async function run() {
  console.log('Logging in to API...');
  const token = await login();
  console.log('Logged in successfully. Reading CSV...');

  const results = [];
  fs.createReadStream(CSV_FILE)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      console.log(`Parsed ${results.length} rows.`);

      let successCount = 0;
      let failCount = 0;
      let skippedCount = 0;

      for (let i = 0; i < results.length; i++) {
        const row = results[i];
        
        const name = row['Nama Lengkap']?.trim();
        if (!name) continue;

        if (ALREADY_IMPORTED.includes(name)) {
            skippedCount++;
            continue;
        }

        const address = row['Alamat']?.trim();
        const desaRaw = row['Desa']?.trim().toUpperCase();
        let phone = row['No HP']?.trim();
        const paketRaw = row['Paket']?.trim();
        const statusRaw = row['Status']?.trim().toLowerCase() === 'aktif' ? 'active' : 'pending';

        if (!phone || phone === '') {
            phone = '0000000000'; // dummy phone to bypass validation
        }

        let village_id = VILLAGE_MAP[desaRaw] || null;
        if (!village_id && desaRaw) {
            // fallback if Desa is like GUMEAR instead of GUMELAR
            if (desaRaw.includes('GUM')) village_id = 1;
        }
        if (!village_id) village_id = 1; // force village_id for invalid like WAHYONO
        
        let package_id = PACKAGE_MAP[paketRaw];
        if (!package_id && paketRaw) {
          if (paketRaw.includes('20')) package_id = 1;
          else if (paketRaw.includes('30')) package_id = 2;
          else if (paketRaw.includes('50')) package_id = 3;
          else if (paketRaw.includes('75')) package_id = 4;
          else if (paketRaw.includes('100')) package_id = 5;
        }
        if (!package_id) package_id = 1; // default to package 1

        const payload = {
          name,
          address,
          phone,
          village_id,
          package_id,
          status: statusRaw
        };

        const res = await fetch(`${API_BASE}/api/customers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          successCount++;
          console.log(`[${i+1}/${results.length}] Success: ${name}`);
        } else {
          failCount++;
          const err = await res.text();
          console.error(`[${i+1}/${results.length}] Failed: ${name} - ${err}`);
        }
      }

      console.log(`\nImport complete! Success: ${successCount}, Failed: ${failCount}, Skipped: ${skippedCount}`);
    });
}

run().catch(console.error);
