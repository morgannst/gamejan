// --- API URL ---
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyE7z5ELBLTeJdnZJhwqyOMWGzHN31jcYatPJYLWpN_KopcDOLS-P3W_IsiE0QJYGG_QA/exec';

// --- DOM Elements ---
const allDOMElements = {
    mainContainer: document.getElementById('main-container'),
    startScreen: document.getElementById('start-screen'),
    gameScreen: document.getElementById('game-screen'),
    endScreen: document.getElementById('end-screen'),
    playerNameInput: document.getElementById('player-name'),
    startGameBtn: document.getElementById('start-game-btn'),
    scoreDisplay: document.getElementById('score'),
    progressBar: document.getElementById('progress-bar'),
    wordImage: document.getElementById('word-image'),
    replayWordAudioBtn: document.getElementById('replay-word-audio-btn'),
    answerInput: document.getElementById('answer-input'),
    hintBtn: document.getElementById('hint-btn'),
    submitAnswerBtn: document.getElementById('submit-answer-btn'),
    starRating: document.getElementById('star-rating'),
    endMessage: document.getElementById('end-message'),
    finalScore: document.getElementById('final-score'),
    playAgainBtn: document.getElementById('play-again-btn'),
    highScoresStart: document.getElementById('high-scores-start'),
    highScoresEnd: document.getElementById('high-scores-end'),
    musicToggleBtn: document.getElementById('music-toggle-btn'),
    musicOnIcon: document.getElementById('music-on-icon'),
    musicOffIcon: document.getElementById('music-off-icon'),
    feedbackModal: document.getElementById('feedback-modal'),
    feedbackTitle: document.getElementById('feedback-title'),
    exampleSentenceEn: document.getElementById('example-sentence-en'),
    exampleSentenceTh: document.getElementById('example-sentence-th'),
    replaySentenceAudioBtn: document.getElementById('replay-sentence-audio-btn'),
    particleContainer: document.getElementById('particle-container'),
    nextQuestionBtn: document.getElementById('next-question-btn'),
    userAnswerFeedback: document.getElementById('user-answer-feedback'),
    userAnswerDisplay: document.getElementById('user-answer-display'),
    themeSelector: document.getElementById('theme-selector'),
    dinoMascot: document.getElementById('dino-mascot'),
    stickerBookBtn: document.getElementById('sticker-book-btn'),
    stickerBookModal: document.getElementById('sticker-book-modal'),
    closeStickerBookBtn: document.getElementById('close-sticker-book-btn'),
    stickerGrid: document.getElementById('sticker-grid'),
    reviewModeBtn: document.getElementById('review-mode-btn'),
    settingsBtn: document.getElementById('settings-btn'),
    settingsModal: document.getElementById('settings-modal'),
    closeSettingsBtn: document.getElementById('close-settings-btn'),
    musicVolumeSlider: document.getElementById('music-volume'),
    sfxVolumeSlider: document.getElementById('sfx-volume'),
    clearDataBtn: document.getElementById('clear-data-btn'),
    shareBtn: document.getElementById('share-btn'),
    stickerAwardModal: document.getElementById('sticker-award-modal'),
    awardedStickerDisplay: document.getElementById('awarded-sticker-display'),
    awardedStickerName: document.getElementById('awarded-sticker-name'),
    closeStickerAwardBtn: document.getElementById('close-sticker-award-btn'),
    stickerAwardParticleContainer: document.getElementById('sticker-award-particle-container'),
};

