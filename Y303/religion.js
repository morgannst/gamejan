/* ============================================================
   RELIGION GAME — Application Logic
   ============================================================ */

let religionMascot = "🐰 กระต่ายน้อย พิ้งกี้";
let religionMode = 'trivia'; // 'trivia' or 'sorting'
let relQuestionIndex = 0;
let relScore = 0;
let relCanAnswer = true;
let relWrongHistory = []; // { item_name: string, isCorrect: boolean }

// --- SOUND EFFECTS SYNTHESIS ---
let relIsMuted = false;
let relAudioCtx = null;

function initRelAudio() {
    if (!relAudioCtx) {
        relAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playRelSound(type) {
    if (relIsMuted) return;
    initRelAudio();
    if (relAudioCtx.state === 'suspended') {
        relAudioCtx.resume();
    }

    const osc = relAudioCtx.createOscillator();
    const gain = relAudioCtx.createGain();
    osc.connect(gain);
    gain.connect(relAudioCtx.destination);

    if (type === 'correct') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, relAudioCtx.currentTime); 
        gain.gain.setValueAtTime(0.1, relAudioCtx.currentTime);
        osc.start();
        setTimeout(() => { osc.frequency.setValueAtTime(659.25, relAudioCtx.currentTime); }, 100);
        gain.gain.setValueAtTime(0.1, relAudioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, relAudioCtx.currentTime + 0.3);
        osc.stop(relAudioCtx.currentTime + 0.3);
    } else if (type === 'wrong') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, relAudioCtx.currentTime); 
        osc.frequency.exponentialRampToValueAtTime(110, relAudioCtx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.08, relAudioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, relAudioCtx.currentTime + 0.45);
        osc.start();
        osc.stop(relAudioCtx.currentTime + 0.45);
    } else if (type === 'victory') {
        const notes = [261.63, 329.63, 392.00, 523.25]; 
        notes.forEach((freq, index) => {
            const singleOsc = relAudioCtx.createOscillator();
            const singleGain = relAudioCtx.createGain();
            singleOsc.connect(singleGain);
            singleGain.connect(relAudioCtx.destination);
            singleOsc.type = 'triangle';
            singleOsc.frequency.setValueAtTime(freq, relAudioCtx.currentTime + index * 0.1);
            singleGain.gain.setValueAtTime(0.1, relAudioCtx.currentTime + index * 0.1);
            singleGain.gain.exponentialRampToValueAtTime(0.01, relAudioCtx.currentTime + index * 0.1 + 0.35);
            singleOsc.start(relAudioCtx.currentTime + index * 0.1);
            singleOsc.stop(relAudioCtx.currentTime + index * 0.1 + 0.35);
        });
    } else if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, relAudioCtx.currentTime);
        gain.gain.setValueAtTime(0.05, relAudioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, relAudioCtx.currentTime + 0.08);
        osc.start();
        osc.stop(relAudioCtx.currentTime + 0.08);
    }
}

function toggleRelMute() {
    relIsMuted = !relIsMuted;
    const icon = document.getElementById('relSoundIcon');
    if (relIsMuted) {
        icon.className = 'w-6 h-6 text-red-500';
        icon.setAttribute('data-lucide', 'volume-x');
    } else {
        icon.className = 'w-6 h-6 text-purple-600';
        icon.setAttribute('data-lucide', 'volume-2');
        playRelSound('click');
    }
    lucide.createIcons();
}

