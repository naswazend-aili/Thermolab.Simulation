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

loadAppState();
