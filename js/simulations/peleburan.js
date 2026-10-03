/* ==========================================================================
   Simulation: Kalor Laten & Perubahan Wujud (Tungku Peleburan)
   Model energi: Q = m·c·ΔT (tiap fase) dan Q = m·L (saat berubah wujud).
   Setiap bahan punya suhu awal, titik lebur/didih, kalor jenis, dan kalor laten
   berbeda, sehingga gambar wadah dan bentuk grafiknya juga berbeda.
   ========================================================================== */
let furnaceCanvas = null, furnaceCtx = null;
let furnaceRunning = false, furnaceTime = 0, furnaceTemp = 20;
let furnacePhase = 'solid', furnaceLatent = 0, furnaceHist = [], furnaceFrame = 0;

const FURNACE_MASS = 100;      // gram
const FURNACE_PMAX = 2000;     // W (pada daya 100%)
const FURNACE_DT = 0.1, FURNACE_SPEED = 6;   // waktu simulasi dipercepat

// c dalam J/g°C, L dalam J/g (nilai pendekatan untuk ilustrasi)
const presetsFurnace = {
  es:    { name: 'Es Batu',       T0: -20, melt: 0,   boil: 100,  cs: 2.1,  cl: 4.18, cg: 2.0, Lf: 334, Lv: 2260, solid: '#cfeeff', liquid: '#2f8ce0', gas: '#e0f2fe', vapor: 'uap air' },
  lilin: { name: 'Lilin Parafin', T0: 20,  melt: 60,  boil: 300,  cs: 2.2,  cl: 2.5,  cg: 2.0, Lf: 210, Lv: 250,  solid: '#f6ecd2', liquid: '#f0c75e', gas: '#fde9b0', vapor: 'uap parafin' },
  timah: { name: 'Logam Timah',   T0: 25,  melt: 232, boil: 2602, cs: 0.227, cl: 0.24, cg: 0.2, Lf: 59,  Lv: 2490, solid: '#94a3b8', liquid: '#e2e8f0', gas: '#cbd5e1', vapor: 'uap timah' }
};

function furnaceMat(){ return presetsFurnace[document.getElementById('furnaceMaterialSelect')?.value || 'es']; }

function initFurnaceSim(){
  furnaceCanvas = document.getElementById('furnaceCanvas');
  if(!furnaceCanvas) return;
  furnaceCtx = furnaceCanvas.getContext('2d');

  const playBtn = document.getElementById('furnacePlayBtn');
  if(playBtn){
    playBtn.addEventListener('click', () => {
      furnaceRunning = !furnaceRunning;
      playBtn.textContent = furnaceRunning ? '⏸ Jeda Pemanasan' : '▶ Mulai Pemanasan';
      if(typeof SFX !== 'undefined') SFX.click();
    });
  }
  const sel = document.getElementById('furnaceMaterialSelect');
  if(sel) sel.addEventListener('change', () => {
    resetFurnaceRun();
    if(typeof SFX !== 'undefined') SFX.click();
    showToast('Bahan diganti ke ' + furnaceMat().name + '. Pemanasan dimulai ulang dari suhu awal ' + furnaceMat().T0 + '°C.', 'info');
  });
  const recordBtn = document.getElementById('furnaceRecordBtn');
  if(recordBtn) recordBtn.addEventListener('click', recordFurnaceData);

  resetFurnaceRun();
  drawFurnaceCanvas();
  renderFurnaceData();
}

function resetFurnaceRun(){
  const p = furnaceMat();
  furnaceRunning = false; furnaceTime = 0; furnaceTemp = p.T0;
  furnacePhase = 'solid'; furnaceLatent = 0; furnaceHist = []; furnaceFrame = 0;
  const playBtn = document.getElementById('furnacePlayBtn');
  if(playBtn) playBtn.textContent = '▶ Mulai Pemanasan';
}

const FURNACE_LABEL = { solid: 'Padat', melting: 'Melebur (Laten)', liquid: 'Cair', boiling: 'Mendidih (Laten)', gas: 'Gas' };

