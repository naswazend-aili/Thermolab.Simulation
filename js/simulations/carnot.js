/* ==========================================================================
   Simulation: Siklus Carnot (Hukum II Termodinamika)
   Siklus 4 tahap sungguhan (isotermal-adiabatik) + diagram P-V berskala tetap,
   jadi perubahan T_H / T_C langsung terlihat pada luas area siklus (= usaha W).
   ========================================================================== */
let carnotCanvas = null, carnotCtx = null;
let carnotS = 0;            // posisi siklus 0..4 (tiap 1 satuan = 1 tahap)
let carnotRunning = false, carnotTarget = null;
const CARNOT_GAMMA = 5 / 3; // gas monoatomik ideal
const CARNOT_STAGES = [
  'Tahap 1 — Ekspansi isotermal: gas menyerap Q_H dari reservoir panas',
  'Tahap 2 — Ekspansi adiabatik: suhu gas turun dari T_H ke T_C',
  'Tahap 3 — Kompresi isotermal: gas membuang Q_C ke reservoir dingin',
  'Tahap 4 — Kompresi adiabatik: suhu gas naik dari T_C ke T_H'
];

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
    playBtn.addEventListener('click', () => {
      carnotTarget = null;
      carnotRunning = !carnotRunning;
      playBtn.textContent = carnotRunning ? '⏸ Jeda' : '▶ Jalankan';
      if(carnotRunning && typeof SFX !== 'undefined') SFX.click();
    });
  }
  const stepBtn = document.getElementById('carnotStepBtn');
  if(stepBtn){
    stepBtn.addEventListener('click', () => {
      carnotTarget = (Math.floor(carnotS / 4) + 1) * 4;   // berhenti tepat di akhir siklus
      carnotRunning = true;
      if(playBtn) playBtn.textContent = '⏸ Jeda';
      if(typeof SFX !== 'undefined') SFX.click();
    });
  }
  const recordBtn = document.getElementById('carnotRecordBtn');
  if(recordBtn) recordBtn.addEventListener('click', recordCarnotData);

  drawCarnotCanvas();
  renderCarnotData();
}

function carnotParams(){
  const Th = +document.getElementById('thSlider').value;
  const Tc = +document.getElementById('tcSlider').value;
  const r = Math.pow(Th / Tc, 1 / (CARNOT_GAMMA - 1));
  return { Th, Tc, V1: 1, V2: 3, V3: 3 * r, V4: r };
}

/* keadaan gas (V, T) pada posisi siklus s */
function carnotState(p, s){
  const seg = Math.min(3, Math.floor(s)), u = s - seg;
  if(seg === 0) return { V: p.V1 + (p.V2 - p.V1) * u, T: p.Th, seg };
  if(seg === 1){ const V = p.V2 + (p.V3 - p.V2) * u; return { V, T: p.Th * Math.pow(p.V2 / V, CARNOT_GAMMA - 1), seg }; }
  if(seg === 2) return { V: p.V3 + (p.V4 - p.V3) * u, T: p.Tc, seg };
  const V = p.V4 + (p.V1 - p.V4) * u;
  return { V, T: p.Tc * Math.pow(p.V4 / V, CARNOT_GAMMA - 1), seg };
}

function updateCarnotReadouts(){
  const thSlider = document.getElementById('thSlider');
  const tcSlider = document.getElementById('tcSlider');
  if(!thSlider || !tcSlider) return;
  let Th = +thSlider.value, Tc = +tcSlider.value;
  if(Tc >= Th){ Tc = Th - 20; tcSlider.value = Tc; }
  document.getElementById('thVal').textContent = Th + ' K';
  document.getElementById('tcVal').textContent = Tc + ' K';
  const eff = 1 - Tc / Th;
  document.getElementById('effVal').textContent = Math.round(eff * 100) + '%';
  const Qh = 200, W = Qh * eff, Qc = Qh - W;
  document.getElementById('carnotQhVal').textContent = Qh.toFixed(0);
  document.getElementById('carnotWVal').textContent = W.toFixed(1);
  document.getElementById('carnotQcVal').textContent = Qc.toFixed(1);
}

