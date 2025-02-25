/******************************************************
  Sorting Algorithm Visualizer App (scripts2.js)
  -----------------------------------------
  This app visualizes 10 sorting algorithms with interactive
  controls to adjust array size, speed, and algorithm selection.
  Real-time performance metrics (comparisons, swaps, steps) are
  displayed. Clicking the "Theory" button opens a modal with
  details on the selected algorithm.
******************************************************/

// Global variables
let canvas, ctx;
let arr = [];
let sorting = false;
let sortGen = null;
let metrics = { comparisons: 0, swaps: 0, steps: 0 };

// UI Elements
const arraySizeSlider = document.getElementById("arraySize");
const arraySizeDisplay = document.getElementById("arraySizeDisplay");
const speedSlider = document.getElementById("speed");
const speedDisplay = document.getElementById("speedDisplay");
const algorithmSelect = document.getElementById("algorithm");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const theoryBtn = document.getElementById("theoryBtn");
const comparisonsEl = document.getElementById("comparisons");
const swapsEl = document.getElementById("swaps");
const stepsEl = document.getElementById("steps");
const currentAlgoEl = document.getElementById("currentAlgo");

// Theory Modal Elements
const theoryModal = document.getElementById("theoryModal");
const closeModal = document.getElementById("closeModal");
const theoryContent = document.getElementById("theoryContent");

/***************************************************
 * Canvas & Array Setup
 ***************************************************/

// Adjust canvas size to fill the .visualizer container
function setupCanvas() {
  canvas = document.getElementById("sortCanvas");
  canvas.width = document.querySelector(".visualizer").clientWidth;
  canvas.height = document.querySelector(".visualizer").clientHeight;
  ctx = canvas.getContext("2d");
}
setupCanvas();
window.addEventListener("resize", setupCanvas);

// Reset array with random values
function resetArray() {
  sorting = false;
  sortGen = null;
  metrics = { comparisons: 0, swaps: 0, steps: 0 };
  
  let size = parseInt(arraySizeSlider.value);
  arr = [];
  
  // Populate arr with random bar heights
  for (let i = 0; i < size; i++) {
    arr.push(Math.random() * (canvas.height * 0.9) + canvas.height * 0.1);
  }
  
  drawArray();
  updateMetrics();
}

// Draw the array as vertical bars with color gradients
function drawArray() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let barWidth = canvas.width / arr.length;
  const barSpacing = arr.length > 100 ? 0 : 1; // Add spacing for better visibility unless many bars
  const adjustedBarWidth = barWidth - barSpacing;
  
  // Create gradient bar colors based on height
  for (let i = 0; i < arr.length; i++) {
    const height = arr[i];
    const normalizedHeight = height / canvas.height; // 0 to 1 value
    
    // Create gradient for each bar
    let gradient = ctx.createLinearGradient(
      i * barWidth, 
      canvas.height - height, 
      i * barWidth, 
      canvas.height
    );
    
    // Different gradient depending on bar height - with more subtle colors
    if (normalizedHeight < 0.33) {
      gradient.addColorStop(0, '#6C63FF'); // Purple/indigo base
      gradient.addColorStop(1, '#5A52F0'); // Slightly darker
    } else if (normalizedHeight < 0.66) {
      gradient.addColorStop(0, '#7986CB'); // Lighter purple/blue
      gradient.addColorStop(1, '#6C63FF'); // Base purple
    } else {
      gradient.addColorStop(0, '#9FA8DA'); // Very light purple/lavender
      gradient.addColorStop(1, '#7986CB'); // Mid purple/blue
    }
    
    // Fill the bar
    ctx.fillStyle = gradient;
    
    // Draw bar with slightly rounded top
    const x = i * barWidth;
    const y = canvas.height - height;
    const radius = Math.min(adjustedBarWidth / 2, 3); // Limit the radius for a more subtle rounding
    
    // Bar body
    ctx.beginPath();
    ctx.moveTo(x, canvas.height);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.lineTo(x + adjustedBarWidth - radius, y);
    ctx.arcTo(x + adjustedBarWidth, y, x + adjustedBarWidth, y + radius, radius);
    ctx.lineTo(x + adjustedBarWidth, canvas.height);
    ctx.fill();
    
    // Add subtle glossy effect
    const glossGradient = ctx.createLinearGradient(x, y, x + adjustedBarWidth, y);
    glossGradient.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
    glossGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)');
    glossGradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
    
    ctx.fillStyle = glossGradient;
    const glossHeight = height * 0.1;
    ctx.fillRect(x, y, adjustedBarWidth, glossHeight);
  }
  
  // Add a subtle grid in the background
  drawGrid();
}

