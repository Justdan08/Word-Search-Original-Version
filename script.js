// Game state
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
// User Interaction
// ========================

function startDrag(cell) {
  isDragging = true;
  startCell = cell;
  selectedCells = [cell];
  direction = null; // Reset direction on new drag
  cell.classList.add("selected");
}

function dragOver(cell) {
  if (!isDragging || !startCell) return;

  // Ensure startCell remains in selection
  if (!selectedCells.includes(startCell)) {
    selectedCells = [startCell];
    startCell.classList.add("selected");
  }

  // Get row/col positions
  const startRow = parseInt(startCell.dataset.row);
  const startCol = parseInt(startCell.dataset.col);
  const currentRow = parseInt(cell.dataset.row);
  const currentCol = parseInt(cell.dataset.col);

  // Calculate direction deltas
  const rowDiff = currentRow - startRow;
  const colDiff = currentCol - startCol;

  // Determine movement direction
  let newDirection = null;
  if (rowDiff === 0) newDirection = "horizontal";
  else if (colDiff === 0) newDirection = "vertical";
  else if (Math.abs(rowDiff) === Math.abs(colDiff)) newDirection = "diagonal";
  else return; // Ignore invalid movements

  // Allow changing direction dynamically
  if (!direction || newDirection !== direction) {
    direction = newDirection;
  }

  // Calculate step values
  const rowStep = Math.sign(rowDiff);
  const colStep = Math.sign(colDiff);

  // Build new selection path
  let row = startRow;
  let col = startCol;
  let newSelection = [startCell]; // Start cell remains selected

  while (row !== currentRow || col !== currentCol) {
    row += rowStep;
    col += colStep;
    const nextCell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    if (!nextCell) break;
    newSelection.push(nextCell);
  }

  // Ensure the last cell is the current cell to keep valid paths
  if (newSelection[newSelection.length - 1] !== cell) return;

  // Apply new selection
  selectedCells.forEach(c => c.classList.remove("selected"));
  newSelection.forEach(c => c.classList.add("selected"));
  selectedCells = newSelection;
}

function endDrag() {
  isDragging = false;
  direction = null;
  checkForWord();
}

function checkForWord() {
  const selectedWord = selectedCells.map(cell => cell.textContent).join("");
  if (currentWords.includes(selectedWord) && !foundWords.includes(selectedWord)) {
    foundWords.push(selectedWord);
    selectedCells.forEach(cell => {
      if (!cell.classList.contains("found")) {
        cell.classList.add("found");
      }
      cell.classList.remove("selected");
    });

    // Mark word as found in the word list
    document.querySelectorAll("#words div").forEach(el => {
      if (el.textContent === selectedWord) el.classList.add("found");
    });

    if (foundWords.length === currentWords.length) {
      stopTimer();
      alert("Good Job Big Dog!");
    }
  } else {
    selectedCells.forEach(cell => cell.classList.remove("selected"));
  }
  selectedCells = [];
}

// ========================
// Mobile Support
// ========================

function addTouchSupport() {
  const cells = document.querySelectorAll(".cell");
  cells.forEach(cell => {
    cell.addEventListener("touchstart", handleTouchStart);
    cell.addEventListener("touchmove", handleTouchMove);
    cell.addEventListener("touchend", handleTouchEnd);
  });
}

function handleTouchStart(e) {
  e.preventDefault();
  startDrag(e.target);
}

function handleTouchMove(e) {
  e.preventDefault();
  const touch = e.touches[0];
  const target = document.elementFromPoint(touch.clientX, touch.clientY);
  if (target?.classList.contains("cell")) dragOver(target);
}

function handleTouchEnd() {
  endDrag();
}
