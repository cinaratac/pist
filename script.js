// Yıldızlar
const starsEl = document.getElementById('stars');
for(let i=0;i<80;i++){
  const s = document.createElement('div');
  s.className='star';
  const size = Math.random()*2.5+1;
  s.style.width=size+'px'; s.style.height=size+'px';
  s.style.left=Math.random()*100+'%';
  s.style.top=Math.random()*100+'%';
  s.style.animationDelay=(Math.random()*3)+'s';
  starsEl.appendChild(s);
}

// Sayfanın her yerinde rastgele kayan yıldızlar
const shootingStarsEl = document.getElementById('shooting-stars');

function createShootingStar(topOnly=false){
  if(!shootingStarsEl) return;
  const star = document.createElement('span');
  const goesRight = Math.random() > .28;
  const top = topOnly || Math.random() < .62
    ? Math.random()*32
    : 8 + Math.random()*78;

  star.className = 'shooting-star';
  star.style.left = (goesRight ? -18+Math.random()*78 : 42+Math.random()*72) + 'vw';
  star.style.top = top + 'vh';
  star.style.setProperty('--tail-length', (95+Math.random()*145) + 'px');
  star.style.setProperty('--shoot-angle', (goesRight ? 12+Math.random()*24 : 144+Math.random()*24) + 'deg');
  star.style.setProperty('--shoot-distance', (55+Math.random()*70) + 'vw');
  const duration = .9+Math.random()*.9;
  star.style.setProperty('--shoot-time', duration + 's');
  shootingStarsEl.appendChild(star);
  setTimeout(()=>star.remove(), duration*1000+150);
}

function scheduleShootingStar(){
  createShootingStar();
  setTimeout(scheduleShootingStar, 180+Math.random()*420);
}

for(let i=0;i<12;i++) setTimeout(()=>createShootingStar(i<8), i*120);
scheduleShootingStar();

// Kenar yıldızları (sayfa boyunca sağda ve solda)
function scatterSideStars(){
  const el = document.getElementById('side-stars');
  el.style.height = document.body.scrollHeight + 'px';
  el.innerHTML = '';
  const count = 50;
  for(let i=0;i<count;i++){
    const s = document.createElement('div');
    s.className = 'side-star';
    const onLeft = Math.random() < 0.5;
    const x = onLeft ? Math.random()*11 : 89 + Math.random()*11;
    s.style.left = x + '%';
    s.style.top = Math.random()*100 + '%';
    s.style.fontSize = (Math.random()*10+9) + 'px';
    s.textContent = Math.random() < 0.5 ? '\u2726' : '\u2727';
    s.style.opacity = (0.25 + Math.random()*0.5).toFixed(2);
    s.style.animationDelay = (Math.random()*4) + 's';
    el.appendChild(s);
  }
}
window.addEventListener('load', scatterSideStars);
window.addEventListener('resize', scatterSideStars);

// En üst ve en alt yıldızı arkadan birbirine bağlayan zincir
function drawStarChain(){
  const chain = document.getElementById('star-chain');
  const topStar = document.getElementById('top-star');
  const bottomStar = document.getElementById('bottom-star');
  if(!chain || !topStar || !bottomStar) return;

  const topBox = topStar.getBoundingClientRect();
  const bottomBox = bottomStar.getBoundingClientRect();
  const startX = topBox.left + topBox.width / 2;
  const startY = topBox.top + window.scrollY + topBox.height / 2;
  const endX = bottomBox.left + bottomBox.width / 2;
  const endY = bottomBox.top + window.scrollY + bottomBox.height / 2;
  const distance = Math.max(0, endY - startY);
  const gap = 22;
  const linkCount = Math.floor(distance / gap);

  chain.style.height = document.body.scrollHeight + 'px';
  chain.replaceChildren();
  for(let i=0;i<=linkCount;i++){
    const progress = linkCount ? i / linkCount : 0;
    const link = document.createElement('span');
    link.className = 'chain-link';
    link.style.left = (startX + (endX-startX)*progress) + 'px';
    link.style.top = (startY + distance*progress) + 'px';
    link.style.setProperty('--link-angle', i%2 ? '90deg' : '0deg');
    chain.appendChild(link);
  }
}

window.addEventListener('load', drawStarChain);
window.addEventListener('resize', drawStarChain);
document.querySelector('.side-video')?.addEventListener('loadedmetadata', drawStarChain);
document.fonts?.ready.then(drawStarChain);

// Wordle iframe'ini içeriğinin tamamı görünecek şekilde boyutlandır
const wordleFrame = document.querySelector('.wordle-frame');
function resizeWordleFrame(){
  if(!wordleFrame?.contentDocument) return;
  const wordleDocument = wordleFrame.contentDocument;
  const height = Math.max(
    wordleDocument.body?.scrollHeight || 0,
    wordleDocument.documentElement?.scrollHeight || 0
  );
  if(height){
    wordleFrame.style.height = (height+8) + 'px';
    requestAnimationFrame(drawStarChain);
  }
}
wordleFrame?.addEventListener('load', resizeWordleFrame);
window.addEventListener('resize', resizeWordleFrame);
if(wordleFrame?.contentDocument?.readyState === 'complete') resizeWordleFrame();

// ---- HAFIZA OYUNU (sadece burada inside joke'lar var) ----
const jokes = ["tamam bişey demedim","ikizler işte","bakarız","pıst"];
let deck = [...jokes, ...jokes].map((text,i)=>({id:i, text}));
deck.sort(()=>Math.random()-0.5);

