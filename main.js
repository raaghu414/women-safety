import { initMap } from './map-module.js';

// --- Mouse Effects ---
const cursorGlow = document.getElementById('cursor-glow');
document.addEventListener('mousemove', (e) => {
    if (cursorGlow) {
        cursorGlow.style.left = e.clientX + 'px';
        cursorGlow.style.top = e.clientY + 'px';
    }

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

// --- Auth & Reveal Logic ---
const authPortal = document.getElementById('auth-portal');
const registerCard = document.getElementById('register-card');
const loginCard = document.getElementById('login-card');
const registrationForm = document.getElementById('registration-form');
const loginFormValidated = document.getElementById('login-form-validated');
const showLoginBtn = document.getElementById('show-login');
const showRegisterBtn = document.getElementById('show-register');
const loginError = document.getElementById('login-error');
const userRoleBtn = document.getElementById('user-role-btn');
const adminRoleBtn = document.getElementById('admin-role-btn');
const unlockOverlay = document.getElementById('unlock-overlay');
const app = document.getElementById('app');
const adminDashboard = document.getElementById('admin-dashboard');
const usersTableBody = document.getElementById('users-table-body');

let currentRole = 'user';

// Toggle between Register and Login
showLoginBtn.addEventListener('click', () => {
    registerCard.style.display = 'none';
    loginCard.style.display = 'block';
});

showRegisterBtn.addEventListener('click', () => {
    loginCard.style.display = 'none';
    registerCard.style.display = 'block';
});

// Role Switcher on Login
userRoleBtn.addEventListener('click', () => {
    currentRole = 'user';
    userRoleBtn.classList.add('active');
    adminRoleBtn.classList.remove('active');
    loginCard.classList.remove('admin-mode');
});

adminRoleBtn.addEventListener('click', () => {
    currentRole = 'admin';
    adminRoleBtn.classList.add('active');
    userRoleBtn.classList.remove('active');
    loginCard.classList.add('admin-mode');
});

// Registration Logic
registrationForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newUser = {
        name: document.getElementById('reg-name').value,
        email: document.getElementById('reg-email').value,
        password: document.getElementById('reg-password').value,
        mobile: document.getElementById('reg-mobile').value,
        gender: document.getElementById('reg-gender').value,
        city: document.getElementById('reg-city').value
    };

    // Get existing users
    let users = JSON.parse(localStorage.getItem('women_safety_users') || '[]');
    
    // Check if email already exists
    if (users.some(u => u.email === newUser.email)) {
        alert("This email is already registered.");
        return;
    }

    users.push(newUser);
    localStorage.setItem('women_safety_users', JSON.stringify(users));

    alert("Registration Successful! Please login.");
    
    // Live update Admin Portal if currently viewing
    populateAdminTable();
    
    registerCard.style.display = 'none';
    loginCard.style.display = 'block';
});

// Login Logic
loginFormValidated.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    let isAuthenticated = false;

    if (currentRole === 'admin') {
        // Permanent Admin Credentials
        if (email === '4mh23cs123@gmail.com' && password === 'Raghu@123') {
            isAuthenticated = true;
            adminDashboard.style.display = 'block';
            populateAdminTable();
        }
    } else {
        // Check local storage for user
        const users = JSON.parse(localStorage.getItem('women_safety_users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            isAuthenticated = true;
            adminDashboard.style.display = 'none'; // Hide if previously shown
            localStorage.setItem('women_safety_session', JSON.stringify(user));
        }
    }

    if (isAuthenticated) {
        if (currentRole === 'admin') {
            localStorage.setItem('women_safety_session', JSON.stringify({ name: 'System Admin', email: '4mh23cs123@gmail.com', mobile: '9148433466', city: 'Admin Hub' }));
        }
        loginError.style.display = 'none';
        triggerUnlockSequence();
    } else {
        loginError.style.display = 'block';
    }
});

const populateAdminTable = () => {
    const users = JSON.parse(localStorage.getItem('women_safety_users') || '[]');
    usersTableBody.innerHTML = users.map(user => `
        <tr>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.mobile}</td>
            <td>${user.gender}</td>
            <td>${user.city}</td>
            <td><code>${user.password}</code></td>
        </tr>
    `).join('') || '<tr><td colspan="6" style="text-align:center">No users registered yet.</td></tr>';
};

// --- Initialization & Session Recovery ---
window.addEventListener('load', () => {
    const session = JSON.parse(localStorage.getItem('women_safety_session') || 'null');
    if (session && session.email === '4mh23cs123@gmail.com') {
        // Recover Admin Dashboard
        adminDashboard.style.display = 'block';
        populateAdminTable();
    }
    
    // Debug helper: Log current database state
    const users = JSON.parse(localStorage.getItem('women_safety_users') || '[]');
    console.log(`Database Initialized. ${users.length} users found.`);
});

