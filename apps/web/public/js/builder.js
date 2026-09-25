import { getJson, sendJson } from "./api.js";
import { appPath } from "./config.js";
import { checkbox, dateTime, detail, numberField, relative, selectField, textArea, textField } from "./forms.js";
import { badge, confirmAction, escapeHtml, notify, row, table } from "./ui.js";

const TABS = [
  ["questions", "Questions"],
  ["blueprint", "Blueprint"],
  ["build", "Build"],
  ["history", "History"],
];
const SERVER_TYPES = [["FIVEM_RP", "FiveM roleplay"], ["GAMING", "Gaming"], ["COMMUNITY", "Community"], ["BUSINESS", "Business or team"]];
const SECTIONS = [
  ["information", "Welcome, rules, and announcements"],
  ["verification", "Verification (members click a button to get in)"],
  ["tickets", "Support tickets"],
  ["applications", "Applications"],
  ["levels", "Levels and level-up messages"],
  ["giveaways", "Giveaways"],
  ["polls", "Polls"],
  ["birthdays", "Birthdays"],
  ["suggestions", "Suggestions"],
  ["starboard", "Starboard"],
  ["media", "Photo and clip channels"],
  ["forums", "Help and feedback forums"],
  ["joinToCreate", "Join-to-create voice rooms"],
  ["fivemStatus", "FiveM server status and alerts"],
  ["events", "Events with a stage channel"],
  ["staffArea", "Staff channels and log channels"],
  ["ageRestricted", "An 18+ channel"],
];
const CHANNEL_TYPES = [["TEXT", "Text"], ["ANNOUNCEMENT", "Announcement"], ["FORUM", "Forum"], ["MEDIA", "Media"], ["VOICE", "Voice"], ["STAGE", "Stage"]];
const TYPE_ICONS = { TEXT: "#", ANNOUNCEMENT: "📢", FORUM: "💬", MEDIA: "🖼️", VOICE: "🔊", STAGE: "🎙️" };
const TEXT_TYPES = new Set(["TEXT", "ANNOUNCEMENT", "FORUM", "MEDIA"]);
const STATUS_LABELS = { QUEUED: "waiting", RUNNING: "running", SUCCEEDED: "finished", PARTIAL: "finished with problems", FAILED: "failed", UNDONE: "undone" };
const ITEM_LABELS = { ROLE: "Role", CATEGORY: "Category", CHANNEL: "Channel", LINK: "Feature" };
const POLL_MS = 2000;

const view = { tab: "questions", overview: undefined, answers: undefined, runs: [], selected: undefined, error: undefined };
let container;
let pollTimer;

export async function renderBuilderPage(target) {
  container = target;
  view.tab = new URLSearchParams(location.search).get("tab") || view.tab;
  container.innerHTML = `<section class="card"><p class="microcopy">Loading the server builder...</p></section>`;
  await load();
  render();
}

async function load() {
  try {
    const [overview, runs] = await Promise.all([getJson("builder/overview"), getJson("builder/runs?limit=25")]);
    view.overview = overview.data;
    view.runs = runs.data;
    view.answers ??= view.overview.draft?.answers ?? view.overview.templates[0].answers;
    const active = view.runs.find((run) => run.status === "QUEUED" || run.status === "RUNNING");
    const selectedId = active?.id ?? view.selected?.run.id ?? view.overview.lastRun?.id;
    view.selected = selectedId ? (await getJson(`builder/runs/${encodeURIComponent(selectedId)}`)).data : undefined;
    view.error = undefined;
    if (active) schedulePoll();
  } catch (error) {
    view.error = error;
  }
}

function render() {
  if (!container?.isConnected) return;
  if (view.error) {
    const denied = view.error.status === 403;
    container.innerHTML = `<section class="card"><h2>${denied ? "You don't have access to the server builder" : "The server builder is unavailable"}</h2><p class="microcopy">${denied ? "Ask a server admin for the builder.manage permission." : escapeHtml(view.error.message)}</p></section>`;
    return;
  }
  container.innerHTML = `<section class="card">
    <nav class="tab-bar" aria-label="Server builder sections">${TABS.map(([id, label]) => `<button class="tab ${view.tab === id ? "active" : ""}" data-b-tab="${id}">${escapeHtml(label)}</button>`).join("")}</nav>
    <div>${tabContent()}</div>
  </section>`;
  bind();
}

