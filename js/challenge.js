/* ==========================================================================
   ThermoLab Challenge — Battle Monster
   Solo (60 detik) atau Regu bergantian di satu layar. Jawaban benar (dan cepat)
   melukai monster. Situs ini statis, jadi mode regu = pass-and-play, bukan
   multiplayer antar-perangkat.
   ========================================================================== */

const challengeBank = [
  { q: 'Sebuah mesin Carnot memiliki T_H = 600 K dan T_C = 300 K. Efisiensinya adalah...', o: ['50%', '25%', '75%', '100%'], a: 0 },
  { q: 'Asas Black menyatakan bahwa pada kalorimeter tertutup berlaku hubungan...', o: ['Q_lepas = Q_terima', 'Q = m · L', 'ΔU = Q + W', 'W = P · V'], a: 0 },
  { q: 'Di antara tembaga, besi, dan kayu, material konduktor terbaik adalah...', o: ['Tembaga', 'Besi', 'Kayu', 'Air'], a: 0 },
  { q: 'Pada grafik kurva pemanasan, bagian mendatar menunjukkan proses...', o: ['Perubahan wujud zat', 'Kenaikan suhu cepat', 'Penurunan tekanan', 'Penyerapan massa'], a: 0 },
  { q: 'Kenaikan suhu pada suatu zat berbanding lurus dengan...', o: ['Energi kinetik rata-rata partikel', 'Massa wadah', 'Jumlah proton', 'Tinggi tempat'], a: 0 },
  { q: 'Jika gas menyerap kalor 200 J dan melakukan usaha 50 J, maka ΔU adalah...', o: ['150 J', '250 J', '100 J', '50 J'], a: 0 },
  { q: 'Satuan standar suhu mutlak dalam termodinamika adalah...', o: ['Kelvin (K)', 'Celsius (°C)', 'Fahrenheit (°F)', 'Reamur (°R)'], a: 0 },
  { q: 'Kalor yang digunakan untuk mengubah zat cair menjadi gas disebut...', o: ['Kalor laten penguapan', 'Kalor jenis', 'Kapasitas kalor', 'Kalor peleburan'], a: 0 },
  { q: 'Kalor jenis air 4,18 J/g·°C artinya...', o: ['4,18 J menaikkan suhu 1 g air sebesar 1°C', '4,18 J melebur 1 g es', '4,18 J menguapkan 1 g air', '4,18 J menaikkan suhu 1 kg air 1 K'], a: 0 },
  { q: 'Kalor untuk menaikkan suhu 2 kg air sebesar 10°C (c = 4200 J/kg·°C) adalah...', o: ['84.000 J', '8.400 J', '42.000 J', '840.000 J'], a: 0 },
  { q: 'Perpindahan kalor melalui zat padat tanpa disertai perpindahan partikelnya disebut...', o: ['Konduksi', 'Konveksi', 'Radiasi', 'Evaporasi'], a: 0 },
  { q: 'Gas menerima kalor 300 J dan melakukan usaha 100 J. Perubahan energi dalamnya...', o: ['200 J', '400 J', '300 J', '100 J'], a: 0 },
  { q: 'Pada proses isotermal gas ideal, perubahan energi dalamnya...', o: ['Sama dengan nol', 'Selalu positif', 'Selalu negatif', 'Sama dengan 2W'], a: 0 },
  { q: 'Selama es melebur pada tekanan tetap, suhu campuran es-air...', o: ['Tetap', 'Naik terus', 'Turun', 'Naik lalu turun'], a: 0 },
  { q: 'Mesin Carnot tidak pernah mencapai efisiensi 100% karena...', o: ['T_C tidak mungkin mencapai 0 K', 'Piston selalu macet', 'Gas selalu bocor', 'Massa gas berubah'], a: 0 },
  { q: 'Gaya tarik antarpartikel paling lemah terdapat pada wujud...', o: ['Gas', 'Cair', 'Padat', 'Kristal'], a: 0 },
  { q: '0°C sama dengan berapa Kelvin?', o: ['273 K', '0 K', '373 K', '100 K'], a: 0 },
  { q: 'Kalorimeter ideal dianggap sistem terisolasi, artinya...', o: ['Tidak ada kalor keluar-masuk', 'Tidak ada massa air', 'Suhu selalu 0°C', 'Tekanan sama dengan nol'], a: 0 },
  { q: 'Kapasitas kalor benda bermassa m dan kalor jenis c dinyatakan...', o: ['C = m · c', 'C = m / c', 'C = c / m', 'C = m + c'], a: 0 },
  { q: 'Suhu akhir setimbang logam panas + air dingin berada...', o: ['Di antara suhu awal logam dan air', 'Di atas suhu awal logam', 'Di bawah suhu awal air', 'Selalu 0°C'], a: 0 }
];

const TEAM_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b'];
const TEAM_DEFAULTS = ['Regu A', 'Regu B', 'Regu C', 'Regu D'];
const TEAM_Q_TIME = 20;

let ch = null; // battle state