// --- DATABASES ---
const triviaQuestions = [
    { q: "พระพุทธศาสนามีกำเนิดในประเทศใดมาแล้วประมาณ 2,500 ปี?", icon: "🌏", choices: ["ประเทศไทย", "ประเทศอินเดีย", "ประเทศศรีลังกา", "ประเทศจีน"], correct: 1, desc: "ศาสนาพุทธกำเนิดที่ประเทศอินเดียมาแล้วประมาณ 2,500 ปีจ้า" },
    { q: "เจ้าชายสิทธัตถะ มีพระนามเดิมว่าอะไร?", icon: "👑", choices: ["สิทธัตถะ", "อัญญาโกณฑัญญะ", "ราหุล", "สุทโธทนะ"], correct: 0, desc: "เจ้าชายมีนามเดิมว่า 'สิทธัตถะ' แปลว่าผู้สำเร็จความมุ่งหมายจ้า" },
    { q: "เจ้าชายสิทธัตถะ อภิเษกสมรส (แต่งงาน) กับพระนางพิมพา เมื่อพระชนมายุเท่าไหร่?", icon: "💍", choices: ["15 พรรษา", "16 พรรษา", "20 พรรษา", "29 พรรษา"], correct: 1, desc: "เจ้าชายอภิเษกสมรสเมื่อมีพระชนมายุได้ 16 พรรษาจ้า" },
    { q: "เจ้าชายสิทธัตถะทรงตัดสินพระทัยออกผนวช (บวช) เมื่อพระชนมายุกี่พรรษา?", icon: "🐎", choices: ["29 พรรษา", "35 พรรษา", "16 พรรษา", "80 พรรษา"], correct: 0, desc: "ทรงออกผนวช ณ ริมฝั่งแม่น้ำอโนมา เมื่ออายุได้ 29 พรรษา เพื่อหาทางพ้นทุกข์" },
    { q: "พระพุทธเจ้าตรัสรู้หลักธรรมสำคัญ 'อริยสัจ 4' ด้วยวิธีใดและเมื่อพระชนมายุเท่าไหร่?", icon: "🧘‍♂️", choices: ["การทรมานร่างกาย - 29 พรรษา", "การนั่งสมาธิ - 35 พรรษา", "การเดินธุดงค์ - 40 พรรษา", "การสวดมนต์ - 35 พรรษา"], correct: 1, desc: "พระพุทธเจ้าตรัสรู้ด้วยวิธี 'นั่งสมาธิ' ใต้ต้นพระศรีมหาโพธิ์ เมื่อพระชนมายุได้ 35 พรรษา" },
    { q: "พระพุทธเจ้าทรงแสดงปฐมเทศนาโปรดบุคคลกลุ่มแรกกลุ่มใด?", icon: "🗣️", choices: ["พระประยูรญาติ", "กลุ่มพราหมณ์ทั้งหลาย", "ปัญจวัคคีย์ ทั้ง 5", "สามเณรราหุล"], correct: 2, desc: "ทรงโปรด 'ปัญจวัคคีย์ ทั้ง 5' (โกณฑัญญะ วัปปะ ภัททิยะ มหานามะ อัสสชิ)" },
    { q: "พระภิกษุรูปแรกในพระพุทธศาสนามีชื่อว่าอะไร?", icon: "🙏", choices: ["พระราหุล", "พระอัญญาโกณฑัญญะ", "พระสารีบุตร", "พระอานนท์"], correct: 1, desc: "ท่านโกณฑัญญะฟังธรรมแล้วดวงตาเห็นธรรม จึงขออุปสมบทเป็นพระภิกษุรูปแรก" },
    { q: "สามเณรรูปแรกในพระพุทธศาสนามีชื่อว่าอะไร?", icon: "🧒", choices: ["สามเณรราหุล", "สามเณรปิณฑิพัทธ์", "สามเณรโกณฑัญญะ", "สามเณรสุมนะ"], correct: 0, desc: "ราหุล (พระราชโอรส) ได้รับการบรรพชาเป็นสามเณรรูปแรกขณะมีอายุเพียง 7 ปี" },
    { q: "พระพุทธเจ้าเสด็จดับขันธปรินิพพานเมื่อพระชนมายุกี่พรรษา?", icon: "🛏️", choices: ["70 พรรษา", "75 พรรษา", "80 พรรษา", "90 พรรษา"], correct: 2, desc: "พระองค์เสด็จดับขันธปรินิพพาน ณ เมืองกุสินารา เมื่อพระชนมายุได้ 80 พรรษา" },
    { q: "คัมภีร์ที่รวบรวมหลักธรรมคำสอนของพระพุทธศาสนาเรียกว่าคัมภีร์อะไร?", icon: "📖", choices: ["พระไตรปิฎก", "คัมภีร์อัลกุรอาน", "คัมภีร์ไบเบิล", "พระเวท"], correct: 0, desc: "เรียกว่า 'พระไตรปิฎก' ซึ่งรวบรวมหลักคำสอนแบ่งออกเป็น 3 หมวดหมู่" },
    { q: "ข้อบังคับ ศีล และกฎระเบียบที่เกี่ยวกับภิกษุและภิกษุณี จัดอยู่ในหมวดใดของพระไตรปิฎก?", icon: "📜", choices: ["พระสุตตันตปิฎก", "พระวินัยปิฎก", "พระอภิธรรมปิฎก", "พระสูตร"], correct: 1, desc: "อยู่ใน 'พระวินัยปิฎก' ซึ่งเป็นเรื่องของศีลและระเบียบวินัยล้วนๆ เลยจ้า" },
    { q: "คำสอนที่เป็นข้อธรรมวิชาการล้วนๆ ไม่มีเรื่องราวหรือนิทานประกอบ เรียกว่าอะไร?", icon: "🧠", choices: ["พระวินัยปิฎก", "พระสุตตันตปิฎก", "พระอภิธรรมปิฎก", "ชาดก"], correct: 2, desc: "อยู่ใน 'พระอภิธรรมปิฎก' เป็นหลักวิชาการธรรมะเชิงลึก เช่น เบญจศีล เบญจธรรม" }
];