// --- Game Data ---
const words = [
    { en: 'shapes', th_hint: 'รูปทรง', sentences: [{ en: 'We can see many shapes around us.', th: 'เราสามารถเห็นรูปทรงมากมายรอบตัวเรา' }] },
    { en: 'circle', th_hint: 'วงกลม', sentences: [{ en: 'A ball is a circle.', th: 'ลูกบอลเป็นวงกลม' }] },
    { en: 'triangle', th_hint: 'สามเหลี่ยม', sentences: [{ en: 'A slice of pizza is a triangle.', th: 'พิซซ่าหนึ่งชิ้นเป็นรูปสามเหลี่ยม' }] },
    { en: 'square', th_hint: 'สี่เหลี่ยมจัตุรัส', sentences: [{ en: 'A window can be a square.', th: 'หน้าต่างสามารถเป็นรูปสี่เหลี่ยมจัตุรัสได้' }] },
    { en: 'rectangle', th_hint: 'สี่เหลี่ยมผืนผ้า', sentences: [{ en: 'A door is a rectangle.', th: 'ประตูเป็นรูปสี่เหลี่ยมผืนผ้า' }] },
    { en: 'heart', th_hint: 'หัวใจ', sentences: [{ en: 'I draw a heart for my mom.', th: 'ฉันวาดรูปหัวใจให้แม่' }] },
    { en: 'star', th_hint: 'ดาว', sentences: [{ en: 'A starfish has the shape of a star.', th: 'ปลาดาวมีรูปร่างเหมือนดาว' }] },
    { en: 'row', th_hint: 'แถว (แนวนอน)', sentences: [{ en: 'Please stand in a row.', th: 'กรุณายืนเรียงเป็นแถว' }] },
    { en: 'column', th_hint: 'คอลัมน์ (แนวตั้ง)', sentences: [{ en: 'The building has many tall columns.', th: 'ตึกมีเสาสูงหลายต้น' }] },
    { en: 'measure', th_hint: 'วัดขนาด', sentences: [{ en: 'We use a ruler to measure things.', th: 'เราใช้ไม้บรรทัดเพื่อวัดสิ่งของ' }] },
];
const stickers = [ { id: 1, name: 'สิงโต', emoji: '🦁' }, { id: 2, name: 'เสือ', emoji: '🐯' }, { id: 3, name: 'หมี', emoji: '🐻' }, { id: 4, name: 'แพนด้า', emoji: '🐼' }, { id: 5, name: 'จิ้งจอก', emoji: '🦊' }, { id: 6, name: 'แมว', emoji: '🐱' }, { id: 7, name: 'สุนัข', emoji: '🐶' }, { id: 8, name: 'หนู', emoji: '🐭' }, { id: 9, name: 'กระต่าย', emoji: '🐰' }, { id: 10, name: 'กบ', emoji: '🐸' }, { id: 11, name: 'ปลาหมึก', emoji: '🐙' }, { id: 12, name: 'ปู', emoji: '🦀' } ];
const themeMusic = { default: ['C4', 'E4', 'G4', 'B4'], space: ['A4', 'C5', 'E5', 'G5'], sea: ['D4', 'F4', 'A4', 'C5'], zoo: ['G3', 'B3', 'D4', 'F#4'] };
const correctFeedbackPhrases = ['เก่งมากเลยจ้า!', 'ถูกต้องนะค้าบ!', 'เยี่ยมไปเลย!'];
const incorrectFeedbackPhrases = ['อุ๊ย ผิดนิดเดียวเอง', 'ลองอีกทีนะ', 'ไม่เป็นไรนะ สู้ๆ'];

// --- Game State ---
const gameState = {
    currentWordIndex: -1,
    score: 0,
    playerName: '',
    highScores: [],
    collectedStickers: [],
    isHintUsed: false,
    isMusicOn: true,
    lastUserAnswer: '',
    currentTheme: 'default',
    isReviewMode: false,
    currentGameWords: [],
    currentExampleSentence: {},
};

// Audio engine instances (kept separate from state)
let synth, musicLoop, musicGain, sfxGain;

