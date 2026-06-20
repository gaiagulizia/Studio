const chocolates = [
    { src: 'https://static.vecteezy.com/system/resources/previews/058/270/700/non_2x/glossy-chocolate-truffles-with-textured-striped-pattern-on-white-background-free-png.png', class: '' },
    { src: 'https://img.pikbest.com/png-images/20250203/round-chocolate-striped-sweets-_11491122.png!sw800', class: '' },
    { src: 'https://static.vecteezy.com/system/resources/previews/041/289/521/non_2x/ai-generated-round-chocolate-candy-isolated-on-transparent-background-png.png', class: 'white-choco' },
    { src: 'https://png.pngtree.com/png-vector/20230413/ourmid/pngtree-chocolate-round-illustration-png-image_6703935.png', class: '' },
    { src: 'https://static.vecteezy.com/system/resources/previews/034/763/953/non_2x/ai-generated-chocolate-ball-free-png.png', class: 'fifth-choco' }
];

const lidImage = 'https://i.ibb.co/PGZv7Nnw/IMG-3743.png';
const MAX = 10;

let total = Number(localStorage.getItem("total")) || 0;
let boxes = [];
let manualInput = "";
let lastAddedIndex = -1;
let animateNewCompleted = false;
let animateNewEmpty = false;

const counter = document.getElementById("counter");
const mainBox = document.getElementById("mainBox");
const completedBoxes = document.getElementById("completedBoxes");

function rebuildBoxes() {
    boxes = [[]];
    for (let i = 0; i < total; i++) {
        let current = boxes[boxes.length - 1];
        if (current.length >= MAX) {
            boxes.push([]);
            current = boxes[boxes.length - 1];
        }
        current.push(chocolates[i % chocolates.length]);
    }
}

function save() {
    localStorage.setItem("total", total);
}

function createSlot(data, index, isNew = false) {
    const slot = document.createElement("div");
    slot.className = `slot slot-${index}`;

    if (data) {
        const wrap = document.createElement("div");
        wrap.className = "choco-wrap";

        const img = document.createElement("img");
        img.src = data.src;
        img.classList.add("choco-img");

        if (data.class) {
            img.classList.add(data.class);
        }

        if (isNew) {
            img.classList.add("new-choco");
        }

        wrap.appendChild(img);
        slot.appendChild(wrap);
    }

    return slot;
}

function buildMain() {
    const current = boxes[boxes.length - 1];
    mainBox.innerHTML = "";

    if (animateNewEmpty) {
        mainBox.classList.add("new-empty-box");
    } else {
        mainBox.classList.remove("new-empty-box");
    }

    if (current.length >= MAX) {
        mainBox.classList.add("full");
    } else {
        mainBox.classList.remove("full");
    }

    for (let i = 0; i < MAX; i++) {
        const isNew = i === lastAddedIndex;
        mainBox.appendChild(createSlot(current[i], i, isNew));
    }

    const overlay = document.createElement("div");
    overlay.className = "closed-overlay";
    overlay.innerHTML = `<img src="${lidImage}" class="lid">`;
    mainBox.appendChild(overlay);

    if (animateNewEmpty) {
        const opening = document.createElement("div");
        opening.className = "opening-lid";
        opening.innerHTML = `<img src="${lidImage}">`;
        mainBox.appendChild(opening);

        setTimeout(() => {
            animateNewEmpty = false;
        }, 1450);
    }
}

function buildArchive() {
    completedBoxes.innerHTML = "";

    for (let i = 0; i < boxes.length - 1; i++) {
        const box = document.createElement("div");
        box.className = "box completed full";

        if (animateNewCompleted && i === boxes.length - 2) {
            box.classList.add("new-completed-box");
        }

        for (let j = 0; j < MAX; j++) {
            box.appendChild(createSlot(boxes[i][j], j, false));
        }

        const overlay = document.createElement("div");
        overlay.className = "closed-overlay";
        overlay.style.display = "flex";
        overlay.innerHTML = `<img src="${lidImage}" class="lid">`;
        box.appendChild(overlay);

        completedBoxes.appendChild(box);
    }

    animateNewCompleted = false;
}

function updateSpeed() {
    const speed = document.getElementById("speedValue");

    if (totalStudySeconds <= 0 || total <= 0) {
        speed.innerText = "0 pag/h";
        return;
    }

    const hours = totalStudySeconds / 3600;
    const avg = (total / hours).toFixed(1);
    speed.innerText = `${avg} pag/h`;
}

