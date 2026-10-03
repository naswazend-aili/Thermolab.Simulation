/* ==========================================================================
   Simulation 2: Kalorimetri & Asas Black
   Interactive click-to-place lab bench: timbang -> ukur suhu air -> panaskan
   -> pindahkan pakai tang -> aduk & catat -> tebak logam misterius.
   ========================================================================== */
const metalsMeta = {
  'Tembaga': { c: 0.385, color: '#b87333' },
  'Aluminium': { c: 0.897, color: '#cbd5e1' },
  'Besi': { c: 0.449, color: '#64748b' },
  'Kuningan': { c: 0.380, color: '#d4a72c' }
};

let caloState = null;
let caloEls = null;

function caloDefaultState(){
  const metalNames = Object.keys(metalsMeta);
  const mysteryMetal = metalNames[Math.floor(Math.random() * metalNames.length)];
  return {
    step: 1, mass: 50, waterMass: 100, waterT: 25, metalT: 100,
    finalTemp: null, metal: mysteryMetal, c: null, done: false, mixing: false, series: []
  };
}

function initCaloSim(){
  const page = document.getElementById('page-kalorimetri');
  if(!page) return;

  caloEls = {
    instruction: document.getElementById('caloInstruction'),
    actionArea: document.getElementById('caloActionArea'),
    nr: document.getElementById('caloNeracaReadout'),
    pr: document.getElementById('caloPemanasReadout'),
    kr: document.getElementById('caloKaloReadout'),
    thermoFill: document.getElementById('caloThermoFill'),
    tf: document.getElementById('caloReadoutTf'),
    sample: document.getElementById('caloEqLogam'),
    thermo: document.getElementById('caloEqTermo'),
    tang: document.getElementById('caloEqTang'),
    stations: {
      neraca: document.getElementById('caloStationNeraca'),
      pemanas: document.getElementById('caloStationPemanas'),
      kalorimeter: document.getElementById('caloStationKalo')
    },
    stepsList: document.getElementById('caloStepsList')
  };

  // Restore from saved data if this experiment was already completed before
  if(appState.experimentsData.calo){
    caloState = caloDefaultState();
    const d = appState.experimentsData.calo;
    caloState.mass = d.mLogam; caloState.waterMass = d.mAir;
    caloState.waterT = d.Tair; caloState.metalT = d.Tlogam;
    caloState.finalTemp = +d.Tf; caloState.c = +d.cCalc; caloState.metal = d.metal;
    caloState.done = true; caloState.step = 7;
    if(caloEls.tf) caloEls.tf.textContent = d.Tf + '°C';
    caloSetInstruction('Eksperimen sudah selesai. Tekan ↺ Reset Eksperimen kalau mau mengulang dari awal.');
  } else {
    caloResetBench();
  }

  caloEls.sample?.addEventListener('click', caloOnSampleClick);
  caloEls.stations.neraca?.addEventListener('click', caloOnNeracaClick);
  caloEls.thermo?.addEventListener('click', caloOnThermoClick);
  caloEls.stations.pemanas?.addEventListener('click', caloOnPemanasClick);
  caloEls.tang?.addEventListener('click', caloOnTangClick);
  caloEls.stations.kalorimeter?.addEventListener('click', caloOnKalorimeterClick);

  renderCaloData();
}

function caloSetInstruction(text){
  if(caloEls?.instruction) caloEls.instruction.textContent = text;
}

function caloUpdateStepsUI(){
  if(!caloEls?.stepsList) return;
  caloEls.stepsList.querySelectorAll('li').forEach(li => {
    const n = +li.dataset.step;
    li.classList.remove('calo-step-active', 'calo-step-done');
    if(n < caloState.step) li.classList.add('calo-step-done');
    else if(n === caloState.step) li.classList.add('calo-step-active');
  });
}

function caloClearEligible(){
  Object.values(caloEls.stations).forEach(x => x?.classList.remove('eligible'));
  [caloEls.sample, caloEls.thermo, caloEls.tang].forEach(x => x?.classList.remove('held'));
}

function caloEligibleStation(k){
  caloClearEligible();
  caloEls.stations[k]?.classList.add('eligible');
}

function caloOnSampleClick(){
  if(caloState.step !== 1) return;
  caloEls.sample.classList.add('held');
  caloState.step = 2;
  caloEligibleStation('neraca');
  caloSetInstruction('Sampel logam sudah dipegang. Sekarang klik Neraca untuk menimbangnya.');
  caloEls.actionArea.innerHTML = '<p style="font-size:12px;color:var(--muted)">💡 Massa logam ditetapkan 50 g agar kamu bisa fokus pada prinsip kalorimetrinya.</p>';
  if(typeof SFX !== 'undefined') SFX.click();
  caloUpdateStepsUI();
}

