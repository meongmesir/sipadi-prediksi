// ─── Pemetaan Provinsi → Koordinat Geografis ──────────────────────────────
// Diambil langsung dari dataset training DSSAT (38 provinsi).
// Model XGBoost memakai latitude, longitude, elevation_m sebagai fitur.

export const provinsiGeo: Record<string, { lat: number; lon: number; elev: number }> = {
  "Aceh":                 { lat:  5.5483, lon:  95.3238, elev:   38 },
  "Sumatera Utara":       { lat:  3.5952, lon:  98.6722, elev:   22 },
  "Sumatera Barat":       { lat: -0.9471, lon: 100.4172, elev:  866 },
  "Riau":                 { lat:  0.5071, lon: 101.4478, elev:   10 },
  "Jambi":                { lat: -1.6101, lon: 103.6131, elev:   25 },
  "Sumatera Selatan":     { lat: -2.9909, lon: 104.7562, elev:   27 },
  "Bengkulu":             { lat: -3.7928, lon: 102.2608, elev:    5 },
  "Lampung":              { lat: -5.4295, lon: 105.2613, elev:   84 },
  "Bangka Belitung":      { lat: -2.1316, lon: 106.1169, elev:   10 },
  "Kepulauan Riau":       { lat:  0.9168, lon: 104.4554, elev:   10 },
  "DKI Jakarta":          { lat: -6.2088, lon: 106.8456, elev:    8 },
  "Jawa Barat":           { lat: -6.9147, lon: 107.6098, elev:  768 },
  "Jawa Tengah":          { lat: -7.1510, lon: 110.1403, elev:  105 },
  "DI Yogyakarta":        { lat: -7.7956, lon: 110.3695, elev:  113 },
  "Jawa Timur":           { lat: -7.5361, lon: 112.2384, elev:   50 },
  "Banten":               { lat: -6.1702, lon: 106.1503, elev:   20 },
  "Bali":                 { lat: -8.4095, lon: 115.1889, elev:  200 },
  "Nusa Tenggara Barat":  { lat: -8.6529, lon: 117.3616, elev:   50 },
  "Nusa Tenggara Timur":  { lat: -8.6574, lon: 121.0794, elev:  100 },
  "Kalimantan Barat":     { lat: -0.0236, lon: 109.3425, elev:   15 },
  "Kalimantan Tengah":    { lat: -1.6815, lon: 113.3824, elev:   20 },
  "Kalimantan Selatan":   { lat: -3.3194, lon: 114.5908, elev:   20 },
  "Kalimantan Timur":     { lat:  0.5387, lon: 116.4194, elev:   10 },
  "Kalimantan Utara":     { lat:  3.0731, lon: 116.0414, elev:   20 },
  "Sulawesi Utara":       { lat:  1.4931, lon: 124.8413, elev:   20 },
  "Sulawesi Tengah":      { lat: -0.8917, lon: 119.8707, elev:   50 },
  "Sulawesi Selatan":     { lat: -5.1477, lon: 119.4327, elev:   10 },
  "Sulawesi Tenggara":    { lat: -3.9985, lon: 122.5129, elev:   20 },
  "Gorontalo":            { lat:  0.5435, lon: 123.0568, elev:   20 },
  "Sulawesi Barat":       { lat: -2.8441, lon: 119.2321, elev:   20 },
  "Maluku":               { lat: -3.6954, lon: 128.1814, elev:   10 },
  "Maluku Utara":         { lat:  0.7893, lon: 127.5801, elev:   10 },
  "Papua Barat":          { lat: -1.3361, lon: 133.1747, elev:   10 },
  "Papua Barat Daya":     { lat: -0.8615, lon: 131.2560, elev:   10 },
  "Papua":                { lat: -2.5337, lon: 140.7181, elev:   10 },
  "Papua Pegunungan":     { lat: -4.0000, lon: 138.5000, elev: 1550 },
  "Papua Selatan":        { lat: -8.0000, lon: 140.0000, elev:   10 },
  "Papua Tengah":         { lat: -4.0000, lon: 136.0000, elev:  100 },
};

// Daftar nama provinsi (terurut, untuk dropdown)
export const provinsiList = Object.keys(provinsiGeo).sort();

// ─── Kultivar (3 varietas sesuai dataset DSSAT) ────────────────────────────