const sortingItems = [
    { name: "พระสงฆ์", type: "ศาสนบุคคล", religion: "พุทธ", icon: "🧘‍♂️" },
    { name: "พระพุทธรูป", type: "ศาสนวัตถุ", religion: "พุทธ", icon: "🙏" },
    { name: "วัด", type: "ศาสนสถาน", religion: "พุทธ", icon: "🕌" },
    { name: "บาทหลวง", type: "ศาสนบุคคล", religion: "คริสต์", icon: "⛪" },
    { name: "ไม้กางเขน", type: "ศาสนวัตถุ", religion: "คริสต์", icon: "✝️" },
    { name: "โบสถ์คริสต์", type: "ศาสนสถาน", religion: "คริสต์", icon: "⛪" },
    { name: "โต๊ะอิหม่าม", type: "ศาสนบุคคล", religion: "อิสลาม", icon: "👳" },
    { name: "มัสยิด", type: "ศาสนสถาน", religion: "อิสลาม", icon: "🕋" },
    { name: "พราหมณ์ / พราหมณี", type: "ศาสนบุคคล", religion: "พราหมณ์-ฮินดู", icon: "🕉️" },
    { name: "เทวรูป (พระศิวะ, พระพิฆเนศ)", type: "ศาสนวัตถุ", religion: "พราหมณ์-ฮินดู", icon: "🔱" },
    { name: "เทวสถานโบสถ์พราหมณ์", type: "ศาสนสถาน", religion: "พราหมณ์-ฮินดู", icon: "🏛️" }
];

let sortingQueue = [];
let relPlayerName = '';

// --- SELECTION ---
function selectRelMascot(name, id) {
    religionMascot = name;
    playRelSound('click');
    document.querySelectorAll('.rel-mascot-btn').forEach(btn => {
        btn.classList.remove('bg-purple-100', 'border-purple-600', 'scale-105');
    });
    document.getElementById(id).classList.add('bg-purple-100', 'border-purple-600', 'scale-105');
}

// --- TRIVIA MODE ---
function startRelTrivia() {
    relPlayerName = document.getElementById('rel-player-name').value.trim();
    if (!relPlayerName) {
        alert("กรุณาพิมพ์ชื่อผู้เล่นก่อนนะจ๊ะ!");
        return;
    }
    playRelSound('click');
    religionMode = 'trivia';
    relQuestionIndex = 0;
    relScore = 0;
    relWrongHistory = [];
    
    document.getElementById('rel-menu').classList.add('hidden');
    document.getElementById('rel-trivia').classList.remove('hidden');
    document.getElementById('trivia-mascot-label').innerText = religionMascot;
    
    loadTriviaQuestion();
}

function loadTriviaQuestion() {
    relCanAnswer = true;
    document.getElementById('trivia-feedback').classList.add('hidden');
    document.getElementById('trivia-choices-container').classList.remove('hidden');

    const currentQ = triviaQuestions[relQuestionIndex];
    document.getElementById('trivia-progress-text').innerText = `ข้อที่ ${relQuestionIndex + 1}/${triviaQuestions.length}`;
    document.getElementById('trivia-score-text').innerText = `คะแนน: ${relScore}`;
    document.getElementById('trivia-progress-bar').style.width = `${((relQuestionIndex) / triviaQuestions.length) * 100}%`;

    document.getElementById('trivia-q-icon').innerText = currentQ.icon;
    document.getElementById('trivia-question-text').innerText = currentQ.q;

    const container = document.getElementById('trivia-choices-container');
    container.innerHTML = '';
    
    currentQ.choices.forEach((choice, index) => {
        const btn = document.createElement('button');
        btn.className = "p-4 rounded-2xl bg-white border-2 border-purple-200 text-left hover:border-purple-500 hover:bg-purple-50 text-gray-800 font-bold transition-all bubbly-button shadow-sm flex items-center gap-3";
        btn.innerHTML = `
            <span class="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-sm font-black">${index+1}</span>
            <span class="text-sm md:text-base">${choice}</span>
        `;
        btn.onclick = () => selectTriviaAnswer(index);
        container.appendChild(btn);
    });
}

