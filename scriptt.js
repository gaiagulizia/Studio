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

/* =============================================
   TRACCIAMENTO DATI GIORNALIERI
   ============================================= */

function getTodayKey() {
    return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function getAllDailyData() {
    try { return JSON.parse(localStorage.getItem("dailyData") || "{}"); }
    catch { return {}; }
}

function saveDailyData(data) {
    localStorage.setItem("dailyData", JSON.stringify(data));
}

function recordTodayPages(delta) {
    const data = getAllDailyData();
    const key = getTodayKey();
    if (!data[key]) data[key] = { pages: 0, seconds: 0 };
    data[key].pages = Math.max(0, (data[key].pages || 0) + delta);
    saveDailyData(data);
}

function recordTodaySeconds(delta) {
    const data = getAllDailyData();
    const key = getTodayKey();
    if (!data[key]) data[key] = { pages: 0, seconds: 0 };
    data[key].seconds = (data[key].seconds || 0) + delta;
    saveDailyData(data);
}

/* =============================================
   LOGICA SCATOLA
   ============================================= */

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
        if (data.class) img.classList.add(data.class);
        if (isNew) img.classList.add("new-choco");
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
        setTimeout(() => { animateNewEmpty = false; }, 1450);
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
    if (totalStudySeconds <= 0 || total <= 0) { speed.innerText = "0 pag/h"; return; }
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
    fitMainBox();
}

function fitMainBox() {
    const area = document.querySelector(".current-box-area");
    const box = document.getElementById("mainBox");
    if (!area || !box) return;
    const ratio = 2.11;
    const availW = area.clientWidth;
    const availH = area.clientHeight;
    if (availW <= 0 || availH <= 0) return;
    let w, h;
    if (availW / availH > ratio) {
        h = availH;
        w = h * ratio;
    } else {
        w = availW;
        h = w / ratio;
    }
    box.style.width = w + "px";
    box.style.height = h + "px";
}

window.addEventListener("resize", fitMainBox);

function confettiBurst() {
    const duration = 1500;
    const end = Date.now() + duration;
    (function frame() {
        confetti({ particleCount: 3, angle: 60, spread: 65, origin: { x: 0 }, startVelocity: 18, gravity: 0.75, scalar: 1 });
        confetti({ particleCount: 3, angle: 120, spread: 65, origin: { x: 1 }, startVelocity: 18, gravity: 0.75, scalar: 1 });
        if (Date.now() < end) requestAnimationFrame(frame);
    })();
}

function addChocolate() {
    total++;
    rebuildBoxes();
    const current = boxes[boxes.length - 1];
    lastAddedIndex = current.length - 1;
    if (total > 10 && total % 10 === 1) animateNewCompleted = true;
    if (total % 10 === 1 && total > 1) animateNewEmpty = true;
    recordTodayPages(1);
    render();
    if (total % MAX === 0) confettiBurst();
    setTimeout(() => { lastAddedIndex = -1; }, 350);
}

function removeChocolate() {
    if (total <= 0) return;
    total--;
    rebuildBoxes();
    recordTodayPages(-1);
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
    const newTotal = Number(manualInput) || 0;
    const delta = newTotal - total;
    total = newTotal;
    manualInput = "";
    rebuildBoxes();
    if (delta !== 0) recordTodayPages(delta);
    render();
}

function changeStudy(amount) {
    const input = document.getElementById("studyMinutes");
    let value = Number(input.value) || 1;
    value = Math.max(1, value + amount);
    input.value = value;
    if (!timerRunning) { timerSeconds = value * 60; updateTimer(); }
}

function changeTotalTime(amount) {
    totalStudySeconds = Math.max(0, totalStudySeconds + amount);
    updateTotalTime();
    updateSpeed();
}

/* =============================================
   CRONOMETRO / TIMER
   ============================================= */

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
    if (h > 0) return String(h).padStart(2,"0") + ":" + String(m).padStart(2,"0") + ":" + String(s).padStart(2,"0");
    return String(m).padStart(2,"0") + ":" + String(s).padStart(2,"0");
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
            recordTodaySeconds(1);
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
        recordTodaySeconds(1);
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

/* =============================================
   SEZIONE STATISTICHE
   ============================================= */

const IT_DAYS_SHORT   = ['Dom','Lun','Mar','Mer','Gio','Ven','Sab'];
const IT_MONTHS_SHORT = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'];
const IT_MONTHS_FULL  = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];