export const cultivarList = [
  { value: "IR_72", label: "IR 72", desc: "Varietas unggul baru, potensi hasil tertinggi dalam simulasi DSSAT" },
  { value: "IR_64", label: "IR 64", desc: "Varietas klasik yang populer dan adaptif di berbagai kondisi lahan" },
  { value: "IR_36", label: "IR 36", desc: "Varietas tahan wereng coklat, cocok untuk lahan rawan hama" },
];

// ─── Waktu Tanam / Sowing DOY (7 nilai diskrit sesuai dataset) ─────────────
// DOY = Day of Year. Contoh: DOY 121 = 1 Mei, DOY 219 = 7 Agustus.

export const sowingDoyList = [
  { doy: 121, label: "Awal Mei",            sub: "DOY 121 · ±1 Mei" },
  { doy: 135, label: "Pertengahan Mei",     sub: "DOY 135 · ±15 Mei" },
  { doy: 154, label: "Awal Juni",           sub: "DOY 154 · ±3 Juni" },
  { doy: 170, label: "Pertengahan Juni",    sub: "DOY 170 · ±19 Juni" },
  { doy: 187, label: "Awal Juli",           sub: "DOY 187 · ±6 Juli" },
  { doy: 202, label: "Pertengahan Juli",    sub: "DOY 202 · ±21 Juli" },
  { doy: 219, label: "Awal Agustus",        sub: "DOY 219 · ±7 Agustus" },
];

// ─── Populasi Tanaman (6 nilai sesuai dataset) ────────────────────────────

export const plantPopList = [
  { value: 15, label: "15 tanaman/m²", desc: "Sangat renggang — lahan kering atau tadah hujan" },
  { value: 20, label: "20 tanaman/m²", desc: "Renggang — jarak tanam lebar" },
  { value: 25, label: "25 tanaman/m²", desc: "Standar Kementan — tegel 20×20 cm" },
  { value: 30, label: "30 tanaman/m²", desc: "Sedang — tegel 18×18 cm" },
  { value: 35, label: "35 tanaman/m²", desc: "Rapat — jajar legowo modifikasi" },
  { value: 40, label: "40 tanaman/m²", desc: "Sangat rapat — jajar legowo 2:1" },
];

// ─── Total Nitrogen (range sesuai dataset: 0–200, step 25) ─────────────────

export const nTotalRange = { min: 0, max: 200, step: 25 };

// ─── Kode Irigasi / Water Code (2 opsi sesuai dataset) ─────────────────────

export const waterCodeList = [
  {
    value: "A",
    label: "Irigasi Otomatis",
    desc: "Air irigasi dari saluran resmi, ketersediaan air terjamin sepanjang musim",
    emoji: "💧",
  },
  {
    value: "N",
    label: "Tadah Hujan",
    desc: "Tidak ada irigasi, sepenuhnya bergantung pada curah hujan alami",
    emoji: "🌧️",
  },
];

// ─── Konfigurasi tampilan kategori hasil ────────────────────────────────────

export const kategoriCfg = {
  "Sangat Baik": {
    emoji: "🏆", color: "text-green-700", bg: "bg-green-100", border: "border-green-300",
    badgeBg: "bg-green-700", barColor: "#15803d", badgeClass: "bg-green-100 text-green-700 border-green-200",
    desc: "Kondisi sangat mendukung panen optimal!",
  },
  "Baik": {
    emoji: "✅", color: "text-blue-700", bg: "bg-blue-100", border: "border-blue-300",
    badgeBg: "bg-blue-700", barColor: "#1d4ed8", badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
    desc: "Kondisi baik. Perawatan rutin akan memaksimalkan hasil.",
  },
  "Cukup": {
    emoji: "⚠️", color: "text-amber-700", bg: "bg-amber-100", border: "border-amber-300",
    badgeBg: "bg-amber-600", barColor: "#b45309", badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
    desc: "Ada beberapa hal yang bisa diperbaiki untuk meningkatkan hasil.",
  },
  "Perlu Perhatian": {
    emoji: "🔴", color: "text-red-700", bg: "bg-red-100", border: "border-red-300",
    badgeBg: "bg-red-700", barColor: "#b91c1c", badgeClass: "bg-red-100 text-red-700 border-red-200",
    desc: "Kondisi perlu perbaikan. Ikuti rekomendasi di bawah.",
  },
};

// ─── Statistik dataset training (untuk referensi di UI) ────────────────────

export const datasetStats = {
  meanYield: 4207,      // kg/ha
  maxYield: 13083,       // kg/ha
  minYield: 1,           // kg/ha
  totalRows: 85266,
};
