/* ==========================================================================
   Quiz Engine with Session & LocalStorage Persistence
   ========================================================================== */

const quizTopics = [
  {
    id: 'carnot',
    name: 'Mesin Carnot',
    icon: '🔥',
    desc: 'Efisiensi mesin kalor ideal, reservoir panas & dingin, serta hubungan suhu dengan kerja mekanik.',
    questions: [
      {
        q: 'Mesin Carnot bekerja di antara reservoir suhu tinggi T_H = 800 K dan suhu rendah T_C = 400 K. Berapakah efisiensi maksimumnya?',
        o: ['25%', '50%', '75%', '100%'],
        a: 1,
        e: 'Efisiensi Carnot: η = 1 - (T_C / T_H) = 1 - (400 / 800) = 0.5 = 50%.'
      },
      {
        q: 'Pada siklus mesin kalor Carnot, besaran Q_H merepresentasikan...',
        o: ['Kalor yang dibuang ke lingkungan dingin', 'Kalor yang diserap dari reservoir panas', 'Kerja mekanik yang hilang', 'Perubahan massa gas ideal'],
        a: 1,
        e: 'Q_H adalah energi kalor yang diserap oleh gas kerja dari reservoir bersuhu tinggi.'
      },
      {
        q: 'Jika suhu reservoir dingin T_C diturunkan sementara T_H tetap, apa yang terjadi pada efisiensi Carnot?',
        o: ['Efisiensi akan menurun', 'Efisiensi akan tetap', 'Efisiensi akan meningkat', 'Efisiensi menjadi 0%'],
        a: 2,
        e: 'Karena η = 1 - (T_C / T_H), semakin kecil nilai T_C maka pecahan T_C/T_H semakin kecil sehingga efisiensi η semakin tinggi.'
      },
      {
        q: 'Mengapa efisiensi mesin Carnot tidak pernah mencapai 100% pada kondisi nyata?',
        o: ['Karena T_C tidak mungkin mencapai 0 Kelvin mutlak', 'Karena massa gas selalu bertambah', 'Karena kalor tidak memiliki energi', 'Karena volume piston konstan'],
        a: 0,
        e: 'Efisiensi 100% hanya tercapai jika T_C = 0 K, yang secara termodinamika tidak dapat dicapai.'
      }
    ]
  },
  {
    id: 'calo',
    name: 'Kalorimetri',
    icon: '🌡️',
    desc: 'Asas Black, kalor jenis bahan, pertukaran kalor, dan kesetimbangan termal.',
    questions: [
      {
        q: 'Prinsip utama Asas Black pada sistem kalorimeter terisolasi adalah...',
        o: ['Q_lepas = Q_terima', 'Q = m · L', 'P = W / t', 'PV = nRT'],
        a: 0,
        e: 'Asas Black menyatakan bahwa dalam sistem tertutup, kalor yang dilepas benda panas sama dengan kalor yang diterima benda dingin.'
      },
      {
        q: 'Rumus Q = m · c · ΔT digunakan saat...',
        o: ['Terjadi perubahan suhu tanpa perubahan wujud', 'Terjadi perubahan wujud pada suhu konstan', 'Gas melakukan ekspansi bebas', 'Suhu zat mencapai nol mutlak'],
        a: 0,
        e: 'Q = m · c · ΔT digunakan untuk menghitung kalor sensibel yang menyebabkan kenaikan atau penurunan suhu.'
      },
      {
        q: 'Jika 100 g air (c = 4.18 J/g·°C) mengalami kenaikan suhu sebesar 10°C, berapa kalor yang diserap?',
        o: ['418 J', '4180 J', '41.8 J', '8360 J'],
        a: 1,
        e: 'Q = m · c · ΔT = 100 × 4.18 × 10 = 4180 J.'
      }
    ]
  },
  {
    id: 'cond',
    name: 'Konduksi Kalor',
    icon: '🧊',
    desc: 'Perambatan kalor tanpa perpindahan massa, konduktivitas termal bahan.',
    questions: [
      {
        q: 'Besaran yang menunjukkan kemampuan suatu bahan menghantarkan kalor disebut...',
        o: ['Kapasitas kalor', 'Kalor laten', 'Konduktivitas termal (k)', 'Massa jenis'],
        a: 2,
        e: 'Konduktivitas termal (k) mengukur laju kemampuan konduksi panas suatu material.'
      },
      {
        q: 'Di antara tembaga (k=0.85), besi (k=0.35), dan kayu (k=0.05), material yang paling cepat menghantarkan panas adalah...',
        o: ['Tembaga', 'Besi', 'Kayu', 'Semua sama'],
        a: 0,
        e: 'Tembaga memiliki nilai konduktivitas termal tertinggi sehingga kalor merambat paling cepat.'
      }
    ]
  },
  {
    id: 'furnace',
    name: 'Tungku & Kalor Laten',
    icon: '🔨',
    desc: 'Perubahan wujud zat, kurva pemanasan, dan kalor laten peleburan/penguapan.',
    questions: [
      {
        q: 'Pada kurva pemanasan, bagian garis yang mendatar (suhu konstan) menunjukkan bahwa...',
        o: ['Pemanasan dihentikan', 'Sedang terjadi perubahan wujud zat (kalor laten)', 'Benda kehilangan massa', 'Energi kalor hilang'],
        a: 1,
        e: 'Saat perubahan wujud, seluruh kalor yang masuk digunakan untuk memutuskan ikatan partikel (kalor laten) sehingga suhu tidak naik.'
      },
      {
        q: 'Rumus yang digunakan untuk menghitung kalor saat benda melebur pada titik leburnya adalah...',
        o: ['Q = m · L', 'Q = m · c · ΔT', 'η = 1 - (T_C/T_H)', 'ΔU = Q - W'],
        a: 0,
        e: 'Q = m · L digunakan saat perubahan fase zat berlangsung.'
      }
    ]
  },
  {
    id: 'wom',
    name: 'Wujud Zat & Kinetik',
    icon: '⚛️',
    desc: 'Model partikel, energi kinetik rata-rata, dan kecepatan partikel terhadap suhu.',
    questions: [
      {
        q: 'Menurut teori kinetik gas, kenaikan suhu suatu zat berbanding lurus dengan...',
        o: ['Energi kinetik rata-rata partikel', 'Massa total partikel', 'Jumlah elektron bebas', 'Gravitasi wadah'],
        a: 0,
        e: 'Suhu mutlak berbanding lurus dengan energi kinetik translasi rata-rata partikel (<Ek> ∝ T).'
      },
      {
        q: 'Ciri susunan partikel pada fase padat adalah...',
        o: ['Bergerak bebas ke segala arah', 'Tersusun rapat dan hanya bergetar di sekitar posisinya', 'Saling berjauhan', 'Tidak memiliki gaya tarik'],
        a: 1,
        e: 'Partikel zat padat terikat kuat dalam kisi kristal/posisi teratur dan hanya bergetar.'
      }
    ]
  },
  {
    id: 'sl',
    name: 'Hukum I Termodinamika',
    icon: '🎛️',
    desc: 'Kekekalan energi sistem, energi dalam, kalor, dan usaha mekanik gas.',
    questions: [
      {
        q: 'Persamaan matematis Hukum I Termodinamika adalah...',
        o: ['ΔU = Q - W', 'ΔU = Q + W', 'W = P · ΔV saja', 'Q = m · c'],
        a: 0,
        e: 'Hukum I Termodinamika menyatakan bahwa perubahan energi dalam ΔU sama dengan kalor yang diserap Q dikurangi usaha yang dilakukan sistem W.'
      },
      {
        q: 'Jika gas menyerap kalor Q = 100 J dan melakukan usaha ke lingkungan W = 40 J, berapakah perubahan energi dalamnya (ΔU)?',
        o: ['140 J', '60 J', '4000 J', '0 J'],
        a: 1,
        e: 'ΔU = Q - W = 100 J - 40 J = 60 J.'
      }
    ]
  }
];