let statsMode    = "week";
let statsOffset  = 0;
let editOpen     = false;
let pagesChartInst = null;
let timeChartInst  = null;

function openStats() {
    document.getElementById("statsOverlay").classList.remove("stat-overlay--hidden");
    statsOffset = 0;
    refreshStats();
}

function closeStats() {
    document.getElementById("statsOverlay").classList.add("stat-overlay--hidden");
}

function setStatsMode(mode) {
    statsMode = mode;
    statsOffset = 0;
    document.querySelectorAll(".period-tab").forEach(btn => {
        btn.classList.toggle("period-tab--active", btn.dataset.mode === mode);
    });
    refreshStats();
}

function changeStatsPeriod(dir) {
    // Non si può andare nel futuro
    if (dir > 0 && statsOffset >= 0) return;
    statsOffset += dir;
    refreshStats();
}

/* Restituisce { labels, pages, timeHours, days, label, totalPages, totalSeconds } */
function getPeriodInfo() {
    const allData = getAllDailyData();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let labels = [], pages = [], timeHours = [], days = [], label = "";

    if (statsMode === "week") {
        // Lunedì della settimana corrente + offset
        const dow = today.getDay(); // 0=Dom
        const monday = new Date(today);
        monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1) + statsOffset * 7);

        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            const key = d.toISOString().slice(0, 10);
            const entry = allData[key] || { pages: 0, seconds: 0 };
            days.push(key);
            labels.push(IT_DAYS_SHORT[d.getDay()] + ' ' + d.getDate());
            pages.push(entry.pages || 0);
            timeHours.push(+(((entry.seconds || 0) / 3600).toFixed(2)));
        }

        const endDate = new Date(monday);        endDate.setDate(monday.getDate() + 6);
        label = `${monday.getDate()} ${IT_MONTHS_SHORT[monday.getMonth()]} – ${endDate.getDate()} ${IT_MONTHS_SHORT[endDate.getMonth()]} ${endDate.getFullYear()}`;

    } else if (statsMode === "month") {
        const refDate = new Date(today.getFullYear(), today.getMonth() + statsOffset, 1);
        const daysInMonth = new Date(refDate.getFullYear(), refDate.getMonth() + 1, 0).getDate();

        for (let i = 1; i <= daysInMonth; i++) {
            const d = new Date(refDate.getFullYear(), refDate.getMonth(), i);
            const key = d.toISOString().slice(0, 10);
            const entry = allData[key] || { pages: 0, seconds: 0 };
            days.push(key);
            labels.push(String(i));
            pages.push(entry.pages || 0);
            timeHours.push(+(((entry.seconds || 0) / 3600).toFixed(2)));
        }

        label = `${IT_MONTHS_FULL[refDate.getMonth()]} ${refDate.getFullYear()}`;

    } else { // year
        const year = today.getFullYear() + statsOffset;
        // days sarà array di array (un array per mese, utile per edit e totali)
        for (let m = 0; m < 12; m++) {
            const daysInMonth = new Date(year, m + 1, 0).getDate();
            let mPages = 0, mSec = 0;
            const mDays = [];
            for (let i = 1; i <= daysInMonth; i++) {
                const d = new Date(year, m, i);
                const key = d.toISOString().slice(0, 10);
                mDays.push(key);
                const entry = allData[key] || { pages: 0, seconds: 0 };
                mPages += entry.pages || 0;
                mSec   += entry.seconds || 0;
            }
            days.push(mDays);
            labels.push(IT_MONTHS_SHORT[m]);
            pages.push(mPages);
            timeHours.push(+(mSec / 3600).toFixed(2));
        }
        label = String(year);
    }

    // Totali
    const totalPages = pages.reduce((a, b) => a + (b || 0), 0);
    let totalSeconds = 0;
    if (statsMode === "year") {
        totalSeconds = days.flat().reduce((s, k) => s + ((allData[k]?.seconds) || 0), 0);
    } else {
        totalSeconds = days.reduce((s, k) => s + ((allData[k]?.seconds) || 0), 0);
    }

    return { labels, pages, timeHours, days, label, totalPages, totalSeconds };
}

