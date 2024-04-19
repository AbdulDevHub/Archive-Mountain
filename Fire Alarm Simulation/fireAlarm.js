// Create an Audio object
let audio = new Audio('fireAlarm.mp3');

// Function to start playing the sound
function startSound() {
    audio.play();
}

// Function to stop playing the sound
function stopSound() {
    audio.pause();
    audio.currentTime = 0;
}

// Randomly delay the start of the sound between 20 and 30 minutes
let delay = Math.random() * (30 - 20) + 20;
setTimeout(startSound, delay * 60 * 1000);

// Listen for the user to type 'stop' in the console
window.addEventListener('keydown', function (event) {
    if (event.key === 'stop') {
        stopSound();
    }
});
