/* ============================================================
   SPELLING TEST — Application Logic
   ============================================================ */

// --------------- Configuration ---------------
const API_URL = (() => {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || window.location.protocol === 'file:') {
        return 'http://localhost:3000';
    }
    return 'https://gamejan.vercel.app';
})();

// --------------- Vocabulary ---------------
const originalVocabulary = [
    { word: "Cousin",         meaning: "ลูกพี่ลูกน้อง" },
    { word: "Groom",          meaning: "เจ้าบ่าว" },
    { word: "Bride",          meaning: "เจ้าสาว" },
    { word: "Father",         meaning: "พ่อ" },
    { word: "Mother",         meaning: "แม่" },
    { word: "Aunt",           meaning: "ป้า, น้าผู้หญิง, อาผู้หญิง" },
    { word: "Uncle",          meaning: "ลุง, น้าผู้ชาย, อาผู้ชาย" },
    { word: "Grandmother",    meaning: "ย่า, ยาย" },
    { word: "Grandson",       meaning: "หลานชาย" },
    { word: "Granddaughter",  meaning: "หลานสาว" }
];

// --------------- State ---------------
let vocabulary     = [...originalVocabulary];
let practiceIndex  = 0;
let testIndex      = 0;
let score          = 0;
let userHistory    = [];
let isChecking     = false;
let synthVoices    = [];
let leaderboardData = [];
let lastWrongWords = [];

// --------------- DOM References ---------------
const screens = {
    start:       document.getElementById('start-screen'),
    practice:    document.getElementById('practice-screen'),
    tips:        document.getElementById('tips-screen'),
    leaderboard: document.getElementById('leaderboard-screen'),
    game:        document.getElementById('game-screen'),
    result:      document.getElementById('result-screen')
};
const homeBtn = document.getElementById('home-btn');

// --------------- Initialization ---------------
if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
        synthVoices = window.speechSynthesis.getVoices();
    };
    synthVoices = window.speechSynthesis.getVoices();
}

lucide.createIcons();

// ==================== SCREEN MANAGEMENT ====================

function showScreen(screenName) {
    Object.values(screens).forEach(s => s.classList.add('hidden'));
    screens[screenName].classList.remove('hidden');
    homeBtn.classList.toggle('hidden', screenName === 'start');
}

function initApp() {
    window.speechSynthesis.cancel();
    showScreen('start');
}

// ==================== AUDIO HELPERS ====================

function unlockAudio() {
    if ('speechSynthesis' in window) {
        const dummy = new SpeechSynthesisUtterance('');
        dummy.volume = 0;
        window.speechSynthesis.speak(dummy);
    }
}

function speakText(text, rate = 0.8, spell = false) {
    if (!('speechSynthesis' in window)) {
        alert("เบราว์เซอร์ของคุณไม่รองรับระบบเสียงอ่าน");
        return;
    }

    window.speechSynthesis.cancel();

    const textToSpeak = spell ? text.split('').join(' . ') : text;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    if (synthVoices.length === 0) {
        synthVoices = window.speechSynthesis.getVoices();
    }

    const enVoice = synthVoices.find(v =>
        v.lang.startsWith('en-') || v.lang === 'en' || v.name.includes('English')
    );
    if (enVoice) utterance.voice = enVoice;

    utterance.lang  = 'en-US';
    utterance.rate  = rate;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
}

// ==================== STUDY TIPS ====================

function showStudyTips() {
    unlockAudio();
    showScreen('tips');
    switchTab('assoc');
}

function switchTab(tabName) {
    const tabs = {
        assoc: { btn: document.getElementById('tab-assoc'), content: document.getElementById('content-assoc') },
        traps: { btn: document.getElementById('tab-traps'), content: document.getElementById('content-traps') },
        plan:  { btn: document.getElementById('tab-plan'),  content: document.getElementById('content-plan')  }
    };

    Object.keys(tabs).forEach(key => {
        const isActive = key === tabName;
        tabs[key].btn.classList.toggle('border-amber-500', isActive);
        tabs[key].btn.classList.toggle('text-amber-600', isActive);
        tabs[key].btn.classList.toggle('border-transparent', !isActive);
        tabs[key].btn.classList.toggle('hover:text-gray-700', !isActive);
        tabs[key].content.classList.toggle('hidden', !isActive);
    });
}