// --- Audio & Theme ---
function initializeAudio() { if (synth) return; musicGain = new Tone.Gain(0.5).toDestination(); sfxGain = new Tone.Gain(0.8).toDestination(); synth = new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 } }).connect(sfxGain); musicLoop = new Tone.Loop(time => { const notes = themeMusic[gameState.currentTheme] || themeMusic.default; const note = notes[Math.floor(Math.random() * notes.length)]; new Tone.Synth().toDestination().triggerAttackRelease(note, '8n', time).connect(musicGain); }, '1n').start(0); loadSettings(); }
function applyTheme(themeName) { document.body.className = `flex items-center justify-center min-h-screen p-4 sm:p-6 theme-${themeName}`; gameState.currentTheme = themeName; localStorage.setItem('funVocabTheme', themeName); allDOMElements.themeSelector.querySelectorAll('button').forEach(btn => btn.classList.toggle('active', btn.dataset.theme === themeName)); }

// --- Settings ---
function loadSettings() {
    const musicVol = localStorage.getItem('funVocabMusicVol') || 0.5;
    const sfxVol = localStorage.getItem('funVocabSfxVol') || 0.8;
    allDOMElements.musicVolumeSlider.value = musicVol;
    allDOMElements.sfxVolumeSlider.value = sfxVol;
    if (musicGain) musicGain.gain.value = musicVol;
    if (sfxGain) sfxGain.gain.value = sfxVol;
}
function clearAllData() {
    if (confirm('คุณแน่ใจหรือไม่ว่าจะล้างข้อมูลทั้งหมด? (คะแนน, สติกเกอร์, และคำที่เคยตอบผิดจะหายไปทั้งหมด)')) {
        localStorage.removeItem('funVocabPlayerName');
        localStorage.removeItem('funVocabTheme');
        localStorage.removeItem('funVocabStickers');
        localStorage.removeItem('funVocabIncorrectWords');
        localStorage.removeItem('funVocabMusicVol');
        localStorage.removeItem('funVocabSfxVol');
        window.location.reload();
    }
}

// --- Sticker Functions ---
function loadStickers() { const saved = localStorage.getItem('funVocabStickers'); gameState.collectedStickers = saved ? JSON.parse(saved) : []; }
function saveStickers() { localStorage.setItem('funVocabStickers', JSON.stringify(gameState.collectedStickers)); }
function awardSticker() {
    const uncollected = stickers.filter(s => !gameState.collectedStickers.includes(s.id));
    if (uncollected.length > 0) {
        const newSticker = uncollected[Math.floor(Math.random() * uncollected.length)];
        gameState.collectedStickers.push(newSticker.id);
        saveStickers();
        
        allDOMElements.awardedStickerDisplay.textContent = newSticker.emoji;
        allDOMElements.awardedStickerName.textContent = newSticker.name;
        allDOMElements.stickerAwardModal.classList.remove('hidden');
        allDOMElements.stickerAwardParticleContainer.innerHTML = '';
        for (let i = 0; i < 30; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            const x = (Math.random() - 0.5) * 500;
            const y = (Math.random() - 0.5) * 500;
            p.style.setProperty('--x', `${x}px`);
            p.style.setProperty('--y', `${y}px`);
            allDOMElements.stickerAwardParticleContainer.appendChild(p);
        }
    }
}
function renderStickerBook() { allDOMElements.stickerGrid.innerHTML = ''; if (gameState.collectedStickers.length === 0) { allDOMElements.stickerGrid.innerHTML = '<p class="col-span-full text-center text-gray-500">ยังไม่มีสติกเกอร์เลย<br>เล่นเกมให้ได้ 3 ดาวเพื่อสะสมนะ!</p>'; return; } stickers.forEach(sticker => { const isCollected = gameState.collectedStickers.includes(sticker.id); const stickerEl = document.createElement('div'); stickerEl.className = `flex flex-col items-center justify-center p-4 rounded-lg transition-all duration-300 ${isCollected ? 'bg-yellow-100' : 'bg-gray-200'}`; stickerEl.innerHTML = `<div class="text-5xl ${isCollected ? '' : 'opacity-20'}">${sticker.emoji}</div><span class="mt-2 text-sm font-semibold ${isCollected ? 'text-yellow-800' : 'text-gray-400'}">${isCollected ? sticker.name : '?'}</span>`; allDOMElements.stickerGrid.appendChild(stickerEl); }); }

