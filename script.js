const timeSettings = {
  pomodoro: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
  reverse: 5 * 60,
};

let totalSeconds = timeSettings.pomodoro;
let secondsLeft = totalSeconds;
let isRunning = false;
let timer;
let currentMode = "pomodoro";
let reverseStartTime;

const modeButtons = document.querySelectorAll(".mode-button");
const earnedBreakDisplay = document.getElementById("earned-break");
const settingsModal = document.getElementById("settingsModal");
const musicModal = document.getElementById("musicModal");
const aboutModal = document.getElementById("aboutModal");
const timerDisplay = document.getElementById("timer-display");
const progressBar = document.getElementById("progress-bar");
const progressPercent = document.getElementById("progress-percent");
const audio = document.getElementById("bgm");
const alarm = document.getElementById("alarmSound");

function showNotification(title, body) {
  if ("Notification" in window && Notification.permission === "granted") {
    navigator.serviceWorker.getRegistration().then(reg => {
      if (reg) {
        reg.showNotification(title, {
          body: body,
          icon: "icon-192.png",
          vibrate: [200, 100, 200],
          tag: "pomodoro-timer"
        });
      }
    });
  }
}

function switchMode(mode) {
  clearInterval(timer);
  isRunning = false;
  currentMode = mode;

  modeButtons.forEach(btn => btn.classList.remove("active"));
  const activeBtn = document.getElementById(`${mode}-mode`);
  if (activeBtn) activeBtn.classList.add("active");

  if (mode === "reverse") {
    totalSeconds = timeSettings.reverse;
    reverseStartTime = Date.now();
  } else {
    totalSeconds = timeSettings[mode];
  }

  secondsLeft = totalSeconds;
  updateDisplay();
  updateProgressBar();

  document.getElementById("shortBreak-mode").style.display = mode === "reverse" ? "none" : "inline-block";
  document.getElementById("longBreak-mode").style.display = mode === "reverse" ? "none" : "inline-block";
  earnedBreakDisplay.style.display = mode === "reverse" ? "block" : "none";

  if (mode === "reverse") {
    earnedBreakDisplay.textContent = "Work for up to 1 hour. The longer you work, the longer break you earn.";
  }
}

function updateDisplay() {
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  timerDisplay.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function updateProgressBar() {
  const percent = Math.floor(((totalSeconds - secondsLeft) / totalSeconds) * 100);
  progressBar.style.width = `${percent}%`;
  progressPercent.textContent = `${percent}%`;
}

function toggleTimer() {
  if (isRunning) {
    clearInterval(timer);
    isRunning = false;
  } else {
    isRunning = true;
    showNotification("Pomodoro Started", "Stay focused!");
    timer = setInterval(() => {
      if (secondsLeft > 0) {
        secondsLeft--;
        updateDisplay();
        updateProgressBar();
      } else {
        clearInterval(timer);
        isRunning = false;
        updateDisplay();
        updateProgressBar();

        showNotification("Time's Up!", "Take a break!");
        if ('vibrate' in navigator) navigator.vibrate([300, 100, 300]);
        if (alarm) alarm.play();
        if (audio && !audio.paused) audio.pause();

        if (currentMode === "reverse") {
          const workedTime = Math.floor((Date.now() - reverseStartTime) / 1000 / 60);
          let earned = 0;
          if (workedTime >= 5 && workedTime <= 20) earned = 2;
          else if (workedTime >= 21 && workedTime <= 30) earned = 5;
          else if (workedTime >= 31 && workedTime <= 45) earned = 10;
          else if (workedTime >= 46 && workedTime <= 55) earned = 15;
          else if (workedTime >= 56 && workedTime <= 60) earned = 30;

          alert(`You earned a ${earned}-minute break!`);
        }
      }
    }, 1000);
  }
}

function openSettings() {
  settingsModal.style.display = "flex";
}
function closeSettings() {
  settingsModal.style.display = "none";
}
function openMusic() {
  musicModal.style.display = "flex";
}
function closeMusic() {
  musicModal.style.display = "none";
}
function openAbout() {
  aboutModal.style.display = "flex";
}
function closeAbout() {
  aboutModal.style.display = "none";
}

function applySettings() {
  const pomodoro = parseInt(document.getElementById("setPomodoro").value) || 25;
  const short = parseInt(document.getElementById("setShort").value) || 5;
  const long = parseInt(document.getElementById("setLong").value) || 15;
  const reverse = parseInt(document.getElementById("setReverse").value) || 5;
  const primary = document.getElementById("primaryColor").value;
  const secondary = document.getElementById("secondaryColor").value;

  timeSettings.pomodoro = pomodoro * 60;
  timeSettings.shortBreak = short * 60;
  timeSettings.longBreak = long * 60;
  timeSettings.reverse = reverse * 60;

  document.documentElement.style.setProperty("--primary", primary);
  document.documentElement.style.setProperty("--secondary", secondary);

  switchMode(currentMode);
  closeSettings();
}

function loadMusic(event) {
  const file = event.target.files[0];
  if (file) {
    const url = URL.createObjectURL(file);
    audio.src = url;
    audio.play();
  }
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  // Ask for notification permission
  if ('Notification' in window && Notification.permission !== 'granted') {
    Notification.requestPermission().then(permission => {
      if (permission !== 'granted') {
        console.warn("Notifications are not enabled.");
      }
    });
  }

  switchMode("pomodoro");

  // Register service worker
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js")
      .then(() => console.log("Service Worker Registered"))
      .catch(err => console.error("Service Worker Error:", err));
  }
});