function selectTriviaAnswer(index) {
    if (!relCanAnswer) return;
    relCanAnswer = false;

    const currentQ = triviaQuestions[relQuestionIndex];
    const choicesContainer = document.getElementById('trivia-choices-container');
    const feedbackBox = document.getElementById('trivia-feedback');

    choicesContainer.classList.add('hidden');
    feedbackBox.classList.remove('hidden');

    const isCorrect = (index === currentQ.correct);
    if (isCorrect) {
        playRelSound('correct');
        relScore++;
        feedbackBox.className = "p-5 rounded-2xl border-2 text-center space-y-3 bg-emerald-50 border-emerald-300 text-emerald-950 bounce-animation";
        document.getElementById('trivia-feedback-emoji').innerText = "🎉 เก่งมากจ้า!";
        document.getElementById('trivia-feedback-title').innerText = "คำตอบถูกต้องที่สุด!";
        relWrongHistory.push({ item_name: currentQ.q, isCorrect: true });
    } else {
        playRelSound('wrong');
        relWrongHistory.push({ item_name: currentQ.q, isCorrect: false, q: currentQ.q, correctAnswer: currentQ.choices[currentQ.correct] });
        feedbackBox.className = "p-5 rounded-2xl border-2 text-center space-y-3 bg-rose-50 border-rose-300 text-rose-950 shake-animation";
        document.getElementById('trivia-feedback-emoji').innerText = "😢 อ๊ะ..ผิดนิดเดียว!";
        document.getElementById('trivia-feedback-title').innerText = `ข้อนี้ตอบข้อ ${currentQ.correct + 1}: ${currentQ.choices[currentQ.correct]}`;
    }

    document.getElementById('trivia-feedback-desc').innerText = currentQ.desc;
}

function nextTriviaQuestion() {
    playRelSound('click');
    relQuestionIndex++;
    if (relQuestionIndex < triviaQuestions.length) {
        loadTriviaQuestion();
    } else {
        endRelGame(triviaQuestions.length);
    }
}

// --- SORTING MODE ---
function startRelSorting() {
    relPlayerName = document.getElementById('rel-player-name').value.trim();
    if (!relPlayerName) {
        alert("กรุณาพิมพ์ชื่อผู้เล่นก่อนนะจ๊ะ!");
        return;
    }
    playRelSound('click');
    religionMode = 'sorting';
    relScore = 0;
    relQuestionIndex = 0;
    relWrongHistory = [];
    sortingQueue = [...sortingItems].sort(() => Math.random() - 0.5);
    
    document.getElementById('rel-menu').classList.add('hidden');
    document.getElementById('rel-sorting').classList.remove('hidden');
    loadSortingItem();
}

function loadSortingItem() {
    relCanAnswer = true;
    document.getElementById('sorting-feedback').className = "hidden";
    
    const currentItem = sortingQueue[relQuestionIndex];
    document.getElementById('sorting-progress-text').innerText = `ไอเทมชิ้นที่ ${relQuestionIndex + 1}/${sortingQueue.length}`;
    document.getElementById('sorting-score-text').innerText = `คะแนน: ${relScore}/${sortingQueue.length}`;

    document.getElementById('sorting-item-type').innerText = `หมวดหมู่: ${currentItem.type}`;
    document.getElementById('sorting-item-name').innerText = currentItem.name;
    document.getElementById('sorting-visual-box').innerText = currentItem.icon;
}