// --- Core Game Logic ---
function updateMascot(state) { allDOMElements.dinoMascot.classList.remove('dino-happy', 'dino-sad'); if (state === 'happy') { allDOMElements.dinoMascot.classList.add('dino-happy'); } else if (state === 'sad') { allDOMElements.dinoMascot.classList.add('dino-sad'); } }
function speakText(text, lang = 'en-US') { if (typeof SpeechSynthesisUtterance === 'undefined') return; speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = lang; u.rate = 0.9; speechSynthesis.speak(u); }
function playSound(note, duration = '8n') { if(synth) synth.triggerAttackRelease(note, duration); }
function toggleMusic() { gameState.isMusicOn = !gameState.isMusicOn; if (gameState.isMusicOn) { Tone.Transport.start(); allDOMElements.musicOnIcon.classList.remove('hidden'); allDOMElements.musicOffIcon.classList.add('hidden'); } else { Tone.Transport.pause(); allDOMElements.musicOnIcon.classList.add('hidden'); allDOMElements.musicOffIcon.classList.remove('hidden'); } }
function createStarParticles() { allDOMElements.particleContainer.innerHTML = ''; for (let i = 0; i < 20; i++) { const p = document.createElement('div'); p.className = 'particle'; const x = (Math.random() - 0.5) * 400; const y = (Math.random() - 0.5) * 400; p.style.setProperty('--x', `${x}px`); p.style.setProperty('--y', `${y}px`); allDOMElements.particleContainer.appendChild(p); } }
async function loadHighScores() { try { const r = await fetch(WEB_APP_URL); if (!r.ok) throw new Error('Network response was not ok'); const d = await r.json(); gameState.highScores = Array.isArray(d) ? d : []; renderHighScores(allDOMElements.highScoresStart); renderHighScores(allDOMElements.highScoresEnd); } catch (e) { console.error('Failed to load high scores:', e); allDOMElements.highScoresStart.innerHTML = '<p class="text-red-500">ไม่สามารถโหลดคะแนนได้</p>'; allDOMElements.highScoresEnd.innerHTML = '<p class="text-red-500">ไม่สามารถโหลดคะแนนได้</p>'; gameState.highScores = []; } }
async function saveHighScore(d) { try { await fetch(WEB_APP_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(d) }); } catch (e) { console.error('Failed to save high score:', e); } }
function renderHighScores(c) { c.innerHTML = ''; if (!Array.isArray(gameState.highScores) || gameState.highScores.length === 0) { c.innerHTML = '<p class="text-gray-400">ยังไม่มีใครเล่นเลย!</p>'; return; } gameState.highScores.forEach((e, i) => { const s = document.createElement('div'); s.className = 'flex justify-between items-center p-2 rounded-lg hover:bg-purple-50'; s.innerHTML = `<div class="flex flex-col"><span class="font-semibold ${i === 0 ? 'text-purple-700' : 'text-gray-800'}">${i + 1}. ${e.name}</span><span class="text-xs text-gray-400">${e.date}</span></div><span class="font-bold text-lg ${i === 0 ? 'text-purple-700' : 'text-gray-600'}">${e.score} คะแนน</span>`; c.appendChild(s); }); }
function getIncorrectWords() { return JSON.parse(localStorage.getItem('funVocabIncorrectWords') || '[]'); }
function saveIncorrectWords(arr) { localStorage.setItem('funVocabIncorrectWords', JSON.stringify(arr)); }
function addIncorrectWord(word) { const incorrect = getIncorrectWords(); if (!incorrect.includes(word)) { incorrect.push(word); saveIncorrectWords(incorrect); } }
function removeIncorrectWord(word) { let incorrect = getIncorrectWords(); incorrect = incorrect.filter(w => w !== word); saveIncorrectWords(incorrect); }
function updateReviewButtonState() { const count = getIncorrectWords().length; allDOMElements.reviewModeBtn.disabled = count === 0; allDOMElements.reviewModeBtn.title = count > 0 ? `ทบทวนคำที่เคยตอบผิด (${count} คำ)` : 'ยังไม่มีคำที่ต้องทบทวน'; }