// Draw a subtle grid in the background
function drawGrid() {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 0.5;
  
  // Vertical grid lines
  const gridSpacing = 30;
  ctx.beginPath();
  for (let x = 0; x < canvas.width; x += gridSpacing) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
  }
  
  // Horizontal grid lines
  for (let y = 0; y < canvas.height; y += gridSpacing) {
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
  }
  ctx.stroke();
  
  // Add a subtle glow at the bottom
  const gradientHeight = 60;
  const glow = ctx.createLinearGradient(0, canvas.height - gradientHeight, 0, canvas.height);
  glow.addColorStop(0, 'rgba(108, 99, 255, 0)');
  glow.addColorStop(1, 'rgba(108, 99, 255, 0.06)');
  
  ctx.fillStyle = glow;
  ctx.fillRect(0, canvas.height - gradientHeight, canvas.width, gradientHeight);
}

// Update metric displays
function updateMetrics() {
  comparisonsEl.innerHTML = "Comparisons: <span>" + metrics.comparisons + "</span>";
  swapsEl.innerHTML = "Swaps: <span>" + metrics.swaps + "</span>";
  stepsEl.innerHTML = "Steps: <span>" + metrics.steps + "</span>";
}

/***************************************************
 * Sorting Algorithms (Generators)
 ***************************************************/

// 1) Bubble Sort
function* bubbleSort(a) {
  let n = a.length;
  let swapped;
  
  for (let i = 0; i < n - 1; i++) {
    swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      metrics.comparisons++;
      yield { type: "compare", indices: [j, j + 1] };
      
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swapped = true;
        metrics.swaps++;
        yield { type: "swap", indices: [j, j + 1] };
      }
    }
    if (!swapped) break;
  }
  yield { type: "done" };
}

// 2) Insertion Sort
function* insertionSort(a) {
  for (let i = 1; i < a.length; i++) {
    let key = a[i];
    let j = i - 1;
    
    while (j >= 0 && a[j] > key) {
      metrics.comparisons++;
      a[j + 1] = a[j];
      metrics.swaps++;
      yield { type: "swap", indices: [j, j + 1] };
      j--;
    }
    a[j + 1] = key;
    yield { type: "insert", index: i };
  }
  yield { type: "done" };
}

// 3) Selection Sort
function* selectionSort(a) {
  let n = a.length;
  
  for (let i = 0; i < n; i++) {
    let minIndex = i;
    
    for (let j = i + 1; j < n; j++) {
      metrics.comparisons++;
      yield { type: "compare", indices: [minIndex, j] };
      
      if (a[j] < a[minIndex]) {
        minIndex = j;
      }
    }
    if (minIndex !== i) {
      [a[i], a[minIndex]] = [a[minIndex], a[i]];
      metrics.swaps++;
      yield { type: "swap", indices: [i, minIndex] };
    }
  }
  yield { type: "done" };
}

// 4) Merge Sort (iterative, bottom-up)
function* mergeSort(a) {
  let n = a.length;
  let currSize = 1;
  
  while (currSize < n) {
    for (let leftStart = 0; leftStart < n - 1; leftStart += 2 * currSize) {
      let mid = Math.min(leftStart + currSize - 1, n - 1);
      let rightEnd = Math.min(leftStart + 2 * currSize - 1, n - 1);
      yield* merge(a, leftStart, mid, rightEnd);
    }
    currSize *= 2;
  }
  yield { type: "done" };
}

function* merge(a, left, mid, right) {
  let n1 = mid - left + 1;
  let n2 = right - mid;
  
  let leftArr = a.slice(left, mid + 1);
  let rightArr = a.slice(mid + 1, right + 1);
  
  let i = 0, j = 0, k = left;
  
  while (i < n1 && j < n2) {
    metrics.comparisons++;
    yield { type: "compare", indices: [k] };
    
    if (leftArr[i] <= rightArr[j]) {
      a[k] = leftArr[i];
      i++;
    } else {
      a[k] = rightArr[j];
      j++;
    }
    metrics.swaps++;
    yield { type: "swap", indices: [k] };
    k++;
  }
  
  while (i < n1) {
    a[k] = leftArr[i];
    i++;
    metrics.swaps++;
    yield { type: "swap", indices: [k] };
    k++;
  }
  while (j < n2) {
    a[k] = rightArr[j];
    j++;
    metrics.swaps++;
    yield { type: "swap", indices: [k] };
    k++;
  }
}