// ==================== LEADERBOARD ====================

function showLeaderboard() {
    unlockAudio();
    showScreen('leaderboard');
    fetchLeaderboard();
}

async function fetchLeaderboard(retryCount = 0) {
    const MAX_RETRIES = 3;
    const listContainer = document.getElementById('leaderboard-list');

    if (retryCount === 0) {
        listContainer.innerHTML = `
            <div class="text-center py-10">
                <div class="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-indigo-600 rounded-full mb-2"></div>
                <p class="text-sm text-gray-500">กำลังเชื่อมต่อฐานข้อมูล Neon...</p>
            </div>`;
    }

    try {
        const response = await fetch(`${API_URL}/api/leaderboard`);
        if (!response.ok) throw new Error('Network error');
        leaderboardData = await response.json();
        renderLeaderboard();
    } catch (err) {
        console.error(`Fetch error (attempt ${retryCount + 1}/${MAX_RETRIES + 1}):`, err);

        if (retryCount < MAX_RETRIES) {
            const delay = Math.pow(2, retryCount) * 1000;
            listContainer.innerHTML = `
                <div class="text-center py-8">
                    <div class="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-amber-500 rounded-full mb-2"></div>
                    <p class="text-sm text-amber-700">กำลังลองใหม่... (ครั้งที่ ${retryCount + 1}/${MAX_RETRIES})</p>
                </div>`;
            setTimeout(() => fetchLeaderboard(retryCount + 1), delay);
        } else {
            listContainer.innerHTML = `
                <div class="text-center py-8 bg-red-50 rounded-2xl border border-red-100 p-4">
                    <i data-lucide="wifi-off" class="w-8 h-8 text-red-500 mx-auto mb-2"></i>
                    <p class="text-sm font-semibold text-red-800">ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้</p>
                    <p class="text-xs text-red-500 mt-1">โปรดตรวจสอบว่าได้รัน server.js หรืออัปโหลดโค้ดขึ้นระบบแล้ว</p>
                    <button onclick="fetchLeaderboard()" class="mt-3 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-5 rounded-xl text-xs transition-all active:scale-95 inline-flex items-center gap-1.5">
                        <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i> ลองใหม่
                    </button>
                </div>`;
            lucide.createIcons();
        }
    }
}

