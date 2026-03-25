const topicSelect = document.getElementById("topicSelect");
const responseCard = document.getElementById("responseCard");
const searchInput = document.getElementById("searchInput");
const resourceList = document.getElementById("resourceList");
const installButton = document.getElementById("installButton");

let entries = [];
let deferredPrompt = null;

const escapeHtml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

function renderTopics(items) {
  topicSelect.innerHTML = items
    .map(
      (item, index) =>
        `<option value="${index}">${escapeHtml(item.topic)} — ${escapeHtml(item.teacher)}</option>`,
    )
    .join("");
}

function renderResponse(index) {
  const item = entries[index];
  if (!item) {
    responseCard.innerHTML = "<p>No topic selected.</p>";
    return;
  }

  responseCard.innerHTML = `
    <h3>${escapeHtml(item.topic)}</h3>
    <p><strong>Core claim:</strong> ${escapeHtml(item.claim)}</p>
    <p><strong>Framework:</strong></p>
    <ol>
      ${item.framework.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}
    </ol>
    <p><strong>Scripture anchors:</strong> ${item.scripture.map(escapeHtml).join(", ")}</p>
    <p><strong>Suggested guide:</strong> ${escapeHtml(item.teacher)} — ${escapeHtml(item.resourceTitle)}</p>
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
    ...item.keywords,
    ...item.scripture,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query.toLowerCase());
}

function renderResources(items) {
  if (!items.length) {
    resourceList.innerHTML = "<p>No resources match that search yet.</p>";
    return;
  }

  resourceList.innerHTML = items
    .map(
      (item) => `
      <article class="resource-card">
        <h3>${escapeHtml(item.topic)}</h3>
        <p><strong>Teacher:</strong> ${escapeHtml(item.teacher)}</p>
        <p><strong>Resource:</strong> ${escapeHtml(item.resourceTitle)} (${escapeHtml(item.resourceType)})</p>
        <p>${escapeHtml(item.claim)}</p>
        <a href="${escapeHtml(item.resourceUrl)}" target="_blank" rel="noopener noreferrer">Open resource</a>
      </article>
    `,
    )
    .join("");
}

async function loadResources() {
  const response = await fetch("data/resources.json");
  entries = await response.json();
  renderTopics(entries);
  renderResponse(0);
  renderResources(entries);
}

topicSelect.addEventListener("change", (event) => {
  renderResponse(Number(event.target.value));
});

searchInput.addEventListener("input", (event) => {
  const filtered = entries.filter((item) => matchesSearch(item, event.target.value.trim()));
  renderResources(filtered);
});

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredPrompt = event;
  installButton.hidden = false;
});

installButton.addEventListener("click", async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  installButton.hidden = true;
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {
    // Ignore registration errors in restricted environments.
  });
}

loadResources().catch((error) => {
  responseCard.innerHTML = `<p>Could not load resources. Error: ${escapeHtml(error.message)}</p>`;
});