function tabContent() {
  switch (view.tab) {
    case "blueprint": return blueprintTab();
    case "build": return buildTab();
    case "history": return historyTab();
    default: return questionsTab();
  }
}

/* ---------- Questions ---------- */

function questionsTab() {
  const a = view.answers;
  const templates = view.overview.templates;
  return `<div class="grid">
    <div class="feature-grid">${templates.map((template) => `<button type="button" class="feature-tile" data-b-template="${escapeHtml(template.type)}"><strong>${escapeHtml(template.label)}</strong><span class="microcopy">${escapeHtml(template.description)}</span></button>`).join("")}</div>
    <p class="microcopy">Pick a starting point, change the answers, then make a blueprint. You can edit it before anything is built.</p>
    <form class="form-grid readable-form" data-b-form="answers">
      ${selectField("serverType", "Server type", SERVER_TYPES, a.serverType)}
      ${textField("serverName", "Server name", a.serverName, "My City", true)}
      ${textArea("staffRanks", "Staff ranks, highest first (one per line)", a.staffRanks.join("\n"))}
      ${textArea("departments", "Departments, each gets a role and private channels (one per line)", a.departments.join("\n"), "Police\nEMS")}
      ${numberField("voiceLounges", "Voice lounges", a.voiceLounges, 0, view.overview.limits.voiceLounges)}
      <fieldset class="full"><legend>Include</legend>
        ${SECTIONS.map(([key, label]) => checkbox(`include.${key}`, label, a.include[key])).join("")}
      </fieldset>
      ${checkbox("useMediaChannels", "Use Discord media channels for photos and clips (needs Community)", a.useMediaChannels)}
      ${checkbox("emojiCategories", "Emoji in category names, like 📢 INFORMATION", a.emojiCategories)}
      <button class="button primary full">Make blueprint</button>
    </form>
  </div>`;
}

function answersFromForm(form) {
  const data = new FormData(form);
  const lines = (name) => String(data.get(name) ?? "").split(/\n+/).map((line) => line.trim()).filter(Boolean);
  return {
    serverType: String(data.get("serverType")),
    serverName: String(data.get("serverName") ?? "").trim(),
    staffRanks: lines("staffRanks"),
    departments: lines("departments"),
    include: Object.fromEntries(SECTIONS.map(([key]) => [key, form.elements[`include.${key}`]?.checked === true])),
    voiceLounges: Number.parseInt(String(data.get("voiceLounges") ?? "0"), 10) || 0,
    useMediaChannels: form.elements.useMediaChannels?.checked === true,
    emojiCategories: form.elements.emojiCategories?.checked === true,
  };
}

/* ---------- Blueprint ---------- */

function blueprintTab() {
  const draft = view.overview.draft;
  if (!draft) return `<div class="empty-state">Answer the questions and make a blueprint first.</div>`;
  const { blueprint, summary, access } = draft;
  const limits = view.overview.limits;
  const metric = (label, value) => `<div class="card metric"><span class="metric-label">${escapeHtml(label)}</span><strong class="metric-value">${escapeHtml(value)}</strong></div>`;
  const roleRows = blueprint.roles.map((role) => row([
    ["Role", `<span class="role-dot" style="background:${escapeHtml(role.color)}"></span><input class="inline-name" data-b-rename-role="${escapeHtml(role.key)}" value="${escapeHtml(role.name)}" aria-label="Role name">`],
    ["Type", role.purpose ? badge(role.purpose) : ""],
    ["", `<button type="button" class="button compact" data-b-remove-role="${escapeHtml(role.key)}">Remove</button>`],
  ]));
  return `<section class="grid cols-4">
      ${metric("Roles", `${summary.roles} / ${limits.roles}`)}
      ${metric("Categories", String(summary.categories))}
      ${metric("Channels", String(summary.channels))}
      ${metric("Channels and categories", `${summary.totalChannels} / ${limits.channels}`)}
    </section>
    ${summary.warnings.length ? `<ul class="checklist">${summary.warnings.map((warning) => `<li>${badge("note")} ${escapeHtml(warning)}</li>`).join("")}</ul>` : ""}
    <section class="grid main-detail">
      <div class="grid">
        ${blueprint.categories.map((category) => categoryCard(category, access)).join("")}
      </div>
      <div class="card"><h3>Roles (highest first)</h3>${table(["Role", "Type", ""], roleRows, "No roles.")}</div>
    </section>`;
}