let activeQuizTopic = 0;

function initQuiz(){
  renderQuizTabs();
  renderQuizTopic(activeQuizTopic);
}

function renderQuizTabs(){
  const tabs = document.getElementById('quizTabs');
  if(!tabs) return;

  tabs.innerHTML = quizTopics.map((t, i) => `
    <button class="quiz-tab ${i === activeQuizTopic ? 'active' : ''}" onclick="renderQuizTopic(${i})">
      ${t.icon} ${t.name}
    </button>
  `).join('');
}

function renderQuizTopic(idx){
  activeQuizTopic = idx;
  renderQuizTabs();

  const t = quizTopics[idx];
  const titleEl = document.getElementById('quizTopicTitle');
  const descEl = document.getElementById('quizTopicDesc');
  if(titleEl) titleEl.textContent = `${t.icon} ${t.name}`;
  if(descEl) descEl.textContent = t.desc;

  const scoreTitle = document.getElementById('quizScoreTitle');
  if(scoreTitle) scoreTitle.textContent = `Skor Quiz: ${t.name}`;

  const userQuizData = appState.quiz[t.id] || { answers: {}, score: 0 };
  const grid = document.getElementById('quizGrid');
  if(!grid) return;

  grid.innerHTML = t.questions.map((item, qIdx) => {
    const savedAnswer = userQuizData.answers[qIdx];
    const isAnswered = savedAnswer !== undefined;

    return `
      <div class="quiz-card">
        <div style="font-size:11.5px; font-weight:700; color:var(--muted); text-transform:uppercase; margin-bottom:6px;">SOAL ${qIdx + 1} DARI ${t.questions.length}</div>
        <h4 style="font-size:16px; margin-bottom:12px;">${item.q}</h4>
        <div class="quiz-options">
          ${item.o.map((opt, oIdx) => {
            let extraClass = '';
            if(isAnswered){
              if(oIdx === item.a) extraClass = 'correct';
              else if(oIdx === savedAnswer) extraClass = 'wrong';
            }
            return `
              <button class="quiz-option ${extraClass}" ${isAnswered ? 'disabled' : ''} onclick="answerQuiz(${idx}, ${qIdx}, ${oIdx})">
                <b>${String.fromCharCode(65 + oIdx)}.</b> ${opt}
              </button>
            `;
          }).join('')}
        </div>
        <div class="quiz-feedback" id="quizFb_${idx}_${qIdx}" style="display:${isAnswered ? 'block' : 'none'}; background:${savedAnswer === item.a ? '#ecfdf5' : '#fff1f2'}; color:${savedAnswer === item.a ? '#065f46' : '#9f1239'};">
          ${isAnswered ? (savedAnswer === item.a ? '✅ <b>Benar!</b> ' : '❌ <b>Belum tepat.</b> ') + item.e : ''}
        </div>
      </div>
    `;
  }).join('');

  updateQuizScoreDisplay(t.id);
}

