/* ==========================================================================
   Simulation 6: Sistem & Hukum I Termodinamika
   ========================================================================== */
let slCanvas = null, slCtx = null;
let slPistonX = 300, slRunning = false, slQcum = 0, slWcum = 0;

function initSlSim(){
  slCanvas = document.getElementById('slCanvas');
  if(!slCanvas) return;
  slCtx = slCanvas.getContext('2d');

  const startBtn = document.getElementById('slStartBtn');
  if(startBtn){
    startBtn.addEventListener('click', ()=>{
      slRunning = !slRunning;
      startBtn.textContent = slRunning ? '⏸ Jeda' : '▶ Mulai Praktikum';
    });
  }

  const heatBtn = document.getElementById('slHeatBtn');
  if(heatBtn){
    heatBtn.addEventListener('click', ()=>{
      if(!slRunning){ showToast('Tekan Mulai Praktikum terlebih dahulu.', 'error'); if(typeof SFX !== 'undefined') SFX.warn(); return; }
      slQcum += 10;
      updateSlReadouts();
      showToast('Kalor ditambahkan (+10 J)', 'success');
      if(typeof SFX !== 'undefined') SFX.heat();
    });
  }

  const coolBtn = document.getElementById('slCoolBtn');
  if(coolBtn){
    coolBtn.addEventListener('click', ()=>{
      if(!slRunning){ showToast('Tekan Mulai Praktikum terlebih dahulu.', 'error'); if(typeof SFX !== 'undefined') SFX.warn(); return; }
      slQcum -= 10;
      updateSlReadouts();
      showToast('Kalor dikurangi (-10 J)', 'info');
      if(typeof SFX !== 'undefined') SFX.cool();
    });
  }

  const recordBtn = document.getElementById('slRecordBtn');
  if(recordBtn){
    recordBtn.addEventListener('click', recordSlData);
  }

  // Piston Drag Event
  const slPistonEl = document.getElementById('slPiston');
  if(slPistonEl){
    slPistonEl.addEventListener('pointerdown', (e)=>{
      e.preventDefault();
      const startX = e.clientX;
      const startPiston = slPistonX;
      function onMove(ev){
        let nx = startPiston + (ev.clientX - startX);
        nx = Math.max(140, Math.min(480, nx));
        const dV = (nx - slPistonX) * 0.1;
        slPistonX = nx;
        slPistonEl.style.left = slPistonX + 'px';
        slWcum += dV * 2;
        updateSlReadouts();
      }
      function onUp(){
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      }
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    });
  }

  drawSlCanvas();
  renderSlData();
}

function drawSlCanvas(){
  if(!slCtx) return;
  const W = slCanvas.width, H = slCanvas.height;
  slCtx.clearRect(0, 0, W, H);

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  slCtx.fillStyle = isDark ? '#1c2541' : '#f8fafc';
  slCtx.fillRect(0, 0, W, H);

  slCtx.strokeStyle = isDark ? '#3a4b7c' : '#334155';
  slCtx.lineWidth = 4;
  slCtx.strokeRect(40, 40, slPistonX - 40, 220);

  // Gas particles inside
  slCtx.fillStyle = '#10b981';
  const uVal = 50 + slQcum - slWcum;
  const vib = Math.max(0, uVal * 0.1);
  
  for(let i = 0; i < 25; i++){
    let px = 50 + (i%5) * (slPistonX - 60)/5;
    let py = 60 + Math.floor(i/5) * 38;
    
    if(slRunning) {
      px += (Math.random() - 0.5) * vib;
      py += (Math.random() - 0.5) * vib;
    }
    
    slCtx.beginPath(); slCtx.arc(px, py, 6, 0, Math.PI * 2); slCtx.fill();
  }

  requestAnimationFrame(drawSlCanvas);
}

function updateSlReadouts(){
  const numV = (slPistonX - 40) * 0.05;
  const V = numV.toFixed(1);
  const numU = 50 + slQcum - slWcum;
  const U = numU.toFixed(1);
  const dU = (slQcum - slWcum).toFixed(1);
  const qMinusW = (slQcum - slWcum).toFixed(1);
  
  const T = Math.max(0, numU * 6).toFixed(0);
  const P = Math.max(0, (numU * 6 / numV) * (13 / 300)).toFixed(1);

  const vEl = document.getElementById('slV'); if(vEl) vEl.textContent = V + ' L';
  const uEl = document.getElementById('slU'); if(uEl) uEl.textContent = U + ' J';
  const duEl = document.getElementById('slDeltaU'); if(duEl) duEl.textContent = dU;
  const qwEl = document.getElementById('slQMinusW'); if(qwEl) qwEl.textContent = qMinusW;
  const tEl = document.getElementById('slT'); if(tEl) tEl.textContent = T + ' K';
  const pEl = document.getElementById('slP'); if(pEl) pEl.textContent = P + ' atm';
}

function resetSislink(){
  slPistonX = 300; slQcum = 0; slWcum = 0; slRunning = false;
  const piston = document.getElementById('slPiston');
  if(piston) piston.style.left = '300px';
  const startBtn = document.getElementById('slStartBtn');
  if(startBtn) startBtn.textContent = '▶ Mulai Praktikum';
  const recBtn = document.getElementById('slRecordBtn');
  if(recBtn) recBtn.textContent = '➕ Catat Kondisi Gas (0/3)';
  updateSlReadouts();
  appState.experimentsData.sl = [];
  saveAppState(); renderSlData();
}

function recordSlData(){
  if(!slRunning){ showToast('Tekan Mulai Praktikum terlebih dahulu.', 'error'); if(typeof SFX !== 'undefined') SFX.warn(); return; }
  const dU = document.getElementById('slDeltaU').textContent;
  const qMinusW = document.getElementById('slQMinusW').textContent;
  const P = document.getElementById('slP').textContent;
  const V = document.getElementById('slV').textContent;
  const T = document.getElementById('slT').textContent;

  const dataset = appState.experimentsData.sl;
  dataset.push({ action: `Kondisi #${dataset.length+1}`, P, V, T, dU, qMinusW });
  
  const recBtn = document.getElementById('slRecordBtn');
  if(recBtn) recBtn.textContent = `➕ Catat Kondisi Gas (${dataset.length}/3)`;
  
  saveAppState(); renderSlData();
  showToast(`Kondisi Hukum I #${dataset.length} Dicatat (ΔU = ${dU} J)`, 'success');
  if(typeof SFX !== 'undefined') SFX.success();
  if(dataset.length >= 3){ triggerSimFinished('sl'); }
}

function renderSlData(){
  const body = document.getElementById('slBody');
  if(!body) return;
  const data = appState.experimentsData.sl;
  if(!data.length){ body.innerHTML = '<tr class="empty-row"><td colspan="7">Belum ada data dicatat.</td></tr>'; return; }

  body.innerHTML = data.map((d, i) => `
    <tr><td>${i+1}</td><td>${d.action}</td><td>${d.P}</td><td>${d.V}</td><td>${d.T}</td><td><b>${d.dU} J</b></td><td><b>${d.qMinusW} J</b></td></tr>
  `).join('');

  const chart = charts['slChart'] || createChart('slChart', 'scatter', 'Diagram P-V', 'Volume (L)', 'Tekanan (P)', '#10b981');
  if(chart){
    chart.data.labels = data.map(d => d.V);
    chart.data.datasets[0].data = data.map(d => ({ x: parseFloat(d.V), y: parseFloat(d.P) }));
    chart.update();
  }
}