function categoryCard(category, access) {
  const channels = category.channels.map((channel) => {
    const who = access[channel.key];
    return `<li class="builder-channel">
      <span class="builder-type" title="${escapeHtml(channel.type.toLowerCase())}">${TYPE_ICONS[channel.type]}</span>
      <input class="inline-name" data-b-rename-channel="${escapeHtml(channel.key)}" value="${escapeHtml(channel.name)}" aria-label="Channel name">
      <span>${channel.purpose ? badge(channel.purpose) : ""}</span>
      <button type="button" class="button compact" data-b-remove-channel="${escapeHtml(channel.key)}">Remove</button>
      <small class="microcopy">${who ? `Sees: ${escapeHtml(who.see)} · ${isVoice(channel.type) ? "Joins" : "Posts"}: ${escapeHtml(who.post.replace(/^join: /, ""))}` : ""}</small>
    </li>`;
  }).join("");
  return `<div class="card">
    <div class="split-line">
      <input class="inline-name strong" data-b-rename-category="${escapeHtml(category.key)}" value="${escapeHtml(category.name)}" aria-label="Category name">
      <button type="button" class="button compact danger" data-b-remove-category="${escapeHtml(category.key)}">Remove category</button>
    </div>
    <ul class="builder-channels">${channels || `<li class="microcopy">No channels.</li>`}</ul>
    <form class="toolbar" data-b-form="add-channel" data-category="${escapeHtml(category.key)}">
      <input name="name" placeholder="New channel name" maxlength="100" required>
      <select name="type" aria-label="Channel type">${CHANNEL_TYPES.map(([value, label]) => `<option value="${value}">${label}</option>`).join("")}</select>
      <button class="button compact">Add channel</button>
    </form>
  </div>`;
}

function isVoice(type) {
  return type === "VOICE" || type === "STAGE";
}

/** Applies `change` to a copy of the blueprint and saves it. */
async function editBlueprint(change, message) {
  const draft = view.overview.draft;
  const blueprint = structuredClone(draft.blueprint);
  change(blueprint);
  try {
    const saved = (await sendJson("builder/draft", "PUT", { answers: draft.answers, blueprint, expectedRevision: draft.revision })).data;
    view.overview.draft = saved;
    if (message) notify(message);
  } catch (error) {
    notify(error.message || "That did not work.", "error");
    if (error.status === 409) await load();
  }
  render();
}

function uniqueKey(blueprint, base) {
  const keys = new Set([...blueprint.categories.map((category) => category.key), ...blueprint.categories.flatMap((category) => category.channels.map((channel) => channel.key))]);
  const clean = base.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50) || "channel";
  let key = clean;
  for (let index = 2; keys.has(key); index += 1) key = `${clean}-${index}`;
  return key;
}

/* ---------- Build ---------- */