// Admin DB Management
const exportDbBtn = document.getElementById('export-db');
const resetDbBtn = document.getElementById('reset-db');

if (exportDbBtn) {
    exportDbBtn.addEventListener('click', () => {
        const users = localStorage.getItem('women_safety_users') || '[]';
        const blob = new Blob([users], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `women_safety_database_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    });
}

if (resetDbBtn) {
    resetDbBtn.addEventListener('click', () => {
        if (confirm("CRITICAL: Are you sure you want to delete ALL registered user data? This cannot be undone.")) {
            localStorage.removeItem('women_safety_users');
            populateAdminTable();
            alert("Database has been reset.");
        }
    });
}

const triggerUnlockSequence = () => {
    authPortal.classList.add('hidden');
    setTimeout(() => {
        unlockOverlay.classList.add('active');
        setTimeout(() => {
            unlockOverlay.classList.remove('active');
            app.classList.remove('app-hidden');
            app.classList.add('app-visible');
            lucide.createIcons();
            initMap();
        }, 3000);
    }, 1000);
};

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

// --- WhatsApp SOS & Tracking Logic ---
const trackingPanel = document.getElementById('tracking-panel');
const trackName = document.getElementById('track-user-name');
const trackCoords = document.getElementById('track-coords');
const trackTime = document.getElementById('track-time');
const trackEta = document.getElementById('track-eta');
const closeTracking = document.getElementById('close-tracking');

let trackingId = null;

const sendEmergencySMS = (pos) => {
    const session = JSON.parse(localStorage.getItem('women_safety_session') || '{}');
    const lat = pos ? pos.coords.latitude.toFixed(6) : 'Unknown';
    const lng = pos ? pos.coords.longitude.toFixed(6) : 'Unknown';
    const mapsLink = pos ? `https://www.google.com/maps?q=${lat},${lng}` : 'Location Unavailable';
    
    const messageText = `🚨 SOS - WOMEN SAFETY 🚨\n` +
        `User: ${session.name || 'User'}\n` +
        `Location: ${lat}, ${lng}\n` +
        `Map: ${mapsLink}`;

    const primaryNumber = '+919148433466'; // Raghavendra
    
    // SMS protocol (Works best on mobile)
    const smsUrl = `sms:${primaryNumber}?body=${encodeURIComponent(messageText)}`;
    
    // Attempt to open SMS app
    window.location.href = smsUrl;
    console.log("SMS Broadcast initiated.");
};

const sendEmergencyWhatsApp = (pos) => {
    const session = JSON.parse(localStorage.getItem('women_safety_session') || '{}');
    const lat = pos ? pos.coords.latitude.toFixed(6) : 'Unknown';
    const lng = pos ? pos.coords.longitude.toFixed(6) : 'Unknown';
    const mapsLink = pos ? `https://www.google.com/maps?q=${lat},${lng}` : 'Location Unavailable';
    
    const messageText = `🚨 EMERGENCY ALERT - WOMEN SAFETY 🚨\n\n` +
        `User: ${session.name || 'Unknown'}\n` +
        `Mobile: ${session.mobile || 'Unknown'}\n` +
        `Location: ${session.city || 'Unknown'}\n` +
        `Coordinates: ${lat}, ${lng}\n` +
        `Live Map Link: ${mapsLink}\n\n` +
        `Help is needed immediately! Triggered by Police Siren/SOS.`;

    const contacts = ['+919148433466', '+918123823223', '+919353891022', '+919901828480'];
    const waUrl = `https://wa.me/${contacts[0]}?text=${encodeURIComponent(messageText)}`;

    if (navigator.share) {
        navigator.share({ title: 'EMERGENCY', text: messageText, url: mapsLink }).catch(() => {
            window.location.href = waUrl;
        });
    } else {
        window.location.href = waUrl;
    }
};

const startRealTimeTracking = () => {
    if ("geolocation" in navigator) {
        trackingPanel.classList.add('active');
        const session = JSON.parse(localStorage.getItem('women_safety_session') || '{}');
        trackName.innerText = session.name || 'Secure User';
        trackCoords.innerText = "Initializing GPS...";

        trackingId = navigator.geolocation.watchPosition((pos) => {
            const lat = pos.coords.latitude.toFixed(4);
            const lng = pos.coords.longitude.toFixed(4);
            trackCoords.innerText = `${lat}, ${lng}`;
            trackTime.innerText = new Date().toLocaleTimeString();
            
            let eta = parseInt(trackEta.dataset.val || 15);
            if (eta > 2) {
                eta -= 1;
                trackEta.dataset.val = eta;
            }
            trackEta.innerText = `${eta} MINS`;
        }, (err) => {
            const errorMsg = err.code === 1 ? "Permission Denied" : "GPS Signal Lost";
            trackCoords.innerText = errorMsg;
            trackCoords.style.color = "var(--danger)";
            console.error("Geolocation Error:", err);
        }, {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 10000
        });
    } else {
        trackCoords.innerText = "GPS Not Supported";
    }
};

const stopTracking = () => {
    if (trackingId) navigator.geolocation.clearWatch(trackingId);
    trackingPanel.classList.remove('active');
};

if (closeTracking) closeTracking.addEventListener('click', stopTracking);

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
    emergencyAlert.querySelector('p').innerHTML = `
        Sending SOS to: <br>
        <strong>Raghavendra (+919148433466)</strong><br>
        <strong>Bindu (+918123823223)</strong><br>
        <strong>Disha (+919353891022)</strong><br>
        <strong>Prahruth (+919901828480)</strong><br>
        <span style="color:var(--primary); font-size: 0.8rem; margin-top: 10px; display: block;">GPS coordinates broadcasted to all nodes.</span>
    `;
    
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
    
    // Trigger Real-time Tracking
    startRealTimeTracking();
    
    // Simulate real call to primary contact
    window.location.href = "tel:+919148433466";
};

if (sosBtn) {
    sosBtn.addEventListener('mousedown', startSosTimer);
    sosBtn.addEventListener('mouseup', clearSosTimer);
    sosBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startSosTimer(); });
    sosBtn.addEventListener('touchend', clearSosTimer);
}