function caloOnNeracaClick(){
  if(caloState.step !== 2) return;
  caloEls.nr.textContent = caloState.mass + ' g';
  caloState.step = 3;
  caloEligibleStation('kalorimeter');
  caloSetInstruction('Massa logam terbaca: ' + caloState.mass + ' g. Sekarang klik Termometer, lalu klik Kalorimeter untuk mengukur suhu air awal.');
  if(typeof SFX !== 'undefined'){ SFX.click(); SFX.voice('Logam berhasil ditimbang, ' + caloState.mass + ' gram.'); }
  caloUpdateStepsUI();
}

function caloOnThermoClick(){
  if(caloState.step !== 3) return;
  caloEls.thermo.classList.add('held');
  caloEls.thermoFill.style.height = '25%';
  caloEls.kr.textContent = caloState.waterT + ' °C';
  caloState.step = 4;
  caloEligibleStation('pemanas');
  caloSetInstruction('Suhu air awal terukur: ' + caloState.waterT + ' °C. Sekarang panaskan logam: klik sampel logam, lalu klik Pembakar Spiritus.');
  if(typeof SFX !== 'undefined') SFX.click();
  caloUpdateStepsUI();
}

function caloOnPemanasClick(){
  if(caloState.step !== 4) return;
  caloEls.pr.textContent = caloState.metalT + ' °C';
  caloEls.sample.classList.remove('held');
  caloState.step = 5;
  caloClearEligible();
  caloEls.tang.classList.add('held');
  caloSetInstruction('Logam sudah dipanaskan sampai ' + caloState.metalT + ' °C — terlalu panas untuk dipegang tangan. Klik Tang Penjepit untuk mengambilnya.');
  if(typeof SFX !== 'undefined'){ SFX.heat(); SFX.voice('Logam sudah panas, ' + caloState.metalT + ' derajat celcius.'); }
  caloUpdateStepsUI();
}

function caloOnTangClick(){
  if(caloState.step !== 5) return;
  caloEls.tang.classList.remove('held');
  caloEls.sample.classList.add('held');
  caloState.step = 6;
  caloEligibleStation('kalorimeter');
  caloSetInstruction('Logam panas sudah dijepit dengan aman. Bawa ke Kalorimeter: klik Kalorimeter untuk memasukkannya ke air.');
  if(typeof SFX !== 'undefined') SFX.click();
  caloUpdateStepsUI();
}

function caloOnKalorimeterClick(){
  if(caloState.step !== 6) return;
  caloClearEligible();
  caloEls.sample.classList.remove('held');
  caloState.mixing = true;
  caloSetInstruction('Logam panas sudah dimasukkan ke air dingin. Tekan tombol di bawah untuk mengaduk dan mengamati suhu menuju kesetimbangan.');
  caloEls.actionArea.innerHTML = '<button class="action-btn" id="caloMixBtn">🥄 Aduk & Mulai Pengukuran</button>';
  document.getElementById('caloMixBtn').onclick = caloStartMix;
  if(typeof SFX !== 'undefined') SFX.click();
}

function caloStartMix(){
  if(!caloState.mixing) return;
  caloState.series = [];
  let t = 0;
  const cw = 4.18;
  const cMetal = metalsMeta[caloState.metal].c;
  const target = (caloState.mass * cMetal * caloState.metalT + caloState.waterMass * cw * caloState.waterT) /
                 (caloState.mass * cMetal + caloState.waterMass * cw);
  caloState.finalTemp = target;
  caloState.c = cMetal;
  caloState.mixing = false;
  caloEls.actionArea.innerHTML = '<p style="font-size:12px;color:var(--muted)">⏱️ Suhu sedang menuju kesetimbangan...</p>';
  if(typeof SFX !== 'undefined') SFX.voice('Mengaduk campuran. Amati suhu logam dan air saling mendekat.');

  const id = setInterval(() => {
    t += 1;
    const frac = 1 - Math.exp(-t / 5);
    const metalTemp = caloState.metalT + (target - caloState.metalT) * frac;
    const waterTemp = caloState.waterT + (target - caloState.waterT) * frac;
    caloState.series.push({ t, metal: metalTemp, water: waterTemp });
    caloEls.thermoFill.style.height = Math.max(0, Math.min(100, (waterTemp / 120) * 100)) + '%';
    caloEls.kr.textContent = waterTemp.toFixed(1) + ' °C';
    caloUpdateChart();

    if(t >= 20){
      clearInterval(id);
      caloState.done = true;
      caloState.step = 7;
      caloState.finalTemp = target;
      caloEls.kr.textContent = target.toFixed(1) + ' °C';
      if(caloEls.tf) caloEls.tf.textContent = target.toFixed(1) + '°C';

      appState.experimentsData.calo = {
        metal: caloState.metal, mLogam: caloState.mass, mAir: caloState.waterMass,
        Tlogam: caloState.metalT, Tair: caloState.waterT,
        Tf: target.toFixed(1), cCalc: cMetal.toFixed(3)
      };
      saveAppState();
      renderCaloData();
      caloUpdateStepsUI();
      caloShowGuess();
      caloSetInstruction('Kesetimbangan tercapai! Kurva logam dan air bertemu di suhu yang sama. Sekarang tebak jenis logamnya di bawah.');
      if(typeof SFX !== 'undefined') SFX.success();
      triggerSimFinished('calo');
    }
  }, 180);
}

