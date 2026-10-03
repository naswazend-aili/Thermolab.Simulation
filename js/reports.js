/* ==========================================================================
   Automated Lab Report Generator & Excel/PDF Exporter
   ========================================================================== */

const experimentInfo = {
  carnot: {
    title: 'HUKUM II TERMODINAMIKA — SIKLUS CARNOT',
    purpose: 'Mempelajari prinsip kerja mesin kalor ideal Carnot, menghitung efisiensi termal berdasarkan perbedaan suhu reservoir (T_H dan T_C), serta menganalisis hubungan usaha mekanik dengan kalor yang diserap/dibuang.',
    theory: 'Efisiensi mesin Carnot dirumuskan dengan η = 1 - (T_C / T_H), di mana suhu harus dalam skala Kelvin mutlak. Kalor yang diserap Q_H diubah sebagian menjadi kerja W = η · Q_H dan sisanya dilepas sebagai Q_C = Q_H - W.'
  },
  calo: {
    title: 'HUKUM KE-0 & ASAS BLACK — KALORIMETRI',
    purpose: 'Menerapkan Asas Black untuk menentukan kalor jenis logam misterius dan mengukur suhu kesetimbangan termal campuran.',
    theory: 'Asas Black: Q_lepas = Q_terima. Logam panas melepaskan kalor m_m · c_m · (T_m - T_f) yang seluruhnya diserap oleh air dingin m_a · c_a · (T_f - T_a) hingga mencapai suhu kesetimbangan T_f.'
  },
  cond: {
    title: 'PERPINDAHAN KALOR — KONDUKSI',
    purpose: 'Membandingkan laju konduksi kalor pada berbagai jenis material batang padat (Tembaga, Besi, Kayu).',
    theory: 'Laju perpindahan kalor konduksi memenuhi persamaan P = (k · A · ΔT) / L. Semakin tinggi nilai konduktivitas termal k, semakin cepat kalor merambat ke ujung batang.'
  },
  furnace: {
    title: 'KALOR LATEN & PERUBAHAN WUJUD',
    purpose: 'Menganalisis kurva pemanasan benda dan mengamati kondisi suhu konstan (plateau) pada saat terjadi perubahan wujud zat.',
    theory: 'Kalor yang masuk selama perubahan wujud tidak menaikkan suhu (Q = m · L) melainkan digunakan untuk mengubah fase zat (kalor laten peleburan dan penguapan).'
  },
  wom: {
    title: 'ENERGI DALAM & TEORI KINETIK',
    purpose: 'Mengamati hubungan antara suhu zat dengan energi kinetik rata-rata dan susunan partikel pada fase padat, cair, dan gas.',
    theory: 'Berdasarkan teori kinetik, energi kinetik partikel berbanding lurus dengan suhu mutlak (<Ek> = 3/2 k_B T). Kenaikan suhu meningkatkan kebebasan dan kecepatan partikel.'
  },
  sl: {
    title: 'HUKUM I TERMODINAMIKA',
    purpose: 'Membuktikan hukum kekekalan energi pada gas ideal dengan membandingkan perubahan energi dalam ΔU dengan Q - W.',
    theory: 'Hukum I Termodinamika: ΔU = Q - W. Kalor yang diserap sistem digunakan untuk menambah energi dalam dan/atau melakukan usaha mekanik ke lingkungan.'
  }
};

