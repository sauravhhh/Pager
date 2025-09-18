let currentMessage = 1;
let totalMessages = 3;
let messageCount = 3;
let deviceOn = true;
let powerButtonTimer = null;
let deleteButtonTimer = null;
let audioContext = null;
let isPowerLongPressActive = false;
let isDeleteLongPressActive = false;

// Initialize audio context
function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// Play beep sound
function playBeep(frequency = 440, duration = 200) {
    initAudio();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
}

// Play alert sound
function playAlert() {
    initAudio();
    // Play a sequence of beeps for alert
    playBeep(880, 100);
    setTimeout(() => playBeep(880, 100), 200);
    setTimeout(() => playBeep(880, 100), 400);
}

// Update time for messages
function updateClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const year = now.getFullYear();
    
    // Update time for the emergency message to match the image
    const emergencyMsg = document.querySelector('#msg-1 .message-time');
    if (emergencyMsg) {
        emergencyMsg.textContent = `10:25 AM ${month}/${day}/${year}`;
    }
}

// Show notification
function showNotification(text) {
    const notification = document.getElementById('notification');
    notification.textContent = text;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 2000);
}

// Show specific message
function showMessage(num) {
    // Hide all messages
    for (let i = 1; i <= totalMessages; i++) {
        const msgEl = document.getElementById(`msg-${i}`);
        if (msgEl) {
            msgEl.style.display = 'none';
        }
    }
    
    // Show current message
    const currentMsgEl = document.getElementById(`msg-${num}`);
    if (currentMsgEl) {
        currentMsgEl.style.display = 'block';
        currentMessage = num;
        
        // Ensure emergency messages are red
        const emergencyText = currentMsgEl.querySelector('.emergency-message');
        if (emergencyText) {
            emergencyText.style.color = '#ff3333';
        }
    }
}

// Power button handler
function handlePowerButton() {
    playBeep(440, 100);
    
    // Start timer for long press
    isPowerLongPressActive = true;
    powerButtonTimer = setTimeout(() => {
        if (deviceOn) {
            // Turn off device
            document.getElementById('screen').style.display = 'none';
            document.querySelector('.beeper-status span').textContent = 'OFF';
            document.querySelector('.status-light').style.backgroundColor = '#f44336';
            deviceOn = false;
            showNotification('Device OFF');
        } else {
            // Turn on device
            document.getElementById('screen').style.display = 'block';
            document.querySelector('.beeper-status span').textContent = 'ON';
            document.querySelector('.status-light').style.backgroundColor = '#4CAF50';
            deviceOn = true;
            showNotification('Device ON');
        }
        playBeep(880, 200);
        isPowerLongPressActive = false;
    }, 1000);
}

// Read button handler
function handleReadButton() {
    if (!deviceOn) return;
    
    playBeep(660, 100);
    readMessage();
}

// Delete button handler
function handleDeleteButton() {
    if (!deviceOn) return;
    
    playBeep(440, 100);
    
    // Start timer for long press
    isDeleteLongPressActive = true;
    deleteButtonTimer = setTimeout(() => {
        deleteMessage();
        playBeep(330, 300);
        isDeleteLongPressActive = false;
    }, 1000);
}

// Up button handler (Previous)
function handleUpButton() {
    if (!deviceOn) return;
    
    playBeep(550, 100);
    previousMessage();
}

// Select button handler
function handleSelectButton() {
    if (!deviceOn) return;
    
    playBeep(660, 100);
    readMessage();
}

// Down button handler (Next)
function handleDownButton() {
    if (!deviceOn) return;
    
    playBeep(550, 100);
    nextMessage();
}

// Clear button timers on mouse up
document.addEventListener('mouseup', () => {
    if (powerButtonTimer) {
        clearTimeout(powerButtonTimer);
        powerButtonTimer = null;
        isPowerLongPressActive = false;
    }
    
    if (deleteButtonTimer) {
        clearTimeout(deleteButtonTimer);
        deleteButtonTimer = null;
        isDeleteLongPressActive = false;
    }
});