function render() {
    counter.innerText = manualInput || total;
    buildMain();
    buildArchive();
    updateSpeed();
    save();
}

function confettiBurst() {
    const duration = 1500;
    const end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 3,
            angle: 60,
            spread: 65,
            origin: { x: 0 },
            startVelocity: 18,
            gravity: 0.75,
            scalar: 1
        });

        confetti({
            particleCount: 3,
            angle: 120,
            spread: 65,
            origin: { x: 1 },
            startVelocity: 18,
            gravity: 0.75,
            scalar: 1
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    })();
}

function addChocolate() {
    total++;
    rebuildBoxes();

    const current = boxes[boxes.length - 1];
    lastAddedIndex = current.length - 1;

    if (total > 10 && total % 10 === 1) {
        animateNewCompleted = true;
    }

    if (total % 10 === 1 && total > 1) {
        animateNewEmpty = true;
    }

    render();

    if (total % MAX === 0) {
        confettiBurst();
    }

    setTimeout(() => {
        lastAddedIndex = -1;
    }, 350);
}

function removeChocolate() {
    if (total <= 0) return;
    total--;
    rebuildBoxes();
    render();
}

function pressNumber(n) {
    if (manualInput.length >= 5) return;
    manualInput += n;
    counter.innerText = manualInput;
}

function clearInput() {
    manualInput = "";
    render();
}

function applyManualTotal() {
    total = Number(manualInput) || 0;
    manualInput = "";
    rebuildBoxes();
    render();
}

function changeStudy(amount) {
    const input = document.getElementById("studyMinutes");
    let value = Number(input.value) || 1;
    value += amount;

    if (value < 1) {
        value = 1;
    }

    input.value = value;

    if (!timerRunning) {
        timerSeconds = value * 60;
        updateTimer();
    }
}

function changeTotalTime(amount) {
    totalStudySeconds += amount;

    if (totalStudySeconds < 0) {
        totalStudySeconds = 0;
    }

    updateTotalTime();
    updateSpeed();
}

let stopwatchSeconds = 0;
let stopwatchInterval = null;
let stopwatchRunning = false;
let totalStudySeconds = Number(localStorage.getItem("totalStudySeconds")) || 0;
let timerSeconds = 1500;
let timerInterval = null;
let timerRunning = false;

function formatTime(sec) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;

    if (h > 0) {
        return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
    }

    return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
}

function updateStopwatch() {
    document.getElementById("stopwatch").innerText = formatTime(stopwatchSeconds);
}

function toggleStopwatch() {
    if (stopwatchRunning) {
        clearInterval(stopwatchInterval);
        stopwatchRunning = false;
    } else {
        stopwatchRunning = true;
        stopwatchInterval = setInterval(() => {
            stopwatchSeconds++;
            totalStudySeconds++;
            updateStopwatch();
            updateTotalTime();
            updateSpeed();
        }, 1000);
    }
}

function resetStopwatch() {
    clearInterval(stopwatchInterval);
    stopwatchRunning = false;
    stopwatchSeconds = 0;
    updateStopwatch();
}

function updateTotalTime() {
    document.getElementById("totalTime").innerText = formatTime(totalStudySeconds);
    localStorage.setItem("totalStudySeconds", totalStudySeconds);
}

function resetTotalTime() {
    totalStudySeconds = 0;
    updateTotalTime();
    updateSpeed();
}

function updateTimer() {
    document.getElementById("timerDisplay").innerText = formatTime(timerSeconds);
}

function startTimer() {
    if (timerRunning) return;

    timerRunning = true;

    timerInterval = setInterval(() => {
        timerSeconds--;
        totalStudySeconds++;
        updateTimer();
        updateTotalTime();
        updateSpeed();

        if (timerSeconds <= 0) {
            clearInterval(timerInterval);
            timerRunning = false;
            alert("Tempo finito!");
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timerInterval);
    timerRunning = false;
}

function resetTimer() {
    clearInterval(timerInterval);
    timerRunning = false;
    timerSeconds = (Number(document.getElementById("studyMinutes").value) || 25) * 60;
    updateTimer();
}

rebuildBoxes();
render();
updateStopwatch();
updateTimer();
updateTotalTime();
updateSpeed();