function caloUpdateChart(){
  const chart = charts['caloChart'] || createChart('caloChart', 'line', 'Suhu (°C)', 'Waktu (s)', 'Suhu (°C)', '#0284c7');
  if(!chart) return;
  chart.data.labels = caloState.series.map(d => d.t + ' s');
  chart.data.datasets = [
    { label: 'Suhu Logam (°C)', data: caloState.series.map(d => d.metal.toFixed(1)), borderColor: '#f97316', backgroundColor: 'transparent', borderWidth: 3 },
    { label: 'Suhu Air (°C)', data: caloState.series.map(d => d.water.toFixed(1)), borderColor: '#0284c7', backgroundColor: 'transparent', borderWidth: 3 }
  ];
  chart.update();
}

function caloShowGuess(){
  caloEls.actionArea.innerHTML = `
    <label style="font-size:13px;font-weight:700;">🔍 Tebak jenis logam sebelum melihat jawaban:</label>
    <select class="calo-guess-select" id="caloGuess">
      <option value="">Pilih tebakan...</option>
      ${Object.keys(metalsMeta).map(m => `<option>${m}</option>`).join('')}
    </select>
    <button class="action-btn" id="caloCheckGuess" style="margin-top:8px;">Periksa Tebakan</button>
    <div id="caloReveal"></div>
  `;
  document.getElementById('caloCheckGuess').onclick = () => {
    const g = document.getElementById('caloGuess').value;
    const rev = document.getElementById('caloReveal');
    if(!g){ rev.className = 'calo-reveal wrong'; rev.textContent = 'Pilih salah satu logam dulu.'; return; }
    if(g === caloState.metal){
      rev.className = 'calo-reveal correct';
      rev.innerHTML = `✅ Tebakan benar! Kalor jenis terhitung (${caloState.c.toFixed(3)} J/g·°C) paling mendekati <b>${caloState.metal}</b>.`;
      if(typeof SFX !== 'undefined'){ SFX.success(); SFX.voice('Tebakan kamu benar! Logamnya adalah ' + caloState.metal + '.'); }
    } else {
      rev.className = 'calo-reveal wrong';
      rev.innerHTML = `❌ Belum tepat. Bandingkan kalor jenis terhitung dengan nilai acuan di materi.`;
      if(typeof SFX !== 'undefined'){ SFX.warn(); SFX.voice('Belum tepat. Coba bandingkan lagi dengan tabel kalor jenis.'); }
    }
  };
}

function caloResetBench(){
  caloState = caloDefaultState();
  if(!caloEls) return;
  caloClearEligible();
  if(caloEls.nr) caloEls.nr.textContent = '';
  if(caloEls.pr) caloEls.pr.textContent = '';
  if(caloEls.kr) caloEls.kr.textContent = '';
  if(caloEls.thermoFill) caloEls.thermoFill.style.height = '0%';
  if(caloEls.tf) caloEls.tf.textContent = '—';
  caloEls.actionArea.innerHTML = '';
  caloSetInstruction('Klik sampel logam untuk memegangnya.');
  caloUpdateStepsUI();
}

function renderCaloData(){
  const data = appState.experimentsData.calo;
  const body = document.getElementById('caloDataBody');
  if(!body) return;
  if(!data){ body.innerHTML = '<tr class="empty-row"><td colspan="2">Belum ada data pencampuran.</td></tr>'; return; }

  body.innerHTML = `
    <tr><td>Massa Logam (m_logam)</td><td><b>${data.mLogam} g</b></td></tr>
    <tr><td>Massa Air (m_air)</td><td><b>${data.mAir} g</b></td></tr>
    <tr><td>Suhu Awal Logam Panas</td><td><b>${data.Tlogam} °C</b></td></tr>
    <tr><td>Suhu Awal Air Dingin</td><td><b>${data.Tair} °C</b></td></tr>
    <tr><td>Suhu Kesetimbangan Akhir (T_f)</td><td><b>${data.Tf} °C</b></td></tr>
    <tr><td>Kalor Jenis Terhitung (c)</td><td><b>${data.cCalc} J/g·°C</b></td></tr>
    <tr><td>Identifikasi Sampel Logam</td><td><b>${data.metal}</b></td></tr>
  `;
}

function resetCalo(){
  appState.experimentsData.calo = null;
  saveAppState();
  renderCaloData();
  const card = document.getElementById('caloResultCard');
  if(card) card.classList.remove('show');
  caloResetBench();
  showToast('Eksperimen Kalorimetri direset. Logam misterius baru sudah disiapkan.', 'info');
}