function renderLeaderboard() {
    const listContainer = document.getElementById('leaderboard-list');
    listContainer.innerHTML = '';

    if (leaderboardData.length === 0) {
        listContainer.innerHTML = '<p class="text-center text-sm text-gray-400 py-8">ยังไม่มีอันดับคะแนน บันทึกคะแนนคนแรกเลย!</p>';
        return;
    }

    const badgeConfig = [
        { emoji: '🥇', bg: 'bg-yellow-50/70', border: 'border-yellow-200' },
        { emoji: '🥈', bg: 'bg-slate-50',     border: 'border-slate-200'  },
        { emoji: '🥉', bg: 'bg-amber-50/70',  border: 'border-amber-100'  }
    ];

    leaderboardData.forEach((item, index) => {
        const badge = badgeConfig[index] || null;
        const badgeHtml = badge
            ? badge.emoji
            : `<span class="text-xs font-bold text-gray-400">#${index + 1}</span>`;
        const bgClass = badge ? badge.bg : 'bg-gray-50';
        const borderClass = badge ? badge.border : 'border-gray-100';

        let stars = '';
        if (item.score === 10)      stars = '⭐⭐⭐';
        else if (item.score >= 7)   stars = '⭐⭐';
        else if (item.score >= 4)   stars = '⭐';
        else                        stars = '👍';

        const div = document.createElement('div');
        div.className = `flex items-center justify-between p-3 rounded-2xl border ${bgClass} ${borderClass} transition-all duration-300 pop-in`;
        div.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full flex items-center justify-center bg-white shadow-sm font-semibold">${badgeHtml}</div>
                <div>
                    <div class="font-bold text-gray-800 text-sm">${item.player_name}</div>
                    <div class="text-[10px] text-gray-400">สอบเมื่อ: ${item.date}</div>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <span class="font-black text-indigo-600 text-lg">${item.score}</span>
                <span class="text-xs text-gray-400">/10</span>
                <div class="text-xs ml-1">${stars}</div>
            </div>`;
        listContainer.appendChild(div);
    });

    lucide.createIcons();
}

// ==================== SAVE SCORE ====================

async function savePlayerScore() {
    const inputEl    = document.getElementById('player-name-input');
    const retryDiv   = document.getElementById('retry-save-div');
    const statusIcon = document.getElementById('save-status-icon');
    const statusText = document.getElementById('save-status-text');
    const name       = inputEl.value.trim();

    if (!name) {
        inputEl.classList.add('shake');
        setTimeout(() => inputEl.classList.remove('shake'), 500);
        return;
    }

    retryDiv.classList.add('hidden');
    statusIcon.innerHTML = '<i data-lucide="loader" class="w-4 h-4 animate-spin"></i>';
    statusText.textContent = 'กำลังบันทึกคะแนนไปยังคลาวด์...';
    statusText.className = 'text-xs font-bold text-indigo-800';
    lucide.createIcons();

    try {
        const response = await fetch(`${API_URL}/api/scores`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ player_name: name, score, history: userHistory })
        });

        if (!response.ok) throw new Error('เซฟคะแนนไม่สำเร็จ');

        statusIcon.innerHTML = '<i data-lucide="check-circle" class="w-4 h-4 text-emerald-500"></i>';
        statusText.textContent = `บันทึกคะแนนของ "${name}" สำเร็จแล้ว!`;
        statusText.className = 'text-xs font-bold text-emerald-600';
    } catch (err) {
        console.error('Error saving score:', err);
        statusIcon.innerHTML = '<i data-lucide="alert-circle" class="w-4 h-4 text-red-500"></i>';
        statusText.textContent = 'บันทึกคะแนนล้มเหลว (คุณอาจยังไม่ได้เปิดเซิร์ฟเวอร์ server.js)';
        statusText.className = 'text-xs font-bold text-red-500';
        retryDiv.classList.remove('hidden');
    }

    lucide.createIcons();
}

// ==================== PRACTICE MODE ====================

function startPracticeMode() {
    unlockAudio();
    practiceIndex = 0;
    vocabulary = [...originalVocabulary];
    showScreen('practice');
    loadPracticeWord();
}

function loadPracticeWord() {
    const currentWord = vocabulary[practiceIndex];
    document.getElementById('practice-word').textContent    = currentWord.word;
    document.getElementById('practice-meaning').textContent = currentWord.meaning;
    document.getElementById('practice-counter').textContent = `คำที่ ${practiceIndex + 1} / ${vocabulary.length}`;

    document.getElementById('flashcard').classList.remove('flipped');
    document.getElementById('btn-prev-practice').disabled = (practiceIndex === 0);

    const isLast = practiceIndex === vocabulary.length - 1;
    document.getElementById('btn-next-practice').innerHTML = isLast
        ? 'เริ่มสอบ <i data-lucide="pen-tool" class="w-5 h-5"></i>'
        : 'ถัดไป <i data-lucide="chevron-right" class="w-5 h-5"></i>';

    lucide.createIcons();
    setTimeout(() => playPracticeAudio(), 300);
}

function flipCard() {
    document.getElementById('flashcard').classList.toggle('flipped');
}

function playPracticeAudio() {
    speakText(vocabulary[practiceIndex].word, 0.9);
}

function spellWord() {
    const word = vocabulary[practiceIndex].word;
    speakText(word, 0.8);
    setTimeout(() => speakText(word, 0.6, true), 1000);
}

function prevPracticeWord() {
    if (practiceIndex > 0) {
        practiceIndex--;
        loadPracticeWord();
    }
}

function nextPracticeWord() {
    if (practiceIndex < vocabulary.length - 1) {
        practiceIndex++;
        loadPracticeWord();
    } else {
        startTestMode();
    }
}

// ==================== TEST MODE ====================

function startTestMode() {
    const nameStartInput = document.getElementById('player-name-start');
    const name = nameStartInput.value.trim();

    if (!name) {
        showScreen('start');
        nameStartInput.classList.add('shake', 'border-red-500');
        nameStartInput.focus();
        setTimeout(() => nameStartInput.classList.remove('shake'), 500);
        nameStartInput.addEventListener('input', () => {
            nameStartInput.classList.remove('border-red-500');
        }, { once: true });
        return;
    }

    nameStartInput.classList.remove('border-red-500');
    _prepareTest(name, [...originalVocabulary].sort(() => Math.random() - 0.5));
}

function startRetryWrongMode() {
    if (lastWrongWords.length === 0) return;

    const name = document.getElementById('player-name-start').value.trim()
              || document.getElementById('player-name-input').value.trim();

    _prepareTest(name, [...lastWrongWords].sort(() => Math.random() - 0.5));
}

function _prepareTest(name, wordList) {
    unlockAudio();
    testIndex   = 0;
    score       = 0;
    userHistory = [];
    isChecking  = false;
    vocabulary  = wordList;

    document.getElementById('save-score-section').classList.remove('hidden');
    document.getElementById('player-name-input').value = name;

    showScreen('game');
    loadTestQuestion();
}

function loadTestQuestion() {
    const currentWord = vocabulary[testIndex];
    document.getElementById('test-meaning').textContent = currentWord.meaning;

    const inputEl = document.getElementById('word-input');
    inputEl.value = '';
    inputEl.focus();

    document.getElementById('question-counter').textContent = `คำที่ ${testIndex + 1} / ${vocabulary.length}`;
    document.getElementById('score-display').textContent    = `คะแนน: ${score}`;
    document.getElementById('progress-bar').style.width     = `${(testIndex / vocabulary.length) * 100}%`;

    setTimeout(() => playTestAudio(), 500);
}

// ==================== SOUND EFFECTS ====================

function playSFX(type) {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();

        if (type === 'correct') {
            const now = ctx.currentTime;
            _playTone(ctx, 'sine', 523.25, now, 0.15, 0.25);       // C5
            _playTone(ctx, 'sine', 659.25, now + 0.08, 0.15, 0.27); // E5
        } else if (type === 'incorrect') {
            const now = ctx.currentTime;
            const osc  = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.linearRampToValueAtTime(90, now + 0.35);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.35);
        }
    } catch (e) {
        console.warn('AudioContext SFX failed:', e);
    }
}

function _playTone(ctx, type, freq, startTime, volume, duration) {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration);
}

function playTestAudio(rate = 0.8) {
    speakText(vocabulary[testIndex].word, rate);
}

// ==================== ANSWER CHECKING ====================

function handleKeyPress(e) {
    if (e.key === 'Enter' && !isChecking && !screens.game.classList.contains('hidden')) {
        checkAnswer();
    }
}

function checkAnswer() {
    if (isChecking) return;

    const inputEl   = document.getElementById('word-input');
    const userInput = inputEl.value.trim();

    if (!userInput) {
        inputEl.classList.add('shake');
        setTimeout(() => inputEl.classList.remove('shake'), 500);
        return;
    }

    isChecking = true;
    const currentWord = vocabulary[testIndex];
    const isCorrect   = userInput.toLowerCase() === currentWord.word.toLowerCase();

    userHistory.push({
        word:       currentWord.word,
        meaning:    currentWord.meaning,
        userAnswer: userInput,
        isCorrect
    });

    const feedbackOverlay = document.getElementById('feedback-overlay');
    const feedbackContent = document.getElementById('feedback-content');

    feedbackOverlay.classList.remove('hidden');

    if (isCorrect) {
        score++;
        playSFX('correct');
        document.getElementById('score-display').textContent = `คะแนน: ${score}`;
        inputEl.classList.add('border-green-500', 'bg-green-50');
        feedbackContent.innerHTML = '<i data-lucide="check-circle" class="w-8 h-8 text-green-500"></i><span class="text-green-600">ถูกต้อง!</span>';
    } else {
        playSFX('incorrect');
        inputEl.classList.add('border-red-500', 'bg-red-50');
        feedbackContent.innerHTML = `
            <div class="text-center">
                <div class="flex items-center justify-center gap-2 mb-1">
                    <i data-lucide="x-circle" class="w-6 h-6 text-red-500"></i>
                    <span class="text-red-600">ผิดพลาด</span>
                </div>
                <div class="text-sm font-normal text-gray-600">
                    คำที่ถูกต้องคือ <span class="font-bold text-green-600">${currentWord.word}</span>
                </div>
            </div>`;
    }

    lucide.createIcons();

    setTimeout(() => {
        feedbackOverlay.classList.add('hidden');
        inputEl.classList.remove('border-green-500', 'bg-green-50', 'border-red-500', 'bg-red-50');

        testIndex++;
        isChecking = false;

        if (testIndex < vocabulary.length) {
            loadTestQuestion();
        } else {
            endGame();
        }
    }, 2000);
}

// ==================== END GAME ====================

function endGame() {
    showScreen('result');
    document.getElementById('progress-bar').style.width = '100%';
    document.getElementById('final-score').textContent = `${score} / ${vocabulary.length}`;

    const resultIcon = document.getElementById('result-icon');
    const resultMsg  = document.getElementById('result-message');

    // Store wrong words for retry mode
    lastWrongWords = userHistory
        .filter(item => !item.isCorrect)
        .map(item => originalVocabulary.find(v => v.word === item.word));

    const retryWrongBtn = document.getElementById('retry-wrong-btn');
    retryWrongBtn.classList.toggle('hidden', !(lastWrongWords.length > 0 && score < vocabulary.length));

    // Result display
    if (score === vocabulary.length) {
        resultIcon.className = "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 bg-green-100 text-green-500";
        resultIcon.innerHTML = '<i data-lucide="award" class="w-10 h-10"></i>';
        resultMsg.textContent = "เก่งมาก! คุณสะกดถูกต้องทุกคำเลย 🌟⭐🌟";
        if (typeof confetti === 'function') {
            confetti({ particleCount: 150, spread: 85, origin: { y: 0.6 } });
        }
    } else if (score >= vocabulary.length / 2) {
        resultIcon.className = "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 bg-yellow-100 text-yellow-500";
        resultIcon.innerHTML = '<i data-lucide="thumbs-up" class="w-10 h-10"></i>';
        resultMsg.textContent = "ทำได้ดี! ฝึกอีกนิดก็จะจำได้ทั้งหมดแล้ว 🌟";
        if (typeof confetti === 'function') {
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        }
    } else {
        resultIcon.className = "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 bg-red-100 text-red-500";
        resultIcon.innerHTML = '<i data-lucide="book-open" class="w-10 h-10"></i>';
        resultMsg.textContent = "พยายามเข้านะ ลองทบทวนคำแนะนำแล้วลองใหมู่อีกรอบ 👍";
    }

    // Render history
    const historyContainer = document.getElementById('history-list');
    historyContainer.innerHTML = '';

    userHistory.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = `flex justify-between items-center p-3 rounded-lg border-l-4 ${item.isCorrect ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`;
        li.innerHTML = `
            <div class="flex-1">
                <div class="text-xs text-gray-500 mb-1">${index + 1}. ${item.meaning}</div>
                <div class="font-semibold ${item.isCorrect ? 'text-green-700' : 'text-red-700'} line-through opacity-80 decoration-2">
                    ${item.isCorrect ? '' : item.userAnswer}
                </div>
                <div class="font-bold text-gray-800 text-lg">${item.word}</div>
            </div>
            <div>
                ${item.isCorrect
                    ? '<i data-lucide="check" class="text-green-500 w-5 h-5"></i>'
                    : '<i data-lucide="x" class="text-red-500 w-5 h-5"></i>'}
            </div>`;
        historyContainer.appendChild(li);
    });

    lucide.createIcons();
    savePlayerScore();
}

// ==================== BOOT ====================
window.onload = initApp;