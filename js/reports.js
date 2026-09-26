/* ==========================================================================
   Automated Lab Report Generator & Excel/PDF Exporter
   ========================================================================== */

const experimentInfo = {
  carnot: {
    title: 'MESIN KALOR CARNOT',
    purpose: 'Mempelajari prinsip kerja mesin kalor ideal Carnot, menghitung efisiensi termal berdasarkan perbedaan suhu reservoir (T_H dan T_C), serta menganalisis hubungan usaha mekanik dengan kalor yang diserap/dibuang.',
    theory: 'Efisiensi mesin Carnot dirumuskan dengan η = 1 - (T_C / T_H), di mana suhu harus dalam skala Kelvin mutlak. Kalor yang diserap Q_H diubah sebagian menjadi kerja W = η · Q_H dan sisanya dilepas sebagai Q_C = Q_H - W.'
  },
  calo: {
    title: 'KALORIMETRI & ASAS BLACK',
    purpose: 'Menerapkan Asas Black untuk menentukan kalor jenis logam misterius dan mengukur suhu kesetimbangan termal campuran.',
    theory: 'Asas Black: Q_lepas = Q_terima. Logam panas melepaskan kalor m_m · c_m · (T_m - T_f) yang seluruhnya diserap oleh air dingin m_a · c_a · (T_f - T_a) hingga mencapai suhu kesetimbangan T_f.'
  },
  cond: {
    title: 'KONDUKSI KALOR',
    purpose: 'Membandingkan laju konduksi kalor pada berbagai jenis material batang padat (Tembaga, Besi, Kayu).',
    theory: 'Laju perpindahan kalor konduksi memenuhi persamaan P = (k · A · ΔT) / L. Semakin tinggi nilai konduktivitas termal k, semakin cepat kalor merambat ke ujung batang.'
  },
  furnace: {
    title: 'TUNGKU PELEBURAN & KALOR LATEN',
    purpose: 'Menganalisis kurva pemanasan benda dan mengamati kondisi suhu konstan (plateau) pada saat terjadi perubahan wujud zat.',
    theory: 'Kalor yang masuk selama perubahan wujud tidak menaikkan suhu (Q = m · L) melainkan digunakan untuk mengubah fase zat (kalor laten peleburan dan penguapan).'
  },
  wom: {
    title: 'SIMULASI WUJUD ZAT & TEORI KINETIK',
    purpose: 'Mengamati hubungan antara suhu zat dengan energi kinetik rata-rata dan susunan partikel pada fase padat, cair, dan gas.',
    theory: 'Berdasarkan teori kinetik, energi kinetik partikel berbanding lurus dengan suhu mutlak (<Ek> = 3/2 k_B T). Kenaikan suhu meningkatkan kebebasan dan kecepatan partikel.'
  },
  sl: {
    title: 'SISTEM & HUKUM I TERMODINAMIKA',
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

function printLabReport(){
  window.print();
}

/* EXCEL EXPORTER (SheetJS) */
function exportExperimentExcel(expId){
  if(typeof XLSX === 'undefined'){
    showToast('Library XLSX belum termuat.', 'error');
    return;
  }

  const data = appState.experimentsData[expId];
  if(!data || (Array.isArray(data) && !data.length)){
    showToast('Belum ada data untuk di-export pada eksperimen ini.', 'error');
    return;
  }

  const wb = XLSX.utils.book_new();
  const wsData = XLSX.utils.json_to_sheet(Array.isArray(data) ? data : [data]);
  XLSX.utils.book_append_sheet(wb, wsData, "Data Simulasi");

  // Summary sheet
  const summary = [
    { Key: "Eksperimen", Value: experimentInfo[expId]?.title || expId },
    { Key: "Hipotesis", Value: appState.hypotheses[expId] || "-" },
    { Key: "Tanggal", Value: new Date().toISOString() }
  ];
  const wsSummary = XLSX.utils.json_to_sheet(summary);
  XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan Laporan");

  XLSX.writeFile(wb, `ThermoLab_${expId.toUpperCase()}_Report.xlsx`);
  showToast('File Excel berhasil di-unduh!', 'success');
  if(typeof SFX !== 'undefined') SFX.success();
}

function exportSelectedReportExcel(){
  const expSelect = document.getElementById('reportExperimentSelect');
  const expId = expSelect ? expSelect.value : 'carnot';
  exportExperimentExcel(expId);
}

function exportAllExcel(){
  if(typeof XLSX === 'undefined') return;
  const wb = XLSX.utils.book_new();
  let hasData = false;

  Object.keys(appState.experimentsData).forEach(exp => {
    const d = appState.experimentsData[exp];
    if(d && (Array.isArray(d) ? d.length : true)){
      hasData = true;
      const ws = XLSX.utils.json_to_sheet(Array.isArray(d) ? d : [d]);
      XLSX.utils.book_append_sheet(wb, ws, exp.toUpperCase());
    }
  });

  if(!hasData){
    showToast('Belum ada data eksperimen untuk di-export.', 'error');
    return;
  }

  XLSX.writeFile(wb, `ThermoLab_Full_Experiment_Data.xlsx`);
  showToast('Semua data berhasil di-export ke Excel!', 'success');
  if(typeof SFX !== 'undefined') SFX.success();
}
