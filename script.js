// ==========================================
// CONFIGURATION SECTION
// Edit these values to customize the website
// ==========================================

// User-selected start date (assigned on button click)
let dynamicStartDate = 0;

// ==========================================
// END OF CONFIGURATION SECTION
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    const startBtn     = document.getElementById("start-btn");
    const dateInput    = document.getElementById("story-date");
    const errorMessage = document.getElementById("error-message");
    const landingScreen = document.getElementById("landing-screen");
    const mainContent  = document.getElementById("main-content");
    const bgMusic      = document.getElementById("bg-music");

    // Disable start button until a date is chosen
    startBtn.disabled = true;

    // -------------------------------------------------------
    // DATE INPUT — prevent manual keyboard typing on mobile
    // -------------------------------------------------------
    dateInput.addEventListener('keydown', (e) => e.preventDefault());
    dateInput.addEventListener('paste',   (e) => e.preventDefault());

    // Open the native date picker on click/focus only (NOT touchstart —
    // touchstart on the input conflicts with the button tap gesture on iOS)
    const showCalendarPicker = function () {
        if (typeof this.showPicker === 'function') {
            try { this.showPicker(); } catch (err) { /* ignore */ }
        }
    };
    dateInput.addEventListener('click', showCalendarPicker);
    dateInput.addEventListener('focus', showCalendarPicker);

    // Enable the start button only after the user picks a date
    dateInput.addEventListener('change', () => {
        startBtn.disabled = !dateInput.value;
        if (dateInput.value) errorMessage.classList.remove("show");
    });

    // -------------------------------------------------------
    // START BUTTON — the ONLY place audio .play() is called
    // iOS Safari rule: play() must be the VERY FIRST thing
    // that runs synchronously inside a user-gesture handler.
    // No load(), no setTimeout(), no async before it.
    // -------------------------------------------------------
    startBtn.addEventListener("click", () => {
        if (!dateInput.value) {
            errorMessage.classList.add("show");
            return;
        }

        // ★ STEP 1 — Play audio immediately (synchronous, first line after guard)
        bgMusic.muted  = false;
        bgMusic.volume = 1;
        const playPromise = bgMusic.play();

        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    console.log("✅ Audio started successfully.");
                })
                .catch(err => {
                    // Do NOT call bgMusic.load() here — it destroys the audio
                    // context on iOS and prevents any further play attempts.
                    console.warn("⚠️ Audio play() rejected by browser:", err);
                });
        }

        // ★ STEP 2 — Save the chosen date for the counter
        dynamicStartDate = new Date(dateInput.value).getTime();

        // ★ STEP 3 — Animate UI transition
        landingScreen.classList.add("fade-out");
        mainContent.classList.remove("hidden");
        setTimeout(() => {
            mainContent.style.opacity = "1";
        }, 50);

        // ★ STEP 4 — Start all features
        setupMusicButton(true);
        startMalakRain();
        startCounter();
        startFallingHearts();
    });

    // -------------------------------------------------------
    // MUSIC BUTTON — Play / Pause toggle
    // -------------------------------------------------------
    function setupMusicButton(autoPlayStarted = false) {
        let isMusicPlaying = autoPlayStarted;
        const musicBtn = document.getElementById("music-btn");

        musicBtn.innerText = isMusicPlaying ? "Pause Music ⏸" : "Play Music ▶";

        musicBtn.addEventListener("click", () => {
            if (isMusicPlaying) {
                bgMusic.pause();
                musicBtn.innerText = "Play Music ▶";
            } else {
                bgMusic.play().catch(e => console.warn("Music btn play failed:", e));
                musicBtn.innerText = "Pause Music ⏸";
            }
            isMusicPlaying = !isMusicPlaying;
        });
    }

    // -------------------------------------------------------
    // MALAK RAIN ANIMATION
    // -------------------------------------------------------
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

        // Stop spawning after 5 s and fade out
        setTimeout(() => {
            clearInterval(spawnInterval);
            rainContainer.style.transition = "opacity 2s ease-out";
            rainContainer.style.opacity = "0";
            setTimeout(() => rainContainer.remove(), 2000);
        }, 5000);
    }

    // -------------------------------------------------------
    // TIME COUNTER ENGINE
    // -------------------------------------------------------
    function startCounter() {
        const daysEl    = document.getElementById("days");
        const hoursEl   = document.getElementById("hours");
        const minutesEl = document.getElementById("minutes");
        const secondsEl = document.getElementById("seconds");

        function updateTime() {
            const distance = Date.now() - dynamicStartDate;

            if (distance < 0) {
                daysEl.innerText    = "0";
                hoursEl.innerText   = "00";
                minutesEl.innerText = "00";
                secondsEl.innerText = "00";
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

    // -------------------------------------------------------
    // MOUSE-FOLLOW HEARTS (desktop only)
    // -------------------------------------------------------
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

    // -------------------------------------------------------
    // FALLING HEARTS BACKGROUND
    // -------------------------------------------------------
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