// 5) Quick Sort (iterative with stack)
function* quickSort(a, low, high) {
  let stack = [];
  stack.push({ low: low, high: high });
  
  while (stack.length > 0) {
    let { low, high } = stack.pop();
    
    if (low < high) {
      let p = yield* partition(a, low, high);
      stack.push({ low: low, high: p - 1 });
      stack.push({ low: p + 1, high: high });
    }
  }
  yield { type: "done" };
}

function* partition(a, low, high) {
  let pivot = a[high];
  let i = low - 1;
  
  for (let j = low; j < high; j++) {
    metrics.comparisons++;
    yield { type: "compare", indices: [j, high] };
    
    if (a[j] < pivot) {
      i++;
      [a[i], a[j]] = [a[j], a[i]];
      metrics.swaps++;
      yield { type: "swap", indices: [i, j] };
    }
  }
  [a[i + 1], a[high]] = [a[high], a[i + 1]];
  metrics.swaps++;
  yield { type: "swap", indices: [i + 1, high] };
  
  return i + 1;
}

// 6) Heap Sort
function* heapSort(a) {
  let n = a.length;
  
  // Build max heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    yield* heapify(a, n, i);
  }
  
  // Extract elements one by one
  for (let i = n - 1; i > 0; i--) {
    [a[0], a[i]] = [a[i], a[0]];
    metrics.swaps++;
    yield { type: "swap", indices: [0, i] };
    yield* heapify(a, i, 0);
  }
  yield { type: "done" };
}

function* heapify(a, n, i) {
  let largest = i;
  let left = 2 * i + 1;
  let right = 2 * i + 2;
  
  if (left < n) {
    metrics.comparisons++;
    yield { type: "compare", indices: [largest, left] };
    if (a[left] > a[largest]) largest = left;
  }
  
  if (right < n) {
    metrics.comparisons++;
    yield { type: "compare", indices: [largest, right] };
    if (a[right] > a[largest]) largest = right;
  }
  
  if (largest !== i) {
    [a[i], a[largest]] = [a[largest], a[i]];
    metrics.swaps++;
    yield { type: "swap", indices: [i, largest] };
    yield* heapify(a, n, largest);
  }
}

// 7) Shell Sort
function* shellSort(a) {
  let n = a.length;
  
  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    for (let i = gap; i < n; i++) {
      let temp = a[i];
      let j = i;
      
      while (j >= gap && a[j - gap] > temp) {
        metrics.comparisons++;
        a[j] = a[j - gap];
        j -= gap;
        metrics.swaps++;
        yield { type: "swap", indices: [j, j + gap] };
      }
      a[j] = temp;
      yield { type: "insert", index: i };
    }
  }
  yield { type: "done" };
}

// 8) Cocktail Shaker Sort
function* cocktailShakerSort(a) {
  let start = 0;
  let end = a.length - 1;
  let swapped = true;
  
  while (swapped) {
    swapped = false;
    for (let i = start; i < end; i++) {
      metrics.comparisons++;
      yield { type: "compare", indices: [i, i + 1] };
      
      if (a[i] > a[i + 1]) {
        [a[i], a[i + 1]] = [a[i + 1], a[i]];
        swapped = true;
        metrics.swaps++;
        yield { type: "swap", indices: [i, i + 1] };
      }
    }
    if (!swapped) break;
    swapped = false;
    end--;
    
    for (let i = end; i > start; i--) {
      metrics.comparisons++;
      yield { type: "compare", indices: [i - 1, i] };
      
      if (a[i - 1] > a[i]) {
        [a[i - 1], a[i]] = [a[i], a[i - 1]];
        swapped = true;
        metrics.swaps++;
        yield { type: "swap", indices: [i - 1, i] };
      }
    }
    start++;
  }
  yield { type: "done" };
}