function submitSortingAnswer(religionName) {
    if (!relCanAnswer) return;
    relCanAnswer = false;

    const currentItem = sortingQueue[relQuestionIndex];
    const feedbackDiv = document.getElementById('sorting-feedback');
    feedbackDiv.classList.remove('hidden');

    const isCorrect = (religionName === currentItem.religion);
    if (isCorrect) {
        playRelSound('correct');
        relScore++;
        feedbackDiv.className = "p-4 rounded-xl text-center text-sm font-bold bg-emerald-100 border-2 border-emerald-300 text-emerald-800 bounce-animation";
        feedbackDiv.innerHTML = `<span class="text-xl">✅</span> ถูกต้องเลยจ้า! <strong>"${currentItem.name}"</strong> เป็นของ <strong>ศาสนา${currentItem.religion}</strong>`;
        relWrongHistory.push({ item_name: currentItem.name, isCorrect: true });
    } else {
        playRelSound('wrong');
        relWrongHistory.push({ item_name: currentItem.name, isCorrect: false, q: `ไอเทม "${currentItem.name}" (${currentItem.type})`, correctAnswer: `ศาสนา${currentItem.religion}` });
        feedbackDiv.className = "p-4 rounded-xl text-center text-sm font-bold bg-rose-100 border-2 border-rose-300 text-rose-800 shake-animation";
        feedbackDiv.innerHTML = `<span class="text-xl">❌</span> อ๊ะ..ไม่ถูกต้อง! เฉลย: <strong>"${currentItem.name}"</strong> คือของ <strong>ศาสนา${currentItem.religion}</strong>`;
    }

    setTimeout(() => {
        relQuestionIndex++;
        if (relQuestionIndex < sortingQueue.length) {
            loadSortingItem();
        } else {
            endRelGame(sortingQueue.length);
        }
    }, 1800);
}

