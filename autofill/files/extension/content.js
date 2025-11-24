/* content.js
   This script runs inside the web page and extracts all form-like fields,
   with helpful context (label, placeholder, nearby question text).
   It listens for messages from the extension (popup/background) and replies
   with the structured data.
*/

function getAllFormElements() {
  // Query standard form controls
  const elements = Array.from(document.querySelectorAll("input, textarea, select, [contenteditable='true']"));
  return elements;
}

// Helper: find <label> text associated with an element
function getLabelText(el) {
  // 1) If input has id and there's a label[for=id]
  if (el.id) {
    const label = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
    if (label && label.innerText.trim()) return label.innerText.trim();
  }
  // 2) If element is inside a label element <label> ... <input> ...</label>
  let p = el;
  while (p) {
    if (p.tagName && p.tagName.toLowerCase() === 'label') {
      if (p.innerText.trim()) return p.innerText.trim();
      break;
    }
    p = p.parentElement;
  }
  // 3) Fallback: try aria-label or aria-labelledby
  if (el.getAttribute && el.getAttribute('aria-label')) {
    return el.getAttribute('aria-label').trim();
  }
  const labelledBy = el.getAttribute && el.getAttribute('aria-labelledby');
  if (labelledBy) {
    const ref = document.getElementById(labelledBy);
    if (ref && ref.innerText.trim()) return ref.innerText.trim();
  }
  return "";
}

// Helper: find nearby text nodes that look like a question or prompt.
// We'll look up to n ancestor levels and search for text nodes near the element.
function getNearbyText(el, maxAncestorLevels = 3) {
  // Search siblings and parent nodes for short text content that might be a question.
  const candidates = [];

  let node = el;
  for (let i = 0; i <= maxAncestorLevels && node; i++) {
    // Look at previous and next sibling nodes (often labels or paragraphs)
    const siblings = [];
    if (node.previousElementSibling) siblings.push(node.previousElementSibling);
    if (node.nextElementSibling) siblings.push(node.nextElementSibling);

    // Also check immediate child text of the parent
    if (node.parentElement) {
      Array.from(node.parentElement.querySelectorAll("p, span, strong, label, h1, h2, h3, h4, h5")).forEach(elm => {
        // prefer elements that are close in the DOM tree
        const distance = Math.abs(Array.prototype.indexOf.call(node.parentElement.children, elm) - Array.prototype.indexOf.call(node.parentElement.children, el));
        if (distance <= 5) candidates.push(elm.innerText.trim());
      });
    }

    siblings.forEach(sib => {
      const txt = sib.innerText && sib.innerText.trim();
      if (txt) candidates.push(txt);
    });

    node = node.parentElement;
  }

  // Filter and score candidates: shortish strings that end with '?' or start with verbs
  const filtered = candidates
    .map(s => s.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .filter(s => s.length <= 300); // avoid giant blocks

  // Return the most "question-like" candidate (heuristic)
  filtered.sort((a, b) => {
    const score = x => (x.endsWith('?') ? 10 : 0) + (/[A-Z]/.test(x[0]) ? 1 : 0) + (x.split(' ').length < 30 ? 1 : 0);
    return score(b) - score(a);
  });

  return filtered.length ? filtered[0] : "";
}

// Helper: nice serialization of element info
function serializeElement(el) {
  return {
    tag: el.tagName.toLowerCase(),
    type: el.type || null,
    id: el.id || null,
    name: el.name || null,
    placeholder: el.placeholder || null,
    label: getLabelText(el) || null,
    ariaLabel: el.getAttribute && el.getAttribute('aria-label') || null,
    required: el.required || false,
    disabled: el.disabled || false,
    visible: !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length),
    valueSnippet: (el.value && String(el.value).slice(0, 200)) || null,
    nearbyText: getNearbyText(el) || null
  };
}

// Build the final fields array
function buildFieldsPayload() {
  const elements = getAllFormElements();
  const fields = elements.map(el => serializeElement(el));
  return { url: location.href, title: document.title, extractedAt: new Date().toISOString(), fields };
}

// Listener: when the extension asks to "scan", return the payload
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.action === "scan-form") {
    try {
      const payload = buildFieldsPayload();
      sendResponse({ ok: true, payload });
    } catch (err) {
      sendResponse({ ok: false, error: String(err) });
    }
    return true; // keep sendResponse alive
  }
});
