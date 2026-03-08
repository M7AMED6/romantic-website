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
    //  iOS SAFARI AUDIO — TWO-STEP UNLOCK PATTERN
    //
    //  iOS will ONLY let JavaScript play audio if a previous user
    //  gesture has already "touched" the audio element. A single
    //  play() from a button click is not always enough because iOS
    //  sometimes considers the gesture "consumed" by the date picker.
    //
    //  Solution:
    //  1. The moment the user interacts with ANYTHING (touchstart on
    //     the whole page), silently play-then-pause the audio.
    //     This unlocks the audio context in iOS Safari.
    //  2. On button click, call play() normally — it will now work.
    // ─────────────────────────────────────────────────────────────
    let audioUnlocked = false;

    function unlockAudioContext() {
        if (audioUnlocked) return;
        audioUnlocked = true;

        // Play a tiny silent slice, then pause immediately.
        // This registers the audio element with iOS's media session
        // without actually starting the music yet.
        bgMusic.muted = true;
        bgMusic.volume = 0;
        bgMusic.play()
            .then(() => {
                bgMusic.pause();
                bgMusic.currentTime = 0;
                bgMusic.muted = false;
                bgMusic.volume = 1;
                console.log("✅ iOS audio context unlocked.");
            })
            .catch(() => {
                // Not unlocked yet — will try again on next gesture
                audioUnlocked = false;
            });
    }

    // Attach to the earliest possible user gestures on the page
    document.addEventListener('touchstart', unlockAudioContext, { passive: true, once: false });
    document.addEventListener('touchend',   unlockAudioContext, { passive: true, once: false });
    document.addEventListener('click',      unlockAudioContext, { once: false });

    // ─────────────────────────────────────────────────────────────
    //  DATE INPUT SETUP
    // ─────────────────────────────────────────────────────────────
    startBtn.disabled = true;

    // Prevent manual keyboard typing (force calendar picker only)
    dateInput.addEventListener('keydown', (e) => e.preventDefault());
    dateInput.addEventListener('paste',   (e) => e.preventDefault());

    // Open native date picker on click and focus
    const showCalendarPicker = function () {
        if (typeof this.showPicker === 'function') {
            try { this.showPicker(); } catch (err) { /* ignore */ }
        }
    };
    dateInput.addEventListener('click', showCalendarPicker);
    dateInput.addEventListener('focus', showCalendarPicker);

    // Enable start button once a date is selected
    dateInput.addEventListener('change', () => {
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

        // Remove the global unlock listeners — no longer needed
        document.removeEventListener('touchstart', unlockAudioContext);
        document.removeEventListener('touchend',   unlockAudioContext);
        document.removeEventListener('click',      unlockAudioContext);

        // STEP 1 — Play audio (audio context already unlocked by now)
        bgMusic.muted  = false;
        bgMusic.volume = 1;
        bgMusic.currentTime = 0;

        bgMusic.play()
            .then(() => {
                console.log("✅ Music started successfully.");
            })
            .catch(err => {
                // Last-resort: user must have somehow bypassed the unlock.
                // Try one more time without load() to preserve audio context.
                console.warn("⚠️ play() failed on button click:", err);
                setTimeout(() => {
                    bgMusic.play().catch(e => console.error("❌ Final play() attempt failed:", e));
                }, 300);
            });

        // STEP 2 — Save date for counter
        dynamicStartDate = new Date(dateInput.value).getTime();

        // STEP 3 — Animate UI
        landingScreen.classList.add("fade-out");
        mainContent.classList.remove("hidden");
        setTimeout(() => { mainContent.style.opacity = "1"; }, 50);

        // STEP 4 — Start all features
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
                bgMusic.play().catch(e => console.warn("Music btn play failed:", e));
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
