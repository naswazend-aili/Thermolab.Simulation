/* ==========================================================================
   Efek visual gaya Kahoot: ikon bentuk jawaban, confetti, dan timer cincin.
   Dipakai bareng oleh Challenge (pass-and-play) dan host/player-battle.html.
   ========================================================================== */
const KQ_SHAPES = [
  '<svg viewBox="0 0 24 24" class="kq-shape"><polygon points="12,3 21,20 3,20" fill="#fff"/></svg>',                 // segitiga
  '<svg viewBox="0 0 24 24" class="kq-shape"><polygon points="12,2 22,12 12,22 2,12" fill="#fff"/></svg>',            // wajik
  '<svg viewBox="0 0 24 24" class="kq-shape"><circle cx="12" cy="12" r="9" fill="#fff"/></svg>',                      // lingkaran
  '<svg viewBox="0 0 24 24" class="kq-shape"><rect x="3" y="3" width="18" height="18" rx="3" fill="#fff"/></svg>'     // kotak
];

function kqConfettiBurst(count = 90){
  const colors = ['#e21b3c', '#1368ce', '#d89e00', '#26890c', '#fde68a', '#a855f7'];
  for(let i = 0; i < count; i++){
    const el = document.createElement('div');
    el.className = 'kq-confetti-piece';
    el.style.left = Math.random() * 100 + 'vw';
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.animationDuration = (2.2 + Math.random() * 1.6) + 's';
    el.style.animationDelay = (Math.random() * 0.5) + 's';
    el.style.borderRadius = Math.random() < 0.5 ? '50%' : '2px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 4500);
  }
}

/* Timer cincin besar. Taruh <div class="kq-timer-ring" id="X"><svg>...</svg><div class="kq-timer-num"></div></div>
   lalu panggil kqTimerRing(id) sekali untuk dapat fungsi update(secondsLeft, secondsTotal). */
function kqTimerRingHTML(id){
  return `<div class="kq-timer-ring" id="${id}">
    <svg viewBox="0 0 80 80"><circle class="kq-ring-bg" cx="40" cy="40" r="34"/><circle class="kq-ring-fg" id="${id}-fg" cx="40" cy="40" r="34"/></svg>
    <div class="kq-timer-num" id="${id}-num">--</div>
  </div>`;
}
function kqTimerRing(id){
  const C = 2 * Math.PI * 34;
  const fg = document.getElementById(id + '-fg'), num = document.getElementById(id + '-num');
  fg.style.strokeDasharray = C;
  return (secLeft, secTotal) => {
    const frac = Math.max(0, Math.min(1, secLeft / secTotal));
    fg.style.strokeDashoffset = C * (1 - frac);
    fg.classList.toggle('urgent', secLeft <= Math.min(5, secTotal * 0.25));
    num.textContent = Math.max(0, Math.ceil(secLeft));
  };
}

function kqPodiumHTML(ranked){
  const medal = ['gold', 'silver', 'bronze'];
  const top3 = ranked.slice(0, 3);
  return `<div class="kq-podium">` + top3.map((r, i) => `
    <div class="kq-podium-col ${medal[i]}">
      <div class="kq-podium-avatar" style="background:${r.color || '#64748b'}">${(r.name || '?').slice(0,1).toUpperCase()}</div>
      <div class="kq-podium-name">${r.name}</div>
      <div class="kq-podium-score">${r.damage || 0} dmg</div>
      <div class="kq-podium-bar">${i + 1}</div>
    </div>`).join('') + `</div>`;
}
