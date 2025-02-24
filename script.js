// ========================
// Game State Variables
// ========================

let selectedCells = [];
let foundWords = [];
let isDragging = false;
let startCell = null;
let direction = null;
let currentWords = []; // Stores the 15 randomly selected words
let timerInterval = null; // Timer interval
let secondsElapsed = 0; // Total seconds elapsed

// Initialize the game
document.addEventListener("DOMContentLoaded", initializeGame);

// Reset button
document.getElementById("reset-button").addEventListener("click", resetGame);

// ========================
// Timer Functions
// ========================

function startTimer() {
  timerInterval = setInterval(() => {
    secondsElapsed++;
    updateTimerDisplay();
  }, 1000); // Update every second
}

function stopTimer() {
  clearInterval(timerInterval);
}

function updateTimerDisplay() {
  const minutes = Math.floor(secondsElapsed / 60);
  const seconds = secondsElapsed % 60;
  const timerDisplay = `${minutes}:${seconds.toString().padStart(2, "0")}`;
  document.getElementById("timer").textContent = timerDisplay;
}

// ========================
// Core Game Functions
// ========================

function initializeGame() {
  // Reset timer
  secondsElapsed = 0;
  updateTimerDisplay();
  startTimer();

  // Get the word pool from the HTML
  const wordPoolElement = document.getElementById("word-pool");
  const wordPool = JSON.parse(wordPoolElement.dataset.words);

  // Randomly select 15 words from the pool
  currentWords = getRandomWords(wordPool, 15);

  const wordsearch = document.getElementById("wordsearch");
  const wordsContainer = document.getElementById("words");

  // Clear the grid and word list
  wordsearch.innerHTML = "";
  wordsContainer.innerHTML = "";

  // Create word list display
  createWordListDisplay(wordsContainer);

  // Create the grid
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const cell = createCell(i, j);
      wordsearch.appendChild(cell);
    }
  }

  // Place words and fill random letters
  currentWords.forEach(word => placeWord(word));
  fillRandomLetters();

  // Add touch support
  addTouchSupport();
}

function getRandomWords(pool, count) {
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function createCell(row, col) {
  const cell = document.createElement("div");
  cell.classList.add("cell");
  cell.dataset.row = row;
  cell.dataset.col = col;
  cell.textContent = "";
  cell.addEventListener("mousedown", () => startDrag(cell));
  cell.addEventListener("mouseenter", () => dragOver(cell));
  cell.addEventListener("mouseup", endDrag);
  return cell;
}

function createWordListDisplay(wordsContainer) {
  const wordsBox = document.createElement("div");
  wordsBox.style.border = "1px solid black";
  wordsBox.style.padding = "10px";
  wordsBox.style.display = "grid";
  wordsBox.style.gap = "5px";
  wordsBox.style.marginTop = "20px";
  wordsBox.style.width = "90%";
  wordsBox.style.marginLeft = "auto";
  wordsBox.style.marginRight = "auto";
  wordsBox.style.gridTemplateColumns = "repeat(3, 1fr)";

  const wordsTitle = document.createElement("div");
  wordsTitle.textContent = "Words to find:";
  wordsTitle.style.gridColumn = "1 / -1";
  wordsTitle.style.fontWeight = "bold";
  wordsTitle.style.marginBottom = "10px";
  wordsBox.appendChild(wordsTitle);

  currentWords.forEach(word => {
    const wordElement = document.createElement("div");
    wordElement.textContent = word;
    wordElement.style.fontSize = "0.75em";
    wordsBox.appendChild(wordElement);
  });

  wordsContainer.appendChild(wordsBox);
}

// ========================
// Word Placement
// ========================

function fillRandomLetters() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  document.querySelectorAll(".cell").forEach(cell => {
    if (cell.textContent === "") {
      cell.textContent = letters[Math.floor(Math.random() * letters.length)];
    }
  });
}

// ========================
// User Interaction
// ========================

function startDrag(cell) {
  isDragging = true;
  startCell = cell;
  selectedCells = [cell];
  direction = null;
  cell.classList.add("selected");
}

function dragOver(cell) {
  if (!isDragging || selectedCells.includes(cell)) return;

  if (!direction) {
    direction = getDirection(startCell, cell);
    if (!direction) return;
  }

  if (!isValidDirection(selectedCells[selectedCells.length - 1], cell, direction)) return;

  const missingCells = getMissingCells(selectedCells[selectedCells.length - 1], cell);
  missingCells.forEach(c => c.classList.add("selected"));
  selectedCells.push(...missingCells, cell);
  cell.classList.add("selected");
}

function endDrag() {
  isDragging = false;
  direction = null;
  checkForWord();
}

function getDirection(start, end) {
  const rowDiff = parseInt(end.dataset.row) - parseInt(start.dataset.row);
  const colDiff = parseInt(end.dataset.col) - parseInt(start.dataset.col);

  if (rowDiff === 0) return "horizontal";
  if (colDiff === 0) return "vertical";
  if (Math.abs(rowDiff) === Math.abs(colDiff)) return "diagonal";
  return null;
}

function isValidDirection(last, cell, direction) {
  const lastRow = parseInt(last.dataset.row);
  const lastCol = parseInt(last.dataset.col);
  const row = parseInt(cell.dataset.row);
  const col = parseInt(cell.dataset.col);

  switch (direction) {
    case "horizontal":
      return row === lastRow;
    case "vertical":
      return col === lastCol;
    case "diagonal":
      return Math.abs(row - lastRow) === Math.abs(col - lastCol);
    default:
      return false;
  }
}

function getMissingCells(last, current) {
  let missingCells = [];
  const rowStep = Math.sign(parseInt(current.dataset.row) - parseInt(last.dataset.row));
  const colStep = Math.sign(parseInt(current.dataset.col) - parseInt(last.dataset.col));
  let row = parseInt(last.dataset.row) + rowStep;
  let col = parseInt(last.dataset.col) + colStep;

  while (row !== parseInt(current.dataset.row) || col !== parseInt(current.dataset.col)) {
    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    if (cell) missingCells.push(cell);
    row += rowStep;
    col += colStep;
  }

  return missingCells;
}

function checkForWord() {
  const selectedWord = selectedCells.map(cell => cell.textContent).join("");
  if (currentWords.includes(selectedWord) && !foundWords.includes(selectedWord)) {
    foundWords.push(selectedWord);
    selectedCells.forEach(cell => {
      cell.classList.add("found");
      cell.classList.remove("selected");
    });

    document.querySelectorAll("#words div").forEach(el => {
      if (el.textContent === selectedWord) el.classList.add("found");
    });

    if (foundWords.length === currentWords.length) {
      stopTimer();
      alert("You found all the words!");
    }
  } else {
    selectedCells.forEach(cell => cell.classList.remove("selected"));
  }
  selectedCells = [];
}

// ========================
// Touch Support
// ========================

function addTouchSupport() {
  document.querySelectorAll(".cell").forEach(cell => {
    cell.addEventListener("touchstart", e => { e.preventDefault(); startDrag(e.target); });
    cell.addEventListener("touchmove", e => { e.preventDefault(); dragOver(document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY)); });
    cell.addEventListener("touchend", endDrag);
  });
}

// ========================
// Reset Functionality
// ========================

function resetGame() {
  document.getElementById("wordsearch").innerHTML = "";
  selectedCells = [];
  foundWords = [];
  stopTimer();
  initializeGame();
}
