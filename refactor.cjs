const fs = require('fs');
const path = require('path');

const map = {
  'Timestamp': 'timestamp',
  'NIK': 'nik',
  'Nama Lengkap': 'nama_lengkap',
  'No HP / WA': 'no_hp_wa',
  'Alamat Pemasangan': 'alamat_pemasangan',
  'Kecamatan': 'kecamatan',
  'Desa': 'desa',
  'RW': 'rw',
  'RT': 'rt',
  'Paket': 'paket',
  'Provider Saat Ini': 'provider_saat_ini',
  'Sumber Info': 'sumber_info',
  'Link Google Maps': 'link_google_maps',
  'Foto KTP': 'foto_ktp',
  'Persetujuan S&K': 'persetujuan_sk',
  'Catatan': 'catatan',
  'Tanggal Aktif': 'tanggal_aktif',
  'Tanggal Rencana Pasang': 'tanggal_rencana_pasang',
  'Waktu Survei': 'waktu_survei'
};

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  for (const [oldKey, newKey] of Object.entries(map)) {
    const esc = oldKey.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    
    // Bracket notation: obj["Old Name"] -> obj.new_name
    content = content.replace(new RegExp(`\\["${esc}"\\]`, 'g'), `.${newKey}`);
    
    // Object keys (with quotes): "Old Name": -> new_name:
    content = content.replace(new RegExp(`"${esc}":`, 'g'), `${newKey}:`);

    // Only if oldKey doesn't have spaces, handle dot notation
    if (!oldKey.includes(' ')) {
      content = content.replace(new RegExp(`\\.${esc}\\b`, 'g'), `.${newKey}`);
      // And object keys without quotes: OldName: -> new_name:
      content = content.replace(new RegExp(`\\b${esc}:`, 'g'), `${newKey}:`);
    }
    
    // Object keys (like in FormData or simple mappings where it's just a string)
    // Actually, we shouldn't replace ALL string literals, but things like `e["Nama Lengkap"]` are caught by bracket notation.
    // What about `params.append("Nama Lengkap", ...)`?
    // We should replace exactly `"${oldKey}"` with `"${newKey}"` if we want to send it correctly to backend.
    content = content.replace(new RegExp(`"${esc}"`, 'g'), `"${newKey}"`);
  }
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