const boardEl = document.getElementById('board');
const statusEl = document.getElementById('game-status');
let flipped = [];
let matchedCount = 0;
let lock = false;

deck.forEach(card=>{
  const c = document.createElement('div');
  c.className='card';
  c.tabIndex=0;
  c.dataset.text = card.text;
  c.innerHTML = `<div class="face front">★</div><div class="face back">${card.text}</div>`;
  c.addEventListener('click', ()=>flipCard(c));
  c.addEventListener('keydown', e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); flipCard(c);} });
  boardEl.appendChild(c);
});

function showClapVideo(){
  document.querySelector('.clap-video')?.remove();
  const video = document.createElement('video');
  video.className = 'clap-video';
  video.src = 'clap.mp4';
  video.autoplay = true;
  video.muted = false;
  video.volume = 1;
  video.playsInline = true;
  video.setAttribute('aria-label', 'Tebrik alkışı');

  const removeVideo = ()=>{
    video.classList.add('is-leaving');
    setTimeout(()=>video.remove(), 300);
  };
  video.addEventListener('ended', removeVideo, {once:true});
  document.body.appendChild(video);
  video.play().catch(()=>setTimeout(removeVideo, 4000));
}

function flipCard(c){
  if(lock || c.classList.contains('flipped') || c.classList.contains('matched')) return;
  c.classList.add('flipped');
  flipped.push(c);
  if(flipped.length===2){
    lock=true;
    const [a,b] = flipped;
    if(a.dataset.text===b.dataset.text){
      if(matchedCount===jokes.length-1) showClapVideo();
      setTimeout(()=>{
        a.classList.add('matched'); b.classList.add('matched');
        matchedCount++;
        flipped=[]; lock=false;
        if(matchedCount===jokes.length){
          statusEl.textContent = "";
        } else {
          statusEl.textContent = "eşleşti, devam";
        }
      },500);
    } else {
      statusEl.textContent = "tekrar dene";
      setTimeout(()=>{
        a.classList.remove('flipped'); b.classList.remove('flipped');
        flipped=[]; lock=false;
      },800);
    }
  }
}

// ---- ZARF ----
function toggleEnvelope(envelope){
  const isOpen = envelope.classList.toggle('open');
  envelope.setAttribute('aria-expanded', String(isOpen));
  envelope.setAttribute('aria-label', isOpen ? 'Zarfı kapat' : 'Zarfı aç');
  const hint = envelope.parentElement.querySelector('.envelope-hint');
  hint.textContent = isOpen ? 'bir daha basarsan kapanır' : 'zarfı aç';
  if(isOpen){
    const envelopeAudio = document.getElementById('envelope-audio');
    envelopeAudio.currentTime = 0;
    envelopeAudio.play().catch(()=>{});
  }
}

// ---- PLAK ANİMASYONU ----
const recordAudio = document.getElementById('record-audio');

recordAudio.addEventListener('ended', ()=>{
  const player = document.querySelector('.music-player');
  player.classList.remove('is-spinning');
  player.setAttribute('aria-pressed', 'false');
});

function toggleRecord(player, event){
  if(recordAudio.paused){
    recordAudio.play().then(()=>{
      player.classList.add('is-spinning');
      player.setAttribute('aria-pressed', 'true');
    }).catch(()=>{
      player.classList.remove('is-spinning');
      player.setAttribute('aria-pressed', 'false');
    });
  } else {
    player.classList.add('is-spinning');
    player.setAttribute('aria-pressed', 'true');
  }

  const peki = document.createElement('span');
  peki.className = 'peki-drop';
  peki.textContent = 'PEKİ';
  player.appendChild(peki);
  setTimeout(()=>peki.remove(), 5700);

  const rect = player.getBoundingClientRect();
  const originX = event.detail ? event.clientX : rect.left + rect.width / 2;
  const originY = event.detail ? event.clientY : rect.top + rect.height / 2;
  const maxRadius = Math.hypot(window.innerWidth, window.innerHeight) * .65;
  const symbols = ['★','✦','☆','✧'];
  for(let i=0;i<52;i++){
    const star = document.createElement('span');
    const angle = Math.random() * Math.PI * 2;
    const radius = 100 + Math.random() * maxRadius;
    star.className = 'record-star';
    star.textContent = symbols[Math.floor(Math.random()*symbols.length)];
    star.style.left = originX + 'px';
    star.style.top = originY + 'px';
    star.style.setProperty('--burst-x', Math.cos(angle) * radius + 'px');
    star.style.setProperty('--burst-y', Math.sin(angle) * radius + 'px');
    star.style.setProperty('--spin', (Math.random()*540-270) + 'deg');
    star.style.setProperty('--star-size', (10+Math.random()*22) + 'px');
    star.style.animationDelay = Math.random()*.16 + 's';
    document.body.appendChild(star);
    setTimeout(()=>star.remove(), 1500);
  }
}

// ---- KUTLAMA EFEKTİ ----
function loveBurst(){
  for(let i=0;i<30;i++){
    const h = document.createElement('div');
    h.className='heart';
    h.textContent = ['★','✦','☆','✧'][Math.floor(Math.random()*4)];
    h.style.left = Math.random()*100+'vw';
    h.style.setProperty('--drift', (Math.random()*160-80)+'px');
    h.style.animationDuration = (3+Math.random()*2)+'s';
    document.body.appendChild(h);
    setTimeout(()=>h.remove(), 5500);
  }
}
