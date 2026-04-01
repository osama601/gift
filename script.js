document.addEventListener('DOMContentLoaded', () => {
    const giftBoxes = document.querySelectorAll('.gift-box');
    const modalContainer = document.getElementById('modalContainer');
    const closeBtns = document.querySelectorAll('.close-btn');
    const cards = document.querySelectorAll('.card');
    
    // Intro Heart Elements
    const introOverlay = document.getElementById('introOverlay');
    const growingHeart = document.getElementById('growingHeart');
    const mainContainer = document.querySelector('.container');
    const bgMusic = document.getElementById('bgMusic');
    const musicToggle = document.getElementById('musicToggle');
    const envelope = document.getElementById('envelope');
    const letterCard = document.getElementById('letterContent');

    let heartScale = 1;
    const increment = 1.2; // The growth step from the "much bigger" version
    const maxClicks = 5;
    let clickCount = 0;
    let isExploding = false;

    // Sparkle Trail Logic
    document.addEventListener('mousemove', (e) => {
        if (Math.random() > 0.1) { // Create sparkles occasionally
            createSparkle(e.clientX, e.clientY);
        }
    });

    function createSparkle(x, y) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.innerHTML = ['✨', '⭐', '💖', '❤️'][Math.floor(Math.random() * 4)];
        sparkle.style.left = x + 'px';
        sparkle.style.top = y + 'px';
        
        // Random drift
        const dx = (Math.random() - 0.5) * 50;
        const dy = (Math.random() - 0.5) * 50;
        sparkle.style.setProperty('--dx', dx + 'px');
        sparkle.style.setProperty('--dy', dy + 'px');

        document.body.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 1000);
    }

    // Envelope Opening Logic
    if (envelope) {
        envelope.addEventListener('click', () => {
            envelope.classList.add('open');
            setTimeout(() => {
                letterCard.classList.add('reveal-content');
                triggerConfetti();
            }, 800);
        });
    }

    // Create background hearts
    const createHearts = () => {
        const heartCount = 20;
        for (let i = 0; i < heartCount; i++) {
            const heart = document.createElement('div');
            heart.classList.add('heart');
            heart.innerHTML = '❤️';
            heart.style.left = Math.random() * 100 + 'vw';
            heart.style.animationDuration = (Math.random() * 3 + 2) + 's';
            heart.style.animationDelay = (Math.random() * 5) + 's';
            heart.style.opacity = Math.random() * 0.5 + 0.3;
            document.body.appendChild(heart);
        }
    };

    createHearts();

    // Growing Heart Interaction
    growingHeart.addEventListener('click', (e) => {
        if (isExploding) return;

        clickCount++;
        heartScale += increment;
        growingHeart.style.setProperty('--s', heartScale);
        growingHeart.style.transform = `scale(${heartScale})`;
        
        // Add a slight shake as it gets bigger
        if (heartScale > 4) { // Start shaking a bit earlier now
            growingHeart.style.transition = 'none'; // Disable transition during shake for performance
            growingHeart.style.animation = 'shake 0.1s infinite';
        }

        // Trigger explosion sequence on the 5th click
        if (clickCount >= maxClicks) {
            isExploding = true;
            growingHeart.style.animation = 'wiggle 0.5s ease-in-out 1';
            
            // Wait for wiggle to finish before exploding
            setTimeout(() => {
                explodeHeart(e.clientX, e.clientY);
            }, 500);
        }
    });

    function explodeHeart(x, y) {
        // Stop shaking/wiggling before explosion
        growingHeart.style.animation = 'none';
        
        // Create explosion particles
        for (let i = 0; i < 60; i++) { // More particles for bigger heart
            const particle = document.createElement('div');
            particle.classList.add('heart-particle');
            particle.innerHTML = Math.random() > 0.5 ? '❤️' : '💖';
            
            // Random direction
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 500 + 200; // Wider explosion
            const tx = Math.cos(angle) * distance + 'px';
            const ty = Math.sin(angle) * distance + 'px';
            const rot = Math.random() * 360 + 'deg';

            particle.style.setProperty('--tx', tx);
            particle.style.setProperty('--ty', ty);
            particle.style.setProperty('--rot', rot);
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';

            document.body.appendChild(particle);

            // Cleanup particles
            setTimeout(() => particle.remove(), 1000);
        }

        // Final celebratory confetti
        triggerConfetti();

        // Reveal the main content
        introOverlay.classList.add('fade-out');
        mainContainer.classList.remove('blurred');
        
        // Show and Play Music
        musicToggle.classList.remove('hidden');
        playMusic();

        // Play a sound if you had one, or just proceed
        setTimeout(() => {
            introOverlay.remove();
        }, 800);
    }

    function playMusic() {
        bgMusic.play().then(() => {
            musicToggle.classList.add('playing');
        }).catch(error => {
            console.log("Autoplay prevented by browser, waiting for user interaction.");
        });
    }

    musicToggle.addEventListener('click', () => {
        if (bgMusic.paused) {
            bgMusic.play();
            musicToggle.classList.add('playing');
        } else {
            bgMusic.pause();
            musicToggle.classList.remove('playing');
        }
    });

    // Gift Reveal Action for each box
    giftBoxes.forEach(box => {
        box.addEventListener('click', () => {
            const giftType = box.getAttribute('data-gift');
            
            // Open the specific box
            box.classList.add('open');
            
            // Wait for lid animation
            setTimeout(() => {
                showModal(giftType);
                triggerConfetti();
                
                // If it's the bouquet, add flower interactions
                if (giftType === 'bouquet') {
                    initFlowers();
                }
            }, 800);
        });
    });

    function initFlowers() {
        const flowers = document.querySelectorAll('.flower');
        flowers.forEach((flower, index) => {
            // Reset bloom state
            flower.setAttribute('data-bloom', 'false');
            
            // Individual flower click to bloom
            flower.addEventListener('click', () => {
                flower.setAttribute('data-bloom', 'true');
                // Trigger small confetti on each bloom
                confetti({
                    particleCount: 20,
                    spread: 50,
                    origin: { y: 0.6 },
                    colors: [flower.querySelector('.petal').style.backgroundColor || '#ff7675']
                });
            });

            // Auto-bloom with delay
            setTimeout(() => {
                flower.setAttribute('data-bloom', 'true');
            }, 500 + (index * 400));
        });
    }

    function showModal(type) {
        // Hide all cards first
        cards.forEach(card => card.classList.add('hidden'));
        
        // Show the specific card
        const targetCard = document.getElementById(`${type}Content`);
        if (targetCard) {
            targetCard.classList.remove('hidden');
            modalContainer.classList.remove('hidden');
        }
    }

    // Close Modal Functionality
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modalContainer.classList.add('hidden');
            
            // Reset all boxes after a short delay
            setTimeout(() => {
                giftBoxes.forEach(box => box.classList.remove('open'));
                // Reset envelope state
                if (letterCard) letterCard.classList.remove('reveal-content');
                if (envelope) envelope.classList.remove('open');
            }, 500);
        });
    });

    // Confetti Function (Canvas Confetti Library)
    function triggerConfetti() {
        const count = 200;
        const defaults = {
            origin: { y: 0.7 }
        };

        function fire(particleRatio, opts) {
            confetti({
                ...defaults,
                ...opts,
                particleCount: Math.floor(count * particleRatio)
            });
        }

        fire(0.25, { spread: 26, startVelocity: 55 });
        fire(0.2, { spread: 60 });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        fire(0.1, { spread: 120, startVelocity: 45 });
    }
});
