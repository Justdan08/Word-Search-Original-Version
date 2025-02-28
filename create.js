// Get references to key elements
const fileTitleInput = document.getElementById('fileTitle');
const titleInput = document.getElementById('titleInput');
const h1Input = document.getElementById('h1Input');
const link1Option = document.getElementById('link1Option');
const link1HrefInput = document.getElementById('link1Href');
const link2Option = document.getElementById('link2Option');
const link2HrefInput = document.getElementById('link2Href');
const newWordInput = document.getElementById('newWord');
const addWordBtn = document.getElementById('addWordBtn');
const wordPoolDisplay = document.getElementById('wordPoolDisplay');
const finishBtn = document.getElementById('finishBtn');
const outputModal = document.getElementById('outputModal');
const finalCodeTextarea = document.getElementById('finalCode');
const downloadBtn = document.getElementById('downloadBtn');
const closeModalBtn = document.getElementById('closeModal');

// Two variables to hold word pool data:
// If the user pastes a group (detected by comma or newline), we'll store it in preformattedPool.
// Otherwise, we build an array of individual words.
let wordsArray = [];
let preformattedPool = null;

// Update the word pool display
function updateWordPoolDisplay() {
  if (preformattedPool !== null) {
    wordPoolDisplay.textContent = preformattedPool;
  } else {
    const formatted = wordsArray.map(word => `"${word}"`).join(", ");
    wordPoolDisplay.textContent = formatted;
  }
}

// Add word button event
addWordBtn.addEventListener('click', () => {
  const inputVal = newWordInput.value.trim();
  if (inputVal === "") return;
  
  // If the input contains a comma or newline, assume it is a preformatted list.
  if (inputVal.includes(",") || inputVal.includes("\n")) {
    preformattedPool = inputVal;
    wordsArray = []; // Clear any individual words
    updateWordPoolDisplay();
  } else {
    // If a preformatted pool already exists, alert the user.
    if (preformattedPool !== null) {
      alert("A preformatted word list is already set. Clear it to add individual words.");
    } else {
      wordsArray.push(inputVal.toUpperCase());
      updateWordPoolDisplay();
    }
  }
  newWordInput.value = "";
  newWordInput.focus();
});

// When drop-down selection changes, check for "Once more with feeling!"
link1Option.addEventListener('change', function() {
  if (link1Option.value === "once") {
    link1HrefInput.value = "puzzle1.HTML";
    link1HrefInput.disabled = true;
  } else {
    link1HrefInput.disabled = false;
    link1HrefInput.value = "";
  }
});
link2Option.addEventListener('change', function() {
  if (link2Option.value === "once") {
    link2HrefInput.value = "puzzle1.HTML";
    link2HrefInput.disabled = true;
  } else {
    link2HrefInput.disabled = false;
    link2HrefInput.value = "";
  }
});

// Finish button event: generate the final HTML using the casual template
finishBtn.addEventListener('click', () => {
  const pageTitle = titleInput.value.trim() || 'Marvel Word Search';
  const h1Text = h1Input.value.trim() || 'Marvel';
  
  // For Link 1: use default href if input is empty
  const link1DefaultHref = link1Option.selectedOptions[0].getAttribute('data-default-href');
  const link1Text = link1Option.selectedOptions[0].textContent;
  const link1Href = link1HrefInput.value.trim() || link1DefaultHref;
  
  // For Link 2: use default href if input is empty
  const link2DefaultHref = link2Option.selectedOptions[0].getAttribute('data-default-href');
  const link2Text = link2Option.selectedOptions[0].textContent;
  const link2Href = link2HrefInput.value.trim() || link2DefaultHref;
  
  // Determine the word pool output
  let wordsOutput;
  if (preformattedPool !== null) {
    // Assume preformattedPool already contains properly formatted words.
    wordsOutput = `[${preformattedPool}]`;
  } else {
    wordsOutput = JSON.stringify(wordsArray);
  }
  
  // Construct the final HTML string using the casual template
  let htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageTitle}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>${h1Text}</h1>
  <div id="options-container"></div>
  <div id="timer">0:00</div>
  <div id="wordsearch"></div>
  <div id="word-list">
    <div id="words"></div>
    <button id="reset-button">Reset Game</button>
    <div class="nav-links">
      <a href="${link1Href}">${link1Text}</a>
      <a href="${link2Href}">${link2Text}</a>
    </div>
  </div>
  
  <!-- Marvel word pool -->
  <div id="word-pool" data-words='${wordsOutput}'></div>
  
  <!-- Puzzle-specific settings -->
  <script>
    const gridSize = 15;  // Defines the 15x15 grid size
  </script>
  
  <script src="script.js"></script>
</body>
</html>`;
  
  // Display the generated HTML in the modal textarea
  finalCodeTextarea.value = htmlContent;
  outputModal.style.display = 'flex';
});

// Download the generated HTML file using the File Title field (or default filename)
downloadBtn.addEventListener('click', () => {
  const content = finalCodeTextarea.value;
  const blob = new Blob([content], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const fileTitle = fileTitleInput.value.trim() || "word-search-puzzle.html";
  a.href = url;
  a.download = fileTitle;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

// Close the modal popup
closeModalBtn.addEventListener('click', () => {
  outputModal.style.display = 'none';
});