function buildTab() {
  const draft = view.overview.draft;
  const preflight = view.overview.preflight;
  const active = activeRun();
  const status = `<div class="card">
    <div class="split-line"><h3>Bot check</h3>${badge(preflight.ready ? "ready" : "not ready")}</div>
    ${preflight.messages.length ? `<ul class="checklist">${preflight.messages.map((message) => `<li>${escapeHtml(message)}</li>`).join("")}</ul>` : `<p class="microcopy">Qbox can create roles and channels.</p>`}
  </div>`;
  if (active) return `${status}${runProgress(view.selected)}`;
  if (!draft) return `${status}<div class="empty-state">Answer the questions and make a blueprint first.</div>`;
  const { summary, links } = draft;
  return `${status}
    <form class="card form-grid readable-form" data-b-form="build">
      <h3>How to build</h3>
      <label class="checkbox full"><input type="radio" name="mode" value="ADD" checked> Add to my server: skip roles and channels that already exist with the same name</label>
      <label class="checkbox full"><input type="radio" name="mode" value="FRESH"> Fresh layout: create everything, even if the names already exist</label>
      <p class="microcopy full">Nothing already in your server is ever deleted. You can undo a build later; that only removes what the build created.</p>
      <h3>Connect Qbox features</h3>
      ${links.map((link) => `<label class="checkbox full"><input type="checkbox" name="links" value="${escapeHtml(link.link)}" ${link.available ? "checked" : "disabled"}> <strong>${escapeHtml(link.label)}</strong>&nbsp;<span class="microcopy">${escapeHtml(link.available ? link.description : "Not in this blueprint.")}</span></label>`).join("")}
      <p class="microcopy full">This saves the new channels and roles into each feature's settings. Your other settings are kept.</p>
      <button class="button primary full" ${preflight.ready ? "" : "disabled"}>Build ${summary.roles} roles and ${summary.totalChannels} channels</button>
    </form>`;
}

function runProgress(detailData) {
  if (!detailData) return "";
  const { run, items } = detailData;
  const finished = run.done + run.skipped + run.failed;
  const running = run.status === "QUEUED" || run.status === "RUNNING";
  const log = [...items].reverse().map((item) => `<li><strong>${escapeHtml(ITEM_LABELS[item.kind])}: ${escapeHtml(item.name)}</strong> ${badge(item.status.toLowerCase())}${item.note ? `<p>${escapeHtml(item.note)}</p>` : ""}${item.error ? `<p>${escapeHtml(item.error)}</p>` : ""}</li>`).join("");
  return `<div class="card">
    <div class="split-line"><h3>Build ${escapeHtml(dateTime(run.createdAt))}</h3>${badge(STATUS_LABELS[run.status])}</div>
    <progress class="builder-progress" max="${Math.max(run.planned, 1)}" value="${finished}"></progress>
    <p class="microcopy">${run.done} created, ${run.skipped} skipped, ${run.failed} failed of ${run.planned}.${running ? " This page updates by itself." : ""}</p>
    ${run.error ? `<p class="microcopy">${escapeHtml(run.error)}</p>` : ""}
    ${run.warnings.length ? `<ul class="checklist">${run.warnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join("")}</ul>` : ""}
    <ul class="timeline builder-log">${log || `<li>Starting...</li>`}</ul>
  </div>`;
}

function activeRun() {
  const run = view.selected?.run;
  return run && (run.status === "QUEUED" || run.status === "RUNNING") ? run : undefined;
}

function schedulePoll() {
  clearTimeout(pollTimer);
  pollTimer = setTimeout(async () => {
    if (!container?.isConnected || !view.selected) return;
    try {
      view.selected = (await getJson(`builder/runs/${encodeURIComponent(view.selected.run.id)}`)).data;
      if (activeRun()) schedulePoll();
      else {
        notify(view.selected.run.status === "UNDONE" ? "Build undone." : `Build ${STATUS_LABELS[view.selected.run.status]}.`, view.selected.run.status === "FAILED" ? "error" : "success");
        await load();
      }
    } catch (error) {
      notify(error.message, "error");
      schedulePoll();
    }
    render();
  }, POLL_MS);
}

/* ---------- History ---------- */

