// Node-based AI regression runner for this project.
// Run from project root:
//   node ai_cli_test.js
//
// It loads the browser-oriented JS files into a shared VM context,
// then invokes runAITest from js/AITest.js and prints the summary.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const context = {
  console,
  setTimeout,
  clearTimeout,
};

// Expose a browser-like global
context.window = context;
context.global = context;

const sandbox = vm.createContext(context);

function loadScript(relPath) {
  const absPath = path.join(__dirname, relPath);
  const code = fs.readFileSync(absPath, 'utf8');
  vm.runInContext(code, sandbox, { filename: relPath });
}

// Load core data and classes in the same order as in index.html (where relevant)
loadScript('js/Data.js');
loadScript('js/Track.js');
loadScript('js/AI.js');
loadScript('js/Car.js');
loadScript('js/AITest.js');

if (typeof sandbox.runAITest !== 'function') {
  console.error('runAITest is not defined in sandbox. Check js/AITest.js wiring.');
  process.exit(1);
}

// Default configuration – can tweak as needed
const options = {
  trackIndex: 0,          // first track in window.TRACKS
  steps: 8000,            // simulation steps (~8000 * 16ms ≈ 2 minutes)
  numCars: 8,             // number of AI cars
  allowOffTrackFrames: 0, // require zero off-track frames to "pass"
};

console.log('Running AI test with options:', options);
const summary = sandbox.runAITest(options);
console.log('Summary from Node runner:', summary);

if (!summary.passed) {
  process.exitCode = 2;
}





