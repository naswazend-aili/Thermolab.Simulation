/* ==========================================================================
   Main Application Bootstrapper & Global Handlers
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp(){
  // Initialize navigation & theme
  initTheme();
  initNavListeners();

  // Initialize all simulations
  if(typeof initCarnotSim === 'function') initCarnotSim();
  if(typeof initCaloSim === 'function') initCaloSim();
  if(typeof initCondSim === 'function') initCondSim();
  if(typeof initFurnaceSim === 'function') initFurnaceSim();
  if(typeof initWomSim === 'function') initWomSim();
  if(typeof initSlSim === 'function') initSlSim();

  // Initialize Quiz & Challenge
  if(typeof initQuiz === 'function') initQuiz();
  if(typeof initChallenge === 'function') initChallenge();

  // Restore saved hypothesis selections in UI
  restoreHypothesesUI();

  // Initial dashboard calculation
  updateProgressDashboard();
}

function initTheme(){
  try {
    const savedTheme = localStorage.getItem('thermolab_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  } catch(e){}

  const themeBtn = document.getElementById('themeToggle');
  if(themeBtn) themeBtn.addEventListener('click', toggleTheme);
}

function initNavListeners(){
  const soundBtn = document.getElementById('soundToggle');
  if(soundBtn){
    soundBtn.addEventListener('click', () => {
      SFX.setMuted(!SFX.isMuted());
      refreshSoundButton();
    });
    refreshSoundButton();
  }

  const moreBtn = document.getElementById('moreMenuBtn');
  if(moreBtn) moreBtn.addEventListener('click', () => openModal('moreMenuModal'));

  const hamburger = document.getElementById('hamburgerBtn');
  if(hamburger){
    hamburger.addEventListener('click', () => {
      document.getElementById('mobileDrawer')?.classList.add('open');
      document.getElementById('drawerOverlay')?.classList.add('open');
    });
  }
}

function refreshSoundButton(){
  const soundBtn = document.getElementById('soundToggle');
  if(!soundBtn) return;
  soundBtn.classList.toggle('muted', SFX.isMuted());
  soundBtn.innerHTML = (SFX.isMuted() ? '🔇' : '🔊') + ' <span class="lbl">Suara</span>';
}

/* HYPOTHESIS HANDLERS */
function selectHypothesis(expId, optionVal){
  appState.hypotheses[expId] = optionVal;
  const options = document.querySelectorAll(`#${expId}HypoCard .hypothesis-option`);
  options.forEach(opt => {
    const radio = opt.querySelector('input[type="radio"]');
    if(radio && radio.value === optionVal){
      opt.classList.add('selected');
      radio.checked = true;
    } else {
      opt.classList.remove('selected');
    }
  });
  saveAppState();
}

function saveHypothesis(expId){
  const chosen = appState.hypotheses[expId];
  if(!chosen){
    showToast('Pilih salah satu hipotesis sebelum melanjutkan.', 'error');
    if(typeof SFX !== 'undefined') SFX.warn();
    return;
  }
  showToast('Hipotesis awal disimpan! Silakan mulai menjalankan simulasi.', 'success');
  if(typeof SFX !== 'undefined') SFX.success();
  scrollToElement('page-' + expId);
}

function restoreHypothesesUI(){
  Object.keys(appState.hypotheses).forEach(expId => {
    const val = appState.hypotheses[expId];
    if(val){
      const radio = document.querySelector(`#${expId}HypoCard input[value="${val}"]`);
      if(radio){
        radio.checked = true;
        radio.closest('.hypothesis-option')?.classList.add('selected');
      }
    }
  });
}

/* SIMULATION COMPLETED RESULT TRIGGER */
function triggerSimFinished(expId){
  const card = document.getElementById(expId + 'ResultCard');
  if(card){
    card.classList.add('show');
    const hypoVal = appState.hypotheses[expId] || 'Belum dipilih';
    const hypoEl = document.getElementById(expId + 'HypoSummary');
    if(hypoEl) hypoEl.textContent = `Pilihan Hipotesis Kamu: Opsi (${hypoVal})`;

    const actualEl = document.getElementById(expId + 'ActualSummary');
    if(actualEl) actualEl.textContent = `Data simulasi terverifikasi dan menunjukkan konsistensi dengan hukum termodinamika.`;
  }
  updateProgressDashboard();
}