function startGame(mode = 'normal') {
    gameState.isReviewMode = mode === 'review';
    if (gameState.isReviewMode) {
        const incorrect = getIncorrectWords();
        if (incorrect.length === 0) { alert('เก่งมาก! ไม่มีคำที่ต้องทบทวนแล้วจ้า'); return; }
        gameState.currentGameWords = words.filter(word => incorrect.includes(word.en));
    } else {
        gameState.currentGameWords = [...words];
    }
    gameState.playerName = allDOMElements.playerNameInput.value.trim() || 'ผู้เล่นนิรนาม';
    localStorage.setItem('funVocabPlayerName', gameState.playerName);
    gameState.score = 0;
    gameState.currentWordIndex = -1;
    allDOMElements.startScreen.classList.add('hidden');
    allDOMElements.gameScreen.classList.remove('hidden');
    allDOMElements.scoreDisplay.textContent = gameState.score;
    Tone.start().then(() => { initializeAudio(); if (gameState.isMusicOn) Tone.Transport.start(); });
    nextQuestion();
}

function nextQuestion() {
    updateMascot('neutral');
    gameState.currentWordIndex++;
    if (gameState.currentWordIndex >= gameState.currentGameWords.length) { endGame(); return; }
    gameState.isHintUsed = false;
    ['answerInput', 'submitAnswerBtn', 'hintBtn'].forEach(el => allDOMElements[el].disabled = false);
    allDOMElements.answerInput.value = '';
    allDOMElements.answerInput.placeholder = 'พิมพ์คำตอบที่นี่';
    allDOMElements.userAnswerFeedback.classList.add('hidden');
    const currentWord = gameState.currentGameWords[gameState.currentWordIndex];
    allDOMElements.progressBar.style.width = `${((gameState.currentWordIndex + 1) / gameState.currentGameWords.length) * 100}%`;
    allDOMElements.wordImage.src = `https://placehold.co/600x400/e9d5ff/4c1d95?text=${encodeURIComponent(currentWord.th_hint)}`;
    allDOMElements.wordImage.alt = currentWord.th_hint;
    allDOMElements.wordImage.classList.add('animate-wobble');
    allDOMElements.wordImage.addEventListener('animationend', () => allDOMElements.wordImage.classList.remove('animate-wobble'), { once: true });
    setTimeout(() => speakText(currentWord.en), 500);
}

function checkAnswer() {
    const userAnswer = allDOMElements.answerInput.value.trim().toLowerCase();
    gameState.lastUserAnswer = userAnswer;
    const correctAnswer = gameState.currentGameWords[gameState.currentWordIndex].en;
    ['answerInput', 'submitAnswerBtn', 'hintBtn'].forEach(el => allDOMElements[el].disabled = true);
    const isCorrect = userAnswer === correctAnswer;
    if (isCorrect) {
        playSound('C5');
        const phrase = correctFeedbackPhrases[Math.floor(Math.random() * correctFeedbackPhrases.length)];
        setTimeout(() => speakText(phrase, 'th-TH'), 200);
        createStarParticles();
        updateMascot('happy');
        allDOMElements.feedbackTitle.textContent = 'ถูกต้อง!';
        allDOMElements.feedbackTitle.className = 'text-3xl sm:text-4xl font-bold mb-4 text-green-500';
        allDOMElements.userAnswerFeedback.classList.add('hidden');
        if (!gameState.isHintUsed) gameState.score++;
        if (gameState.isReviewMode) removeIncorrectWord(correctAnswer);
    } else {
        playSound('C3', '4n');
        const phrase = incorrectFeedbackPhrases[Math.floor(Math.random() * incorrectFeedbackPhrases.length)];
        setTimeout(() => speakText(phrase, 'th-TH'), 200);
        updateMascot('sad');
        allDOMElements.feedbackTitle.textContent = `ผิดจ้า! คำตอบคือ: ${correctAnswer}`;
        allDOMElements.feedbackTitle.className = 'text-2xl sm:text-3xl font-bold mb-4 text-red-500';
        allDOMElements.userAnswerDisplay.textContent = gameState.lastUserAnswer || '(ไม่ได้ตอบ)';
        allDOMElements.userAnswerFeedback.classList.remove('hidden');
        if (!gameState.isReviewMode) addIncorrectWord(correctAnswer);
    }
    allDOMElements.scoreDisplay.textContent = gameState.score;
    showFeedbackModal();
}

