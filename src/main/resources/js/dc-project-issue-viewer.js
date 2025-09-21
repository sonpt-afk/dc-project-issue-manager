/******/ (() => { // webpackBootstrap
/*!****************************************!*\
  !*** ./src/main/resources/js/index.js ***!
  \****************************************/
// filepath: d:\dc-app-noob\dc-project-issue-viewer\src\main\resources\js\index.js
// Main entry point for webpack bundling

console.log('DC Project Issue Viewer initialized');

// Your main application code
AJS.$(function () {
  // This runs when the DOM is ready
  console.log('DOM is ready for DC Project Issue Viewer');

  // Example: Add a custom button to project pages
  if (AJS.$('#project-tab-content').length) {
    AJS.$('#project-tab-content').append('<div class="dc-project-issue-summary">' + '  <h3>Project Issue Summary</h3>' + '  <div id="dc-issue-stats">Loading project statistics...</div>' + '</div>');

    // You could make AJAX calls to fetch issue statistics here
    fetchProjectStats();
  }
});

// Example function to fetch project statistics
function fetchProjectStats() {
  // In a real implementation, you'd make a call to a REST endpoint
  // For now, just simulate with a timeout
  setTimeout(function () {
    AJS.$('#dc-issue-stats').html('<ul>' + '  <li>Open Issues: 12</li>' + '  <li>In Progress: 5</li>' + '  <li>Completed: 8</li>' + '</ul>');
  }, 1500);
}
/******/ })()
;
//# sourceMappingURL=dc-project-issue-viewer.js.map