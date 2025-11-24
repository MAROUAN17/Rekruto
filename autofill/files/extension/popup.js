document.getElementById("scan").addEventListener("click", async () => {
  const resultEl = document.getElementById("result");
  resultEl.textContent = "Scanning...";

  // Ask the active tab's content script to scan
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || !tabs[0]) {
      resultEl.textContent = "No active tab.";
      return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      console.log("Active tab:", tabs[0]);
    });

    chrome.tabs.sendMessage(tabs[0].id, { action: "scan-form" }, (response) => {
      if (!response) {
        // Could be because content script isn't injected on this page, or error.
        resultEl.textContent =
          "No response. Content script may not be active on this page.";
        // Check console for errors.
        return;
      }
      if (response.ok) {
        resultEl.textContent = JSON.stringify(response.payload, null, 2);
      } else {
        resultEl.textContent = "Error: " + response.error;
      }
    });
  });
});