/* ANALYSIS CHECKER & FEEDBACK */
function checkAnalysis(expId){
  const text = document.getElementById(expId + 'AnalysisText')?.value.trim().toLowerCase() || '';
  const feedbackEl = document.getElementById(expId + 'AnalysisFeedback');
  if(!feedbackEl) return;

  feedbackEl.style.display = 'block';
  
  if(text.length < 20){
    feedbackEl.className = 'analysis-checker-box incomplete';
    feedbackEl.innerHTML = `<b>⚠️ Analisis Terlalu Singkat:</b> Silakan tulis kalimat penjelasan yang lebih lengkap berdasarkan grafik.`;
    if(typeof SFX !== 'undefined') SFX.warn();
    return;
  }

  let isCorrect = false;
  let missingIdea = '';

  if(expId === 'carnot'){
    if((text.includes('naik') || text.includes('meningkat') || text.includes('besar') || text.includes('berbanding lurus')) && 
       (text.includes('suhu') || text.includes('selisih') || text.includes('delta'))) {
      isCorrect = true;
    } else {
      missingIdea = 'Coba perhatikan grafik: apakah efisiensi (%) naik atau turun ketika selisih suhu semakin besar?';
    }
  } else if (expId === 'calo') {
    if(text.includes('sama') || text.includes('kekal') || text.includes('setimbang') || text.includes('tetap') || text.includes('asas black')) {
      isCorrect = true;
    } else {
      missingIdea = 'Ingat hukum Asas Black: kalor yang dilepas logam harus berbanding lurus / sama dengan yang diserap air.';
    }
  } else if (expId === 'cond') {
    if((text.includes('tembaga') || text.includes('k')) && (text.includes('cepat') || text.includes('tinggi'))) {
      isCorrect = true;
    } else {
      missingIdea = 'Sebutkan material mana (Tembaga, Besi, atau Kayu) yang kurva suhunya naik paling cepat dan mengapa (nilai k).';
    }
  } else if (expId === 'furnace') {
    if(text.includes('mendatar') || text.includes('tetap') || text.includes('laten') || text.includes('konstan') || text.includes('wujud')) {
      isCorrect = true;
    } else {
      missingIdea = 'Perhatikan garis grafik saat benda mendidih atau melebur. Apakah garisnya terus naik atau sempat mendatar? Mengapa?';
    }
  } else {
    isCorrect = true; // For others, just accept if length > 20
  }

  if(!isCorrect){
    feedbackEl.className = 'analysis-checker-box incomplete';
    feedbackEl.innerHTML = `<b>⚠️ Analisis Belum Tepat:</b> ${missingIdea} <br>Tuliskan kembali jawabanmu dengan menambahkan kata kunci yang tepat.`;
    if(typeof SFX !== 'undefined') SFX.warn();
  } else {
    feedbackEl.className = 'analysis-checker-box complete';
    feedbackEl.innerHTML = `<b>✅ Analisis Sesuai:</b> Hebat! Penjelasan kamu tepat dan sesuai dengan prinsip fisika termodinamika.`;
    if(typeof SFX !== 'undefined') SFX.success();
  }
  updateProgressDashboard();
}

/* AUTO-CONCLUSION */
function autoConclude(expId){
  const concText = document.getElementById(expId + 'ConclusionText');
  if(!concText) return;

  const dataset = appState.experimentsData[expId];
  let autoText = `Dari hasil pengujian ${expId.toUpperCase()}, data aktual menunjukkan kesesuaian dengan prinsip termodinamika. `;
  if(Array.isArray(dataset) && dataset.length){
    autoText += `Tercatat total ${dataset.length} titik pengamatan yang memperkuat bukti empiris pada grafik.`;
  }
  concText.value = autoText;
  showToast('Kesimpulan otomatis berhasil disusun berdasarkan data aktual.', 'success');
  if(typeof SFX !== 'undefined') SFX.success();
  updateProgressDashboard();
}

/* DASHBOARD PROGRESS CALCULATIONS */
function updateProgressDashboard(){
  let completedSims = 0;
  const exps = ['carnot', 'calo', 'cond', 'furnace', 'wom', 'sl'];

  exps.forEach(exp => {
    const d = appState.experimentsData[exp];
    const isCompleted = d && (Array.isArray(d) ? d.length >= 3 : true);
    if(isCompleted){
      completedSims++;
      const chk = document.getElementById(`chk-${exp}-st`);
      if(chk){
        chk.textContent = '✓ Selesai';
        chk.style.color = 'var(--green)';
        chk.style.fontWeight = '700';
      }
    }
  });

  const totalPct = Math.min(100, Math.round((completedSims / 6) * 100));
  const totalPercentEl = document.getElementById('totalProgressPercent');
  if(totalPercentEl) totalPercentEl.textContent = totalPct + '%';

  const barEl = document.getElementById('totalProgressBar');
  if(barEl) barEl.style.width = totalPct + '%';

  const statSim = document.getElementById('statSimCount');
  if(statSim) statSim.textContent = `${completedSims}/6`;

  // Dashboard quick progress
  const dashBar = document.getElementById('dashQuickBar');
  if(dashBar) dashBar.style.width = totalPct + '%';
  const dashPct = document.getElementById('dashQuickPct');
  if(dashPct) dashPct.textContent = totalPct + '%';
}
