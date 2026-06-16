/* script.js - Interactive Logic for Quantum Flip */

// --- Audio Synthesis Engine ---
let audioCtx = null;
let soundEnabled = true;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playFlipSound() {
  if (!soundEnabled) return;
  try {
    initAudio();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.type = 'sine';
    // Fast rising frequency sweep simulating wind-up and spin
    osc.frequency.setValueAtTime(220, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1400, audioCtx.currentTime + 0.35);
    
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.25, audioCtx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);
  } catch (e) {
    console.warn('Web Audio API is blocked or not supported:', e);
  }
}

function playLandSound() {
  if (!soundEnabled) return;
  try {
    initAudio();
    
    // Impact click
    const clickOsc = audioCtx.createOscillator();
    const clickGain = audioCtx.createGain();
    clickOsc.connect(clickGain);
    clickGain.connect(audioCtx.destination);
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(180, audioCtx.currentTime);
    clickGain.gain.setValueAtTime(0.5, audioCtx.currentTime);
    clickGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
    clickOsc.start();
    clickOsc.stop(audioCtx.currentTime + 0.12);

    // High metal bell/ring decay
    const bellOsc = audioCtx.createOscillator();
    const bellGain = audioCtx.createGain();
    bellOsc.connect(bellGain);
    bellGain.connect(audioCtx.destination);
    bellOsc.type = 'sine';
    bellOsc.frequency.setValueAtTime(1600, audioCtx.currentTime);
    bellGain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    bellGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
    bellOsc.start();
    bellOsc.stop(audioCtx.currentTime + 0.6);
  } catch (e) {
    console.warn('Web Audio API is blocked or not supported:', e);
  }
}

// --- Confetti Celebration Particle System ---
const canvas = document.getElementById('confetti-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let confettiAnimId = null;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 8 + 4;
    this.speedX = Math.random() * 12 - 6;
    this.speedY = Math.random() * -14 - 6;
    this.gravity = 0.45;
    this.color = `hsl(${Math.random() * 360}, 90%, 55%)`;
    this.rotation = Math.random() * 360;
    this.rotationSpeed = Math.random() * 12 - 6;
    this.opacity = 1;
  }
  
  update() {
    this.speedY += this.gravity;
    this.x += this.speedX;
    this.y += this.speedY;
    this.rotation += this.rotationSpeed;
    this.opacity -= 0.012;
  }
  
  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;
    // Draw rectangular confetti bits
    ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 1.5);
    ctx.restore();
  }
}

function triggerConfetti() {
  const coin = document.getElementById('coin-element');
  if (!coin) return;
  const rect = coin.getBoundingClientRect();
  const startX = rect.left + rect.width / 2 + window.scrollX;
  const startY = rect.top + rect.height / 2 + window.scrollY;
  
  particles = [];
  for (let i = 0; i < 90; i++) {
    particles.push(new Particle(startX, startY));
  }
  
  if (confettiAnimId) cancelAnimationFrame(confettiAnimId);
  animateConfetti();
}

function animateConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  particles = particles.filter(p => p.opacity > 0 && p.y < canvas.height);
  
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  
  if (particles.length > 0) {
    confettiAnimId = requestAnimationFrame(animateConfetti);
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}


// --- App State Management ---
let state = {
  stats: {
    total: 0,
    heads: 0,
    tails: 0
  },
  history: [], // Elements look like: { result: 'heads'|'tails', prediction: 'heads'|'tails'|null, isWin: bool|null, time: string }
  prediction: null, // 'heads', 'tails', or null
  isFlipping: false
};

// --- DOM Elements ---
const coinElement = document.getElementById('coin-element');
const coinWrapper = document.getElementById('coin-interactive-wrapper');
const coinShadow = document.getElementById('coin-shadow-element');
const flipButton = document.getElementById('flip-button');
const predictHeadsBtn = document.getElementById('predict-heads');
const predictTailsBtn = document.getElementById('predict-tails');
const resultBanner = document.getElementById('result-banner');

const statTotal = document.getElementById('stat-total');
const statHeads = document.getElementById('stat-heads');
const statHeadsPct = document.getElementById('stat-heads-pct');
const statTails = document.getElementById('stat-tails');
const statTailsPct = document.getElementById('stat-tails-pct');

