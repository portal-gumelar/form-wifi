const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/Modals.tsx', 'utf8');

const map = {
  '"Timestamp"': '"timestamp"',
  '"NIK"': '"nik"',
  '"Nama Lengkap"': '"nama_lengkap"',
  '"No HP / WA"': '"no_hp_wa"',
  '"Alamat Pemasangan"': '"alamat_pemasangan"',
  '"Kecamatan"': '"kecamatan"',
  '"Desa"': '"desa"',
  '"RW"': '"rw"',
  '"RT"': '"rt"',
  '"Paket"': '"paket"',
  '"Provider Saat Ini"': '"provider_saat_ini"',
  '"Sumber Info"': '"sumber_info"',
  '"Link Google Maps"': '"link_google_maps"',
  '"Foto KTP"': '"foto_ktp"',
  '"Persetujuan S&K"': '"persetujuan_sk"',
  '"Catatan"': '"catatan"',
  '"Tanggal Aktif"': '"tanggal_aktif"',
  '"Tanggal Rencana Pasang"': '"tanggal_rencana_pasang"',
  '"Waktu Survei"': '"waktu_survei"'
};

for (const [k, v] of Object.entries(map)) {
  content = content.split(k).join(v);
}
fs.writeFileSync('src/components/dashboard/Modals.tsx', content);

let table = fs.readFileSync('src/components/dashboard/RegistrationTable.tsx', 'utf8');
for (const [k, v] of Object.entries(map)) {
  table = table.split(k).join(v);
}
fs.writeFileSync('src/components/dashboard/RegistrationTable.tsx', table);

let dash = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');
dash = dash.split('Timestamp:').join('timestamp:');
dash = dash.split('NIK:').join('nik:');
dash = dash.split('Paket:').join('paket:');
dash = dash.split('Kecamatan:').join('kecamatan:');
dash = dash.split('Desa:').join('desa:');
for (const [k, v] of Object.entries(map)) {
  dash = dash.split(k).join(v);
}
fs.writeFileSync('src/pages/Dashboard.tsx', dash);