function generateLabReport(){
  const expSelect = document.getElementById('reportExperimentSelect');
  const expId = expSelect ? expSelect.value : 'carnot';
  const info = experimentInfo[expId] || experimentInfo.carnot;

  const titleEl = document.getElementById('reportTitle');
  if(titleEl) titleEl.textContent = info.title;

  const dateEl = document.getElementById('reportDate');
  if(dateEl) dateEl.textContent = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const purposeEl = document.getElementById('reportPurpose');
  if(purposeEl) purposeEl.textContent = info.purpose;

  const hypoEl = document.getElementById('reportHypoText');
  const hypoVal = appState.hypotheses[expId];
  if(hypoEl){
    hypoEl.textContent = hypoVal ? `Pilihan Hipotesis Mahasiswa: Opsi (${hypoVal}) — Hipotesis telah tersimpan sebelum simulasi dimulai.` : 'Belum memilih hipotesis awal sebelum simulasi.';
  }

  // Render Data Table
  const tableContainer = document.getElementById('reportTableContainer');
  const expData = appState.experimentsData[expId];

  if(!tableContainer) return;

  if(!expData || (Array.isArray(expData) && !expData.length)){
    tableContainer.innerHTML = '<p style="color:#f43f5e; font-style:italic; padding:12px; background:#fff1f2; border-radius:8px;">⚠️ Belum ada data eksperimen yang dicatat untuk simulasi ini. Jalankan simulasi terlebih dahulu.</p>';
  } else if(Array.isArray(expData)){
    const keys = Object.keys(expData[0]);
    tableContainer.innerHTML = `
      <table style="width:100%; border-collapse:collapse; margin:10px 0;">
        <thead>
          <tr style="background:#f1f5f9;">
            ${keys.map(k => `<th style="border:1px solid #cbd5e1; padding:8px; text-transform:uppercase; font-size:12px;">${k}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${expData.map(row => `
            <tr>
              ${keys.map(k => `<td style="border:1px solid #cbd5e1; padding:8px; font-family:'IBM Plex Mono'; font-size:12.5px;">${row[k]}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } else if(typeof expData === 'object'){
    const keys = Object.keys(expData);
    tableContainer.innerHTML = `
      <table style="width:100%; border-collapse:collapse; margin:10px 0;">
        <thead>
          <tr style="background:#f1f5f9;">
            <th style="border:1px solid #cbd5e1; padding:8px; text-align:left;">Parameter</th>
            <th style="border:1px solid #cbd5e1; padding:8px; text-align:left;">Nilai Pengamatan</th>
          </tr>
        </thead>
        <tbody>
          ${keys.map(k => `
            <tr>
              <td style="border:1px solid #cbd5e1; padding:8px; font-weight:600;">${k}</td>
              <td style="border:1px solid #cbd5e1; padding:8px; font-family:'IBM Plex Mono'; font-size:12.5px;">${expData[k]}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  // Analysis & Conclusion
  const analysisInput = document.getElementById(expId + 'AnalysisText');
  const conclInput = document.getElementById(expId + 'ConclusionText');

  const reportAnalysis = document.getElementById('reportAnalysisText');
  if(reportAnalysis){
    reportAnalysis.textContent = (analysisInput && analysisInput.value.trim()) ? analysisInput.value.trim() : 'Data aktual simulasi menunjukkan konsistensi dengan teori termodinamika yang dipelajari.';
  }

  const reportConclusion = document.getElementById('reportConclusionText');
  if(reportConclusion){
    reportConclusion.textContent = (conclInput && conclInput.value.trim()) ? conclInput.value.trim() : `Praktikum ${info.title} telah berhasil diselesaikan dengan hasil pengukuran terverifikasi sesuai hukum fisika.`;
  }
}

/* ---- Deteksi: dibuka di dalam frame/pratinjau? (unduhan & cetak sering diblokir di sana) ---- */
function isEmbeddedFrame(){
  try { return window.self !== window.top; } catch(e){ return true; }
}
const EMBED_HINT = 'Kamu membuka ThermoLab di dalam frame/pratinjau, jadi unduhan & cetak bisa diblokir browser. Buka situsnya langsung di tab baru (alamat github.io) lalu coba lagi.';

function printLabReport(){
  generateLabReport();
  if(isEmbeddedFrame()) showToast(EMBED_HINT, 'error');
  else showToast('Di jendela cetak, pilih tujuan "Simpan sebagai PDF".', 'info');
  setTimeout(() => {
    try { window.print(); }
    catch(e){ showToast('Cetak diblokir browser. ' + EMBED_HINT, 'error'); }
  }, 150);
}

/* Simpan workbook: coba XLSX.writeFile, kalau gagal pakai Blob + link unduh manual */
function saveWorkbook(wb, filename){
  try {
    XLSX.writeFile(wb, filename);
  } catch(e){
    try {
      const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([out], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    } catch(e2){
      showToast('Gagal membuat file Excel. ' + (isEmbeddedFrame() ? EMBED_HINT : 'Coba muat ulang halaman.'), 'error');
      return false;
    }
  }
  if(isEmbeddedFrame()) showToast('Kalau file tidak terunduh: ' + EMBED_HINT, 'info');
  return true;
}

/* EXCEL EXPORTER (SheetJS) */
function exportExperimentExcel(expId){
  if(typeof XLSX === 'undefined'){
    showToast('Library Excel (XLSX) belum termuat. Cek koneksi internet lalu muat ulang halaman.', 'error');
    return;
  }
  const data = appState.experimentsData[expId];
  if(!data || (Array.isArray(data) && !data.length)){
    showToast('Belum ada data untuk di-export pada eksperimen ini.', 'error');
    return;
  }
  const info = experimentInfo[expId] || { title: expId };
  const val = id => (document.getElementById(id)?.value || '').trim() || '-';

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(Array.isArray(data) ? data : [data]), 'Data Simulasi');
  const summary = [
    { Bagian: 'Eksperimen', Isi: info.title },
    { Bagian: 'Tanggal', Isi: new Date().toLocaleDateString('id-ID') },
    { Bagian: 'Hipotesis awal', Isi: appState.hypotheses[expId] ? 'Opsi ' + appState.hypotheses[expId] : '-' },
    { Bagian: 'Analisis', Isi: val(expId + 'AnalysisText') },
    { Bagian: 'Kesimpulan', Isi: val(expId + 'ConclusionText') }
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summary), 'Ringkasan Laporan');

  if(saveWorkbook(wb, `ThermoLab_${expId.toUpperCase()}_Report.xlsx`)){
    showToast('File Excel dibuat!', 'success');
    if(typeof SFX !== 'undefined') SFX.success();
  }
}

function exportSelectedReportExcel(){
  const expSelect = document.getElementById('reportExperimentSelect');
  exportExperimentExcel(expSelect ? expSelect.value : 'carnot');
}

function exportAllExcel(){
  if(typeof XLSX === 'undefined'){
    showToast('Library Excel (XLSX) belum termuat. Cek koneksi internet lalu muat ulang halaman.', 'error');
    return;
  }
  const wb = XLSX.utils.book_new();
  let hasData = false;
  Object.keys(appState.experimentsData).forEach(exp => {
    const d = appState.experimentsData[exp];
    if(d && (Array.isArray(d) ? d.length : true)){
      hasData = true;
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(Array.isArray(d) ? d : [d]), exp.toUpperCase());
    }
  });
  if(!hasData){ showToast('Belum ada data eksperimen untuk di-export.', 'error'); return; }
  if(saveWorkbook(wb, 'ThermoLab_Full_Experiment_Data.xlsx')){
    showToast('Semua data berhasil di-export ke Excel!', 'success');
    if(typeof SFX !== 'undefined') SFX.success();
  }
}
