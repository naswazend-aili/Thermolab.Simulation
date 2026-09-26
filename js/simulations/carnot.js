/* ==========================================================================
   Simulation 1: Mesin Kalor Carnot
   ========================================================================== */
let carnotCanvas = null, carnotCtx = null;
let carnotTheta = 0, carnotRunning = false;

function initCarnotSim(){
  carnotCanvas = document.getElementById('engineCanvas');
  if(!carnotCanvas) return;
  carnotCtx = carnotCanvas.getContext('2d');

  const thSlider = document.getElementById('thSlider');
  const tcSlider = document.getElementById('tcSlider');

  if(thSlider && tcSlider){
    thSlider.addEventListener('input', updateCarnotReadouts);
    tcSlider.addEventListener('input', updateCarnotReadouts);
    updateCarnotReadouts();
  }

  const playBtn = document.getElementById('carnotPlayBtn');
  if(playBtn){
    playBtn.addEventListener('click', ()=>{
      carnotRunning = !carnotRunning;
      playBtn.textContent = carnotRunning ? '⏸ Jeda' : '▶ Jalankan';
      if(carnotRunning && typeof SFX !== 'undefined') SFX.click();
    });
  }

  const stepBtn = document.getElementById('carnotStepBtn');
  if(stepBtn){
    stepBtn.addEventListener('click', ()=>{
      carnotRunning = true;
      setTimeout(()=>{ carnotRunning = false; if(playBtn) playBtn.textContent = '▶ Jalankan'; }, 1200);
      if(typeof SFX !== 'undefined') SFX.click();
    });
  }

  const recordBtn = document.getElementById('carnotRecordBtn');
  if(recordBtn){
    recordBtn.addEventListener('click', recordCarnotData);
  }

  drawCarnotCanvas();
  renderCarnotData();
}

function updateCarnotReadouts(){
  const thSlider = document.getElementById('thSlider');
  const tcSlider = document.getElementById('tcSlider');
  if(!thSlider || !tcSlider) return;

  let Th = +thSlider.value;
  let Tc = +tcSlider.value;
  if(Tc >= Th){
    tcSlider.value = Th - 20;
    Tc = Th - 20;
  }

  document.getElementById('thVal').textContent = Th + ' K';
  document.getElementById('tcVal').textContent = Tc + ' K';
  const eff = (1 - Tc / Th);
  document.getElementById('effVal').textContent = Math.round(eff * 100) + '%';

  const Qh = 200;
  const W = Qh * eff;
  const Qc = Qh - W;

  document.getElementById('carnotQhVal').textContent = Qh.toFixed(0);
  document.getElementById('carnotWVal').textContent = W.toFixed(1);
  document.getElementById('carnotQcVal').textContent = Qc.toFixed(1);
}