const ratioHeads = document.getElementById('ratio-heads');
const ratioTails = document.getElementById('ratio-tails');
const ratioHeadsLabel = document.getElementById('ratio-heads-label');
const ratioTailsLabel = document.getElementById('ratio-tails-label');

const historyList = document.getElementById('history-list');
const emptyHistoryMsg = document.getElementById('empty-history-msg');
const clearHistoryBtn = document.getElementById('clear-history');
const resetStatsBtn = document.getElementById('reset-stats-btn');
const soundToggleBtn = document.getElementById('sound-toggle');


// --- Load and Save Data ---
function loadData() {
  try {
    const savedStats = localStorage.getItem('quantum_flip_stats');
    const savedHistory = localStorage.getItem('quantum_flip_history');
    const savedSound = localStorage.getItem('quantum_flip_sound');

    if (savedStats) state.stats = JSON.parse(savedStats);
    if (savedHistory) state.history = JSON.parse(savedHistory);
    if (savedSound !== null) {
      soundEnabled = JSON.parse(savedSound);
      updateSoundUI();
    }
  } catch (e) {
    console.error('Failed to load LocalStorage data:', e);
  }
}

function saveData() {
  try {
    localStorage.setItem('quantum_flip_stats', JSON.stringify(state.stats));
    localStorage.setItem('quantum_flip_history', JSON.stringify(state.history));
    localStorage.setItem('quantum_flip_sound', JSON.stringify(soundEnabled));
  } catch (e) {
    console.error('Failed to save to LocalStorage:', e);
  }
}


// --- Rendering / UI Sync ---
function updateSoundUI() {
  soundToggleBtn.textContent = soundEnabled ? '🔊 Sounds On' : '🔇 Muted';
  soundToggleBtn.setAttribute('aria-label', soundEnabled ? 'Mute sound effects' : 'Unmute sound effects');
}

function renderStats() {
  const { total, heads, tails } = state.stats;
  statTotal.textContent = total;
  statHeads.textContent = heads;
  statTails.textContent = tails;

  const headsPct = total > 0 ? Math.round((heads / total) * 100) : 50;
  const tailsPct = total > 0 ? Math.round((tails / total) * 100) : 50;

  statHeadsPct.textContent = total > 0 ? `${headsPct}%` : '0%';
  statTailsPct.textContent = total > 0 ? `${tailsPct}%` : '0%';

  ratioHeads.style.width = `${headsPct}%`;
  ratioTails.style.width = `${tailsPct}%`;
  ratioHeadsLabel.textContent = `${headsPct}%`;
  ratioTailsLabel.textContent = `${tailsPct}%`;
}

function renderHistory() {
  // Clear list except the empty message block
  historyList.querySelectorAll('.history-item').forEach(item => item.remove());

  if (state.history.length === 0) {
    emptyHistoryMsg.style.display = 'block';
    return;
  }

  emptyHistoryMsg.style.display = 'none';

  state.history.forEach(item => {
    const li = document.createElement('li');
    li.className = `history-item ${item.result}-item`;

    let predText = 'No prediction';
    let predClass = 'none';

    if (item.prediction) {
      if (item.isWin) {
        predText = `Predicted ${item.prediction} (Won!)`;
        predClass = 'win';
      } else {
        predText = `Predicted ${item.prediction} (Lost)`;
        predClass = 'lose';
      }
    }

    li.innerHTML = `
      <div class="history-info">
        <div class="history-badge ${item.result}" aria-hidden="true"></div>
        <div class="history-text">
          <span class="history-label">${item.result.toUpperCase()}</span>
          <span class="history-prediction-status ${predClass}">${predText}</span>
        </div>
      </div>
      <span class="history-time">${item.time}</span>
    `;

    historyList.appendChild(li);
  });
}


