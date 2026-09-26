/* ==========================================================================
   Simulation 2: Kalorimetri & Asas Black
   ========================================================================== */
const metalsMeta = {
  'Tembaga': { c: 0.385, color: '#b87333' },
  'Aluminium': { c: 0.897, color: '#cbd5e1' },
  'Besi': { c: 0.449, color: '#64748b' },
  'Kuningan': { c: 0.380, color: '#d4a72c' }
};

function initCaloSim(){
  const mLogamSlider = document.getElementById('caloMassSlider');
  const mAirSlider = document.getElementById('caloWaterSlider');

  if(mLogamSlider) mLogamSlider.addEventListener('input', e=>document.getElementById('caloMassVal').textContent = e.target.value + ' g');
  if(mAirSlider) mAirSlider.addEventListener('input', e=>document.getElementById('caloWaterVal').textContent = e.target.value + ' g');

  renderCaloData();
}

function runCaloMix(){
  const mLogam = +document.getElementById('caloMassSlider').value;
  const mAir = +document.getElementById('caloWaterSlider').value;
  const metalName = document.getElementById('caloMetalSelect').value;

  const err = validateNumericInput(mLogam, 10, 300, 'Massa Logam') || validateNumericInput(mAir, 10, 300, 'Massa Air');
  if(err){ showToast(err, 'error'); if(typeof SFX !== 'undefined') SFX.warn(); return; }

  const cLogam = metalsMeta[metalName].c;
  const cAir = 4.18;
  const Tlogam = 100;
  const Tair = 25;

  const Tf = (mLogam * cLogam * Tlogam + mAir * cAir * Tair) / (mLogam * cLogam + mAir * cAir);
  const calculatedC = (mAir * cAir * (Tf - Tair)) / (mLogam * (Tlogam - Tf));

  document.getElementById('caloReadoutTf').textContent = Tf.toFixed(1) + '°C';

  appState.experimentsData.calo = {
    metal: metalName, mLogam, mAir, Tlogam, Tair, Tf: Tf.toFixed(1), cCalc: calculatedC.toFixed(3)
  };
  saveAppState();
  renderCaloData();

  // Chart convergence curve
  const chart = charts['caloChart'] || createChart('caloChart', 'line', 'Suhu (°C)', 'Waktu (s)', 'Suhu (°C)', '#0284c7');
  if(chart){
    const labels = []; const metalSeries = []; const waterSeries = [];
    for(let t = 0; t <= 10; t++){
      labels.push(t + ' s');
      metalSeries.push((Tlogam - (Tlogam - Tf) * (t / 10)).toFixed(1));
      waterSeries.push((Tair + (Tf - Tair) * (t / 10)).toFixed(1));
    }
    chart.data.labels = labels;
    chart.data.datasets = [
      { label: 'Suhu Logam (°C)', data: metalSeries, borderColor: '#f97316', backgroundColor: 'transparent', borderWidth: 3 },
      { label: 'Suhu Air (°C)', data: waterSeries, borderColor: '#0284c7', backgroundColor: 'transparent', borderWidth: 3 }
    ];
    chart.update();
  }

  showToast(`Pencampuran Selesai! Suhu kesetimbangan: ${Tf.toFixed(1)}°C`, 'success');
  if(typeof SFX !== 'undefined') SFX.success();
  triggerSimFinished('calo');
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
    <tr><td>Suhu Awal Air Cold</td><td><b>${data.Tair} °C</b></td></tr>
    <tr><td>Suhu Kesetimbangan Akhir (T_f)</td><td><b>${data.Tf} °C</b></td></tr>
    <tr><td>Kalor Jenis Terhitung (c)</td><td><b>${data.cCalc} J/g·°C</b></td></tr>
    <tr><td>Identifikasi Sampel Logam</td><td><b>${data.metal}</b></td></tr>
  `;
}

function resetCalo(){
  appState.experimentsData.calo = null;
  saveAppState();
  renderCaloData();
  const tf = document.getElementById('caloReadoutTf');
  if(tf) tf.textContent = '—';
  const card = document.getElementById('caloResultCard');
  if(card) card.classList.remove('show');
  showToast('Data Kalorimetri direset.', 'info');
}
