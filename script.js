// Game state
let selectedCells = [];
let foundWords = [];
let isDragging = false;
let startCell = null;
let direction = null;
let currentWords = [];
let secondsElapsed = 0;
let score = 0;
let timerInterval = null;

// Initialize the game
document.addEventListener("DOMContentLoaded", () => {
    initializeGame();
    updateSolvedWordStyle();
    updateHighlightColor();

    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }
    createOptionsMenu();
});

// Reset button
document.getElementById("reset-button").addEventListener("click", resetGame);

// ========================
// Options Menu Functions
// ========================
function createOptionsMenu() {
    const container = document.createElement('div');
    container.id = 'options-container';
    container.innerHTML = `
        <button id="options-button">☰</button>
        <div id="options-menu" class="hidden">
            <button id="dark-mode-toggle">Toggle Dark Mode</button>
            <h3>Word Found Display:</h3>
            <button id="style-original">Original</button>
            <button id="style-bold">Bold</button>
            <button id="style-highlighted">Highlighted</button>
            <h3>Highlight Color:</h3>
            <input type="color" id="highlight-color-picker" value="#4984B8">
        </div>
    `;
    document.body.appendChild(container);

    document.getElementById('dark-mode-toggle').addEventListener('click', toggleDarkMode);
    document.getElementById('style-original').addEventListener('click', () => changeSolvedWordStyle('original'));
    document.getElementById('style-bold').addEventListener('click', () => changeSolvedWordStyle('bold'));
    document.getElementById('style-highlighted').addEventListener('click', () => changeSolvedWordStyle('highlighted'));
    document.getElementById('options-button').addEventListener('click', toggleOptionsMenu);
    document.getElementById('highlight-color-picker').addEventListener('input', changeHighlightColor);
}

function toggleDarkMode() {
    const body = document.body;
    body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', body.classList.contains('dark-mode'));
    updateSolvedWordStyle();
}

function changeSolvedWordStyle(style) {
    localStorage.setItem('solvedWordStyle', style);
    updateSolvedWordStyle();
}

function updateSolvedWordStyle() {
    const style = localStorage.getItem('solvedWordStyle') || 'original';
    document.querySelectorAll('.found').forEach(word => {
        word.classList.remove('bold-style', 'highlight-style', 'original-style');
        word.classList.add(`${style}-style`);
    });
}

function changeHighlightColor(event) {
    const color = event.target.value;
    localStorage.setItem('highlightColor', color);
    updateHighlightColor();
}

function updateHighlightColor() {
    const color = localStorage.getItem('highlightColor') || '#4984B8';
    document.documentElement.style.setProperty('--highlight-color', color);
}

function toggleOptionsMenu() {
    document.getElementById('options-menu').classList.toggle('hidden');
}

// ========================
// Timer Functions
// ========================
function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        secondsElapsed++;
        updateTimerDisplay();
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