function showFeedbackModal() {
    const currentWord = gameState.currentGameWords[gameState.currentWordIndex];
    const sentences = currentWord.sentences;
    const randomSentence = sentences[Math.floor(Math.random() * sentences.length)];
    gameState.currentExampleSentence = randomSentence;
    allDOMElements.exampleSentenceEn.textContent = gameState.currentExampleSentence.en;
    allDOMElements.exampleSentenceTh.textContent = gameState.currentExampleSentence.th;
    allDOMElements.feedbackModal.classList.remove('hidden');
}

function useHint() {
    if (gameState.isHintUsed) return;
    gameState.isHintUsed = true;
    playSound('E5', '16n');
    allDOMElements.answerInput.value = gameState.currentGameWords[gameState.currentWordIndex].en.charAt(0);
    allDOMElements.hintBtn.disabled = true;
    allDOMElements.answerInput.focus();
}

async function endGame() {
    if (Tone.Transport.state === 'started') Tone.Transport.stop();
    allDOMElements.gameScreen.classList.add('hidden');
    allDOMElements.endScreen.classList.remove('hidden');
    updateReviewButtonState();
    
    allDOMElements.shareBtn.style.display = 'none';
    if (gameState.isReviewMode) {
        allDOMElements.endMessage.textContent = 'ทบทวนเสร็จแล้ว เยี่ยมมาก!';
        allDOMElements.finalScore.textContent = `ตอบถูก ${gameState.score}/${gameState.currentGameWords.length} คำ`;
        allDOMElements.starRating.innerHTML = '';
        return;
    }

    allDOMElements.shareBtn.style.display = 'block';
    const finalPercentage = gameState.score / gameState.currentGameWords.length;
    let stars = 0;
    let message = '';
    let endSpeech = '';
    if (finalPercentage >= 0.8) { stars = 3; message = 'เก่งมากเลย!'; endSpeech = 'สุดยอดไปเลย! ได้สามดาวแน่ะ'; }
    else if (finalPercentage >= 0.5) { stars = 2; message = 'เยี่ยมไปเลย!'; endSpeech = 'เก่งมากจ้ะ! ได้ตั้งสองดาว'; }
    else { stars = 1; message = 'พยายามอีกหน่อยนะ!'; endSpeech = 'พยายามได้ดีมากเลยนะ!'; }
    allDOMElements.starRating.innerHTML = '⭐'.repeat(stars).padEnd(3, '☆').replace(/⭐/g, '<span class="star-filled">⭐</span>').replace(/☆/g, '<span class="star-empty">☆</span>');
    allDOMElements.endMessage.textContent = message;
    allDOMElements.finalScore.textContent = `คะแนนของคุณ: ${gameState.score}/${gameState.currentGameWords.length}`;
    setTimeout(() => speakText(endSpeech, 'th-TH'), 500);
    if (stars === 3) awardSticker();
    const utcTimestamp = new Date().toISOString();
    const scoreData = { name: gameState.playerName, score: gameState.score, timestamp: utcTimestamp };
    await saveHighScore(scoreData);
    await loadHighScores();
}

