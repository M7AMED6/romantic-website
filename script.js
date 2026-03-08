// ==========================================
// CONFIGURATION SECTION
// ==========================================
let dynamicStartDate = 0;
// ==========================================
// END OF CONFIGURATION SECTION
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    const startBtn      = document.getElementById("start-btn");
    const dateInput     = document.getElementById("story-date");
    const errorMessage  = document.getElementById("error-message");
    const landingScreen = document.getElementById("landing-screen");
    const mainContent   = document.getElementById("main-content");
    const bgMusic       = document.getElementById("bg-music");

    // ─────────────────────────────────────────────────────────────
    //  WEB AUDIO API SETUP
    //
    //  The <audio> element .play() API is unreliable on iOS Safari.
    //  The Web Audio API (AudioContext) is the only guaranteed way
    //  to play audio on iOS after a user gesture.
    //
    //  Pattern:
    //   1. Create AudioContext on first user gesture (it starts "suspended" on iOS)
    //   2. Connect the <audio> element as a source node
    //   3. Call audioCtx.resume() before bgMusic.play()
    // ─────────────────────────────────────────────────────────────
    let audioCtx    = null;
    let audioSource = null;

    function initAudioContext() {
        if (audioCtx) return; // already set up
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            audioSource = audioCtx.createMediaElementSource(bgMusic);
            audioSource.connect(audioCtx.destination);
            console.log("AudioContext created, state:", audioCtx.state);
        } catch (e) {
            console.warn("Web Audio API not available, falling back to HTML5 audio:", e);
            audioCtx = null;
        }
    }

    function playMusic() {
        if (audioCtx) {
            // iOS Safari starts AudioContext in "suspended" state.
            // resume() must be called inside a user gesture.
            audioCtx.resume().then(() => {
                bgMusic.play().catch(e => console.warn("play() failed:", e));
            });
        } else {
            // Fallback for browsers without Web Audio API
            bgMusic.play().catch(e => console.warn("Fallback play() failed:", e));
        }
    }

    // ─────────────────────────────────────────────────────────────
    //  DATE INPUT SETUP
    // ─────────────────────────────────────────────────────────────
    startBtn.disabled = true;

    dateInput.addEventListener('keydown', (e) => e.preventDefault());
    dateInput.addEventListener('paste',   (e) => e.preventDefault());

    // Open native date picker
    const showCalendarPicker = function () {
        if (typeof this.showPicker === 'function') {
            try { this.showPicker(); } catch (err) {}
        }
    };
    dateInput.addEventListener('click', showCalendarPicker);
    dateInput.addEventListener('focus', showCalendarPicker);

    // Enable start button once date is picked
    dateInput.addEventListener('change', () => {
        // The date change event IS a user gesture — set up AudioContext here
        // so it's ready before the button click
        initAudioContext();
        startBtn.disabled = !dateInput.value;
        if (dateInput.value) errorMessage.classList.remove("show");
    });

    // ─────────────────────────────────────────────────────────────
    //  START BUTTON
    // ─────────────────────────────────────────────────────────────
    startBtn.addEventListener("click", () => {
        if (!dateInput.value) {
            errorMessage.classList.add("show");
            return;
        }

        // Ensure AudioContext exists (in case change event wasn't enough)
        initAudioContext();

        // STEP 1 — Play via Web Audio API (works on iOS)
        bgMusic.loop = true;
        bgMusic.volume = 1;
        playMusic();

        // STEP 2 — Save date for counter
        dynamicStartDate = new Date(dateInput.value).getTime();

        // STEP 3 — UI transition
        landingScreen.classList.add("fade-out");
        mainContent.classList.remove("hidden");
        setTimeout(() => { mainContent.style.opacity = "1"; }, 50);

        // STEP 4 — All features
        setupMusicButton(true);
        startMalakRain();
        startCounter();
        startFallingHearts();
    });

    // ─────────────────────────────────────────────────────────────
    //  MUSIC BUTTON — Play / Pause Toggle
    // ─────────────────────────────────────────────────────────────
    function setupMusicButton(autoPlayStarted = false) {
        let isMusicPlaying = autoPlayStarted;
        const musicBtn = document.getElementById("music-btn");
        musicBtn.innerText = isMusicPlaying ? "Pause Music ⏸" : "Play Music ▶";

        musicBtn.addEventListener("click", () => {
            if (isMusicPlaying) {
                bgMusic.pause();
                musicBtn.innerText = "Play Music ▶";
            } else {
                playMusic();
                musicBtn.innerText = "Pause Music ⏸";
            }
            isMusicPlaying = !isMusicPlaying;
        });
    }

    // ─────────────────────────────────────────────────────────────
    //  MALAK RAIN ANIMATION
    // ─────────────────────────────────────────────────────────────
    function startMalakRain() {
        const rainContainer = document.createElement("div");
        rainContainer.id = "malak-rain";
        document.body.appendChild(rainContainer);

        const colors = [
            "rgba(255, 255, 255, 0.9)",
            "rgba(255, 192, 203, 0.9)",
            "rgba(255, 182, 193, 0.8)"
        ];

        const spawnInterval = setInterval(() => {
            const drop = document.createElement("div");
            drop.classList.add("malak-drop");
            drop.innerText = "malak";
            drop.style.left = `${Math.random() * 100}vw`;
            drop.style.animationDuration = `${Math.random() * 2 + 2}s`;
            drop.style.fontSize = `${Math.random() * 15 + 15}px`;
            drop.style.color = colors[Math.floor(Math.random() * colors.length)];
            rainContainer.appendChild(drop);
            setTimeout(() => drop.remove(), 4000);
        }, 80);

        setTimeout(() => {
            clearInterval(spawnInterval);
            rainContainer.style.transition = "opacity 2s ease-out";
            rainContainer.style.opacity = "0";
            setTimeout(() => rainContainer.remove(), 2000);
        }, 5000);
    }

    // ─────────────────────────────────────────────────────────────
    //  TIME COUNTER ENGINE
    // ─────────────────────────────────────────────────────────────
    function startCounter() {
        const daysEl    = document.getElementById("days");
        const hoursEl   = document.getElementById("hours");
        const minutesEl = document.getElementById("minutes");
        const secondsEl = document.getElementById("seconds");

        function updateTime() {
            const distance = Date.now() - dynamicStartDate;
            if (distance < 0) {
                daysEl.innerText = hoursEl.innerText = minutesEl.innerText = secondsEl.innerText = "0";
                return;
            }
            daysEl.innerText    = Math.floor(distance / 86400000);
            hoursEl.innerText   = String(Math.floor((distance % 86400000) / 3600000)).padStart(2, "0");
            minutesEl.innerText = String(Math.floor((distance % 3600000)  / 60000)).padStart(2, "0");
            secondsEl.innerText = String(Math.floor((distance % 60000)    / 1000)).padStart(2, "0");
        }

        updateTime();
        setInterval(updateTime, 1000);
    }

    // ─────────────────────────────────────────────────────────────
    //  MOUSE-FOLLOW HEARTS (desktop)
    // ─────────────────────────────────────────────────────────────
    let lastHeartTime = 0;
    document.addEventListener("mousemove", (e) => {
        if (!landingScreen.classList.contains("fade-out")) return;
        const now = Date.now();
        if (now - lastHeartTime > 50 && Math.random() < 0.4) {
            createMouseHeart(e.clientX, e.clientY);
            lastHeartTime = now;
        }
    });

    function createMouseHeart(x, y) {
        const heart = document.createElement("div");
        heart.classList.add("mouse-heart");
        heart.innerHTML = "❤";
        heart.style.left = `${x}px`;
        heart.style.top  = `${y}px`;
        heart.style.fontSize = `${Math.random() * 10 + 10}px`;
        document.body.appendChild(heart);
        setTimeout(() => heart.remove(), 1200);
    }

    // ─────────────────────────────────────────────────────────────
    //  FALLING HEARTS BACKGROUND
    // ─────────────────────────────────────────────────────────────
    function startFallingHearts() {
        const container = document.getElementById("falling-hearts");
        const colors = [
            "rgba(255, 180, 200, 0.8)",
            "rgba(255, 105, 180, 0.7)",
            "rgba(255, 192, 203, 0.9)",
            "rgba(238, 130, 238, 0.6)"
        ];

        function createFallingHeart() {
            const heart = document.createElement("div");
            heart.classList.add("falling-heart");
            heart.innerHTML = "❤";
            heart.style.left = `${Math.random() * 100}vw`;
            const duration = Math.random() * 8 + 7;
            heart.style.animationDuration = `${duration}s`;
            heart.style.fontSize = `${Math.random() * 20 + 15}px`;
            heart.style.color = colors[Math.floor(Math.random() * colors.length)];
            container.appendChild(heart);
            setTimeout(() => heart.remove(), duration * 1000);
        }

        const spawnRate = window.innerWidth > 768 ? 400 : 800;
        for (let i = 0; i < 5; i++) setTimeout(createFallingHeart, i * 300);
        setInterval(createFallingHeart, spawnRate);
    }
});
