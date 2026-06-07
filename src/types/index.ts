// ─── Struktur data input pengguna ────────────────────────────────────────────
// Setiap field di sini memetakan langsung ke fitur model XGBoost.

export interface DataLahan {
  namaLahan: string;       // Label opsional (bukan fitur model)
  provinsi: string;        // → lat, lon, elevation_m (via lookup tabel)
  luasLahan: string;       // Untuk kalkulasi total hasil (bukan fitur model)
  cultivarName: string;    // → cultivar_name: "IR_72" | "IR_64" | "IR_36"
  sowingDoy: number;       // → sowing_doy: 121|135|154|170|187|202|219
  nTotalKgHa: number;      // → n_total_kg_ha: 0–200 (step 25)
  plantPop: number;        // → plant_pop: 15|20|25|30|35|40
  waterCode: string;       // → water_code: "A" (Irigasi) | "N" (Tadah Hujan)
}

// ─── Struktur hasil prediksi ─────────────────────────────────────────────────
// Output utama model: yield_hwam dalam kg/ha.

export interface HasilType {
  data: DataLahan;
  yieldKgHa: number;                 // Prediksi yield (kg/ha) — output utama model
  yieldTonHa: number;                // yieldKgHa / 1000 (untuk tampilan)
  totalProduksiKg: number;            // yieldKgHa × luasLahan
  rataRataNasionalKgHa: number;       // Rata-rata nasional dari dataset (≈4.207 kg/ha)
  selisihPersen: number;              // % di atas/bawah rata-rata
  kategori: "Sangat Baik" | "Baik" | "Cukup" | "Perlu Perhatian";
  persentasePotensi: number;          // % terhadap max yield dataset (13.083 kg/ha)
  catatanRisiko: string[];
  rekomendasi: string[];
}

// ─── Struktur data pengguna ──────────────────────────────────────────────────

export interface UserType {
  namaLengkap: string;
  email: string;
  noHP?: string;
  provinsi: string;
  role?: "petani" | "admin" | "superadmin";
}