function formatHours(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${String(m).padStart(2,'0')}m`;
}

function refreshStats() {
    const info = getPeriodInfo();

    document.getElementById("periodLabel").textContent   = info.label;
    document.getElementById("statsTotalPages").textContent = info.totalPages;
    document.getElementById("statsTotalHours").textContent = formatHours(info.totalSeconds);

    renderCharts(info);
    if (editOpen) renderEditTable(info);
}

/* ---- Chart.js ---- */

const CHART_OPTS_BASE = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
        x: {
            ticks: { color: '#5c2c16', font: { family: 'DynaPuff', size: 10 }, maxRotation: 45 },
            grid:  { color: 'rgba(255,214,231,0.4)' }
        },
        y: {
            beginAtZero: true,
            ticks: { color: '#5c2c16', font: { family: 'DynaPuff', size: 10 } },
            grid:  { color: 'rgba(255,214,231,0.5)' }
        }
    }
};

function renderCharts(info) {
    if (pagesChartInst) { pagesChartInst.destroy(); pagesChartInst = null; }
    if (timeChartInst)  { timeChartInst.destroy();  timeChartInst  = null; }

    const PINK_BG     = 'rgba(255,182,212,0.78)';
    const PINK_BORDER = '#e8749b';

    pagesChartInst = new Chart(
        document.getElementById("pagesChart").getContext("2d"), {
        type: 'bar',
        data: {
            labels: info.labels,
            datasets: [{
                data: info.pages,
                backgroundColor: PINK_BG,
                borderColor:     PINK_BORDER,
                borderWidth: 1.5,
                borderRadius: 6,
                borderSkipped: false
            }]
        },
        options: { ...CHART_OPTS_BASE }
    });

    // Clone opzioni e aggiungi callback ore sull'asse Y
    const timeOpts = JSON.parse(JSON.stringify(CHART_OPTS_BASE));
    timeOpts.scales.y.ticks = {
        color: '#5c2c16',
        font: { family: 'DynaPuff', size: 10 },
        callback: v => v + 'h'
    };

    timeChartInst = new Chart(
        document.getElementById("timeChart").getContext("2d"), {
        type: 'bar',
        data: {
            labels: info.labels,
            datasets: [{
                data: info.timeHours,
                backgroundColor: PINK_BG,
                borderColor:     PINK_BORDER,
                borderWidth: 1.5,
                borderRadius: 6,
                borderSkipped: false
            }]
        },
        options: timeOpts
    });
}

/* ---- Modifica registrazioni ---- */

function toggleEdit() {
    editOpen = !editOpen;
    const area = document.getElementById("editArea");
    area.classList.toggle("edit-area--hidden", !editOpen);
    if (editOpen) renderEditTable(getPeriodInfo());
}

function renderEditTable(info) {
    const area   = document.getElementById("editArea");
    const allData = getAllDailyData();

    // Costruisci righe: per la modalità anno mostra solo i giorni con dati
    let rows = [];

    if (statsMode === "year") {
        info.days.forEach(monthDays => {
            monthDays.forEach(key => {
                const e = allData[key];
                if (e && (e.pages > 0 || e.seconds > 0)) {
                    rows.push({ key, label: key, pages: e.pages || 0, minutes: Math.round((e.seconds || 0) / 60) });
                }
            });
        });
    } else {
        info.days.forEach((key, i) => {
            const e = allData[key] || { pages: 0, seconds: 0 };
            rows.push({ key, label: info.labels[i], pages: e.pages || 0, minutes: Math.round((e.seconds || 0) / 60) });
        });
    }

    if (rows.length === 0) {
        area.innerHTML = '<p class="edit-empty">Nessun dato registrato per questo periodo.</p>';
        return;
    }

    let html = `<table class="edit-table">
        <thead><tr>
            <th>Data</th>
            <th>Pagine</th>
            <th>Minuti studiati</th>
            <th></th>
        </tr></thead><tbody>`;

    rows.forEach(row => {
        html += `<tr>
            <td>${row.label}</td>
            <td><input class="edit-input" type="number" id="ep-${row.key}" value="${row.pages}" min="0"></td>
            <td><input class="edit-input" type="number" id="em-${row.key}" value="${row.minutes}" min="0"></td>
            <td><button class="save-row-btn" onclick="saveEditRow('${row.key}')">Salva</button></td>
        </tr>`;
    });

    html += '</tbody></table>';
    area.innerHTML = html;
}

function saveEditRow(key) {
    const pInput = document.getElementById(`ep-${key}`);
    const mInput = document.getElementById(`em-${key}`);
    const pages   = Math.max(0, Number(pInput?.value) || 0);
    const seconds = Math.max(0, (Number(mInput?.value) || 0) * 60);

    const allData = getAllDailyData();
    allData[key] = { pages, seconds };
    saveDailyData(allData);

    refreshStats();

    // Feedback visivo
   
