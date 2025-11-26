/******************************************************
 * UNIVERSAL JOB-FORM SCRAPER (content.js)
 * Covers:
 * - Google Forms
 * - Workday
 * - Greenhouse
 * - Lever
 * - SmartRecruiters
 * - BambooHR
 * - Taleo / Oracle Recruiting
 * - Recruitee
 * - Custom HTML forms
 * - Classic HTML label forms
 ******************************************************/

// ----------------------------
// Entry point: Message listener
// ----------------------------
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.action === "scan-form") {
    try {
      const payload = buildFieldsPayload();
      sendResponse({ ok: true, payload });
    } catch (err) {
      sendResponse({ ok: false, error: String(err) });
    }
    return true;
  }
});

// ----------------------------
// CHECK SUPPORT
// ----------------------------
function isSupportedSite() {
  // 1) Detect all visible, relevant fields
  const elements = Array.from(
    document.querySelectorAll(
      "input, textarea, select, [contenteditable='true']"
    )
  ).filter((el) => isRelevantField(el));

  if (elements.length < 3 || window.location.href.includes('docs.google.com/forms')) {
    return false;
  }

  // 2) Count how many fields have a question extracted
  let labeled = 0;
  for (const el of elements) {
    const q = extractQuestion(el);
    if (q && q.trim().length > 0) {
      labeled++;
    }
  }

  // 3) Calculate ratio
  const ratio = labeled / elements.length;

  // 4) Decide if the site is supported
  return ratio >= 0.5; // tweak threshold if needed
}

// ----------------------------
// MASTER SCRAPER
// ----------------------------
function buildFieldsPayload() {
  const elements = Array.from(
    document.querySelectorAll(`
      input,
      textarea,
      select,
      [contenteditable="true"]
    `)
  ).filter((el) => isRelevantField(el));

  const fields = elements.map((el) => serializeElement(el));

  const supported = isSupportedSite();
  if (!supported) return "Website is not supported";
  return {
    url: location.href,
    supported,
    title: document.title,
    extractedAt: new Date().toISOString(),
    fields,
  };
}

// ----------------------------
// Filter fields (no hidden junk)
// ----------------------------
function isRelevantField(el) {
  const style = window.getComputedStyle(el);
  const rect = el.getClientRects().length > 0;

  const visible =
    style.display !== "none" && style.visibility !== "hidden" && rect;

  const type = (el.type || "").toLowerCase();

  if (["hidden", "submit", "button", "image", "reset", "radio"].includes(type))
    return false;

  return visible;
}

// ----------------------------
// Serialize a single element
// ----------------------------
function serializeElement(el) {
  return {
    tag: el.tagName.toLowerCase(),
    type: el.type || null,
    id: el.id || null,
    name: el.name || null,
    placeholder: el.placeholder || null,
    required: !!el.required,
    disabled: !!el.disabled,
    visible: true,
    valueSnippet: (el.value || "").slice(0, 50),
    question: extractQuestion(el),
  };
}

// ----------------------------
// UNIVERSAL QUESTION EXTRACTOR
// ----------------------------
function extractQuestion(el) {
  if (!el) return null;

  // ATS PLATFORM DETECTORS
  const isGoogleForms = !!document.querySelector(
    ".freebirdFormviewerViewFormContent"
  );
  const isWorkday = !!document.querySelector(".WD3");
  const isGreenhouse = !!document.querySelector(".application-form");
  const isLever = !!document.querySelector(".application-template");
  const isTaleo = !!document.querySelector("table.taleoTable");
  const isSmartRec = !!document.querySelector(".smart-widget");
  const isBambooHR = !!document.querySelector(".BambooHR-ATS");

  // 1) DIRECT LABEL DETECTION
  const q1 = extractFromLabels(el);
  if (q1) return q1;

  // 2) GOOGLE FORMS
  if (isGoogleForms) {
    const qGF = extractGoogleFormsQuestion(el);
    if (qGF) return qGF;
  }

  // 3) WORKDAY
  if (isWorkday) {
    const qWD = extractWorkdayQuestion(el);
    if (qWD) return qWD;
  }

  // 4) LEVER
  if (isLever) {
    const qL = extractLeverQuestion(el);
    if (qL) return qL;
  }

  // 5) GREENHOUSE
  if (isGreenhouse) {
    const qG = extractGreenhouseQuestion(el);
    if (qG) return qG;
  }

  // 6) TALEO, BAMBOOHR, SMARTRECRUITERS, GENERIC ATS
  const qW = extractWrapperBasedQuestion(el);
  if (qW) return qW;

  // 7) LAST RESORT: NEARBY TEXT
  const qN = extractNearbyText(el);
  if (qN) return qN;

  // 8) FINAL FALLBACK: Placeholder
  if (el.placeholder && el.placeholder.trim()) {
    return cleanText(el.placeholder);
  }

  return null;
}