// Prevent context menu during long press
document.getElementById('power-btn').addEventListener('contextmenu', (e) => {
    if (isPowerLongPressActive) {
        e.preventDefault();
    }
});

document.getElementById('delete-btn').addEventListener('contextmenu', (e) => {
    if (isDeleteLongPressActive) {
        e.preventDefault();
    }
});

// Read current message
function readMessage() {
    const message = document.getElementById(`msg-${currentMessage}`);
    if (message) {
        message.style.color = '#0aa';
        setTimeout(() => {
            message.style.color = '#0f0';
        }, 1000);
        showNotification('Message Read');
    }
}

// Delete current message
function deleteMessage() {
    const message = document.getElementById(`msg-${currentMessage}`);
    if (message) {
        message.style.display = 'none';
        messageCount--;
        showNotification('Message Deleted');
        
        // Show next message if available
        let next = currentMessage + 1;
        if (next > totalMessages) next = 1;
        
        // Find next available message
        let attempts = 0;
        while (document.getElementById(`msg-${next}`) && 
               document.getElementById(`msg-${next}`).style.display === 'none' && 
               attempts < totalMessages) {
            next++;
            if (next > totalMessages) next = 1;
            attempts++;
        }
        
        if (attempts < totalMessages && document.getElementById(`msg-${next}`)) {
            showMessage(next);
        }
    }
}

// Navigate to next message
function nextMessage() {
    let next = currentMessage + 1;
    if (next > totalMessages) next = 1;
    
    // Skip deleted messages
    let attempts = 0;
    while (document.getElementById(`msg-${next}`) && 
           document.getElementById(`msg-${next}`).style.display === 'none' && 
           attempts < totalMessages) {
        next++;
        if (next > totalMessages) next = 1;
        attempts++;
    }
    
    if (document.getElementById(`msg-${next}`)) {
        showMessage(next);
    }
}

// Navigate to previous message
function previousMessage() {
    let prev = currentMessage - 1;
    if (prev < 1) prev = totalMessages;
    
    // Skip deleted messages
    let attempts = 0;
    while (document.getElementById(`msg-${prev}`) && 
           document.getElementById(`msg-${prev}`).style.display === 'none' && 
           attempts < totalMessages) {
        prev--;
        if (prev < 1) prev = totalMessages;
        attempts++;
    }
    
    if (document.getElementById(`msg-${prev}`)) {
        showMessage(prev);
    }
}

// Simulate incoming emergency message
function simulateEmergencyMessage() {
    totalMessages++;
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const year = now.getFullYear();
    
    const newMsg = document.createElement('div');
    newMsg.className = 'message';
    newMsg.id = `msg-${totalMessages}`;
    newMsg.style.display = 'none';
    newMsg.innerHTML = `
        <div class="message-time">${hours}:${minutes} ${month}/${day}/${year}</div>
        <div class="emergency-message">EMERGENCY: EVACUATE BUILDING IMMEDIATELY</div>
    `;
    
    document.getElementById('message-container').appendChild(newMsg);
    showMessage(totalMessages);
    messageCount++;
    
    // Show notification and play alert
    showNotification('EMERGENCY ALERT!');
    playAlert();
}

// Add event listeners to buttons
document.getElementById('power-btn').addEventListener('click', handlePowerButton);
document.getElementById('read-btn').addEventListener('click', handleReadButton);
document.getElementById('delete-btn').addEventListener('click', handleDeleteButton);
document.getElementById('up-btn').addEventListener('click', handleUpButton);
document.getElementById('select-btn').addEventListener('click', handleSelectButton);
document.getElementById('down-btn').addEventListener('click', handleDownButton);

// Initialize
updateClock();
setInterval(updateClock, 60000); // Update every minute

// Simulate emergency message every 45 seconds
setInterval(simulateEmergencyMessage, 45000);
