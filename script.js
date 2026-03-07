// ==========================================
// CONFIGURATION SECTION
// Edit these values to customize the website
// ==========================================

// 1. START DATE: Deprecated fixed date configuration. 
// User date is now chosen interactively below.
let dynamicStartDate = 0; 

// (Typewriter removed based on new design with static centered message)

// 3. IMAGES: (Gallery removed based on request)

// ==========================================
// END OF CONFIGURATION SECTION
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    const startBtn = document.getElementById("start-btn");
    const dateInput = document.getElementById("story-date");
    const errorMessage = document.getElementById("error-message");
    const landingScreen = document.getElementById("landing-screen");
    const mainContent = document.getElementById("main-content");
    const bgMusic = document.getElementById("bg-music");

    // Initialize button to disabled initially if no date is set
    startBtn.disabled = true;

    // Fix mobile date input issue: prevent manual typing & open picker automatically
    dateInput.addEventListener('keydown', (e) => e.preventDefault());
    dateInput.addEventListener('paste', (e) => e.preventDefault());
    
    const showCalendarPicker = function() {
        // Use showPicker() for modern browsers to force native calendar
        if (typeof this.showPicker === 'function') {
            try { this.showPicker(); } catch (err) {}
        }
    };
    
    dateInput.addEventListener('click', showCalendarPicker);
    dateInput.addEventListener('focus', showCalendarPicker);
    // Additional event for mobile Safari
    dateInput.addEventListener('touchstart', showCalendarPicker, { passive: true });

    // Enable button only when user selects a date
    dateInput.addEventListener('change', () => {
        if(dateInput.value) {
            startBtn.disabled = false;
            errorMessage.classList.remove("show");
        } else {
            startBtn.disabled = true;
        }
    });

    // Preload effects configurations if needed (images removed)

    // Start Button Click Event
    startBtn.addEventListener("click", () => {
        if (!dateInput.value) {
            errorMessage.classList.add("show");
            return;
        }

        // 1. تشغيل الصوت "فوراً" قبل أي عملية تانية
        // دي أهم خطوة للأيفون: لازم الـ play يحصل في أول سطر
        bgMusic.play().then(() => {
            console.log("Success: Audio started");
        }).catch(err => {
            console.log("First attempt failed, retrying...", err);
            bgMusic.load(); // إعادة تحميل المصدر كخطة بديلة
            bgMusic.play();
        });
        
        // 2. معالجة البيانات
        dynamicStartDate = new Date(dateInput.value).getTime();

        // 3. تغيير شكل الشاشة (الأنيميشن)
        landingScreen.classList.add("fade-out");
        mainContent.classList.remove("hidden");
        
        setTimeout(() => {
            mainContent.style.opacity = "1";
        }, 50);

        // 4. تشغيل باقي الوظائف
        setupMusicButton(true);
        startMalakRain();
        startCounter();
        startFallingHearts();
    });

    // EDIT HERE: Music Button Toggle Logic
    function setupMusicButton(autoPlayStarted = false) {
        let isMusicPlaying = autoPlayStarted;
        const musicBtn = document.getElementById("music-btn");
        
        // Ensure starting state is correct based on autoplay
        musicBtn.innerText = isMusicPlaying ? "Pause Music ⏸" : "Play Music ▶";
        
        musicBtn.addEventListener("click", () => {
            if (isMusicPlaying) {
                bgMusic.pause();
                musicBtn.innerText = "Play Music ▶";
            } else {
                bgMusic.play().catch(e => console.log("Audio play failed.", e));
                musicBtn.innerText = "Pause Music ⏸";
            }
            isMusicPlaying = !isMusicPlaying;
        });
    }

    // Malak Rain Animation
    function startMalakRain() {
        const rainContainer = document.createElement("div");
        rainContainer.id = "malak-rain";
        document.body.appendChild(rainContainer);

        const spawnInterval = setInterval(() => {
            const drop = document.createElement("div");
            drop.classList.add("malak-drop");
            drop.innerText = "malak";
            
            // Randomize position, duration, and size
            drop.style.left = `${Math.random() * 100}vw`;
            drop.style.animationDuration = `${Math.random() * 2 + 2}s`; // Falls between 2 to 4 seconds
            drop.style.fontSize = `${Math.random() * 15 + 15}px`;
            
            // Subtle pinkish-white colors for the words
            const colors = ["rgba(255, 255, 255, 0.9)", "rgba(255, 192, 203, 0.9)", "rgba(255, 182, 193, 0.8)"];
            drop.style.color = colors[Math.floor(Math.random() * colors.length)];

            rainContainer.appendChild(drop);

            // Clean up off-screen
            setTimeout(() => {
                drop.remove();
            }, 4000);
        }, 80); // Spawn rapidly

        // End rain after 5 seconds exactly, allowing smooth fade out
        setTimeout(() => {
            clearInterval(spawnInterval);
            rainContainer.style.opacity = '0';
            rainContainer.style.transition = 'opacity 2s ease-out';
            
            // Ensure fully removed from DOM
            setTimeout(() => {
                rainContainer.remove();
            }, 2000);
        }, 5000);
    }

    // Time Counter Engine
    // EDIT HERE: The counter logic now pulls from the "dynamicStartDate" variable assigned above
    function startCounter() {
        const daysEl = document.getElementById("days");
        const hoursEl = document.getElementById("hours");
        const minutesEl = document.getElementById("minutes");
        const secondsEl = document.getElementById("seconds");

        function updateTime() {
            const now = new Date().getTime();
            const distance = now - dynamicStartDate;

            if (distance < 0) {
                // If the start date is in the future
                daysEl.innerText = "0";
                hoursEl.innerText = "00";
                minutesEl.innerText = "00";
                secondsEl.innerText = "00";
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            // Animate only when values change (simple update)
            daysEl.innerText = days;
            hoursEl.innerText = hours.toString().padStart(2, '0');
            minutesEl.innerText = minutes.toString().padStart(2, '0');
            secondsEl.innerText = seconds.toString().padStart(2, '0');
        }

        updateTime();
        setInterval(updateTime, 1000);
    }

    // (Typewriter engine removed as requested)

    // (Slideshow Engine removed as requested)

    // Mouse Interaction: Animated Hearts following the cursor
    // Variable to throttle the heart creation
    let lastHeartTime = 0;
    
    document.addEventListener("mousemove", (e) => {
        // Only run if the user has clicked start
        if (!landingScreen.classList.contains("fade-out")) return;

        const now = Date.now();
        // Create a heart every 50ms at most to prevent lag
        if (now - lastHeartTime > 50) {
            // Further reduce density with a random check
            if (Math.random() < 0.4) {
                createMouseHeart(e.clientX, e.clientY);
                lastHeartTime = now;
            }
        }
    });

    function createMouseHeart(x, y) {
        const heart = document.createElement("div");
        heart.classList.add("mouse-heart");
        heart.innerHTML = "❤";
        heart.style.left = `${x}px`;
        heart.style.top = `${y}px`;

        // Randomize size slightly
        const size = Math.random() * 10 + 10; // between 10px and 20px
        heart.style.fontSize = `${size}px`;

        document.body.appendChild(heart);

        // Remove element after CSS animation duration ends
        setTimeout(() => {
            heart.remove();
        }, 1200); 
    }

    // Falling Hearts Background Effect
    function startFallingHearts() {
        const container = document.getElementById("falling-hearts");

        function createFallingHeart() {
            const heart = document.createElement("div");
            heart.classList.add("falling-heart");
            heart.innerHTML = "❤";
            
            // Random horizontal start position (allow overflowing slightly so it looks natural)
            heart.style.left = `${Math.random() * 100}vw`;
            
            // Random animation duration (controls the fall speed)
            const duration = Math.random() * 8 + 7; // Falls between 7s and 15s
            heart.style.animationDuration = `${duration}s`;
            
            // Random size variation
            heart.style.fontSize = `${Math.random() * 20 + 15}px`;
            
            // Random color shades (pink to subtle purple)
            const colors = ["rgba(255, 180, 200, 0.8)", "rgba(255, 105, 180, 0.7)", "rgba(255, 192, 203, 0.9)", "rgba(238, 130, 238, 0.6)"];
            heart.style.color = colors[Math.floor(Math.random() * colors.length)];

            container.appendChild(heart);

            // Clean up off-screen hearts
            setTimeout(() => {
                heart.remove();
            }, duration * 1000);
        }

        // Spawn a heart at an interval depending on screen size (less density on mobile)
        const spawnInterval = window.innerWidth > 768 ? 400 : 800;
        
        // Initial set of hearts so screen is not empty
        for(let i=0; i<5; i++) {
            setTimeout(createFallingHeart, i * 300);
        }

        setInterval(createFallingHeart, spawnInterval);
    }
});
