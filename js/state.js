/* ==========================================================================
   State & Storage Manager
   ========================================================================== */
const appStateKey = 'thermolab_app_state_v25';

let appState = {
  hypotheses: {},
  experimentsData: {
    carnot: [],
    calo: null,
    cond: [],
    furnace: [],
    wom: [],
    sl: []
  },
  quiz: {},
  materiRead: {}
};

function loadAppState(){
  try {
    const saved = localStorage.getItem(appStateKey);
    if(saved) {
      const parsed = JSON.parse(saved);
      appState = { ...appState, ...parsed };
    }
  } catch(e){
    console.error('Gagal memuat appState:', e);
  }
}

function saveAppState(){
  try {
    localStorage.setItem(appStateKey, JSON.stringify(appState));
  } catch(e){
    console.error('Gagal menyimpan appState:', e);
  }
  if(typeof updateProgressDashboard === 'function') updateProgressDashboard();
}

function resetAllProgress(){
  appState = {
    hypotheses: {},
    experimentsData: { carnot: [], calo: null, cond: [], furnace: [], wom: [], sl: [] },
    quiz: {},
    materiRead: {}
  };
  saveAppState();
}

/* Dipanggil dari tombol "Reset Semua Progress Pembelajaran" di menu (☰).
   Minta konfirmasi dulu karena ini aksi permanen & tidak bisa dibatalkan,
   lalu reload halaman supaya SEMUA tampilan (grafik, tabel data, jawaban
   kuis, hipotesis, status Challenge, dll) benar-benar bersih dari awal —
   bukan cuma data di balik layar yang kehapus tapi layarnya masih nampilin yang lama. */
function resetAllProgressWithConfirm(){
  const sure = confirm('Yakin mau reset SEMUA progress pembelajaran?\n\nSemua hipotesis, data simulasi, jawaban kuis, dan laporan yang sudah dibuat akan terhapus permanen dan tidak bisa dikembalikan lagi.');
  if(!sure) return;
  resetAllProgress();
  if(typeof showToast === 'function') showToast('Semua progress berhasil direset. Memuat ulang halaman...', 'success');
  setTimeout(() => location.reload(), 600);
}

loadAppState();
