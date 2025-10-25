// background.js

// Load user settings from storage or set defaults
async function getSettings() {
  const defaults = {
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
      "https://notion.so",
      "https://calendar.google.com",
      "https://mail.google.com",
      "https://chat.openai.com",
      "https://github.com",
      "https://linkedin.com",
      "https://trello.com",
      "https://medium.com"
    ]
  };
  const stored = await chrome.storage.sync.get(defaults);
  return stored;
}

// Pick random productive site
function getRandomSite(sites) {
  return sites[Math.floor(Math.random() * sites.length)];
}

// Create & apply redirect rules
async function updateRedirectRules() {
  const { blockedSites, productiveSites } = await getSettings();
  const randomRedirect = getRandomSite(productiveSites);
  console.log("🌐 Redirecting all distracting sites to:", randomRedirect);

  try {
    const existing = await chrome.declarativeNetRequest.getDynamicRules();
    const removeIds = existing.map(rule => rule.id);

    const newRules = blockedSites.map((site, i) => ({
      id: i + 1,
      priority: 1,
      action: { type: "redirect", redirect: { url: randomRedirect } },
      condition: { urlFilter: `||${site}`, resourceTypes: ["main_frame"] }
    }));

    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: removeIds,
      addRules: newRules
    });
  } catch (err) {
    console.error("❌ Error updating redirect rules:", err);
  }
}

// Run at install/start
chrome.runtime.onInstalled.addListener(updateRedirectRules);
chrome.runtime.onStartup.addListener(updateRedirectRules);

// Update dynamically when user edits settings
chrome.storage.onChanged.addListener(updateRedirectRules);

// Optional: refresh redirect target every new visit
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  const { blockedSites } = await getSettings();
  if (blockedSites.some(site => details.url.includes(site))) {
    await updateRedirectRules();
  }
});

