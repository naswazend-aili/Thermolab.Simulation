/* ==========================================================================
   Simulation 5: Wujud Zat & Kinetik Partikel
   ========================================================================== */
let womCanvas = null, womCtx = null;
let womParticles = [], womRunning = false;

function initWomSim(){
  womCanvas = document.getElementById('womCanvas');
  if(!womCanvas) return;
  womCtx = womCanvas.getContext('2d');

  const playBtn = document.getElementById('womPlayBtn');
  if(playBtn){
    playBtn.addEventListener('click', ()=>{
      womRunning = !womRunning;
      playBtn.textContent = womRunning ? '⏸ Jeda' : '▶ Jalankan Simulasi';
    });
  }

  const recordBtn = document.getElementById('womRecordBtn');
  if(recordBtn){
    recordBtn.addEventListener('click', recordWomData);
  }

  initWomParticles();
  drawWomCanvas();
  renderWomData();
}

function initWomParticles(){
  womParticles = [];
  for(let i=0; i<42; i++){
    womParticles.push({
      x: 100 + (i%7) * 32,
      y: 100 + Math.floor(i/7) * 32,
      vx: (Math.random() - 0.5),
      vy: (Math.random() - 0.5)
    });
  }
}

function drawWomCanvas(){
  if(!womCtx) return;
  const W = womCanvas.width, H = womCanvas.height;
  womCtx.clearRect(0, 0, W, H);

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  womCtx.fillStyle = isDark ? '#1c2541' : '#f8fafc';
  womCtx.fillRect(0, 0, W, H);

  const T = +(document.getElementById('womHeatSlider')?.value || 25);
  const tempVal = document.getElementById('womTempVal');
  if(tempVal) tempVal.textContent = T + '°C';

  let phase = T < 0 ? 'Padat' : (T < 100 ? 'Cair' : 'Gas');
  const phaseTag = document.getElementById('womPhaseTag');
  if(phaseTag) phaseTag.textContent = phase;

  const speedScale = Math.max(0.2, (T + 60) / 40);

  womParticles.forEach(p => {
    if(womRunning){ p.x += p.vx * speedScale; p.y += p.vy * speedScale; }
    if(p.x < 20 || p.x > W-20) p.vx *= -1;
    if(p.y < 20 || p.y > H-20) p.vy *= -1;

    womCtx.beginPath();
    womCtx.arc(p.x, p.y, 8, 0, Math.PI * 2);
    womCtx.fillStyle = phase === 'Padat' ? '#0284c7' : (phase === 'Cair' ? '#10b981' : '#8b5cf6');
    womCtx.fill();
    womCtx.strokeStyle = isDark ? '#ffffff33' : '#00000022';
    womCtx.stroke();
  });

  requestAnimationFrame(drawWomCanvas);
}

function resetWom(){
  womRunning = false;
  initWomParticles();
  const playBtn = document.getElementById('womPlayBtn');
  if(playBtn) playBtn.textContent = '▶ Jalankan Simulasi';
}

function recordWomData(){
  const T = +document.getElementById('womHeatSlider').value;
  const phase = document.getElementById('womPhaseTag').textContent;
  const dataset = appState.experimentsData.wom;

  dataset.push({ t: T, phase, speed: (Math.max(0.2, (T+60)/40)).toFixed(1) });
  saveAppState();
  renderWomData();
  showToast(`Data Fase ${phase} (${T}°C) dicatat.`, 'success');
  if(typeof SFX !== 'undefined') SFX.success();

  if(dataset.length >= 3){ triggerSimFinished('wom'); }
}

function renderWomData(){
  const body = document.getElementById('womBody');
  if(!body) return;
  const data = appState.experimentsData.wom;
  if(!data.length){ body.innerHTML = '<tr class="empty-row"><td colspan="4">Belum ada data dicatat.</td></tr>'; return; }

  body.innerHTML = data.map((d, i) => `
    <tr><td>${i+1}</td><td>${d.t} °C</td><td><b>${d.phase}</b></td><td>${d.speed} v_rel</td></tr>
  `).join('');

  const chart = charts['womChart'] || createChart('womChart', 'line', 'Kecepatan Partikel', 'Suhu (°C)', 'Speed', '#8b5cf6');
  if(chart){
    chart.data.labels = data.map(d => d.t + ' °C');
    chart.data.datasets[0].data = data.map(d => parseFloat(d.speed));
    chart.update();
  }
}