// 9) Counting Sort (for non-negative integers only)
function* countingSort(a) {
  // Map values to a range suitable for counting sort (0-canvas.height)
  let min = Math.min(...a);
  let max = Math.max(...a);
  let range = max - min + 1;
  
  // Create count array and output array
  let count = new Array(range).fill(0);
  let output = new Array(a.length);
  
  // Count occurrences of each value
  for (let i = 0; i < a.length; i++) {
    let value = Math.floor(a[i] - min);
    count[value]++;
    metrics.steps++;
    yield { type: "count", index: i };
  }
  
  // Calculate cumulative count
  for (let i = 1; i < count.length; i++) {
    count[i] += count[i - 1];
    metrics.steps++;
  }
  
  // Build the output array
  for (let i = a.length - 1; i >= 0; i--) {
    let value = Math.floor(a[i] - min);
    output[count[value] - 1] = a[i];
    count[value]--;
    metrics.swaps++;
    yield { type: "assign", index: i };
  }
  
  // Copy the output array to original array
  for (let i = 0; i < a.length; i++) {
    a[i] = output[i];
    metrics.swaps++;
    yield { type: "assign", index: i };
  }
  
  yield { type: "done" };
}

// 10) Radix Sort (for non-negative integers)
function* radixSort(a) {
  // Find the number of digits in the maximum element
  let max = Math.max(...a);
  let min = Math.min(...a);
  
  // Make all values positive for radix sort
  if (min < 0) {
    for (let i = 0; i < a.length; i++) {
      a[i] -= min;
      yield { type: "assign", index: i };
    }
    max -= min;
  }
  
  // Perform counting sort for each digit position
  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    yield* countingSortForRadix(a, exp);
  }
  
  // Restore original value range if we shifted
  if (min < 0) {
    for (let i = 0; i < a.length; i++) {
      a[i] += min;
      yield { type: "assign", index: i };
    }
  }
  
  yield { type: "done" };
}

function* countingSortForRadix(a, exp) {
  let n = a.length;
  let output = new Array(n).fill(0);
  let count = new Array(10).fill(0);
  
  // Count occurrences of each digit
  for (let i = 0; i < n; i++) {
    let digit = Math.floor(a[i] / exp) % 10;
    count[digit]++;
    metrics.comparisons++; // Count digit extraction as a comparison
    yield { type: "count", index: i };
  }
  
  // Calculate cumulative count
  for (let i = 1; i < 10; i++) {
    count[i] += count[i - 1];
    metrics.steps++;
  }
  
  // Build the output array
  for (let i = n - 1; i >= 0; i--) {
    let digit = Math.floor(a[i] / exp) % 10;
    output[count[digit] - 1] = a[i];
    count[digit]--;
    metrics.swaps++;
    yield { type: "assign", index: i };
  }
  
  // Copy the output array to original array
  for (let i = 0; i < n; i++) {
    a[i] = output[i];
    metrics.swaps++;
    yield { type: "assign", index: i };
  }
}

/***************************************************
 * Event Listeners
 ***************************************************/

// Update display values when sliders change
arraySizeSlider.addEventListener("input", () => {
  arraySizeDisplay.textContent = arraySizeSlider.value;
});

speedSlider.addEventListener("input", () => {
  speedDisplay.textContent = speedSlider.value;
});

// Update current algorithm display when changed
algorithmSelect.addEventListener("change", () => {
  currentAlgoEl.textContent = algorithmSelect.value;
});

// Start Sort Button
startBtn.addEventListener("click", () => {
  if (sorting) return; // Prevent starting a new sort while one is running
  sorting = true;
  
  // Reset metrics
  metrics = { comparisons: 0, swaps: 0, steps: 0 };
  
  let algo = algorithmSelect.value;
  currentAlgoEl.textContent = algo;
  
  // Add sorting class to the visualizer for styling
  document.querySelector('.visualizer').classList.add('sorting');
  
  // Instantiate the chosen sorting generator
  if (algo === "Bubble Sort") {
    sortGen = bubbleSort(arr);
  } else if (algo === "Insertion Sort") {
    sortGen = insertionSort(arr);
  } else if (algo === "Selection Sort") {
    sortGen = selectionSort(arr);
  } else if (algo === "Merge Sort") {
    sortGen = mergeSort(arr);
  } else if (algo === "Quick Sort") {
    sortGen = quickSort(arr, 0, arr.length - 1);
  } else if (algo === "Heap Sort") {
    sortGen = heapSort(arr);
  } else if (algo === "Shell Sort") {
    sortGen = shellSort(arr);
  } else if (algo === "Cocktail Shaker Sort") {
    sortGen = cocktailShakerSort(arr);
  } else if (algo === "Counting Sort") {
    sortGen = countingSort(arr);
  } else if (algo === "Radix Sort") {
    sortGen = radixSort(arr);
  }
});