function updateTimerDisplay() {
    const minutes = Math.floor(secondsElapsed / 60);
    const seconds = secondsElapsed % 60;
    document.getElementById("timer").textContent = 
        `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

// ========================
// Core Game Functions
// ========================
function initializeGame() {
    stopTimer();
    document.getElementById("wordsearch").innerHTML = "";
    
    // Reset game state
    score = 0;
    secondsElapsed = 0;
    selectedCells = [];
    foundWords = [];
    
    // Initialize displays
    updateScoreDisplay();
    updateTimerDisplay();

    // Setup game board
    const wordPool = JSON.parse(document.getElementById("word-pool").dataset.words);
    currentWords = getRandomWords(wordPool, 15);

    const wordsearch = document.getElementById("wordsearch");
    const wordsContainer = document.getElementById("words");

    // Clear containers
    wordsearch.innerHTML = "";
    wordsContainer.innerHTML = "";

    // Create words list
    const wordsBox = document.createElement("div");
    wordsBox.style.cssText = `border: 1px solid black; padding: 10px; display: grid; 
        gap: 5px; margin: 20px auto; width: 90%; grid-template-columns: repeat(3, 1fr);`;

    const wordsTitle = document.createElement("div");
    wordsTitle.textContent = "Words to find:";
    wordsTitle.style.cssText = "grid-column: 1 / -1; font-weight: bold; margin-bottom: 10px;";
    wordsBox.appendChild(wordsTitle);

    currentWords.forEach(word => {
        const wordElement = document.createElement("div");
        wordElement.textContent = word;
        wordElement.style.cssText = "white-space: nowrap; overflow: visible; font-size: 0.75em;";
        wordsBox.appendChild(wordElement);
    });
    wordsContainer.appendChild(wordsBox);

    // Create grid
    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
            wordsearch.appendChild(createCell(i, j));
        }
    }

    currentWords.forEach(word => placeWord(word));
    fillRandomLetters();
    addTouchSupport();
    startTimer();
    updateSolvedWordStyle();
}

function getRandomWords(pool, count) {
    return [...pool].sort(() => 0.5 - Math.random()).slice(0, count);
}

function createCell(row, col) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.row = row;
    cell.dataset.col = col;
    cell.textContent = "";
    cell.addEventListener("mousedown", () => startDrag(cell));
    cell.addEventListener("mouseenter", () => dragOver(cell));
    cell.addEventListener("mouseup", endDrag);
    return cell;
}

function placeWord(word) {
    const directions = ["horizontal", "vertical", "diagonal"];
    const direction = directions[Math.floor(Math.random() * directions.length)];
    let row, col;

    if (direction === "horizontal") {
        row = Math.floor(Math.random() * 15);
        col = Math.floor(Math.random() * (15 - word.length));
    } else if (direction === "vertical") {
        col = Math.floor(Math.random() * 15);
        row = Math.floor(Math.random() * (15 - word.length));
    } else {
        row = Math.floor(Math.random() * (15 - word.length));
        col = Math.floor(Math.random() * (15 - word.length));
    }

    if (canPlaceWord(word, row, col, direction)) {
        for (let i = 0; i < word.length; i++) {
            let cell;
            if (direction === "horizontal") {
                cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col + i}"]`);
            } else if (direction === "vertical") {
                cell = document.querySelector(`.cell[data-row="${row + i}"][data-col="${col}"]`);
            } else {
                cell = document.querySelector(`.cell[data-row="${row + i}"][data-col="${col + i}"]`);
            }
            cell.textContent = word[i];
        }
    } else {
        placeWord(word); // Retry placement
    }
}

function canPlaceWord(word, row, col, direction) {
    for (let i = 0; i < word.length; i++) {
        const cell = direction === "horizontal"
            ? document.querySelector(`.cell[data-row="${row}"][data-col="${col + i}"]`)
            : direction === "vertical"
            ? document.querySelector(`.cell[data-row="${row + i}"][data-col="${col}"]`)
            : document.querySelector(`.cell[data-row="${row + i}"][data-col="${col + i}"]`);

        if (!cell || (cell.textContent !== "" && cell.textContent !== word[i])) {
            return false;
        }
    }
    return true;
}

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
    if (!cell) return;
    isDragging = true;
    startCell = cell;
    selectedCells = [cell];
    direction = null;
    cell.classList.add("selected");
}

function dragOver(cell) {
    if (!isDragging || !startCell) return;

    if (!selectedCells.includes(startCell)) {
        selectedCells = [startCell];
        startCell.classList.add("selected");
    }

    const startRow = parseInt(startCell.dataset.row);
    const startCol = parseInt(startCell.dataset.col);
    const currentRow = parseInt(cell.dataset.row);
    const currentCol = parseInt(cell.dataset.col);

    const rowDiff = currentRow - startRow;
    const colDiff = currentCol - startCol;

    let newDirection = null;
    if (rowDiff === 0) newDirection = "horizontal";
    else if (colDiff === 0) newDirection = "vertical";
    else if (Math.abs(rowDiff) === Math.abs(colDiff)) newDirection = "diagonal";
    else return;

    if (!direction || newDirection !== direction) {
        direction = newDirection;
    }

    const rowStep = Math.sign(rowDiff);
    const colStep = Math.sign(colDiff);

    let row = startRow;
    let col = startCol;
    let newSelection = [startCell];

    while (row !== currentRow || col !== currentCol) {
        row += rowStep;
        col += colStep;
        const nextCell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        if (!nextCell) break;
        newSelection.push(nextCell);
    }

    if (newSelection[newSelection.length - 1] !== cell) return;

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

        updateSolvedWordStyle();

        document.querySelectorAll("#words div").forEach(el => {
            if (el.textContent === selectedWord) el.classList.add("found");
        });

        if (foundWords.length === currentWords.length) {
            stopTimer();
            alert("Good Job Big Dog!");
        }
    } else {
        selectedCells.forEach(cell => {
            cell.classList.remove("selected");
        });
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
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (target?.classList.contains("cell")) {
        startDrag(target);
    }
}

function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (target?.classList.contains("cell")) {
        if (target !== selectedCells[selectedCells.length - 1]) {
            dragOver(target);
        }
    }
}

function handleTouchEnd() {
    endDrag();
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