// --- END GAME & RESULTS ---
function endRelGame(totalQuestions) {
    playRelSound('victory');
    document.getElementById('rel-trivia').classList.add('hidden');
    document.getElementById('rel-sorting').classList.add('hidden');
    document.getElementById('rel-end').classList.remove('hidden');

    // Confetti from app.js can be triggered if available, or we implement locally
    if (typeof spawnConfetti === 'function') {
        spawnConfetti();
    }

    document.getElementById('end-mascot-congrats').innerText = `${religionMascot} ดีใจกับความเก่งของหนูด้วยน้า!`;
    document.getElementById('end-score-val').innerText = `${relScore} / ${totalQuestions}`;

    const comment = document.getElementById('end-comment');
    if (relScore === totalQuestions) {
        comment.innerText = "ยอดเยี่ยมมหัศจรรย์ไปเลยจ้า! น้องตอบถูกครบถ้วนทุกข้อเลย คะแนนเต็มสมบูรณ์แบบที่สุด! 🏆🌟✨";
    } else if (relScore >= totalQuestions * 0.75) {
        comment.innerText = "เก่งสุดยอดเลยจ้า! หนูมีความเข้าใจเนื้อหาในชั้นเรียนดีมากๆ อีกนิดเดียวก็จะเต็มแล้ว สู้ๆ นะคะคนเก่ง! 💕🎈";
    } else if (relScore >= totalQuestions * 0.5) {
        comment.innerText = "ดีเลยจ้า! เกินครึ่งแล้วนะ ทบทวนอีกนิด หนูจะทำคะแนนได้ดีขึ้นเยอะแน่นอนจ้า ✌️🥳";
    } else {
        comment.innerText = "หนูพยายามได้ดีมากจ้า! ลองกลับไปอ่านทบทวน แล้วกลับมาท้าทายใหม่อีกครั้งน้า คุณครูและเหล่าตัวการ์ตูนเอาใจช่วยเสมอจ้า! 🐯🌻";
    }

    const reviewSection = document.getElementById('review-section');
    const reviewList = document.getElementById('review-list');
    const mistakes = relWrongHistory.filter(h => !h.isCorrect);
    
    if (mistakes.length > 0) {
        reviewSection.classList.remove('hidden');
        reviewList.innerHTML = '';
        mistakes.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${item.q}</strong> ➜ คำตอบที่ถูกต้องคือ: <span class="text-emerald-700 font-bold">${item.correctAnswer}</span>`;
            reviewList.appendChild(li);
        });
    } else {
        reviewSection.classList.add('hidden');
    }

    submitReligionScore(relPlayerName, religionMode, relScore, relWrongHistory);
}

async function submitReligionScore(playerName, mode, score, history) {
    const statusLabel = document.getElementById('rel-save-status');
    statusLabel.classList.remove('hidden');
    statusLabel.className = "text-xs text-indigo-600 font-semibold mb-2 animate-pulse";
    statusLabel.innerText = 'กำลังบันทึกคะแนน...';
    try {
        const response = await fetch(`${API_URL}/api/religion-scores`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ player_name: playerName, mode: mode, score: score, history: history })
        });
        const data = await response.json();
        if (data.success) {
            statusLabel.className = "text-xs text-emerald-600 font-semibold mb-2";
            statusLabel.innerText = '✅ บันทึกคะแนนบนฐานข้อมูลคลาวด์สำเร็จแล้ว!';
        } else {
            statusLabel.className = "text-xs text-rose-600 font-semibold mb-2";
            statusLabel.innerText = '❌ เกิดข้อผิดพลาด: ' + data.error;
        }
    } catch (err) {
        statusLabel.className = "text-xs text-rose-600 font-semibold mb-2";
        statusLabel.innerText = '❌ ไม่สามารถเชื่อมต่อฐานข้อมูลได้ (เล่นแบบออฟไลน์)';
        console.error(err);
    }
}

// Show Religion Leaderboard
async function showReligionLeaderboard() {
    playRelSound('click');
    document.getElementById('rel-menu').classList.add('hidden');
    document.getElementById('rel-end').classList.add('hidden');
    document.getElementById('rel-leaderboard').classList.remove('hidden');
    
    // Default load trivia leaderboard
    loadReligionLeaderboardData('trivia');
}

async function loadReligionLeaderboardData(mode) {
    const listContainer = document.getElementById('rel-leaderboard-list');
    listContainer.innerHTML = `<div class="text-center py-10 text-purple-600">กำลังโหลด...</div>`;
    
    // Update tabs
    document.getElementById('tab-lead-trivia').classList.toggle('border-purple-600', mode === 'trivia');
    document.getElementById('tab-lead-trivia').classList.toggle('text-purple-600', mode === 'trivia');
    document.getElementById('tab-lead-trivia').classList.toggle('border-transparent', mode !== 'trivia');
    document.getElementById('tab-lead-trivia').classList.toggle('text-gray-500', mode !== 'trivia');

    document.getElementById('tab-lead-sorting').classList.toggle('border-purple-600', mode === 'sorting');
    document.getElementById('tab-lead-sorting').classList.toggle('text-purple-600', mode === 'sorting');
    document.getElementById('tab-lead-sorting').classList.toggle('border-transparent', mode !== 'sorting');
    document.getElementById('tab-lead-sorting').classList.toggle('text-gray-500', mode !== 'sorting');

    try {
        const response = await fetch(`${API_URL}/api/religion-leaderboard?mode=${mode}`);
        const data = await response.json();
        
        if (data.error) throw new Error(data.error);

        if (data.length === 0) {
            listContainer.innerHTML = `
                <div class="text-center py-12 text-gray-400">
                    <span class="text-4xl block mb-2">🏆</span>
                    <p>ยังไม่มีผู้เล่นในโหมดนี้<br>มาเป็นที่ 1 คนแรกกันเถอะ!</p>
                </div>`;
            return;
        }

        listContainer.innerHTML = data.map((entry, idx) => `
            <div class="flex items-center justify-between p-3 rounded-xl ${idx < 3 ? 'bg-purple-50 border border-purple-100' : 'bg-gray-50 border border-gray-100'} hover:bg-white hover:shadow-md transition-all mb-2">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        idx === 0 ? 'bg-amber-400 text-white shadow-md' : 
                        idx === 1 ? 'bg-gray-300 text-gray-700' : 
                        idx === 2 ? 'bg-amber-700 text-white' : 
                        'bg-gray-200 text-gray-500'
                    }">
                        ${idx === 0 ? '👑' : idx + 1}
                    </div>
                    <div>
                        <div class="font-bold text-gray-800 text-sm">${entry.player_name}</div>
                        <div class="text-xs text-gray-500">${entry.date}</div>
                    </div>
                </div>
                <div class="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 text-xl">
                    ${entry.score}
                </div>
            </div>
        `).join('');

    } catch (err) {
        listContainer.innerHTML = `
            <div class="text-center py-10">
                <div class="text-rose-500 text-4xl mb-2">⚠️</div>
                <p class="text-sm text-gray-500">ไม่สามารถโหลดข้อมูลอันดับคะแนนได้</p>
                <p class="text-xs text-gray-400 mt-1">${err.message}</p>
            </div>
        `;
    }
}

function returnToRelMenu() {
    playRelSound('click');
    document.getElementById('rel-trivia').classList.add('hidden');
    document.getElementById('rel-sorting').classList.add('hidden');
    document.getElementById('rel-end').classList.add('hidden');
    document.getElementById('rel-leaderboard').classList.add('hidden');
    document.getElementById('rel-menu').classList.remove('hidden');
}

function restartRelMode() {
    playRelSound('click');
    if (religionMode === 'trivia') {
        startRelTrivia();
    } else {
        startRelSorting();
    }
}
