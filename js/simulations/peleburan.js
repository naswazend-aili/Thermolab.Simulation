/* ==========================================================================
   Simulation 4: Tungku Peleburan & Kalor Laten
   ========================================================================== */
let furnaceCanvas = null, furnaceCtx = null;
let furnaceRunning = false, furnaceTime = 0, furnaceTemp = 20;

const presetsFurnace = {
  es: { name: 'Es Batu', melt: 0, boil: 100 },
  lilin: { name: 'Lilin Parafin', melt: 60, boil: 200 },
  timah: { name: 'Logam Timah', melt: 232, boil: 600 }
};

function initFurnaceSim(){
  furnaceCanvas = document.getElementById('furnaceCanvas');
  if(!furnaceCanvas) return;
  furnaceCtx = furnaceCanvas.getContext('2d');

  const playBtn = document.getElementById('furnacePlayBtn');
  if(playBtn){
    playBtn.addEventListener('click', ()=>{
      furnaceRunning = !furnaceRunning;
      playBtn.textContent = furnaceRunning ? '⏸ Jeda Pemanasan' : '▶ Mulai Pemanasan';
    });
  }

  const recordBtn = document.getElementById('furnaceRecordBtn');
  if(recordBtn){
    recordBtn.addEventListener('click', recordFurnaceData);
  }

  drawFurnaceCanvas();
  renderFurnaceData();
}

function drawFurnaceCanvas(){
  if(!furnaceCtx) return;
  const W = furnaceCanvas.width, H = furnaceCanvas.height;
  furnaceCtx.clearRect(0, 0, W, H);

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  furnaceCtx.fillStyle = isDark ? '#1c2541' : '#0f172a';
  furnaceCtx.fillRect(0, 0, W, H);

  // Crucible furnace
  furnaceCtx.fillStyle = isDark ? '#2a385b' : '#334155';
  furnaceCtx.fillRect(W/2 - 90, 120, 180, 140);
  furnaceCtx.strokeStyle = '#f97316';
  furnaceCtx.lineWidth = 4;
  furnaceCtx.strokeRect(W/2 - 90, 120, 180, 140);

  const matKey = document.getElementById('furnaceMaterialSelect')?.value || 'es';
  const p = presetsFurnace[matKey];
  const power = +(document.getElementById('furnacePowerSlider')?.value || 60);
  const pVal = document.getElementById('furnacePowerVal');
  if(pVal) pVal.textContent = power + '%';

  let phase = 'Padat';
  if(furnaceRunning){
    furnaceTime += 0.2;
    if(furnaceTemp < p.melt){ furnaceTemp += (power * 0.05); phase = 'Padat'; }
    else if(furnaceTemp >= p.melt && furnaceTemp < p.melt + 2){ furnaceTemp += 0.05; phase = 'Melebur (Laten)'; }
    else if(furnaceTemp < p.boil){ furnaceTemp += (power * 0.05); phase = 'Cair'; }
    else if(furnaceTemp >= p.boil && furnaceTemp < p.boil + 2){ furnaceTemp += 0.05; phase = 'Mendidih (Laten)'; }
    else { furnaceTemp += (power * 0.02); phase = 'Gas'; }
  }

  const tempVal = document.getElementById('furnaceTempVal');
  if(tempVal) tempVal.textContent = Math.round(furnaceTemp) + '°C';
  const tagVal = document.getElementById('phaseTagBadge');
  if(tagVal) tagVal.textContent = phase;

  // Fire visual
  if(furnaceRunning){
    furnaceCtx.fillStyle = '#f97316'; furnaceCtx.font = '32px sans-serif';
    furnaceCtx.fillText('🔥', W/2 - 16, 290);
  }

  requestAnimationFrame(drawFurnaceCanvas);
}

function resetFurnace(){
  furnaceRunning = false; furnaceTime = 0; furnaceTemp = 20;
  const playBtn = document.getElementById('furnacePlayBtn');
  if(playBtn) playBtn.textContent = '▶ Mulai Pemanasan';
  appState.experimentsData.furnace = [];
  saveAppState(); renderFurnaceData();
}

function recordFurnaceData(){
  const matKey = document.getElementById('furnaceMaterialSelect').value;
  const p = presetsFurnace[matKey];
  const phase = document.getElementById('phaseTagBadge').textContent;
  const dataset = appState.experimentsData.furnace;

  dataset.push({ matName: p.name, t: furnaceTime.toFixed(1), temp: Math.round(furnaceTemp), phase });
  saveAppState();
  renderFurnaceData();
  showToast(`Titik Pemanasan Dicatat: ${Math.round(furnaceTemp)}°C (${phase})`, 'success');
  if(typeof SFX !== 'undefined') SFX.success();

  if(dataset.length >= 5){ triggerSimFinished('furnace'); }
}

function renderFurnaceData(){
  const body = document.getElementById('furnaceBody');
  if(!body) return;
  const data = appState.experimentsData.furnace;
  if(!data.length){ body.innerHTML = '<tr class="empty-row"><td colspan="5">Belum ada data dicatat.</td></tr>'; return; }

  body.innerHTML = data.map((d, i) => `
    <tr><td>${i+1}</td><td>${d.matName}</td><td>${d.t} s</td><td><b>${d.temp} °C</b></td><td>${d.phase}</td></tr>
  `).join('');

  const chart = charts['furnaceChart'] || createChart('furnaceChart', 'line', 'Suhu (°C)', 'Waktu (s)', 'Suhu (°C)', '#f97316');
  if(chart){
    chart.data.labels = data.map(d => d.t + ' s');
    chart.data.datasets[0].data = data.map(d => d.temp);
    chart.update();
  }
}
