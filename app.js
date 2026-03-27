const topicButtons = document.getElementById('topicButtons');
const responseCard = document.getElementById('responseCard');
const searchInput = document.getElementById('searchInput');
const resourceList = document.getElementById('resourceList');
const installButton = document.getElementById('installButton');

let entries = [];
let activeIndex = 0;
let deferredPrompt = null;

const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

function detectPlatform() {
  const ua = navigator.userAgent || '';
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && 'ontouchend' in document);
  const isAndroid = /Android/.test(ua);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || Boolean(navigator.standalone);

  if (isStandalone) return 'standalone';
  if (isIOS) return 'ios';
  if (isAndroid) return 'android';
  return 'desktop';
}

function showInstallInstructionsPopup() {
  const platform = detectPlatform();

  if (platform === 'standalone') {
    window.alert('Defend the Faith is already installed on this device.');
    return;
  }

  if (platform === 'ios') {
    window.alert('Install on iPhone/iPad:\n1) Open in Safari\n2) Tap Share (square with arrow)\n3) Tap Add to Home Screen\n4) Tap Add');
    return;
  }

  if (platform === 'android') {
    window.alert('Install on Android:\n1) Open browser menu (⋮)\n2) Tap Install app / Add to Home screen\n3) Tap Install');
    return;
  }

  window.alert('Install on desktop:\nUse the install icon in the address bar or browser menu → Install app.');
}

function cleanFrameworkPoints(framework = []) {
  const hiddenPattern = /^(Typical argument|Example argument|How to answer clearly)/i;
  const cleaned = framework
    .map((point) => String(point).trim())
    .filter((point) => point && !hiddenPattern.test(point));

  return [...new Set(cleaned)];
}

function renderTopicButtons(items) {
  topicButtons.innerHTML = items
    .map(
      (item, index) => `
      <button class="topic-btn ${index === activeIndex ? 'is-active' : ''}" data-index="${index}">
        <strong>${escapeHtml(item.topic)}</strong><br />
        <span class="muted">${escapeHtml(item.teacher)}</span>
      </button>
    `,
    )
    .join('');
}

function renderResponse(index) {
  const item = entries[index];
  if (!item) {
    responseCard.innerHTML = '<p>Choose a topic to begin.</p>';
    return;
  }

  const frameworkPoints = cleanFrameworkPoints(item.framework);

  responseCard.innerHTML = `
    <h3>${escapeHtml(item.topic)}</h3>
    <p class="response-meta"><strong>Core claim:</strong> ${escapeHtml(item.claim)}</p>
    <p class="plain-summary"><strong>Simple explanation:</strong> ${escapeHtml(item.plainSummary || 'Summary coming soon.')}</p>

    <h4 class="section-title">Understand the objection</h4>
    <p><strong>Typical argument (defined):</strong> ${escapeHtml(item.argumentDefinition || item.typicalObjection || 'No argument definition added yet.')}</p>
    <p class="example"><strong>Example argument:</strong> ${escapeHtml(item.argumentExample || item.objectionExample || 'No example added yet.')}</p>

    <h4 class="section-title">How to answer clearly</h4>
    <ol>
      ${frameworkPoints.map((point) => `<li>${escapeHtml(point)}</li>`).join('')}
    </ol>

    <div class="detail-grid">
      ${(item.answerDetails || [])
        .map(
          (detail) => `
          <article class="detail-card">
            <p><strong>${escapeHtml(detail.point)}</strong></p>
            <p>${escapeHtml(detail.detail)}</p>
            <p class="detail-example"><strong>Example:</strong> ${escapeHtml(detail.example)}</p>
          </article>
        `,
        )
        .join('')}
    </div>

    <p class="scripture"><strong>Scripture anchors:</strong> ${item.scripture.map(escapeHtml).join(', ')}</p>

    <p class="next-step">
      <strong>Trusted next step:</strong> ${escapeHtml(item.teacher)} — ${escapeHtml(item.resourceTitle)}
    </p>

    <div class="walkthrough">
      <p><strong>Walkthrough: answer clearly and confidently</strong></p>
      <ol>
        ${(item.conversationWalkthrough || [])
          .map(
            (step) => `
              <li>
                <p><strong>${escapeHtml(step.step)}</strong></p>
                <p>${escapeHtml(step.coach)}</p>
                <p class="detail-example"><strong>Try saying:</strong> ${escapeHtml(step.sample)}</p>
              </li>
            `,
          )
          .join('')}
      </ol>
      <p><strong>Confidence tips:</strong></p>
      <ul>
        ${(item.confidenceTips || []).map((tip) => `<li>${escapeHtml(tip)}</li>`).join('')}
      </ul>
    </div>

    <div class="sources">
      <p><strong>Sources & links:</strong></p>
      <ul>
        ${(item.sourceLinks || [])
          .map(
            (source) =>
              `<li><a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.label)}</a></li>`,
          )
          .join('')}
      </ul>
    </div>
  `;
}

function matchesSearch(item, query) {
  if (!query) return true;
  const haystack = [
    item.topic,
    item.claim,
    item.teacher,
    item.resourceTitle,
    item.resourceType,
    item.argumentDefinition || '',
    item.argumentExample || '',
    item.typicalObjection || '',
    item.objectionExample || '',
    ...(item.answerDetails || []).flatMap((detail) => [detail.point, detail.detail, detail.example]),
    ...(item.sourceLinks || []).flatMap((source) => [source.label, source.url]),
    ...(item.conversationWalkthrough || []).flatMap((step) => [step.step, step.coach, step.sample]),
    ...(item.confidenceTips || []),
    ...item.scripture,
    ...item.keywords,
  ]
    .join(' ')
    .toLowerCase();

  return haystack.includes(query.toLowerCase());
}

function renderResources(items) {
  if (!items.length) {
    resourceList.innerHTML = '<p>No resources match your search yet.</p>';
    return;
  }

  resourceList.innerHTML = items
    .map(
      (item) => `
      <article class="resource-card">
        <span class="badge">Trusted Protestant Source</span>
        <h3>${escapeHtml(item.topic)}</h3>
        <p><strong>Teacher:</strong> ${escapeHtml(item.teacher)}</p>
        <p><strong>Resource:</strong> ${escapeHtml(item.resourceTitle)} (${escapeHtml(item.resourceType)})</p>
        <p>${escapeHtml(item.claim)}</p>
        <a href="${escapeHtml(item.resourceUrl)}" target="_blank" rel="noopener noreferrer">Open resource ↗</a>
      </article>
    `,
    )
    .join('');
}

async function loadResources() {
  const response = await fetch('data/resources.json');
  entries = await response.json();
  renderTopicButtons(entries);
  renderResponse(activeIndex);
  renderResources(entries);
}

topicButtons.addEventListener('click', (event) => {
  const target = event.target.closest('button[data-index]');
  if (!target) return;

  activeIndex = Number(target.dataset.index);
  renderTopicButtons(entries);
  renderResponse(activeIndex);
});

searchInput.addEventListener('input', (event) => {
  const query = event.target.value.trim();
  const filtered = entries.filter((item) => matchesSearch(item, query));
  renderResources(filtered);
});

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredPrompt = event;
});

installButton.addEventListener('click', async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    return;
  }

  showInstallInstructionsPopup();
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('sw.js')
    .then((registration) => registration.update())
    .catch(() => {
      // Ignore registration errors in restricted environments.
    });
}


loadResources().catch((error) => {
  responseCard.innerHTML = `<p>Could not load resources: ${escapeHtml(error.message)}</p>`;
});