function answerQuiz(topicIdx, qIdx, optionIdx){
  const t = quizTopics[topicIdx];
  const item = t.questions[qIdx];

  appState.quiz[t.id] = appState.quiz[t.id] || { answers: {}, score: 0 };
  if(appState.quiz[t.id].answers[qIdx] !== undefined) return; // already answered

  appState.quiz[t.id].answers[qIdx] = optionIdx;
  if(optionIdx === item.a){
    appState.quiz[t.id].score = (appState.quiz[t.id].score || 0) + 1;
    if(typeof SFX !== 'undefined') SFX.success();
  } else {
    if(typeof SFX !== 'undefined') SFX.warn();
  }

  saveAppState();
  renderQuizTopic(topicIdx);
}

function updateQuizScoreDisplay(topicId){
  const t = quizTopics.find(x => x.id === topicId) || quizTopics[activeQuizTopic];
  const data = appState.quiz[t.id] || { score: 0 };
  const scoreEl = document.getElementById('quizScoreVal');
  if(scoreEl) scoreEl.textContent = `${data.score || 0}/${t.questions.length}`;
}

function resetActiveQuiz(){
  const t = quizTopics[activeQuizTopic];
  if(appState.quiz[t.id]){
    delete appState.quiz[t.id];
    saveAppState();
  }
  renderQuizTopic(activeQuizTopic);
  showToast(`Quiz ${t.name} direset.`, 'info');
}
