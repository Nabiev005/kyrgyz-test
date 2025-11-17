const persons = [
  {
    name: "Чынгыз Айтматов",
    img: "185e1bf93150ce613c6258b60d9bbf45_MNWLZVZkVWHXFwqhj4WNIiFrNeO5f43s.jpg",
    questions: [
      { q: "Он известен как писатель." },
      { q: "Его произведения связаны с кыргызской культурой." },
      { q: "Автор знаменитого романа 'И дольше века длится день'." }
    ]
  },
  {
    name: "Курманжан Датка",
    img: "49709328728a190deef60bc049e8dd1b_11111-63c15d5bb0b3c.jpg",
    questions: [
      { q: "Она известна как политический деятель." },
      { q: "Защищала интересы кыргызского народа." },
      { q: "Жила в XIX веке." }
    ]
  },
  {
    name: "Токтогул Сатылганов",
    img: "a659b82608b0113abc967dc60ec48eb5_i_id=6462042a9213889d6c26825f97a6131c_l-5234987-images-thumbs&n=13.webp",
    questions: [
      { q: "Он известен как певец и композитор." },
      { q: "Вклад в кыргызскую музыку и культуру." },
      { q: "Создал много народных песен." }
    ]
  },
  {
    name: "Касым Тыныстанов",
    img: "a4d9197343038cb2f158c44a8ff73657_742621669722447_big-1.jpg",
    questions: [
      { q: "Поэт и педагог." },
      { q: "Вклад в литературу и образование." },
      { q: "Знаменит своими стихами о природе." }
    ]
  },
  {
    name: "Алыкул Осмонов",
    img: "e6a6e6656e8763f597ea34f3952fea2f_578859.1.1373872676.jpg",
    questions: [
      { q: "Известен как поэт." },
      { q: "Его стихи о любви и природе." },
      { q: "Вклад в кыргызскую литературу." }
    ]
  },
  {
    name: "Тоголок Молдо",
    img: "63f8209b5621548f139e8e2daf38ec57_i_id=45a201d54b0218c8769546330618de727e499021-5859268-images-thumbs&n=13.webp",
    questions: [
      { q: "Поэт и акын." },
      { q: "Творчество связано с народными сказаниями." },
      { q: "Вклад в сохранение культуры." }
    ]
  },
  {
    name: "Исхак Раззаков",
    img: "ea6019dabd2374bdd6725bae515e1918_image_5dfa10c869b50.jpg",
    questions: [
      { q: "Политический деятель." },
      { q: "Работал на благо страны." },
      { q: "Знаменит реформами и развитием образования." }
    ]
  }
];

/* DOM */
const personImg = document.getElementById('personImg');
const tilesEl = document.getElementById('tiles');
const colsSelect = document.getElementById('colsSelect');
const openedEl = document.getElementById('opened');
const totalEl = document.getElementById('total');
const timeEl = document.getElementById('time');
const questionArea = document.getElementById('questionArea');
const guessInput = document.getElementById('guessInput');
const guessBtn = document.getElementById('guessBtn');
const nextPersonBtn = document.getElementById('nextPersonBtn');
const revealAllBtn = document.getElementById('revealAllBtn');
const hintBtn = document.getElementById('hintBtn');
const qIndexEl = document.getElementById('qIndex');
const mistakesEl = document.getElementById('mistakes');
const roundResultEl = document.getElementById('roundResult');
const musicFile = document.getElementById('musicFile');
const musicPlayBtn = document.getElementById('musicPlayBtn');

/* VARS */
let cols = Number(colsSelect.value);
let tiles = [];
let revealed = new Set();
let opened = 0;
let totalTiles = cols * cols;
let currentIndex = 0;
let current = null;
let currentQ = 0;
let mistakes = 0;
let timer = null;
let seconds = 0;
let bgAudio = null;
let bgPlaying = false;

function normalize(s){
  return s.trim().toLowerCase().replace(/\s+/g,' ');
}