/* satu langkah energi: memasukkan E joule ke bahan */
function furnaceAddEnergy(p, E){
  const m = FURNACE_MASS;
  while(E > 1e-9){
    if(furnacePhase === 'solid'){
      const need = m * p.cs * (p.melt - furnaceTemp);
      if(E < need){ furnaceTemp += E / (m * p.cs); E = 0; } else { furnaceTemp = p.melt; E -= Math.max(need, 0); furnacePhase = 'melting'; furnaceLatent = 0; }
    } else if(furnacePhase === 'melting'){
      const need = m * p.Lf - furnaceLatent;
      if(E < need){ furnaceLatent += E; E = 0; } else { E -= need; furnacePhase = 'liquid'; furnaceLatent = 0; }
    } else if(furnacePhase === 'liquid'){
      const need = m * p.cl * (p.boil - furnaceTemp);
      if(E < need){ furnaceTemp += E / (m * p.cl); E = 0; } else { furnaceTemp = p.boil; E -= Math.max(need, 0); furnacePhase = 'boiling'; furnaceLatent = 0; }
    } else if(furnacePhase === 'boiling'){
      const need = m * p.Lv - furnaceLatent;
      if(E < need){ furnaceLatent += E; E = 0; } else { E -= need; furnacePhase = 'gas'; furnaceLatent = 0; }
    } else { furnaceTemp += E / (m * p.cg); E = 0; }
  }
}