// Reset Button
resetBtn.addEventListener("click", () => {
  resetArray();
  document.querySelector('.visualizer').classList.remove('sorting');
  currentAlgoEl.textContent = algorithmSelect.value;
});

// Theory Button
theoryBtn.addEventListener("click", () => {
  let algo = algorithmSelect.value;
  
  // Info for each algorithm
  let theoryData = {
    "Bubble Sort": {
      description: "Repeatedly steps through the list, comparing adjacent elements and swapping them if they are in the wrong order.",
      time: "O(n²)",
      space: "O(1)"
    },
    "Insertion Sort": {
      description: "Builds the sorted array one element at a time by inserting elements in their correct position.",
      time: "O(n²) worst, O(n) best",
      space: "O(1)"
    },
    "Selection Sort": {
      description: "Selects the minimum element from the unsorted portion and swaps it with the first unsorted element.",
      time: "O(n²)",
      space: "O(1)"
    },
    "Merge Sort": {
      description: "Divides the list into halves, recursively sorts them, and then merges the sorted halves.",
      time: "O(n log n)",
      space: "O(n)"
    },
    "Quick Sort": {
      description: "Partitions the list around a pivot and recursively sorts the partitions.",
      time: "O(n log n) average, O(n²) worst",
      space: "O(log n)"
    },
    "Heap Sort": {
      description: "Builds a heap and repeatedly extracts the maximum element to sort the list.",
      time: "O(n log n)",
      space: "O(1)"
    },
    "Shell Sort": {
      description: "A generalization of insertion sort that allows swapping elements far apart.",
      time: "O(n^(3/2)) average",
      space: "O(1)"
    },
    "Cocktail Shaker Sort": {
      description: "A bidirectional bubble sort that sorts in both directions on each pass.",
      time: "O(n²)",
      space: "O(1)"
    },
    "Counting Sort": {
      description: "Counts occurrences of each value and uses arithmetic to determine positions (non-comparison based).",
      time: "O(n + k)",
      space: "O(k)"
    },
    "Radix Sort": {
      description: "Sorts numbers digit by digit using a stable sort as a subroutine.",
      time: "O(nk)",
      space: "O(n + k)"
    }
  };
  
  let data = theoryData[algo];
  let content = `
    <h2>${algo} Theory</h2>
    <hr>
    <p>${data.description}</p>
    <ul>
      <li><strong>Time Complexity:</strong> ${data.time}</li>
      <li><strong>Space Complexity:</strong> ${data.space}</li>
    </ul>`;
  
  theoryContent.innerHTML = content;
  theoryModal.style.display = "flex";
});

// Close Modal Button
closeModal.addEventListener("click", () => {
  theoryModal.style.display = "none";
});

/***************************************************
 * Animation Loop
 ***************************************************/
function animate() {
  if (sorting && sortGen) {
    let stepsPerFrame = parseInt(speedSlider.value);
    
    try {
      // Execute multiple steps per animation frame for faster sorting
      for (let i = 0; i < stepsPerFrame; i++) {
        let res = sortGen.next();
        metrics.steps++;
        
        if (res.done) {
          sorting = false;
          document.querySelector('.visualizer').classList.remove('sorting');
          break;
        }
      }
    } catch (error) {
      console.error("Sorting error:", error);
      sorting = false;
      document.querySelector('.visualizer').classList.remove('sorting');
    }
    
    // Redraw the array and update metrics each frame
    drawArray();
    updateMetrics();
  }
  requestAnimationFrame(animate);
}

// Start animation & initialize array
animate();
resetArray();

// Initialize display values
arraySizeDisplay.textContent = arraySizeSlider.value;
speedDisplay.textContent = speedSlider.value;
currentAlgoEl.textContent = algorithmSelect.value;
