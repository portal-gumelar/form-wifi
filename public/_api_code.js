
const GAS_API_URL = "https://script.google.com/macros/s/AKfycbysJJibkHgTnACVYXaYCwG1R4JnnQHuxe8tmvEuHWqLjJ0s0bN1DtQuc5_9uv9gOw6EEw/exec";

function mapAPIData(apiData) {
  return apiData.map(function(r, i) {
    return {
      id: i + 1,
      timestamp: r["Timestamp"] || "",
      provider: r["Provider Saat Ini"] || "",
      nama: r["Nama Lengkap"] || "",
      alamat: r["Alamat Pemasangan"] || "",
      hp: String(r["No HP / WA"] || ""),
      paket: r["Paket"] || "",
      tanggal: r["Tanggal Rencana Pasang"] ? r["Tanggal Rencana Pasang"].split("T")[0] : "",
      maps: (r["Bisa Google Maps"] || "").includes("Ya") ? "Ya" : "Tidak",
      link: r["Link Google Maps"] || "",
      survei: r["Waktu Survei"] || "",
      prioritas: r["Prioritas"] || "",
      sumber: r["Sumber Info"] || ""
    };
  });
}

async function loadFromAPI() {
  try {
    var res = await fetch(GAS_API_URL);
    var json = await res.json();
    if (Array.isArray(json) && json.length > 0) {
      allData = mapAPIData(json);
      saveData();
      renderTable();
      renderDashboard();
      populateFilters();
      showToast("Data berhasil dimuat dari Google Sheets! (" + allData.length + " record)", "success");
    }
  } catch(e) {
    console.error("API fetch error:", e);
    showToast("Gagal memuat data API, menggunakan data lokal.", "error");
  }
}
