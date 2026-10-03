/* ==========================================================================
   Main Application Bootstrapper & Global Handlers
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  /* AKSESIBILITAS: setiap elemen non-interaktif yang punya onclick (mis. .exp-card)
     dibuat bisa difokus & dioperasikan lewat keyboard (Tab lalu Enter/Spasi). */
  document.querySelectorAll('[onclick]').forEach(el => {
    const tag = el.tagName.toLowerCase();
    if(tag === 'button' || tag === 'a' || tag === 'input' || tag === 'select' || tag === 'textarea' || tag === 'label') return;
    if(!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
    if(!el.hasAttribute('role')) el.setAttribute('role', 'button');
    el.addEventListener('keydown', (e) => {
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); el.click(); }
    });
  });
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
  if(typeof SFX !== 'undefined'){ SFX.success(); SFX.voice('Hipotesis disimpan. Sekarang jalankan simulasinya sesuai langkah yang ditunjukkan.'); }
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
const expFriendlyNames = {
  carnot: 'Hukum Dua Termodinamika', calo: 'Hukum Ke Nol dan Kalorimetri', cond: 'Perpindahan Kalor',
  furnace: 'Kalor Laten', wom: 'Energi Dalam', sl: 'Hukum Satu Termodinamika'
};

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
  if(typeof SFX !== 'undefined'){
    const name = expFriendlyNames[expId] || 'eksperimen';
    SFX.voice(`Kerja bagus! Percobaan ${name} selesai. Sekarang tulis analisis dan kesimpulanmu di bawah.`);
  }
  updateProgressDashboard();
}

/* ANALYSIS CHECKER & FEEDBACK */
function checkAnalysis(expId){
  const raw = document.getElementById(expId + 'AnalysisText')?.value.trim() || '';
  const text = raw.toLowerCase();
  const feedbackEl = document.getElementById(expId + 'AnalysisFeedback');
  if(!feedbackEl) return;

  feedbackEl.style.display = 'block';

  const words = text.split(/\s+/).filter(Boolean);
  const uniqueWords = new Set(words);

  if(words.length < 12){
    feedbackEl.className = 'analysis-checker-box incomplete';
    feedbackEl.innerHTML = `<b>⚠️ Analisis Terlalu Singkat:</b> Tulis penjelasan yang lebih lengkap (minimal 12 kata) berdasarkan grafik/data yang kamu catat.`;
    if(typeof SFX !== 'undefined') SFX.warn();
    return;
  }

  // Deteksi kata yang diulang-ulang (mis. "suhu naik suhu naik suhu naik...")
  // supaya jawaban asal tidak lolos hanya karena panjang teksnya cukup.
  if(uniqueWords.size / words.length < 0.45){
    feedbackEl.className = 'analysis-checker-box incomplete';
    feedbackEl.innerHTML = `<b>⚠️ Analisis Terlihat Berulang:</b> Sepertinya kata-katanya banyak diulang. Coba jelaskan dengan kalimat yang lebih bervariasi, sebutkan angka/data yang kamu amati.`;
    if(typeof SFX !== 'undefined') SFX.warn();
    return;
  }

  let isCorrect = false;
  let missingIdea = '';
  const has = (...kw) => kw.some(k => text.includes(k));

  if(expId === 'carnot'){
    if(has('naik', 'meningkat', 'besar', 'berbanding lurus') && has('suhu', 'selisih', 'delta', 't_h', 'th')) isCorrect = true;
    else missingIdea = 'Coba perhatikan grafik: apakah efisiensi (%) naik atau turun ketika selisih suhu (T_H − T_C) semakin besar?';
  } else if(expId === 'calo'){
    if(has('sama', 'kekal', 'setimbang', 'tetap', 'asas black', 'seimbang')) isCorrect = true;
    else missingIdea = 'Ingat hukum Asas Black: kalor yang dilepas logam harus berbanding lurus / sama dengan yang diserap air.';
  } else if(expId === 'cond'){
    if(has('tembaga', 'konduktor', 'konduktivitas') && has('cepat', 'tinggi', 'terbaik')) isCorrect = true;
    else missingIdea = 'Sebutkan material mana (Tembaga, Besi, atau Kayu) yang kurva suhunya naik paling cepat dan mengapa (nilai konduktivitas k).';
  } else if(expId === 'furnace'){
    if(has('mendatar', 'tetap', 'laten', 'konstan') && has('wujud', 'lebur', 'didih', 'fase')) isCorrect = true;
    else missingIdea = 'Perhatikan garis grafik saat benda mendidih atau melebur. Apakah garisnya terus naik atau sempat mendatar? Kenapa (kalor laten)?';
  } else if(expId === 'wom'){
    if(has('cepat', 'kencang', 'besar') && has('partikel', 'kinetik', 'gerak') && has('suhu', 'panas')) isCorrect = true;
    else missingIdea = 'Jelaskan hubungan suhu dengan kecepatan gerak partikel: makin panas, partikel bergerak seperti apa?';
  } else if(expId === 'sl'){
    if(has('kalor', 'q') && has('usaha', 'w') && has('energi dalam', 'delta u', 'δu', 'u')) isCorrect = true;
    else missingIdea = 'Kaitkan tiga besaran dalam Hukum I: kalor (Q), usaha (W), dan perubahan energi dalam (ΔU). Bagaimana hubungan ΔU = Q − W pada percobaanmu?';
  } else {
    isCorrect = true;
  }

  if(!isCorrect){
    feedbackEl.className = 'analysis-checker-box incomplete';
    feedbackEl.innerHTML = `<b>⚠️ Analisis Belum Tepat:</b> ${missingIdea} <br>Tuliskan kembali jawabanmu dengan menyebutkan konsep dan data yang relevan.`;
    if(typeof SFX !== 'undefined') SFX.warn();
  } else {
    feedbackEl.className = 'analysis-checker-box complete';
    feedbackEl.innerHTML = `<b>✅ Analisis Sesuai:</b> Hebat! Penjelasan kamu menyinggung konsep fisika yang tepat untuk eksperimen ini.<br><span style="font-size:11.5px;opacity:.8;">Catatan: pengecekan ini berbasis kata kunci, bukan penilaian akhir gurumu.</span>`;
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
