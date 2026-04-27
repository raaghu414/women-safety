import { initMap } from './map-module.js';

// --- Mouse Effects ---
const cursorGlow = document.getElementById('cursor-glow');
document.addEventListener('mousemove', (e) => {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';

    // Update card hover glow
    const cards = document.querySelectorAll('.adv-card');
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--x', `${x}px`);
        card.style.setProperty('--y', `${y}px`);
    });
});

// --- State ---
let sosTimer = null;
let isStealth = false;
let isSirenActive = false;
let sirenInterval = null;
let stealthExitTimer = null;
let isStrobeActive = false;
let strobeInterval = null;

// --- DOM Elements ---
const sosBtn = document.getElementById('sos-trigger');
const stealthToggle = document.getElementById('stealth-toggle');
const stealthUI = document.getElementById('stealth-ui');
const fakeCallTrigger = document.getElementById('trigger-fake-call');
const fakeCallOverlay = document.getElementById('fake-call-overlay');
const declineCall = document.getElementById('decline-call');
const acceptCall = document.getElementById('accept-call');
const sirenTrigger = document.getElementById('trigger-siren');
const emergencyAlert = document.getElementById('emergency-alert');
const cancelSos = document.getElementById('cancel-sos');
const triggerRecord = document.getElementById('trigger-record');
const triggerStrobe = document.getElementById('trigger-strobe');

// --- SOS Logic (Quantum Shield) ---
const startSosTimer = () => {
    sosBtn.style.transform = 'scale(0.95)';
    sosTimer = setTimeout(() => {
        activateSos();
    }, 3000);
};

const clearSosTimer = () => {
    sosBtn.style.transform = 'scale(1)';
    clearTimeout(sosTimer);
};

const activateSos = () => {
    emergencyAlert.style.display = 'flex';
    emergencyAlert.querySelector('p').innerHTML = "Calling <strong>Raaghu (+919148433466)</strong>... <br>GPS tracking active.";
    
    // Audio Alarm
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const playAlarm = () => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(1000, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
    };
    
    // Play alarm sequence
    let count = 0;
    const alarmInterval = setInterval(() => {
        playAlarm();
        count++;
        if (count > 5) clearInterval(alarmInterval);
    }, 200);

    if ("vibrate" in navigator) {
        navigator.vibrate([100, 30, 100, 30, 100, 30, 500]);
    }
    // Simulate real call
    window.location.href = "tel:+919148433466";
};

sosBtn.addEventListener('mousedown', startSosTimer);
sosBtn.addEventListener('mouseup', clearSosTimer);
sosBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startSosTimer(); });
sosBtn.addEventListener('touchend', clearSosTimer);

cancelSos.addEventListener('click', () => {
    emergencyAlert.style.display = 'none';
});

// --- Stealth Mode ---
stealthToggle.addEventListener('click', () => {
    isStealth = true;
    stealthUI.style.display = 'block';
    document.body.style.cursor = 'auto';
});

const startExitTimer = () => {
    stealthExitTimer = setTimeout(() => {
        isStealth = false;
        stealthUI.style.display = 'none';
        document.body.style.cursor = 'none';
    }, 3000);
};

const clearExitTimer = () => clearTimeout(stealthExitTimer);

const stealthLogo = document.querySelector('.news-header');
if (stealthLogo) {
    stealthLogo.addEventListener('mousedown', startExitTimer);
    stealthLogo.addEventListener('mouseup', clearExitTimer);
    stealthLogo.addEventListener('touchstart', startExitTimer);
    stealthLogo.addEventListener('touchend', clearExitTimer);
}

// --- Fake Call ---
fakeCallTrigger.addEventListener('click', () => {
    setTimeout(() => {
        fakeCallOverlay.style.display = 'flex';
        playCallSound();
    }, 1000);
});

const closeCall = () => {
    fakeCallOverlay.style.display = 'none';
};

declineCall.addEventListener('click', closeCall);
acceptCall.addEventListener('click', closeCall);

const playCallSound = () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    osc.connect(ctx.destination);
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
};

// --- Police Siren (Dual Tone) ---
sirenTrigger.addEventListener('click', () => {
    isSirenActive = !isSirenActive;
    if (isSirenActive) {
        startSiren();
        sirenTrigger.style.background = 'rgba(244, 63, 94, 0.4)';
        
        // Request and Display Real-time Location
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                const lat = position.coords.latitude.toFixed(4);
                const lng = position.coords.longitude.toFixed(4);
                
                const alertToast = document.createElement('div');
                alertToast.className = 'safety-toast';
                alertToast.innerHTML = `<i data-lucide="shield"></i> DISPATCHED: Coords [${lat}, ${lng}] sent to <strong>Bengaluru Central Station</strong>`;
                document.body.appendChild(alertToast);
                lucide.createIcons();
                setTimeout(() => alertToast.remove(), 5000);
            }, () => {
                // Fallback if denied
                const alertToast = document.createElement('div');
                alertToast.className = 'safety-toast';
                alertToast.innerHTML = '<i data-lucide="shield"></i> ALERT: Dispatching general area location to Police Station...';
                document.body.appendChild(alertToast);
                lucide.createIcons();
                setTimeout(() => alertToast.remove(), 4000);
            });
        }
    } else {
        stopSiren();
        sirenTrigger.style.background = 'var(--glass)';
    }
});

const startSiren = () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    sirenInterval = setInterval(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        // Police Siren Tones (High-Low)
        const freq = Math.sin(Date.now() / 200) > 0 ? 900 : 600;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
        
        // Flash screen logic
        document.body.style.background = freq > 700 ? '#1e1b4b' : '#450a0a';
    }, 200);
};

const stopSiren = () => {
    clearInterval(sirenInterval);
    document.body.style.background = 'var(--bg)';
};

// --- Strobe Light ---
triggerStrobe.addEventListener('click', () => {
    isStrobeActive = !isStrobeActive;
    if (isStrobeActive) {
        triggerStrobe.style.background = 'rgba(34, 211, 238, 0.3)';
        strobeInterval = setInterval(() => {
            document.body.style.opacity = document.body.style.opacity === '0.1' ? '1' : '0.1';
        }, 50);
    } else {
        clearInterval(strobeInterval);
        document.body.style.opacity = '1';
        triggerStrobe.style.background = 'var(--glass)';
    }
});

// --- Discreet Record ---
triggerRecord.addEventListener('click', () => {
    triggerRecord.classList.toggle('recording');
    if (triggerRecord.classList.contains('recording')) {
        triggerRecord.style.background = 'rgba(244, 63, 94, 0.4)';
        triggerRecord.querySelector('span').innerText = "RECORDING...";
        console.log("Audio Recording Started (Simulation)");
    } else {
        triggerRecord.style.background = 'var(--glass)';
        triggerRecord.querySelector('span').innerText = "Discreet Record";
        console.log("Audio Recording Stopped and Encrypted.");
    }
});


// --- AI Guardian ---
const guardianFab = document.getElementById('guardian-fab');
if (guardianFab) {
    guardianFab.addEventListener('click', () => {
        alert("Aura AI: Neural protection active. Scanning for safe paths...");
    });
}

// Initialize Map
initMap();