function historyTab() {
  const rows = view.runs.map((run) => row([
    ["When", `${escapeHtml(relative(run.createdAt))}`],
    ["Status", badge(STATUS_LABELS[run.status])],
    ["Mode", run.mode === "ADD" ? "Add to server" : "Fresh layout"],
    ["Result", `${run.done} created, ${run.skipped} skipped, ${run.failed} failed`],
    ["By", escapeHtml(run.startedByName)],
    ["", `<button type="button" class="button compact" data-b-view-run="${escapeHtml(run.id)}">View</button>
      ${run.status !== "UNDONE" && run.status !== "RUNNING" && run.status !== "QUEUED" && run.done > 0 ? `<button type="button" class="button compact danger" data-b-undo="${escapeHtml(run.id)}">Undo this build</button>` : ""}`],
  ], `class="${run.id === view.selected?.run.id ? "selected" : ""}"`));
  return `<section class="grid main-detail">
    <div>${table(["When", "Status", "Mode", "Result", "By", ""], rows, "No builds yet.")}</div>
    <div>${view.selected ? `${runProgress(view.selected)}${runFacts(view.selected.run)}` : `<p class="microcopy">Choose a build to see each step.</p>`}</div>
  </section>`;
}

function runFacts(run) {
  return `<div class="card detail-stack">
    ${detail("Started by", escapeHtml(run.startedByName))}
    ${detail("Started", escapeHtml(dateTime(run.startedAt ?? run.createdAt)))}
    ${run.finishedAt ? detail("Finished", escapeHtml(dateTime(run.finishedAt))) : ""}
    ${run.undoneAt ? detail("Undone", escapeHtml(dateTime(run.undoneAt))) : ""}
    ${detail("Features", escapeHtml(run.links.join(", ") || "None"))}
  </div>`;
}

/* ---------- Events ---------- */

function bind() {
  container.querySelectorAll("[data-b-tab]").forEach((button) => button.addEventListener("click", () => {
    view.tab = button.dataset.bTab;
    history.replaceState({}, "", appPath(`/builder?tab=${view.tab}`));
    render();
  }));
  container.querySelectorAll("[data-b-template]").forEach((button) => button.addEventListener("click", () => {
    view.answers = structuredClone(view.overview.templates.find((template) => template.type === button.dataset.bTemplate).answers);
    render();
  }));
  container.querySelectorAll("form[data-b-form]").forEach((form) => form.addEventListener("submit", (event) => {
    event.preventDefault();
    void submit(form);
  }));
  const rename = (selector, attribute, apply) => container.querySelectorAll(selector).forEach((input) => input.addEventListener("change", () => {
    const value = input.value.trim();
    if (!value) return render();
    void editBlueprint((blueprint) => apply(blueprint, input.dataset[attribute], value), "Saved.");
  }));
  rename("[data-b-rename-role]", "bRenameRole", (blueprint, key, value) => { blueprint.roles.find((role) => role.key === key).name = value; });
  rename("[data-b-rename-category]", "bRenameCategory", (blueprint, key, value) => { blueprint.categories.find((category) => category.key === key).name = value; });
  rename("[data-b-rename-channel]", "bRenameChannel", (blueprint, key, value) => {
    for (const category of blueprint.categories) for (const channel of category.channels) if (channel.key === key) channel.name = value;
  });
  container.querySelectorAll("[data-b-remove-role]").forEach((button) => button.addEventListener("click", () => {
    const key = button.dataset.bRemoveRole;
    void editBlueprint((blueprint) => {
      const strip = (overwrites) => overwrites.filter((overwrite) => overwrite.target !== key);
      blueprint.roles = blueprint.roles.filter((role) => role.key !== key);
      for (const category of blueprint.categories) {
        category.overwrites = strip(category.overwrites);
        for (const channel of category.channels) channel.overwrites = strip(channel.overwrites);
      }
    }, "Role removed.");
  }));
  container.querySelectorAll("[data-b-remove-channel]").forEach((button) => button.addEventListener("click", () => {
    const key = button.dataset.bRemoveChannel;
    void editBlueprint((blueprint) => {
      for (const category of blueprint.categories) category.channels = category.channels.filter((channel) => channel.key !== key);
    }, "Channel removed.");
  }));
  container.querySelectorAll("[data-b-remove-category]").forEach((button) => button.addEventListener("click", async () => {
    const category = view.overview.draft.blueprint.categories.find((item) => item.key === button.dataset.bRemoveCategory);
    if (!(await confirmAction({ title: `Remove ${category.name}?`, body: `Its ${category.channels.length} channels are removed from the blueprint too.`, confirmText: "Remove" }))) return;
    void editBlueprint((blueprint) => { blueprint.categories = blueprint.categories.filter((item) => item.key !== category.key); }, "Category removed.");
  }));
  container.querySelectorAll("[data-b-view-run]").forEach((button) => button.addEventListener("click", async () => {
    try {
      view.selected = (await getJson(`builder/runs/${encodeURIComponent(button.dataset.bViewRun)}`)).data;
      render();
    } catch (error) {
      notify(error.message, "error");
    }
  }));
  container.querySelectorAll("[data-b-undo]").forEach((button) => button.addEventListener("click", async () => {
    const run = view.runs.find((item) => item.id === button.dataset.bUndo);
    if (!(await confirmAction({ title: "Undo this build?", body: `This deletes the ${run.done} roles, categories, and channels this build created, and everything in them. Things that already existed are not touched. Feature settings stay as they are.`, confirmText: "Undo build" }))) return;
    try {
      view.selected = { run: (await sendJson(`builder/runs/${encodeURIComponent(run.id)}/undo`, "POST", {})).data, items: view.selected?.items ?? [] };
      notify("Undoing the build...");
      await load();
      render();
    } catch (error) {
      notify(error.message, "error");
    }
  }));
}