// --- Predictions Selection ---
function selectPrediction(choice) {
  if (state.isFlipping) return;

  if (state.prediction === choice) {
    // Deselect if clicked again
    state.prediction = null;
    predictHeadsBtn.classList.remove('active');
    predictTailsBtn.classList.remove('active');
    predictHeadsBtn.setAttribute('aria-checked', 'false');
    predictTailsBtn.setAttribute('aria-checked', 'false');
  } else {
    state.prediction = choice;
    if (choice === 'heads') {
      predictHeadsBtn.classList.add('active');
      predictHeadsBtn.setAttribute('aria-checked', 'true');
      predictTailsBtn.classList.remove('active');
      predictTailsBtn.setAttribute('aria-checked', 'false');
    } else {
      predictTailsBtn.classList.add('active');
      predictTailsBtn.setAttribute('aria-checked', 'true');
      predictHeadsBtn.classList.remove('active');
      predictHeadsBtn.setAttribute('aria-checked', 'false');
    }
    
    // Auto initiate audio on user action
    initAudio();
  }
}


// --- Main Flip Function ---
function flip() {
  if (state.isFlipping) return;

  state.isFlipping = true;
  flipButton.disabled = true;
  
  // Hide current result banner text
  resultBanner.classList.remove('show');
  
  // Audio synthesis init
  initAudio();
  playFlipSound();

  // Clear previous animations/rotations
  coinElement.className = 'coin';
  coinShadow.className = 'coin-shadow';
  
  // Force a browser reflow to reset CSS transitions/animations
  void coinElement.offsetWidth;

  // Decide outcome
  const outcome = Math.random() < 0.5 ? 'heads' : 'tails';

  // Apply visual spin animation based on output
  if (outcome === 'heads') {
    coinElement.classList.add('flipping-heads');
  } else {
    coinElement.classList.add('flipping-tails');
  }
  coinShadow.classList.add('flipping');

  // Animation duration matches style.css keyframes (2.2 seconds)
  setTimeout(() => {
    playLandSound();

    // Calculate prediction outcomes
    let isWin = null;
    let predictionMessage = '';

    if (state.prediction) {
      isWin = state.prediction === outcome;
      if (isWin) {
        predictionMessage = ' You won your prediction!';
        resultBanner.className = 'result-banner show result-win';
        triggerConfetti();
      } else {
        predictionMessage = ' You missed your prediction.';
        resultBanner.className = 'result-banner show result-lose';
      }
    } else {
      resultBanner.className = 'result-banner show result-neutral';
    }

    resultBanner.textContent = `${outcome.toUpperCase()}!${predictionMessage}`;

    // Update Stats
    state.stats.total++;
    if (outcome === 'heads') {
      state.stats.heads++;
    } else {
      state.stats.tails++;
    }

    // Update History (Limit to 5)
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    state.history.unshift({
      result: outcome,
      prediction: state.prediction,
      isWin: isWin,
      time: timeString
    });

    if (state.history.length > 5) {
      state.history.pop();
    }

    // Save and Redraw
    saveData();
    renderStats();
    renderHistory();

    // Reset state & elements for next turn
    state.isFlipping = false;
    flipButton.disabled = false;
  }, 2200);
}


// --- Event Listeners ---
predictHeadsBtn.addEventListener('click', () => selectPrediction('heads'));
predictTailsBtn.addEventListener('click', () => selectPrediction('tails'));

flipButton.addEventListener('click', flip);
coinWrapper.addEventListener('click', flip);

// Keyboard interaction for accessibility
coinWrapper.addEventListener('keydown', (e) => {
  if (e.key === ' ' || e.key === 'Enter') {
    e.preventDefault();
    flip();
  }
});

soundToggleBtn.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  saveData();
  updateSoundUI();
  initAudio();
});

clearHistoryBtn.addEventListener('click', () => {
  state.history = [];
  saveData();
  renderHistory();
});

resetStatsBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to reset all your statistics and history?')) {
    state.stats = { total: 0, heads: 0, tails: 0 };
    state.history = [];
    state.prediction = null;
    predictHeadsBtn.classList.remove('active');
    predictTailsBtn.classList.remove('active');
    predictHeadsBtn.setAttribute('aria-checked', 'false');
    predictTailsBtn.setAttribute('aria-checked', 'false');
    saveData();
    renderStats();
    renderHistory();
    resultBanner.textContent = 'Ready to spin...';
    resultBanner.className = 'result-banner';
  }
});


// --- Initial Setup ---
loadData();
renderStats();
renderHistory();
updateSoundUI();
