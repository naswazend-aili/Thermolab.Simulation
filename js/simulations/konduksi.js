/* ==========================================================================
   Simulation 3: Konduksi Kalor
   ========================================================================== */
let condCanvas = null, condCtx = null;
let condRunning = false, condTime = 0;

function initCondSim(){
  condCanvas = document.getElementById('condCanvas');
  if(!condCanvas) return;
  condCtx = condCanvas.getContext('2d');

  const flameSlider = document.getElementById('condFlameSlider');
  if(flameSlider){
    flameSlider.addEventListener('input', e=>document.getElementById('condFlameVal').textContent = e.target.value + '°C');
  }

  const playBtn = document.getElementById('condPlayBtn');
  if(playBtn){
    playBtn.addEventListener('click', ()=>{
      condRunning = !condRunning;
      playBtn.textContent = condRunning ? '⏸ Jeda Pemanasan' : '▶ Mulai Pemanasan';
    });
  }

  const recordBtn = document.getElementById('condRecordBtn');
  if(recordBtn){
    recordBtn.addEventListener('click', recordCondData);
  }

  drawCondCanvas();
  renderCondData();
}

function drawCondCanvas(){
  if(!condCtx) return;
  const W = condCanvas.width, H = condCanvas.height;
  condCtx.clearRect(0, 0, W, H);

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  condCtx.fillStyle = isDark ? '#1c2541' : '#f8fafc';
  condCtx.fillRect(0, 0, W, H);

  const x0 = 80, y0 = 160, barL = 480, barH = 40;
  const flameT = +document.getElementById('condFlameSlider').value;
  const k = +document.getElementById('condMaterial').value;

  if(condRunning){ condTime += 0.1; }
  const endT = 25 + (flameT - 25) * (1 - Math.exp(-k * condTime * 0.1));
  const endVal = document.getElementById('condEndVal');
  if(endVal) endVal.textContent = endT.toFixed(1) + '°C';

  // Bar heat distribution
  for(let i = 0; i < 30; i++){
    const xx = x0 + i * (barL / 30);
    const frac = i / 30;
    const tempAtSeg = flameT - (flameT - endT) * frac;
    const heatRatio = Math.max(0, Math.min(1, (tempAtSeg - 25) / (flameT - 25)));
    condCtx.fillStyle = `hsl(${220 - heatRatio*220}, 85%, 55%)`;
    condCtx.fillRect(xx, y0, barL / 30 + 1, barH);
  }
  condCtx.strokeStyle = isDark ? '#3a4b7c' : '#334155';
  condCtx.lineWidth = 3;
  condCtx.strokeRect(x0, y0, barL, barH);

  // Flame icon
  condCtx.fillStyle = '#f97316'; condCtx.font = '28px sans-serif';
  condCtx.fillText('🔥', x0 - 35, y0 + 32);

  requestAnimationFrame(drawCondCanvas);
}

function resetCondSim(){
  condTime = 0; condRunning = false;
  const playBtn = document.getElementById('condPlayBtn');
  if(playBtn) playBtn.textContent = '▶ Mulai Pemanasan';
}

function recordCondData(){
  const k = +document.getElementById('condMaterial').value;
  const nameMap = { '0.85': 'Tembaga', '0.35': 'Besi', '0.05': 'Kayu' };
  const matName = nameMap[k];
  const flameT = +document.getElementById('condFlameSlider').value;
  const endT = parseFloat(document.getElementById('condEndVal').textContent);

  const dataset = appState.experimentsData.cond;
  if(dataset.some(d => d.name === matName)){
    showToast(`Material ${matName} sudah dicatat. Pilih material lain.`, 'error');
    if(typeof SFX !== 'undefined') SFX.warn(); return;
  }

  dataset.push({ name: matName, k, t: condTime.toFixed(1), endT: endT.toFixed(1), flameT });
  saveAppState();
  renderCondData();
  showToast(`Data ${matName} dicatat! (Suhu Ujung: ${endT.toFixed(1)}°C)`, 'success');
  if(typeof SFX !== 'undefined') SFX.success();

  if(dataset.length >= 3){ triggerSimFinished('cond'); }
}

function renderCondData(){
  const body = document.getElementById('condBody');
  if(!body) return;
  const data = appState.experimentsData.cond;
  if(!data.length){ body.innerHTML = '<tr class="empty-row"><td colspan="4">Belum ada data dicatat.</td></tr>'; return; }

  body.innerHTML = data.map((d, i) => `
    <tr><td>${i+1}</td><td><b>${d.name}</b></td><td>${d.t} s</td><td><b>${d.endT} °C</b></td></tr>
  `).join('');

  const chart = charts['condChart'] || createChart('condChart', 'bar', 'Suhu Ujung Batang (°C)', 'Material', 'Suhu (°C)', '#0ea5e9');
  if(chart){
    chart.data.labels = data.map(d => d.name);
    chart.data.datasets[0].data = data.map(d => parseFloat(d.endT));
    chart.update();
  }
}
