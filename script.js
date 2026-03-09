/* ===== AUDIO ===== */
const bgMusic = new Audio("audio/background.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.3;
bgMusic.play().catch(() => console.log("Autoplay blocked; click to start music"));

const correctSound = new Audio("audio/correct.wav");
const wrongSound = new Audio("audio/wrong.wav");
const placeSound = new Audio("audio/place.wav");
const restartSound = new Audio("audio/restart.wav");
const clearSound = new Audio("audio/clear.wav");
const undoSound = new Audio("audio/backforward.wav");

/* ===== ELEMENTS ===== */
const plots = document.querySelectorAll(".plot");
const cropContainer = document.getElementById("cropContainer");
const roundText = document.getElementById("round");
const scoreText = document.getElementById("score");

/* ===== VARIABLES ===== */
let score = 0;
let round = 1;
let draggedCrop = null;
const totalRounds = 3;

/* ===== UNDO/REDO STACKS ===== */
let undoStack = [];
let redoStack = [];

/* ===== CROPS ===== */
const cropData = {
  corn: { icon: "🌽", name: "Corn" },
  pumpkin: { icon: "🎃", name: "Pumpkin" },
  beans: { icon: "🫘", name: "Beans" },
  tomato: { icon: "🍅", name: "Tomato" },
  lettuce: { icon: "🥬", name: "Lettuce" },
  carrot: { icon: "🥕", name: "Carrot" },
  potato: { icon: "🥔", name: "Potato" }
};

/* ===== ALL CORRECT ROTATIONS ===== */
const correctRotationsList = [
  ["corn", "beans", "tomato", "carrot"],
  ["corn", "beans", "lettuce", "carrot"],
  ["pumpkin", "beans", "tomato", "carrot"],
  ["pumpkin", "beans", "lettuce", "carrot"],
  ["corn", "lettuce", "beans", "carrot"],
  ["pumpkin", "lettuce", "beans", "carrot"],
  ["carrot", "corn", "beans", "tomato"],
  ["carrot", "corn", "beans", "lettuce"],
  ["potato", "corn", "beans", "tomato"],
  ["potato", "pumpkin", "beans", "lettuce"],
  ["carrot", "pumpkin", "beans", "tomato"],
  ["carrot", "pumpkin", "beans", "lettuce"]
];

/* ===== START GAME ===== */
startRound();

/* ===== START ROUND ===== */
function startRound(){

  // Pick a valid rotation
  const validRotation = shuffle([...correctRotationsList])[0];

  // Use its crops
  const selectedCrops = [...validRotation];

  // Shuffle so learner must arrange them
  const misarranged = shuffle([...selectedCrops]);

  cropContainer.innerHTML="";

  misarranged.forEach(crop=>{
    const div = document.createElement("div");
    div.className="crop";
    div.draggable = true;
    div.id = crop;
    div.innerHTML = cropData[crop].icon + " " + cropData[crop].name;

    div.addEventListener("dragstart",()=>{
      draggedCrop = crop;
    });

    cropContainer.appendChild(div);
  });

  // Reset plots
  plots.forEach(plot=>{
    plot.innerHTML = plot.id.toUpperCase();
    plot.dataset.crop="";
  });

  // Clear undo/redo stacks
  undoStack = [];
  redoStack = [];
}

/* ===== DRAG & DROP ===== */
plots.forEach(plot => {
  plot.addEventListener("dragover", e => e.preventDefault());
  plot.addEventListener("drop", () => {
    if (!draggedCrop) return;

    // Play place sound
    placeSound.currentTime = 0;
    placeSound.play();

    // Save previous state for undo
    const previousState = Array.from(plots).map(p => p.dataset.crop || "");
    undoStack.push(previousState);
    redoStack = []; // clear redo stack

    plot.dataset.crop = draggedCrop;
    plot.innerHTML = "";
    for (let i = 0; i < 12; i++) {
      const plant = document.createElement("div");
      plant.className = "plant";
      plant.innerHTML = cropData[draggedCrop].icon;
      plot.appendChild(plant);
    }
    checkGame();
  });
});

/* ===== CHECK GAME ===== */
function checkGame() {
  const filled = Array.from(plots).every(plot => plot.dataset.crop);
  if (!filled) return;

  const learnerArrangement = Array.from(plots).map(plot => plot.dataset.crop);

  const correct = correctRotationsList.some(rotation => {
    return rotation.join() === learnerArrangement.join();
  });

  if (correct) {
    score += 3;
    scoreText.textContent = score;

    // Play correct sound
    correctSound.currentTime = 0;
    correctSound.play();

    alert("🎉 Correct Crop Rotation! +3 points");
    nextRound();
  } else {
    // Play wrong sound
    wrongSound.currentTime = 0;
    wrongSound.play();

    alert("❌ Incorrect! Showing correct answer...");
    showCorrectAnswer();
  }
}

/* ===== SHOW CORRECT ANSWER ===== */
function showCorrectAnswer() {
  const learnerArrangement = Array.from(plots).map(plot => plot.dataset.crop);
  const correctRotation = correctRotationsList.find(rotation => {
    return rotation.filter(c => learnerArrangement.includes(c)).length === 4;
  }) || correctRotationsList[0];

  plots.forEach((plot, i) => {
    const correctCrop = correctRotation[i];
    plot.innerHTML = "";
    for (let j = 0; j < 12; j++) {
      const plant = document.createElement("div");
      plant.className = "plant";
      plant.innerHTML = cropData[correctCrop].icon;
      plot.appendChild(plant);
    }
  });

  setTimeout(() => nextRound(), 3000);
}

/* ===== NEXT ROUND ===== */
function nextRound() {
  if (round < totalRounds) {
    round++;
    roundText.textContent = round;
    startRound();
  } else {
    alert("🏁 Game Over! Final Score: " + score);
  }
}

/* ===== RESET GAME ===== */
function resetGame() {
  score = 0;
  round = 1;
  scoreText.textContent = score;
  roundText.textContent = round;
  startRound();
  restartSound.play();
}

/* ===== CLEAR PLOTS ===== */
function clearPlots() {
  plots.forEach(plot => {
    plot.innerHTML = plot.id.toUpperCase();
    plot.dataset.crop = "";
  });

  // Save empty state for undo
  const emptyState = Array.from(plots).map(p => p.dataset.crop || "");
  undoStack.push(emptyState);
  redoStack = [];
  clearSound.play();
}

/* ===== UNDO ===== */
function undoMove() {
  undoSound.play();
  if (undoStack.length === 0) return;
  const lastState = undoStack.pop();
  const currentState = Array.from(plots).map(p => p.dataset.crop || "");
  redoStack.push(currentState);

  plots.forEach((plot, i) => {
    const crop = lastState[i];
    plot.dataset.crop = crop;
    plot.innerHTML = "";
    if (crop) {
      for (let j = 0; j < 12; j++) {
        const plant = document.createElement("div");
        plant.className = "plant";
        plant.innerHTML = cropData[crop].icon;
        plot.appendChild(plant);
      }
    } else {
      plot.innerHTML = plot.id.toUpperCase();
    }
  });

}

/* ===== REDO ===== */
function redoMove() {
  undoSound.play();
  if (redoStack.length === 0) return;
  const nextState = redoStack.pop();
  const currentState = Array.from(plots).map(p => p.dataset.crop || "");
  undoStack.push(currentState);

  plots.forEach((plot, i) => {
    const crop = nextState[i];
    plot.dataset.crop = crop;
    plot.innerHTML = "";
    if (crop) {
      for (let j = 0; j < 12; j++) {
        const plant = document.createElement("div");
        plant.className = "plant";
        plant.innerHTML = cropData[crop].icon;
        plot.appendChild(plant);
      }
    } else {
      plot.innerHTML = plot.id.toUpperCase();
    }
  });

}

/* ===== TOGGLE MUSIC ===== */
function toggleMusic() {
  if (bgMusic.paused) {
    bgMusic.play();
  } else {
    bgMusic.pause();
  }
}

/* ===== SHUFFLE UTILITY ===== */
function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}