// ----------------------------
// LABEL + ARIA DETECTORS
// ----------------------------
function extractFromLabels(el) {
  // <label for="id">
  if (el.id) {
    const label = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
    if (label) return cleanText(label.innerText);
  }

  // Nested label <label> ... <input> ... </label>
  let p = el;
  while (p) {
    if (p.tagName?.toLowerCase() === "label") {
      if (p.innerText.trim()) return cleanText(p.innerText);
      break;
    }
    p = p.parentElement;
  }

  // aria-label
  if (el.getAttribute("aria-label")) {
    return cleanText(el.getAttribute("aria-label"));
  }

  // aria-labelledby
  const labelledBy = el.getAttribute("aria-labelledby");
  if (labelledBy) {
    const ref = document.getElementById(labelledBy);
    if (ref) return cleanText(ref.innerText);
  }

  return null;
}

// ----------------------------
// GOOGLE FORMS
// ----------------------------
function extractGoogleFormsQuestion(el) {
  // Find the Google Forms answer block
  const root = el.closest(".freebirdFormviewerComponentsQuestionBaseRoot");
  if (!root) return null;

  // Google Forms question is ALWAYS above root,
  // but may be 2–7 ancestor layers up.
  let node = root.parentElement;

  for (let depth = 0; depth < 10 && node; depth++) {
    // Look for the question title block in this ancestor
    const heading = node.querySelector(
      ".HoXoMd[role='heading'], .M4DNQ .HoXoMd, [role='heading'], .M7eMe"
    );

    if (heading && heading.innerText.trim()) {
      // Clean * to remove "required" star
      return heading.innerText.replace("*", "").trim();
    }

    node = node.parentElement;
  }

  return null;
}

// ----------------------------
// WORKDAY
// ----------------------------
function extractWorkdayQuestion(el) {
  const block = el.closest(".gwt-Label, .field-container");
  if (!block) return null;

  const candidate = block.querySelector(".gwt-Label, label, span");
  return candidate ? cleanText(candidate.innerText) : null;
}

// ----------------------------
// GREENHOUSE
// ----------------------------
function extractGreenhouseQuestion(el) {
  const block = el.closest(".application-question, .fieldset");
  if (!block) return null;

  const q = block.querySelector(
    "label, legend, h3, h4, .application-question__title"
  );
  return q ? cleanText(q.innerText) : null;
}

// ----------------------------
// LEVER
// ----------------------------
function extractLeverQuestion(el) {
  const block = el.closest(
    ".application-template-question, .application-question"
  );
  if (!block) return null;

  const q = block.querySelector("label, .application-label, h4, h3");
  return q ? cleanText(q.innerText) : null;
}

// ----------------------------
// GENERIC ATS WRAPPER
// ----------------------------
function extractWrapperBasedQuestion(el) {
  const container = el.closest(`
    .field, .field-container,
    .question, .form-field,
    .application-question,
    .form-group, .input-wrapper
  `);

  if (!container) return null;

  const q = container.querySelector("label, legend, h1, h2, h3, h4, p, span");
  if (q && q.innerText.trim()) {
    return cleanText(q.innerText);
  }
  return null;
}

// ----------------------------
// NEARBY TEXT HEURISTICS
// ----------------------------
function extractNearbyText(el) {
  const candidates = [];
  let node = el;

  for (let i = 0; i < 4 && node; i++) {
    // siblings
    if (node.previousElementSibling?.innerText) {
      candidates.push(node.previousElementSibling.innerText.trim());
    }
    if (node.nextElementSibling?.innerText) {
      candidates.push(node.nextElementSibling.innerText.trim());
    }

    // parent's children
    if (node.parentElement) {
      const els = node.parentElement.querySelectorAll(
        "p, span, strong, label, h1, h2, h3, h4, h5"
      );
      els.forEach((e) => {
        const t = e.innerText?.trim();
        if (t) candidates.push(t);
      });
    }

    node = node.parentElement;
  }

  if (candidates.length === 0) return null;

  return candidates.sort((a, b) => score(b) - score(a))[0];

  function score(t) {
    let s = 0;
    if (t.endsWith("?")) s += 10;
    if (t.length < 200) s += 3;
    return s;
  }
}

// ----------------------------
// UTIL
// ----------------------------
function cleanText(t) {
  return t.replace(/\s+/g, " ").trim();
}