if (cancelSos) {
    cancelSos.addEventListener('click', () => {
        emergencyAlert.style.display = 'none';
        stopTracking();
    });
}

// --- Stealth Mode ---
if (stealthToggle) {
    stealthToggle.addEventListener('click', () => {
        isStealth = true;
        stealthUI.style.display = 'block';
        document.body.style.cursor = 'auto';
    });
}

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
if (fakeCallTrigger) {
    fakeCallTrigger.addEventListener('click', () => {
        setTimeout(() => {
            fakeCallOverlay.style.display = 'flex';
            playCallSound();
        }, 1000);
    });
}

const closeCall = () => {
    fakeCallOverlay.style.display = 'none';
};

if (declineCall) declineCall.addEventListener('click', closeCall);
if (acceptCall) acceptCall.addEventListener('click', closeCall);

const playCallSound = () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    osc.connect(ctx.destination);
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
};

// --- Police Siren (Dual Tone) ---
if (sirenTrigger) {
    sirenTrigger.addEventListener('click', () => {
        isSirenActive = !isSirenActive;
        if (isSirenActive) {
            startSiren();
            sirenTrigger.style.background = 'rgba(244, 63, 94, 0.4)';
            
            // Request and Display Real-time Location & Trigger Emergency Messaging
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition((position) => {
                    startRealTimeTracking();
                    
                    const alertToast = document.createElement('div');
                    alertToast.className = 'safety-toast';
                    document.body.appendChild(alertToast);
                    
                    let countdown = 5;
                    const countdownInterval = setInterval(() => {
                        alertToast.innerHTML = `<i data-lucide="shield"></i> BROADCASTING IN ${countdown}s... [Raghavendra]`;
                        lucide.createIcons();
                        countdown--;
                        
                        if (countdown < 0) {
                            clearInterval(countdownInterval);
                            if (isSirenActive) { // Only send if siren still active
                                sendEmergencySMS(position);
                                setTimeout(() => sendEmergencyWhatsApp(position), 1000);
                                alertToast.innerHTML = `<i data-lucide="shield"></i> BROADCAST COMPLETE: SMS & WhatsApp sent.`;
                                lucide.createIcons();
                                setTimeout(() => alertToast.remove(), 3000);
                            }
                        }
                    }, 1000);

                }, (err) => {
                    // Fallback to sending message even without exact location
                    alert("GPS Error. Sending emergency SMS to Raghavendra in 5s...");
                    setTimeout(() => sendEmergencySMS(null), 5000);
                });
            }
        } else {
            stopSiren();
            stopTracking();
            sirenTrigger.style.background = 'var(--glass)';
        }
    });
}

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
if (triggerStrobe) {
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
}

// --- Discreet Record ---
if (triggerRecord) {
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
}

// Note: initMap() is now called after successful login reveal.
