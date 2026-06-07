import type { DataLahan, HasilType } from "../types";
import { fetchWithAuth } from "./api";

/**
 * hitungPrediksi memanggil endpoint backend FastAPI /api/predict
 */
export async function hitungPrediksi(data: DataLahan): Promise<HasilType> {
  const payload = {
    nama_lahan: data.namaLahan,
    provinsi: data.provinsi,
    luas_lahan_ha: parseFloat(data.luasLahan) || 1.0,
    cultivar_name: data.cultivarName,
    sowing_doy: data.sowingDoy,
    n_total_kg_ha: data.nTotalKgHa,
    plant_pop: data.plantPop,
    water_code: data.waterCode
  };

  const response = await fetchWithAuth("/predict", {
    method: "POST",
    body: JSON.stringify(payload)
  });

  // Map response backend (snake_case) ke HasilType frontend (camelCase)
  return {
    data,
    yieldKgHa: response.yield_kg_ha,
    yieldTonHa: response.yield_kg_ha / 1000,
    totalProduksiKg: response.yield_kg_ha * (parseFloat(data.luasLahan) || 1.0),
    rataRataNasionalKgHa: 4207, // bisa ditarik dari /api/admin/dashboard/stats jika perlu
    selisihPersen: parseFloat((((response.yield_kg_ha - 4207) / 4207) * 100).toFixed(1)),
    kategori: response.kategori,
    persentasePotensi: Math.min(100, Math.round((response.yield_kg_ha / 13083) * 100)),
    catatanRisiko: response.catatan_risiko,
    rekomendasi: response.rekomendasi,
  };
}

/**
 * getRiwayatPrediksi mengambil histori dari backend
 */
export async function getRiwayatPrediksi(page = 1, limit = 10) {
  const response = await fetchWithAuth(`/predict/history?page=${page}&limit=${limit}`);
  return response;
}