function shareResult() {
    const shareText = `เราได้ ${gameState.score}/${gameState.currentGameWords.length} คะแนนในเกมทายศัพท์หรรษา! มาเล่นด้วยกันนะ! ${window.location.href}`;
    const textArea = document.createElement("textarea");
    textArea.value = shareText;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        document.execCommand('copy');
        alert('คัดลอกข้อความสำหรับแชร์แล้ว!');
    } catch (err) {
        console.error('ไม่สามารถคัดลอกได้', err);
    }
    document.body.removeChild(textArea);
}

// --- Event Listeners ---
allDOMElements.startGameBtn.addEventListener('click', () => startGame('normal'));
allDOMElements.reviewModeBtn.addEventListener('click', () => startGame('review'));
allDOMElements.playAgainBtn.addEventListener('click', async () => {
    allDOMElements.endScreen.classList.add('hidden');
    allDOMElements.startScreen.classList.remove('hidden');
    allDOMElements.highScoresStart.innerHTML = `<div class="flex justify-center items-center py-4"><svg class="animate-spin h-8 w-8 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span class="ml-3 text-gray-500">กำลังโหลดคะแนน...</span></div>`;
    await loadHighScores();
});
allDOMElements.submitAnswerBtn.addEventListener('click', checkAnswer);
allDOMElements.answerInput.addEventListener('keyup', (e) => { if (e.key === 'Enter') checkAnswer(); });
allDOMElements.hintBtn.addEventListener('click', useHint);
allDOMElements.replayWordAudioBtn.addEventListener('click', () => speakText(gameState.currentGameWords[gameState.currentWordIndex].en));
allDOMElements.replaySentenceAudioBtn.addEventListener('click', () => speakText(gameState.currentExampleSentence.en));
allDOMElements.musicToggleBtn.addEventListener('click', toggleMusic);
allDOMElements.nextQuestionBtn.addEventListener('click', () => { allDOMElements.feedbackModal.classList.add('hidden'); nextQuestion(); });
allDOMElements.themeSelector.addEventListener('click', (e) => { if (e.target.tagName === 'BUTTON') applyTheme(e.target.dataset.theme); });
allDOMElements.stickerBookBtn.addEventListener('click', () => { renderStickerBook(); allDOMElements.stickerBookModal.classList.remove('hidden'); });
allDOMElements.closeStickerBookBtn.addEventListener('click', () => { allDOMElements.stickerBookModal.classList.add('hidden'); });
allDOMElements.settingsBtn.addEventListener('click', () => allDOMElements.settingsModal.classList.remove('hidden'));
allDOMElements.closeSettingsBtn.addEventListener('click', () => allDOMElements.settingsModal.classList.add('hidden'));
allDOMElements.musicVolumeSlider.addEventListener('input', (e) => { if(musicGain) musicGain.gain.value = e.target.value; localStorage.setItem('funVocabMusicVol', e.target.value); });
allDOMElements.sfxVolumeSlider.addEventListener('input', (e) => { if(sfxGain) sfxGain.gain.value = e.target.value; localStorage.setItem('funVocabSfxVol', e.target.value); });
allDOMElements.clearDataBtn.addEventListener('click', clearAllData);
allDOMElements.shareBtn.addEventListener('click', shareResult);
allDOMElements.closeStickerAwardBtn.addEventListener('click', () => allDOMElements.stickerAwardModal.classList.add('hidden'));

// --- Initial Load ---
window.addEventListener('DOMContentLoaded', async () => {
    const savedName = localStorage.getItem('funVocabPlayerName');
    if (savedName) allDOMElements.playerNameInput.value = savedName;
    const savedTheme = localStorage.getItem('funVocabTheme') || 'default';
    applyTheme(savedTheme);
    loadStickers();
    updateReviewButtonState();
    allDOMElements.highScoresStart.innerHTML = `<div class="flex justify-center items-center py-4"><svg class="animate-spin h-8 w-8 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span class="ml-3 text-gray-500">กำลังโหลดคะแนน...</span></div>`;
    await loadHighScores();
    allDOMElements.musicOnIcon.classList.remove('hidden');
    allDOMElements.musicOffIcon.classList.add('hidden');
});