async function submit(form) {
  switch (form.dataset.bForm) {
    case "answers": {
      view.answers = answersFromForm(form);
      const draft = view.overview.draft;
      if (draft && !(await confirmAction({ title: "Make a new blueprint?", body: "This replaces your current blueprint, including any edits you made to it.", confirmText: "Replace" }))) return;
      try {
        view.overview.draft = (await sendJson("builder/generate", "POST", { answers: view.answers, save: true, expectedRevision: draft?.revision ?? 0 })).data;
        notify("Blueprint ready. Check it before you build.");
        view.tab = "blueprint";
        history.replaceState({}, "", appPath("/builder?tab=blueprint"));
      } catch (error) {
        notify(error.message || "That did not work.", "error");
        if (error.status === 409) await load();
      }
      return render();
    }
    case "add-channel": {
      const data = new FormData(form);
      const type = String(data.get("type"));
      const raw = String(data.get("name") ?? "").trim();
      if (!raw) return undefined;
      const name = TEXT_TYPES.has(type) ? raw.toLowerCase().replace(/\s+/g, "-") : raw;
      return editBlueprint((blueprint) => {
        const category = blueprint.categories.find((item) => item.key === form.dataset.category);
        category.channels.push({ key: uniqueKey(blueprint, name), name, type, slowmodeSeconds: 0, nsfw: false, userLimit: 0, overwrites: [] });
      }, "Channel added.");
    }
    case "build": {
      const data = new FormData(form);
      const mode = String(data.get("mode"));
      const links = data.getAll("links");
      const { summary } = view.overview.draft;
      const ok = await confirmAction({
        title: "Build your server now?",
        body: `Qbox will create up to ${summary.roles} roles and ${summary.totalChannels} channels and categories${links.length ? `, then connect ${links.length} features` : ""}. ${mode === "ADD" ? "Items that already exist are skipped." : "Everything is created new."} Nothing is deleted.`,
        confirmText: "Build",
      });
      if (!ok) return undefined;
      try {
        const run = (await sendJson("builder/runs", "POST", { mode, links })).data;
        view.selected = { run, items: [] };
        notify("Build started.");
        schedulePoll();
      } catch (error) {
        notify(error.message || "That did not work.", "error");
      }
      return render();
    }
    default:
      return undefined;
  }
}
