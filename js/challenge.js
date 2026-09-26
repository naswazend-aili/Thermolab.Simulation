/* ==========================================================================
   ThermoLab Challenge Game (Solo Time Attack & Team Room Competition)
   ========================================================================== */

let challengeTimer = null;
let challengeTimeLeft = 60;
let challengeScore = 0;
let challengeQuestions = [];
let challengeCurrentIndex = 0;

const challengeBank = [
  { q: 'Sebuah mesin Carnot memiliki T_H = 600 K dan T_C = 300 K. Efisiensinya adalah...', o: ['50%', '25%', '75%', '100%'], a: 0 },
  { q: 'Asas Black menyatakan bahwa pada kalorimeter tertutup berlaku hubungan...', o: ['Q_lepas = Q_terima', 'Q = m · L', 'ΔU = Q + W', 'W = P · V'], a: 0 },
  { q: 'Di antara tembaga, besi, dan kayu, material konduktor terbaik adalah...', o: ['Tembaga', 'Besi', 'Kayu', 'Air'], a: 0 },
  { q: 'Pada grafik kurva pemanasan, bagian mendatar menunjukkan proses...', o: ['Perubahan wujud zat', 'Kenaikan suhu cepat', 'Penurunan tekanan', 'Penyerapan massa'], a: 0 },
  { q: 'Kenaikan suhu pada suatu zat berbanding lurus dengan...', o: ['Energi kinetik partikel', 'Massa wadah', 'Jumlah proton', 'Tinggi tempat'], a: 0 },
  { q: 'Jika gas menyerap kalor 200 J dan melakukan usaha 50 J, maka ΔU adalah...', o: ['150 J', '250 J', '100 J', '50 J'], a: 0 },
  { q: 'Satuan standar suhu mutlak dalam termodinamika adalah...', o: ['Kelvin (K)', 'Celsius (°C)', 'Fahrenheit (°F)', 'Reamur (°R)'], a: 0 },
  { q: 'Kalor yang digunakan untuk mengubah zat cair menjadi gas disebut...', o: ['Kalor laten penguapan', 'Kalor jenis', 'Kapasitas kalor', 'Kalor peleburan'], a: 0 }
];

function initChallenge(){
  // initial reset
  resetChallengeGame();
}

function startSoloChallenge(){
  document.getElementById('gameModeSelectView').style.display = 'none';
  document.getElementById('gameTeamRoomView').style.display = 'none';
  document.getElementById('gameOverView').style.display = 'none';
  document.getElementById('gameActiveQuestionView').style.display = 'block';

  challengeTimeLeft = 60;
  challengeScore = 0;
  challengeCurrentIndex = 0;
  challengeQuestions = [...challengeBank].sort(() => 0.5 - Math.random());

  document.getElementById('gameCurrentScore').textContent = '0';
  document.getElementById('gameTimer').textContent = `⏱️ ${challengeTimeLeft}s`;

  if(challengeTimer) clearInterval(challengeTimer);
  challengeTimer = setInterval(() => {
    challengeTimeLeft--;
    document.getElementById('gameTimer').textContent = `⏱️ ${challengeTimeLeft}s`;
    if(challengeTimeLeft <= 0){
      clearInterval(challengeTimer);
      endChallengeGame();
    }
  }, 1000);

  loadChallengeQuestion();
}

function loadChallengeQuestion(){
  if(challengeCurrentIndex >= challengeQuestions.length){
    clearInterval(challengeTimer);
    endChallengeGame();
    return;
  }
  const cur = challengeQuestions[challengeCurrentIndex];
  document.getElementById('gameQuestionTracker').textContent = `Soal ${challengeCurrentIndex + 1} dari ${challengeQuestions.length}`;
  document.getElementById('gameQuestionText').textContent = cur.q;

  const container = document.getElementById('gameOptionsContainer');
  container.innerHTML = cur.o.map((opt, i) => `
    <button class="challenge-opt-btn" onclick="answerChallenge(${i === cur.a})">
      <b>${String.fromCharCode(65 + i)}.</b> ${opt}
    </button>
  `).join('');
}

function answerChallenge(isCorrect){
  if(isCorrect){
    challengeScore += 100;
    showToast('+100 Poin! Jawaban Benar!', 'success');
    if(typeof SFX !== 'undefined') SFX.success();
  } else {
    showToast('Jawaban Belum Tepat!', 'error');
    if(typeof SFX !== 'undefined') SFX.warn();
  }
  document.getElementById('gameCurrentScore').textContent = challengeScore;
  challengeCurrentIndex++;
  loadChallengeQuestion();
}

function showTeamRoomView(){
  document.getElementById('gameModeSelectView').style.display = 'none';
  document.getElementById('gameTeamRoomView').style.display = 'block';
}

function createTeamRoom(){
  const code = 'TL-' + Math.floor(1000 + Math.random() * 9000);
  alert(`🎉 Room Kompetisi Berhasil Dibuat!\nKode Room: ${code}\nBagikan kode ini ke anggota tim untuk bermain bersama.`);
  showToast(`Room ${code} aktif sebagai Host.`, 'success');
}

function joinTeamRoom(){
  const code = document.getElementById('joinRoomCodeInput')?.value.trim();
  const name = document.getElementById('joinPlayerNameInput')?.value.trim();
  const team = document.getElementById('joinTeamSelect')?.value;

  if(!code){
    showToast('Masukkan Room Code.', 'error');
    return;
  }
  if(!name){
    showToast('Masukkan Nama Pemain.', 'error');
    return;
  }

  showToast(`Bergabung ke ${code} sebagai [${team}] ${name}!`, 'success');
  startSoloChallenge();
}

function endChallengeGame(){
  document.getElementById('gameActiveQuestionView').style.display = 'none';
  document.getElementById('gameOverView').style.display = 'block';
  document.getElementById('gameFinalScore').textContent = challengeScore;

  if(typeof SFX !== 'undefined') SFX.success();
}

function resetChallengeGame(){
  if(challengeTimer) clearInterval(challengeTimer);
  document.getElementById('gameOverView').style.display = 'none';
  document.getElementById('gameActiveQuestionView').style.display = 'none';
  document.getElementById('gameTeamRoomView').style.display = 'none';
  document.getElementById('gameModeSelectView').style.display = 'block';
  document.getElementById('gameTimer').textContent = '⏱️ 60s';
}