function drawFurnaceCanvas(){
  if(!furnaceCtx) return;
  const c = furnaceCtx, CW = furnaceCanvas.width, CH = furnaceCanvas.height;
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const ink = isDark ? '#f8fafc' : '#0f172a', mute = isDark ? '#94a3b8' : '#64748b';
  const p = furnaceMat();
  const power = +(document.getElementById('furnacePowerSlider')?.value || 60);
  const pVal = document.getElementById('furnacePowerVal'); if(pVal) pVal.textContent = power + '%';
  const yMax = p.boil + (p.boil - p.T0) * 0.18;

  if(furnaceRunning){
    furnaceAddEnergy(p, power / 100 * FURNACE_PMAX * FURNACE_DT * FURNACE_SPEED);
    furnaceTime += FURNACE_DT * FURNACE_SPEED;
    furnaceFrame++;
    if(furnaceFrame % 2 === 0) furnaceHist.push({ t: furnaceTime, T: furnaceTemp, ph: furnacePhase });
    if(furnaceTemp >= p.boil + (p.boil - p.T0) * 0.15){
      furnaceRunning = false;
      const b = document.getElementById('furnacePlayBtn'); if(b) b.textContent = '▶ Mulai Pemanasan';
      showToast('Pemanasan selesai: bahan sudah menjadi gas. Tekan Reset untuk mengulang.', 'info');
    }
  }
  const phaseLabel = FURNACE_LABEL[furnacePhase];
  const tempVal = document.getElementById('furnaceTempVal'); if(tempVal) tempVal.textContent = Math.round(furnaceTemp) + '°C';
  const tagVal = document.getElementById('phaseTagBadge'); if(tagVal) tagVal.textContent = phaseLabel;

  c.clearRect(0, 0, CW, CH);
  c.fillStyle = isDark ? '#1c2541' : '#f8fafc'; c.fillRect(0, 0, CW, CH);

  /* ---------- KIRI: wadah + api + termometer ---------- */
  const cx = 30, cw = 210, cyTop = 96, ch = 150, base = cyTop + ch;
  const inner = { x: cx + 8, w: cw - 16, top: cyTop + 8, h: ch - 16 };
  const fill = furnacePhase === 'melting' ? furnaceLatent / (FURNACE_MASS * p.Lf) : furnacePhase === 'boiling' ? furnaceLatent / (FURNACE_MASS * p.Lv) : 0;
  const tNow = furnaceTime;

  // isi wadah
  const liqH = furnacePhase === 'melting' ? inner.h * 0.62 * fill : furnacePhase === 'liquid' ? inner.h * 0.62 : furnacePhase === 'boiling' ? inner.h * 0.62 * (1 - fill) : 0;
  const bottom = inner.top + inner.h;
  if(furnacePhase === 'solid' || furnacePhase === 'melting'){
    const sh = inner.h * 0.62 * (furnacePhase === 'melting' ? 1 - fill : 1);
    c.fillStyle = p.solid; c.fillRect(inner.x + 34, bottom - liqH - sh, inner.w - 68, sh);
    c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 2; c.strokeRect(inner.x + 34, bottom - liqH - sh, inner.w - 68, sh);
  }
  if(liqH > 0){
    c.fillStyle = p.liquid; c.beginPath(); c.moveTo(inner.x, bottom);
    for(let x = 0; x <= inner.w; x += 6){ c.lineTo(inner.x + x, bottom - liqH + Math.sin(x * 0.09 + tNow * 0.6) * (furnacePhase === 'boiling' ? 4 : 2)); }
    c.lineTo(inner.x + inner.w, bottom); c.closePath(); c.fill();
  }
  if(furnacePhase === 'boiling'){                        // gelembung
    for(let i = 0; i < 9; i++){
      const bx = inner.x + 20 + ((i * 47 + tNow * 9) % (inner.w - 40)), by = bottom - ((tNow * 26 + i * 31) % Math.max(liqH, 10));
      c.beginPath(); c.arc(bx, by, 3 + (i % 3), 0, Math.PI * 2); c.fillStyle = 'rgba(255,255,255,0.75)'; c.fill();
    }
  }
  if(furnacePhase === 'boiling' || furnacePhase === 'gas'){   // uap naik
    const n = furnacePhase === 'gas' ? 14 : 7;
    for(let i = 0; i < n; i++){
      const ux = cx + 20 + ((i * 41) % (cw - 40)) + Math.sin(tNow * 0.5 + i) * 8;
      const uy = cyTop - 10 - ((tNow * 14 + i * 23) % 70);
      c.beginPath(); c.arc(ux, uy, 9 + (i % 4) * 2, 0, Math.PI * 2); c.fillStyle = p.gas; c.globalAlpha = 0.55; c.fill(); c.globalAlpha = 1;
    }
    if(furnacePhase === 'gas'){ c.fillStyle = p.gas; c.globalAlpha = 0.35; c.fillRect(inner.x, inner.top, inner.w, inner.h); c.globalAlpha = 1; }
  }
  // dinding wadah
  c.strokeStyle = isDark ? '#94a3b8' : '#475569'; c.lineWidth = 5;
  c.beginPath(); c.moveTo(cx, cyTop); c.lineTo(cx, base); c.lineTo(cx + cw, base); c.lineTo(cx + cw, cyTop); c.stroke();

  // api (tinggi mengikuti daya)
  if(furnaceRunning){
    for(let i = 0; i < 6; i++){
      const fx = cx + 22 + i * ((cw - 44) / 5), fh = (14 + power * 0.32) * (0.8 + 0.4 * Math.sin(tNow * 3 + i * 1.7));
      c.beginPath(); c.moveTo(fx - 9, base + 40); c.quadraticCurveTo(fx - 4, base + 40 - fh * 0.6, fx, base + 40 - fh); c.quadraticCurveTo(fx + 4, base + 40 - fh * 0.6, fx + 9, base + 40); c.closePath();
      c.fillStyle = i % 2 ? '#fb923c' : '#facc15'; c.fill();
    }
  }
  c.fillStyle = isDark ? '#334155' : '#475569'; c.fillRect(cx - 10, base + 6, cw + 20, 34);
  c.fillStyle = '#fff'; c.font = 'bold 12px Poppins'; c.fillText('Tungku ' + power + '%', cx + 6, base + 28);

  // label bahan
  c.fillStyle = ink; c.font = 'bold 15px Poppins'; c.fillText(p.name, cx, 24);
  c.font = '11.5px Poppins'; c.fillStyle = mute;
  c.fillText('Lebur ' + p.melt + '°C · Didih ' + p.boil + '°C', cx, 42);
  c.fillText('L_lebur = ' + p.Lf + ' J/g · L_uap = ' + p.Lv + ' J/g', cx, 58);
  c.fillStyle = ink; c.font = 'bold 13px Poppins';
  c.fillText('Fase: ' + phaseLabel, cx, 82);

  // termometer
  const tx = 262, ty0 = cyTop - 10, ty1 = base + 6;
  c.strokeStyle = mute; c.lineWidth = 2; c.strokeRect(tx, ty0, 14, ty1 - ty0);
  const frac = Math.max(0, Math.min(1, (furnaceTemp - p.T0) / (yMax - p.T0)));
  c.fillStyle = '#ef4444'; c.fillRect(tx + 2, ty1 - (ty1 - ty0) * frac, 10, (ty1 - ty0) * frac);
  [[p.melt, 'lebur'], [p.boil, 'didih']].forEach(m => {
    const yy = ty1 - (ty1 - ty0) * ((m[0] - p.T0) / (yMax - p.T0));
    c.strokeStyle = '#f97316'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(tx - 4, yy); c.lineTo(tx + 18, yy); c.stroke();
  });

  /* ---------- KANAN: grafik suhu-waktu hidup ---------- */
  const gx0 = 350, gx1 = 622, gy0 = 292, gy1 = 44;
  const tMax = Math.max(80, furnaceTime * 1.08);
  const gsx = t => gx0 + (t / tMax) * (gx1 - gx0), gsy = T => gy0 - ((T - p.T0) / (yMax - p.T0)) * (gy0 - gy1);
  c.fillStyle = ink; c.font = 'bold 13px Poppins'; c.fillText('Grafik Suhu terhadap Waktu', gx0 - 20, 18);
  c.strokeStyle = mute; c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(gx0, gy1 - 6); c.lineTo(gx0, gy0); c.lineTo(gx1 + 6, gy0); c.stroke();
  c.font = '11px Poppins'; c.fillStyle = mute;
  c.fillText('T (°C)', gx0 - 20, gy1 - 10); c.fillText('t (s)', gx1 - 18, gy0 + 16);
  [[p.melt, 'titik lebur ' + p.melt + '°C'], [p.boil, 'titik didih ' + p.boil + '°C']].forEach(m => {
    const yy = gsy(m[0]);
    c.setLineDash([5, 5]); c.strokeStyle = 'rgba(249,115,22,0.6)'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(gx0, yy); c.lineTo(gx1, yy); c.stroke(); c.setLineDash([]);
    c.fillStyle = '#f97316'; c.fillText(m[1], gx0 + 6, yy - 4);
  });
  const col = { solid: '#ef4444', melting: '#8b5cf6', liquid: '#ef4444', boiling: '#8b5cf6', gas: '#ef4444' };
  c.lineWidth = 3;
  for(let i = 1; i < furnaceHist.length; i++){
    c.strokeStyle = col[furnaceHist[i].ph];
    c.beginPath(); c.moveTo(gsx(furnaceHist[i - 1].t), gsy(furnaceHist[i - 1].T)); c.lineTo(gsx(furnaceHist[i].t), gsy(furnaceHist[i].T)); c.stroke();
  }
  c.beginPath(); c.arc(gsx(furnaceTime), gsy(furnaceTemp), 6, 0, Math.PI * 2); c.fillStyle = '#ef4444'; c.fill();
  c.fillStyle = '#8b5cf6'; c.font = '11px Poppins'; c.fillText('ungu = suhu konstan (kalor laten)', gx0 + 6, gy0 + 34);

  if(typeof isPageActive === 'function' && !isPageActive('peleburan')) return;
  requestAnimationFrame(drawFurnaceCanvas);
}

function resetFurnace(){
  resetFurnaceRun();
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