function shuffle(a){
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

/* TILES */
function createTilesGrid(nCols){
  cols = nCols;
  document.documentElement.style.setProperty('--cols', cols);

  tilesEl.innerHTML = '';
  tiles = [];
  revealed.clear();
  opened = 0;
  openedEl.textContent = opened;

  totalTiles = cols * cols;
  totalEl.textContent = totalTiles;

  for(let i=0;i<totalTiles;i++){
    const t = document.createElement('div');
    t.className = 'tile';
    t.dataset.idx = i;
    t.addEventListener('click', ()=> revealTile(i));
    tilesEl.appendChild(t);
    tiles.push(t);
  }
}

function revealTile(idx){
  if(revealed.has(idx)) return;
  revealed.add(idx);

  const t = tiles[idx];
  if(t) t.classList.add('revealed');

  opened++;
  openedEl.textContent = opened;
}

function revealRandomTiles(n){
  const closed = [];
  for(let i=0;i<totalTiles;i++){
    if(!revealed.has(i)) closed.push(i);
  }
  shuffle(closed);

  for(let i=0;i<Math.min(n, closed.length); i++){
    revealTile(closed[i]);
  }
}

function revealAllTiles(){
  for(let i=0;i<totalTiles;i++){
    revealTile(i);
  }
}

/* TIMER */
function startTimer(){
  clearInterval(timer);
  seconds = 0;
  timeEl.textContent = '00:00';

  timer = setInterval(()=>{
    seconds++;
    const mm = String(Math.floor(seconds/60)).padStart(2,'0');
    const ss = String(seconds%60).padStart(2,'0');
    timeEl.textContent = `${mm}:${ss}`;
  },1000);
}

function stopTimer(){
  clearInterval(timer);
}

/* QUESTIONS */
function renderQuestion() {
  if(currentQ >= current.questions.length) {
    questionArea.innerHTML = `<div class="questionText">Все подсказки заданы. Попробуйте угадать!</div>`;
    qIndexEl.textContent = current.questions.length;
    return;
  }

  questionArea.innerHTML = `<div class="questionText">Подсказка ${currentQ + 1}: ${current.questions[currentQ].q}</div>`;
  qIndexEl.textContent = currentQ + 1;
}

/* GUESS */
function attemptGuess(){
  const ans = guessInput.value.trim();
  if(!ans) return;

  if(normalize(ans) === normalize(current.name)){
    revealAllTiles();
    stopTimer();
    roundResultEl.textContent = `Верно — это ${current.name}!`;
    setTimeout(nextPerson, 2000);
  } else {
    mistakes++;
    mistakesEl.textContent = mistakes;
    roundResultEl.textContent = "Неверно — попробуйте ещё.";
  }

  guessInput.value = "";
}

/* PERSONS */
function loadPerson(index){
  currentIndex = index;
  current = persons[index];

  personImg.src = current.img;

  createTilesGrid(cols);

  currentQ = 0;
  mistakes = 0;

  qIndexEl.textContent = 0;
  mistakesEl.textContent = 0;
  roundResultEl.textContent = "—";

  renderQuestion();
  startTimer();
}

function nextPerson(){
  if(currentIndex + 1 < persons.length){
    loadPerson(currentIndex + 1);
  } else {
    stopTimer();
    questionArea.innerHTML = `<div class="questionText">🎉 Поздравляем! Вы прошли всех ${persons.length} человек!</div>`;
    roundResultEl.textContent = "Игра окончена!";
  }
}

/* MUSIC */
musicFile.addEventListener('change', e=>{
  const f = e.target.files?.[0];
  if(!f) return;

  if(bgAudio){
    bgAudio.pause();
    bgAudio.src = "";
  }

  bgAudio = new Audio(URL.createObjectURL(f));
  bgAudio.loop = true;
  bgPlaying = false;
  musicPlayBtn.textContent = "Воспроизвести";
});

musicPlayBtn.addEventListener('click', async ()=>{
  if(!bgAudio){
    alert("Сначала выберите файл музыки");
    return;
  }

  try{
    if(!bgPlaying){
      await bgAudio.play();
      bgPlaying = true;
      musicPlayBtn.textContent = "Пауза";
    } else {
      bgAudio.pause();
      bgPlaying = false;
      musicPlayBtn.textContent = "Воспроизвести";
    }
  } catch(e){
    alert("Браузер запретил воспроизведение.");
  }
});

/* BUTTONS */
guessBtn.addEventListener('click', attemptGuess);
guessInput.addEventListener('keydown', e=>{
  if(e.key === 'Enter') attemptGuess();
});

nextPersonBtn.addEventListener('click', nextPerson);
revealAllBtn.addEventListener('click', revealAllTiles);
hintBtn.addEventListener('click', ()=>{
  renderQuestion();
  currentQ++;
  revealRandomTiles(2);
});
colsSelect.addEventListener('change', e=>{
  createTilesGrid(Number(e.target.value));
});

/* INIT */
(function init(){
  createTilesGrid(cols);
  loadPerson(0);
})();
