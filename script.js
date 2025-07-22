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
let reverseStartTime = null;

const modeButtons = document.querySelectorAll(".mode-button");
const earnedBreakDisplay = document.getElementById("earned-break");
const settingsModal = document.getElementById("settingsModal");
const musicModal = document.getElementById("musicModal");
const aboutModal = document.getElementById("aboutModal");
const timerDisplay = document.getElementById("timer-display");
const progressBar = document.getElementById("progress-bar");
const progressPercent = document.getElementById("progress-percent");
const audio = document.getElementById("bgm");

function switchMode(mode) {
  clearInterval(timer);
  isRunning = false;
  currentMode = mode;

  modeButtons.forEach(btn => btn.classList.remove("active"));
  document.getElementById(`${mode}-mode`).classList.add("active");

  if (mode === "reverse") {
    totalSeconds = timeSettings.reverse;
    reverseStartTime = Date.now();
    earnedBreakDisplay.style.display = "block";
    earnedBreakDisplay.innerText = "Work for up to 1 hour. The longer you work, the longer break you earn.";
    document.getElementById("shortBreak-mode").style.display = "none";
    document.getElementById("longBreak-mode").style.display = "none";
  } else {
    totalSeconds = timeSettings[mode];
    earnedBreakDisplay.style.display = "none";
    document.getElementById("shortBreak-mode").style.display = "inline-block";
    document.getElementById("longBreak-mode").style.display = "inline-block";
  }

  secondsLeft = totalSeconds;
  updateDisplay();
  updateProgressBar();
}

function toggleTimer() {
  if (isRunning) {
    clearInterval(timer);
    isRunning = false;
  } else {
    isRunning = true;
    timer = setInterval(() => {
      if (secondsLeft > 0) {
        secondsLeft--;
        updateDisplay();
        updateProgressBar();
      } else {
        clearInterval(timer);
        isRunning = false;
        alert("Time's up!");
        if (audio && !audio.paused) audio.pause();

        if (currentMode === "reverse") {
          const minutesWorked = Math.floor((Date.now() - reverseStartTime) / 60000);
          let earned = 0;

          if (minutesWorked >= 56) earned = 30;
          else if (minutesWorked >= 46) earned = 15;
          else if (minutesWorked >= 31) earned = 10;
          else if (minutesWorked >= 21) earned = 5;
          else if (minutesWorked >= 5) earned = 2;

          alert(`You earned a ${earned}-minute break!`);
        }
      }
    }, 1000);
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

window.onload = () => {
  settingsModal.style.display = "none";
  musicModal.style.display = "none";
  aboutModal.style.display = "none";
  switchMode("pomodoro");
};
