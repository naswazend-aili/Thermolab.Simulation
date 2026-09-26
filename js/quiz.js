/* ==========================================================================
   Quiz Engine with Session & LocalStorage Persistence
   ========================================================================== */

const quizTopics = [
  {
    id: 'carnot',
    name: 'Mesin Carnot',
    icon: '🔥',
    desc: 'Efisiensi mesin kalor ideal, reservoir panas & dingin, serta hubungan suhu dengan kerja mekanik.',
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
      },
      {
        q: 'Sebuah mesin Carnot beroperasi dengan efisiensi 60%. Jika mesin membuang kalor sebesar 400 J ke reservoir dingin, berapakah usaha yang dihasilkan?',
        o: ['200 J', '400 J', '600 J', '1000 J'],
        a: 2,
        e: 'η = W / Q_H = W / (W + Q_C). 0.6 = W / (W + 400) => W = 600 J.'
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
      },
      {
        q: 'Logam 100 g bersuhu 100°C dimasukkan ke dalam 200 g air (c=4.2 J/g°C) bersuhu 20°C. Jika suhu campuran 25°C, berapakah kalor jenis logam?',
        o: ['0.42 J/g°C', '0.56 J/g°C', '0.68 J/g°C', '1.0 J/g°C'],
        a: 1,
        e: 'Q_lepas = Q_terima => 100 · c_L · 75 = 200 · 4.2 · 5 => 7500 c_L = 4200 => c_L = 0.56 J/g°C.'
      },
      {
        q: 'Apakah yang dimaksud dengan kapasitas kalor (C)?',
        o: ['Kalor untuk menaikkan suhu 1 gram zat sebesar 1°C', 'Kalor untuk menaikkan suhu seluruh benda sebesar 1°C', 'Kalor yang diserap benda saat berubah wujud', 'Kalor jenis dibagi massa benda'],
        a: 1,
        e: 'Kapasitas kalor (C = m · c) adalah jumlah kalor yang diperlukan benda secara keseluruhan untuk menaikkan suhunya 1°C.'
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
      },
      {
        q: 'Laju perpindahan kalor secara konduksi berbanding terbalik dengan...',
        o: ['Luas penampang benda', 'Perbedaan suhu ujung-ujung benda', 'Ketebalan atau panjang benda', 'Konduktivitas termal benda'],
        a: 2,
        e: 'Menurut rumus P = (k · A · ΔT) / L, laju konduksi berbanding terbalik dengan L (panjang atau ketebalan penghantar).'
      },
      {
        q: 'Mengapa pegangan panci biasanya terbuat dari plastik atau kayu?',
        o: ['Karena mereka adalah konduktor panas yang sangat baik', 'Karena mereka memiliki titik lebur sangat tinggi', 'Karena mereka adalah isolator dengan konduktivitas termal rendah', 'Karena kalor tidak bisa mengenai benda organik'],
        a: 2,
        e: 'Plastik dan kayu memiliki nilai k (konduktivitas termal) yang sangat kecil sehingga sulit menghantarkan panas, melindungi tangan.'
      },
      {
        q: 'Jika ketebalan dinding ruangan diduakalikan (luas dan material sama), maka laju rambat kalor melalui dinding tersebut akan...',
        o: ['Menjadi empat kali lebih besar', 'Menjadi dua kali lebih besar', 'Tetap sama', 'Menjadi setengah dari semula'],
        a: 3,
        e: 'Karena laju kalor P berbanding terbalik dengan ketebalan L, menduakalikan tebal (2L) akan mengurangi laju konduksi menjadi 1/2 kali semula.'
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
      },
      {
        q: 'Berapakah kalor yang dibutuhkan untuk meleburkan 2 kg es pada suhu 0°C (Kalor lebur es L = 334.000 J/kg)?',
        o: ['167.000 J', '334.000 J', '668.000 J', '1.336.000 J'],
        a: 2,
        e: 'Gunakan rumus Q = m · L = 2 kg × 334.000 J/kg = 668.000 Joule.'
      },
      {
        q: 'Pada tekanan 1 atm, air mendidih di suhu 100°C. Jika terus dipanaskan dengan api besar, suhu air akan...',
        o: ['Terus naik melampaui 100°C', 'Tetap 100°C hingga seluruh air menjadi uap', 'Turun sedikit karena mendidih', 'Langsung berubah menjadi plasma'],
        a: 1,
        e: 'Saat air mendidih, energi kalor digunakan sebagai kalor laten penguapan sehingga suhunya tetap 100°C hingga molekul air habis berubah gas.'
      },
      {
        q: 'Peristiwa zat menyerap kalor untuk berubah wujud dari padat langsung menjadi gas tanpa melalui fase cair disebut...',
        o: ['Mencair', 'Membeku', 'Menyublim', 'Mengkristal'],
        a: 2,
        e: 'Menyublim adalah perubahan wujud fasa padat langsung menjadi gas, yang membutuhkan energi kalor.'
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
        q: 'Menurut teori kinetik gas, kenaikan suhu mutlak suatu zat berbanding lurus dengan...',
        o: ['Energi kinetik rata-rata partikel', 'Massa total partikel', 'Jumlah elektron bebas', 'Gravitasi wadah'],
        a: 0,
        e: 'Suhu mutlak berbanding lurus dengan energi kinetik translasi rata-rata partikel (<Ek> ∝ T).'
      },
      {
        q: 'Ciri susunan partikel pada fase padat adalah...',
        o: ['Bergerak bebas ke segala arah', 'Tersusun rapat dan hanya bergetar di sekitar posisinya', 'Saling berjauhan', 'Tidak memiliki gaya tarik'],
        a: 1,
        e: 'Partikel zat padat terikat kuat dalam kisi kristal/posisi teratur dan hanya bergetar.'
      },
      {
        q: 'Dalam ruang tertutup, tekanan gas ideal timbul karena...',
        o: ['Tumbukan partikel-partikel gas dengan dinding wadah', 'Gaya gravitasi bumi yang menarik partikel gas', 'Tumbukan antar sesama partikel gas', 'Kalor yang diserap oleh partikel'],
        a: 0,
        e: 'Menurut teori kinetik gas, tekanan timbul dari impuls akibat tumbukan lenting partikel gas yang bergerak acak terhadap luas dinding wadah.'
      },
      {
        q: 'Jika suhu gas ideal (dalam wadah bervolume tetap) dinaikkan menjadi dua kali lipat dalam Kelvin, maka tekanannya akan...',
        o: ['Menjadi setengahnya', 'Tetap sama', 'Menjadi dua kali lipat', 'Menjadi empat kali lipat'],
        a: 2,
        e: 'Sesuai Hukum Gay-Lussac (P/T = konstan untuk V tetap), tekanan sebanding dengan suhu mutlak. Jika suhu dinaikkan 2x, tekanan menjadi 2x.'
      },
      {
        q: 'Kecepatan efektif (v_rms) molekul gas hidrogen (ringan) dibandingkan gas oksigen (berat) pada suhu yang sama adalah...',
        o: ['Hidrogen lebih lambat', 'Sama persis karena suhunya sama', 'Hidrogen lebih cepat', 'Tergantung pada tekanan wadah'],
        a: 2,
        e: 'v_rms berbanding terbalik dengan akar massa molekul (v_rms ∝ 1/√M). Hidrogen jauh lebih ringan, sehingga partikelnya bergerak jauh lebih cepat.'
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
      },
      {
        q: 'Proses termodinamika di mana tidak ada pertukaran kalor yang masuk maupun keluar sistem (Q = 0) disebut proses...',
        o: ['Isotermal', 'Isobarik', 'Isokhorik', 'Adiabatik'],
        a: 3,
        e: 'Proses adiabatik terjadi tanpa adanya pertukaran kalor antara sistem dan lingkungan, sehingga persamaannya menjadi ΔU = -W.'
      },
      {
        q: 'Jika suatu gas ideal dimampatkan (volume diperkecil) dengan cepat secara adiabatik, maka suhu gas tersebut akan...',
        o: ['Tetap', 'Turun', 'Naik', 'Menjadi 0 K'],
        a: 2,
        e: 'Pemampatan berarti sistem menerima kerja (W negatif). Karena adiabatik (Q=0), ΔU = 0 - (-W) = +W. Energi dalam naik, sehingga suhu naik.'
      },
      {
        q: 'Pada sebuah proses isokhorik (volume gas dipertahankan tetap), usaha luar yang dilakukan oleh sistem selalu...',
        o: ['Sebanding dengan kenaikan tekanan', 'Sama dengan kalor yang diserap', 'Bernilai nol', 'Sangat besar'],
        a: 2,
        e: 'Usaha termodinamika ditentukan oleh perubahan volume (W = P · ΔV). Karena volumenya dijaga tetap (ΔV = 0), maka usaha W selalu 0.'
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

  const answeredCount = Object.keys(userQuizData.answers).length;
  if(answeredCount === t.questions.length) {
    grid.innerHTML += `
      <div class="quiz-card" style="background:var(--surface-2); text-align:center; border:2px solid var(--green); margin-top:20px;">
        <h3 style="color:var(--green); margin-bottom:8px; font-size:18px;">🎉 Quiz Selesai!</h3>
        <p>Kamu telah menyelesaikan seluruh pertanyaan untuk materi <b>${t.name}</b> dengan skor <b>${userQuizData.score}/${t.questions.length}</b>.</p>
        <p style="font-size:13px; color:var(--muted); margin-top:8px;">Progress quiz kamu telah tercatat dan tersimpan secara otomatis.</p>
      </div>
    `;
  }

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
  
  const answeredCount = Object.keys(appState.quiz[t.id].answers).length;
  if(answeredCount === t.questions.length) {
    showToast(`Quiz ${t.name} selesai! Progress tercatat.`, 'success');
  }

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
