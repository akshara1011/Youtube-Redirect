// Default lists — used both for display and initialization
const DEFAULTS = {
  blockedSites: [
    "youtube.com",
    "facebook.com",
    "instagram.com",
    "twitter.com",
    "x.com",
    "netflix.com",
    "tiktok.com",
    "reddit.com"
  ],
  productiveSites: [
    "notion.so",
    "calendar.google.com",
    "mail.google.com",
    "chat.openai.com",
    "github.com",
    "linkedin.com",
    "trello.com",
    "medium.com"
  ]
};

// --- Initialize settings and render UI ---
async function loadSettings() {
  // Fetch all stored data
  const data = await chrome.storage.sync.get(null);

  // If first time (no data saved yet), initialize with defaults
  if (!data.blockedSites && !data.productiveSites) {
    await chrome.storage.sync.set(DEFAULTS);
    console.log("🆕 Initialized default site lists in storage.");
  }

  // Always re-fetch to ensure fresh state
  const stored = await chrome.storage.sync.get(DEFAULTS);

  // Render both lists
  renderList("blockedList", stored.blockedSites, "blockedSites");
  renderList("productiveList", stored.productiveSites, "productiveSites");
}

// --- Render a list dynamically ---
function renderList(listId, items, key) {
  const ul = document.getElementById(listId);
  ul.innerHTML = "";

  items.forEach((item, index) => {
    const li = document.createElement("li");
    li.textContent = item;

    // Delete button
    const delBtn = document.createElement("button");
    delBtn.textContent = "❌";
    delBtn.className = "delete-btn";
    delBtn.onclick = async () => {
      const updatedItems = items.filter((_, i) => i !== index);
      await chrome.storage.sync.set({ [key]: updatedItems });
      renderList(listId, updatedItems, key);
    };

    li.appendChild(delBtn);
    ul.appendChild(li);
  });
}

// --- Add a new site to list ---
async function addItem(inputId, key, listId) {
  const input = document.getElementById(inputId);
  const value = input.value.trim();
  if (!value) return;

  // Get current data with defaults
  const stored = await chrome.storage.sync.get(DEFAULTS);
  const items = stored[key] || [];

  // Avoid duplicates
  if (items.includes(value)) {
    alert("⚠️ This site is already in your list!");
    input.value = "";
    return;
  }

  // Add new entry and save
  items.push(value);
  await chrome.storage.sync.set({ [key]: items });
  input.value = "";
  renderList(listId, items, key);
}

// --- Event listeners for buttons ---
document.getElementById("addBlocked").addEventListener("click", () =>
  addItem("blockedInput", "blockedSites", "blockedList")
);
document.getElementById("addProductive").addEventListener("click", () =>
  addItem("productiveInput", "productiveSites", "productiveList")
);

// --- Initialize UI on page load ---
loadSettings();