function chEl(id){ return document.getElementById(id); }
function chEscape(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function chShuffle(arr){ return [...arr].sort(() => 0.5 - Math.random()); }
function chShow(view){
  ['gameModeSelectView', 'gameTeamRoomView', 'gameActiveQuestionView', 'gameOverView'].forEach(id => {
    const el = chEl(id); if(el) el.style.display = (id === view) ? 'block' : 'none';
  });
}

function initChallenge(){ resetChallengeGame(); }

function showTeamRoomView(){
  chShow('gameTeamRoomView');
  updateTeamInputs();
}

function updateTeamInputs(){
  const n = +chEl('teamCountSelect').value;
  const old = [...document.querySelectorAll('.team-name-input')].map(i => i.value);
  chEl('teamNameInputs').innerHTML = Array.from({ length: n }, (_, i) => `
    <input type="text" class="team-name-input" maxlength="18" value="${chEscape(old[i] || TEAM_DEFAULTS[i])}"
      style="margin-bottom:8px; background:rgba(255,255,255,0.9); color:#0f172a; border-left:6px solid ${TEAM_COLORS[i]};">
  `).join('');
}

function startSoloChallenge(){
  chStart('solo', [{ name: 'Kamu' }]);
}

function startTeamBattle(){
  const names = [...document.querySelectorAll('.team-name-input')].map((i, idx) => i.value.trim() || TEAM_DEFAULTS[idx]);
  chStart('team', names.map(name => ({ name })));
}

function chStart(mode, teams){
  if(ch && ch.timer) clearInterval(ch.timer);
  const nQ = mode === 'team' ? Math.min(teams.length * 4, challengeBank.length) : challengeBank.length;
  ch = {
    mode,
    teams: teams.map((t, i) => ({ name: t.name, color: TEAM_COLORS[i], dmg: 0, correct: 0 })),
    turn: 0,
    qs: chShuffle(challengeBank).slice(0, nQ),
    qi: 0,
    maxHp: mode === 'team' ? nQ * 60 : 500,
    hp: mode === 'team' ? nQ * 60 : 500,
    timeLeft: mode === 'team' ? TEAM_Q_TIME : 60,
    locked: false, over: false, timer: null
  };
  chShow('gameActiveQuestionView');
  chEl('monsterEmoji').className = 'monster-emoji';
  chEl('gameFeedback').textContent = '';
  chEl('chTimerWrap').innerHTML = kqTimerRingHTML('chRing');
  ch.ringUpdate = kqTimerRing('chRing');
  ch.roundTotal = ch.mode === 'team' ? TEAM_Q_TIME : 60;
  chRenderMonster();
  chRenderTeams();
  chLoadQuestion();
  if(typeof SFX !== 'undefined') SFX.voice(mode === 'team'
    ? 'Battle dimulai! Kalahkan monster entropi bersama-sama. Giliran ' + ch.teams[0].name + '.'
    : 'Battle dimulai! Kalahkan monster sebelum waktu habis.');
  chStartTimer();
}

function chStartTimer(){
  if(ch.timer) clearInterval(ch.timer);
  chEl('gameTimer').textContent = `⏱️ ${ch.timeLeft}s`;
  ch.ringUpdate && ch.ringUpdate(ch.timeLeft, ch.roundTotal);
  ch.timer = setInterval(() => {
    if(ch.locked || ch.over) return;
    ch.timeLeft--;
    chEl('gameTimer').textContent = `⏱️ ${Math.max(ch.timeLeft, 0)}s`;
    ch.ringUpdate && ch.ringUpdate(ch.timeLeft, ch.roundTotal);
    if(ch.timeLeft <= 0){
      if(ch.mode === 'solo') chEnd();
      else chAnswer(-1); // waktu habis dihitung salah
    }
  }, 1000);
}

function chRenderMonster(){
  const pct = Math.max(0, ch.hp / ch.maxHp * 100);
  chEl('monsterHpFill').style.width = pct + '%';
  chEl('monsterHpText').textContent = `HP ${Math.max(0, Math.round(ch.hp))} / ${ch.maxHp}`;
}

function chRenderTeams(){
  chEl('teamChips').innerHTML = ch.teams.map((t, i) => `
    <span class="team-chip ${i === ch.turn ? 'active' : ''}" style="color:${t.color};">
      ${chEscape(t.name)} · <b>${t.dmg}</b> dmg
    </span>`).join('');
  chEl('gameTurnLabel').textContent = ch.mode === 'team' ? `Giliran: ${ch.teams[ch.turn].name}` : '';
}

function chLoadQuestion(){
  if(ch.qi >= ch.qs.length){
    if(ch.mode === 'solo'){ ch.qs = chShuffle(challengeBank); ch.qi = 0; }
    else { chEnd(); return; }
  }
  const cur = ch.qs[ch.qi];
  ch.locked = false;
  if(ch.mode === 'team') ch.timeLeft = TEAM_Q_TIME;
  chEl('gameFeedback').textContent = '';
  chEl('gameQuestionTracker').textContent = ch.mode === 'team' ? `Soal ${ch.qi + 1} dari ${ch.qs.length}` : `Soal ${ch.qi + 1}`;
  chEl('gameQuestionText').textContent = cur.q;
  ch.shuffled = cur.o.map((opt, i) => ({ opt, isCorrect: i === cur.a })).sort(() => 0.5 - Math.random());
  chEl('gameOptionsContainer').innerHTML = ch.shuffled.map((item, i) => `
    <button class="kq-opt kq-opt-${i}" onclick="chAnswer(${i})">${KQ_SHAPES[i]}<span>${chEscape(item.opt)}</span></button>
  `).join('');
  if(ch.ringUpdate) ch.ringUpdate(ch.timeLeft, ch.roundTotal);
  chRenderTeams();
}

function chAnswer(idx){
  if(ch.locked || ch.over) return;
  ch.locked = true;
  const team = ch.teams[ch.turn];
  const correct = idx >= 0 && ch.shuffled[idx].isCorrect;
  const btns = chEl('gameOptionsContainer').querySelectorAll('.kq-opt');
  btns.forEach((b, i) => {
    b.disabled = true;
    if(ch.shuffled[i].isCorrect) b.classList.add('kq-correct');
    else b.classList.add(i === idx ? 'kq-wrong' : 'kq-dim');
  });

  const monster = chEl('monsterEmoji');
  monster.classList.remove('hit', 'dodge', 'kq-shake'); void monster.offsetWidth;

  if(correct){
    const dmg = ch.mode === 'team' ? 60 + Math.max(0, ch.timeLeft) * 4 : 100;
    ch.hp -= dmg; team.dmg += dmg; team.correct++;
    monster.classList.add('hit', 'kq-shake');
    chEl('gameFeedback').innerHTML = `<span style="color:#86efac;">💥 ${chEscape(team.name)} menyerang! -${dmg} HP</span>`;
    kqConfettiBurst(28);
    if(typeof SFX !== 'undefined') SFX.success();
  } else {
    monster.classList.add('dodge');
    chEl('gameFeedback').innerHTML = `<span style="color:#fca5a5;">${idx < 0 ? '⏰ Waktu habis!' : '🛡️ Serangan meleset!'} Monster kebal ronde ini.</span>`;
    if(typeof SFX !== 'undefined') SFX.warn();
  }
  chRenderMonster();
  chRenderTeams();

  setTimeout(() => {
    if(ch.over) return;
    if(ch.hp <= 0){ chEnd(); return; }
    ch.qi++;
    if(ch.mode === 'team'){
      ch.turn = (ch.turn + 1) % ch.teams.length;
      if(ch.qi < ch.qs.length && typeof SFX !== 'undefined'){ SFX.phase(); SFX.voice('Giliran ' + ch.teams[ch.turn].name); }
    }
    chLoadQuestion();
  }, 1400);
}

function chEnd(){
  if(!ch || ch.over) return;
  ch.over = true;
  clearInterval(ch.timer);
  const won = ch.hp <= 0;
  const ranked = [...ch.teams].sort((a, b) => b.dmg - a.dmg);
  const top = ranked[0];
  if(won) chEl('monsterEmoji').classList.add('dead');

  chEl('gameOverEmoji').textContent = won ? '🏆' : '💀';
  chEl('gameOverTitle').textContent = won ? 'MONSTER DIKALAHKAN!' : 'MONSTER MASIH BERTAHAN...';
  chEl('gameOverSub').textContent = ch.mode === 'team'
    ? (won ? `${top.name} jadi MVP dengan damage terbesar!` : `Sisa HP monster ${Math.round(ch.hp)}. ${top.name} paling banyak melukai. Coba lagi!`)
    : (won ? `Kamu menang dengan ${top.correct} jawaban benar!` : `Waktu habis. Sisa HP monster ${Math.round(ch.hp)}. Coba lagi!`);
  const medals = ['🥇', '🥈', '🥉', '4'];
  const podiumEl = chEl('gamePodium');
  if(podiumEl) podiumEl.innerHTML = ch.teams.length > 1 ? kqPodiumHTML(ranked.map(t => ({ name: t.name, color: t.color, damage: t.dmg }))) : '';
  chEl('gameRankingBody').innerHTML = ranked.map((t, i) => `
    <tr><td>${medals[i]}</td><td style="color:${t.color}; font-weight:700;">${chEscape(t.name)}</td><td>${t.correct}</td><td><b>${t.dmg}</b></td></tr>`).join('');
  chShow('gameOverView');
  chEl('gameTimer').textContent = '🏁 Selesai';
  if(won) kqConfettiBurst(150);
  if(typeof SFX !== 'undefined'){
    won ? SFX.success() : SFX.warn();
    SFX.voice(won ? `Hebat! Monster berhasil dikalahkan. ${top.name} adalah yang terbaik.` : 'Monster masih bertahan. Belajar lagi dan coba sekali lagi!');
  }
}

function resetChallengeGame(){
  if(ch && ch.timer) clearInterval(ch.timer);
  ch = null;
  chShow('gameModeSelectView');
  const t = chEl('gameTimer'); if(t) t.textContent = '⏱️';
}
