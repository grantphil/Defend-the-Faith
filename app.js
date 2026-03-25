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

  responseCard.innerHTML = `
    <h3>${escapeHtml(item.topic)}</h3>
    <p class="response-meta"><strong>Core claim:</strong> ${escapeHtml(item.claim)}</p>

    <p><strong>Typical objection:</strong> ${escapeHtml(item.typicalObjection || 'No objection added yet.')}</p>
    <p class="example"><strong>Example objection:</strong> ${escapeHtml(item.objectionExample || 'No example added yet.')}</p>

    <p><strong>How to answer clearly:</strong></p>
    <ol>
      ${item.framework.map((point) => `<li>${escapeHtml(point)}</li>`).join('')}
    </ol>

    <p class="scripture"><strong>Scripture anchors:</strong> ${item.scripture.map(escapeHtml).join(', ')}</p>

    <p class="next-step">
      <strong>Trusted next step:</strong> ${escapeHtml(item.teacher)} — ${escapeHtml(item.resourceTitle)}
    </p>
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
  installButton.hidden = false;
});

installButton.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  installButton.hidden = true;
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {
    // Ignore registration errors in restricted environments.
  });
}

loadResources().catch((error) => {
  responseCard.innerHTML = `<p>Could not load resources: ${escapeHtml(error.message)}</p>`;
});