function drawCarnotCanvas(){
  if(!carnotCtx) return;
  const W = carnotCanvas.width, H = carnotCanvas.height;
  carnotCtx.clearRect(0, 0, W, H);

  // Background
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  carnotCtx.fillStyle = isDark ? '#1c2541' : '#f1f5f9';
  carnotCtx.fillRect(0, 0, W, H);

  // Cylinder frame
  const cylX = 140, cylY = 130, cylW = 220, cylH = 100;
  carnotCtx.fillStyle = isDark ? '#2a385b' : '#cbd5e1';
  carnotCtx.fillRect(cylX, cylY, cylW, cylH);
  carnotCtx.strokeStyle = isDark ? '#3a4b7c' : '#475569';
  carnotCtx.lineWidth = 4;
  carnotCtx.strokeRect(cylX, cylY, cylW, cylH);

  if(carnotRunning){ carnotTheta += 0.05; }
  const pistonDisplacement = Math.sin(carnotTheta) * 35;
  const pistonX = cylX + 110 + pistonDisplacement;

  // Gas expansion/compression visual
  const gasColor = `hsl(${15 + Math.sin(carnotTheta)*25}, 85%, 60%)`;
  carnotCtx.fillStyle = gasColor;
  carnotCtx.fillRect(cylX + 2, cylY + 2, pistonX - cylX - 2, cylH - 4);

  // Piston Head & Rod
  carnotCtx.fillStyle = isDark ? '#475569' : '#334155';
  carnotCtx.fillRect(pistonX, cylY + 2, 16, cylH - 4);

  // Wheel & Crank Shaft
  const wheelX = 450, wheelY = 180, wheelR = 50;
  carnotCtx.beginPath();
  carnotCtx.arc(wheelX, wheelY, wheelR, 0, Math.PI * 2);
  carnotCtx.fillStyle = isDark ? '#3a4b7c' : '#94a3b8';
  carnotCtx.fill();
  carnotCtx.stroke();

  // Crank pin
  const pinX = wheelX + Math.cos(carnotTheta) * 35;
  const pinY = wheelY + Math.sin(carnotTheta) * 35;

  carnotCtx.strokeStyle = '#f97316'; carnotCtx.lineWidth = 5;
  carnotCtx.beginPath(); carnotCtx.moveTo(pistonX + 16, cylY + cylH/2); carnotCtx.lineTo(pinX, pinY); carnotCtx.stroke();

  // Labels
  carnotCtx.fillStyle = isDark ? '#f8fafc' : '#0f172a';
  carnotCtx.font = 'bold 14px Poppins';
  carnotCtx.fillText('Silinder Gas Kerja Carnot', cylX + 10, cylY - 16);

  requestAnimationFrame(drawCarnotCanvas);
}

function recordCarnotData(){
  const thSlider = document.getElementById('thSlider');
  const tcSlider = document.getElementById('tcSlider');
  const Th = +thSlider.value;
  const Tc = +tcSlider.value;

  const err = validateNumericInput(Th, 300, 1000, 'T_H') || validateNumericInput(Tc, 200, 800, 'T_C');
  if(err){ showToast(err, 'error'); if(typeof SFX !== 'undefined') SFX.warn(); return; }

  const eff = Math.round((1 - Tc / Th) * 100);
  const Qh = 200;
  const W = (Qh * eff / 100).toFixed(1);
  const Qc = (Qh - W).toFixed(1);

  const dataset = appState.experimentsData.carnot;
  if(dataset.some(d => d.th === Th && d.tc === Tc)){
    showToast('Kondisi suhu ini sudah dicatat. Ubah T_H atau T_C.', 'error');
    if(typeof SFX !== 'undefined') SFX.warn(); return;
  }

  dataset.push({ th: Th, tc: Tc, dT: Th - Tc, eff: eff, qh: Qh, w: W, qc: Qc });
  saveAppState();
  renderCarnotData();
  showToast(`Data Carnot #${dataset.length} dicatat! (&eta; = ${eff}%)`, 'success');
  if(typeof SFX !== 'undefined') SFX.success();

  if(dataset.length >= 3){ triggerSimFinished('carnot'); }
}

function renderCarnotData(){
  const body = document.getElementById('carnotBody');
  if(!body) return;
  const data = appState.experimentsData.carnot;
  if(!data.length){ body.innerHTML = '<tr class="empty-row"><td colspan="7">Belum ada data dicatat.</td></tr>'; return; }

  body.innerHTML = data.map((d, i) => `
    <tr><td>${i+1}</td><td>${d.th}</td><td>${d.tc}</td><td>${d.qh}</td><td>${d.w}</td><td>${d.qc}</td><td><b>${d.eff}%</b></td></tr>
  `).join('');

  const chart = charts['carnotChart'] || createChart('carnotChart', 'line', 'Efisiensi (%)', 'Selisih Suhu ΔT (K)', 'Efisiensi η (%)', '#f97316');
  if(chart){
    chart.data.labels = data.map(d => d.dT + ' K');
    chart.data.datasets[0].data = data.map(d => d.eff);
    chart.update();
  }
}

function resetCarnot(){
  appState.experimentsData.carnot = [];
  saveAppState();
  renderCarnotData();
  const card = document.getElementById('carnotResultCard');
  if(card) card.classList.remove('show');
  showToast('Data Carnot direset.', 'info');
}