function drawCarnotCanvas(){
  if(!carnotCtx) return;
  const c = carnotCtx, CW = carnotCanvas.width, CH = carnotCanvas.height;
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const ink = isDark ? '#f8fafc' : '#0f172a', mute = isDark ? '#94a3b8' : '#64748b';
  const p = carnotParams();
  const eff = 1 - p.Tc / p.Th;

  if(carnotRunning){
    carnotS += 0.012;
    if(carnotTarget !== null && carnotS >= carnotTarget){
      carnotS = carnotTarget % 4; carnotTarget = null; carnotRunning = false;
      const b = document.getElementById('carnotPlayBtn'); if(b) b.textContent = '▶ Jalankan';
    }
    if(carnotS >= 4 && carnotTarget === null) carnotS -= 4;
  }
  const st = carnotState(p, carnotS % 4);

  c.clearRect(0, 0, CW, CH);
  c.fillStyle = isDark ? '#1c2541' : '#f8fafc'; c.fillRect(0, 0, CW, CH);

  /* ---------- KIRI: silinder + dua reservoir ---------- */
  const tH = (p.Th - 450) / 500, tC = (p.Tc - 250) / 170;
  const hotOn = st.seg === 0, coldOn = st.seg === 2;
  const cylX = 50, cylY = 124, cylW = 210, cylH = 76;

  // reservoir panas (makin panas -> makin merah & pekat)
  const hotY = hotOn ? cylY - 46 : cylY - 64;
  c.fillStyle = `hsl(${34 - 30 * tH}, 92%, ${62 - 16 * tH}%)`; c.fillRect(cylX, hotY, cylW, 46);
  c.fillStyle = '#fff'; c.font = 'bold 13px Poppins'; c.fillText('Reservoir Panas  T_H = ' + p.Th + ' K', cylX + 10, hotY + 28);
  // reservoir dingin (makin dingin -> makin biru tua)
  const coldY = coldOn ? cylY + cylH : cylY + cylH + 18;
  c.fillStyle = `hsl(${198 + 20 * (1 - tC)}, 82%, ${70 - 26 * (1 - tC)}%)`; c.fillRect(cylX, coldY, cylW, 46);
  c.fillStyle = '#fff'; c.fillText('Reservoir Dingin  T_C = ' + p.Tc + ' K', cylX + 10, coldY + 28);

  // silinder & gas (warna gas mengikuti suhu gas saat ini)
  const pistonX = cylX + 12 + ((st.V - p.V1) / (p.V3 - p.V1)) * (cylW - 40);
  const gt = Math.max(0, Math.min(1, (st.T - 250) / 700));   // biru (dingin) -> merah (panas)
  c.fillStyle = `rgb(${Math.round(56 + 183 * gt)}, ${Math.round(189 - 121 * gt)}, ${Math.round(248 - 180 * gt)})`; c.fillRect(cylX + 3, cylY + 3, pistonX - cylX - 3, cylH - 6);
  c.strokeStyle = isDark ? '#94a3b8' : '#475569'; c.lineWidth = 4; c.strokeRect(cylX, cylY, cylW, cylH);
  c.fillStyle = isDark ? '#cbd5e1' : '#334155'; c.fillRect(pistonX, cylY + 3, 14, cylH - 6);
  c.fillRect(pistonX + 14, cylY + cylH / 2 - 4, 262 - pistonX - 14 + 20, 8);

  // panah aliran kalor
  c.lineWidth = 6; c.lineCap = 'round';
  if(hotOn){ c.strokeStyle = '#f97316'; c.beginPath(); c.moveTo(cylX + cylW / 2, cylY - 16); c.lineTo(cylX + cylW / 2, cylY + 22); c.stroke(); }
  if(coldOn){ c.strokeStyle = '#0ea5e9'; c.beginPath(); c.moveTo(cylX + cylW / 2, cylY + cylH - 22); c.lineTo(cylX + cylW / 2, cylY + cylH + 16); c.stroke(); }

  // suhu gas saat ini
  c.fillStyle = ink; c.font = 'bold 13px Poppins';
  c.fillText('Suhu gas: ' + Math.round(st.T) + ' K', cylX, 22);
  c.font = '11.5px Poppins'; c.fillStyle = mute;
  c.fillText(CARNOT_STAGES[st.seg].split(':')[0], cylX, 40);

  // batang energi: Q_H = W + Q_C  (berubah langsung saat slider digeser)
  const bx = 22, by = 292, bw = 290, wPx = bw * eff;
  c.fillStyle = ink; c.font = 'bold 12px Poppins'; c.fillText('Pembagian energi dari Q_H = 200 J', bx, by - 8);
  c.fillStyle = '#22c55e'; c.fillRect(bx, by, wPx, 24);
  c.fillStyle = '#38bdf8'; c.fillRect(bx + wPx, by, bw - wPx, 24);
  c.fillStyle = '#fff'; c.font = 'bold 11.5px Poppins';
  if(wPx > 62) c.fillText('W ' + (200 * eff).toFixed(0) + ' J', bx + 6, by + 16);
  c.fillText('Q_C ' + (200 * (1 - eff)).toFixed(0) + ' J', bx + wPx + 6, by + 16);
  c.fillStyle = mute; c.font = '11px Poppins';
  c.fillText('η = ' + Math.round(eff * 100) + '%  (hijau = usaha berguna)', bx, by + 42);

  /* ---------- KANAN: diagram P-V (skala tetap) ---------- */
  const x0 = 372, x1 = 620, y0 = 296, y1 = 40;
  const sx = V => x0 + (V / 24) * (x1 - x0), sy = P => y0 - (P / 1000) * (y0 - y1);
  c.fillStyle = ink; c.font = 'bold 13px Poppins'; c.fillText('Diagram P–V (skala tetap)', x0 - 20, 22);
  c.strokeStyle = mute; c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(x0, y1 - 6); c.lineTo(x0, y0); c.lineTo(x1 + 6, y0); c.stroke();
  c.fillStyle = mute; c.font = '11px Poppins'; c.fillText('P', x0 - 14, y1 + 2); c.fillText('V', x1 + 2, y0 + 14);

  const pts = [], N = 40;
  const push = (V, T, seg, P) => pts.push({ x: sx(V), y: sy(P !== undefined ? P : T / V), seg });
  for(let i = 0; i <= N; i++){ const V = p.V1 + (p.V2 - p.V1) * i / N; push(V, p.Th, 0); }
  const Pb = p.Th / p.V2;
  for(let i = 1; i <= N; i++){ const V = p.V2 + (p.V3 - p.V2) * i / N; push(V, 0, 1, Pb * Math.pow(p.V2 / V, CARNOT_GAMMA)); }
  for(let i = 1; i <= N; i++){ const V = p.V3 + (p.V4 - p.V3) * i / N; push(V, p.Tc, 2); }
  const Pd = p.Tc / p.V4;
  for(let i = 1; i <= N; i++){ const V = p.V4 + (p.V1 - p.V4) * i / N; push(V, 0, 3, Pd * Math.pow(p.V4 / V, CARNOT_GAMMA)); }

  c.beginPath(); pts.forEach((q, i) => i ? c.lineTo(q.x, q.y) : c.moveTo(q.x, q.y)); c.closePath();
  c.fillStyle = 'rgba(34,197,94,0.28)'; c.fill();                       // luas = usaha W
  const segCol = ['#f97316', '#a855f7', '#0ea5e9', '#a855f7'];
  for(let sg = 0; sg < 4; sg++){
    c.beginPath();
    for(let k = sg * N; k <= (sg + 1) * N; k++){ k === sg * N ? c.moveTo(pts[k].x, pts[k].y) : c.lineTo(pts[k].x, pts[k].y); }
    c.strokeStyle = segCol[sg]; c.lineWidth = (sg === st.seg) ? 5 : 2.5; c.stroke();
  }
  const lab = [['A', p.V1, p.Th / p.V1], ['B', p.V2, Pb], ['C', p.V3, p.Tc / p.V3], ['D', p.V4, Pd]];
  c.fillStyle = ink; c.font = 'bold 12px Poppins';
  lab.forEach(l => c.fillText(l[0], sx(l[1]) + 5, sy(l[2]) - 5));
  // titik gas saat ini
  const Pnow = st.seg === 1 ? Pb * Math.pow(p.V2 / st.V, CARNOT_GAMMA) : st.seg === 3 ? Pd * Math.pow(p.V4 / st.V, CARNOT_GAMMA) : st.T / st.V;
  c.beginPath(); c.arc(sx(st.V), sy(Pnow), 7, 0, Math.PI * 2); c.fillStyle = '#ef4444'; c.fill();
  c.strokeStyle = '#fff'; c.lineWidth = 2; c.stroke();
  c.fillStyle = mute; c.font = '11px Poppins';
  c.fillText('Luas hijau = usaha W per siklus', x0 + 6, y0 + 28);
  c.fillStyle = ink; c.font = 'bold 11.5px Poppins';
  c.fillText(CARNOT_STAGES[st.seg].split('—')[0].trim(), x0 + 6, y0 + 46);

  // Berhenti kalau halaman tidak aktif (hemat baterai); goTo() menyalakan lagi.
  if(typeof isPageActive === 'function' && !isPageActive('carnot')) return;
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
