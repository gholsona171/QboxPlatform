import { getJson, sendJson } from "./api.js";
import { appPath } from "./config.js";
import { checkbox, dateTime, detail, numberField, relative, selectField, textArea, textField } from "./forms.js";
import { badge, confirmAction, escapeHtml, notify, row, table } from "./ui.js";
import { BRAND } from "./brand.js";

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
const CHANNEL_EMOJIS = [["NONE", "None"], ["KEY", "Key channels only"], ["ALL", "Every channel"]];
const EMOJI_SEPARATORS = [["BAR", "Bar, like 👋┃welcome"], ["SPACE", "Dash or space, like 👋-welcome and 🔊 Lounge 1"]];
const DESCRIBE_PLACEHOLDER = "A Rust community with 3 wipes a month, a clan system, a trading market, and a ticket desk for base raids…";
const CHANNEL_TYPES = [["TEXT", "Text"], ["ANNOUNCEMENT", "Announcement"], ["FORUM", "Forum"], ["MEDIA", "Media"], ["VOICE", "Voice"], ["STAGE", "Stage"]];
const TYPE_ICONS = { TEXT: "#", ANNOUNCEMENT: "📢", FORUM: "💬", MEDIA: "🖼️", VOICE: "🔊", STAGE: "🎙️" };
const TEXT_TYPES = new Set(["TEXT", "ANNOUNCEMENT", "FORUM", "MEDIA"]);
const FORUM_TYPES = new Set(["FORUM", "MEDIA"]);
const EVERYONE = "@everyone";
const BOT = "@bot";
const VIEW = ["ViewChannel", "ReadMessageHistory"];
const TEXT_POST = ["SendMessages", "SendMessagesInThreads", "CreatePublicThreads"];
const VOICE_POST = ["Connect", "Speak"];
const TEXT_MANAGE = ["ManageMessages", "ManageThreads"];
const VOICE_MANAGE = ["MuteMembers", "MoveMembers"];
const ACCESS_CHOICES = [["default", "Default"], ["hidden", "Hidden"], ["see", "See only"], ["post", "See & post"]];
const FORUM_LIMITS = { guidelines: 4096, tags: 20, tagName: 20, postTitle: 100, postContent: 2000 };
const STATUS_LABELS = { QUEUED: "waiting", RUNNING: "running", SUCCEEDED: "finished", PARTIAL: "finished with problems", FAILED: "failed", UNDONE: "undone" };
const ITEM_LABELS = { ROLE: "Role", CATEGORY: "Category", CHANNEL: "Channel", LINK: "Feature" };
const POLL_MS = 2000;

/** `panel` is the one open inline editor on the blueprint: an access editor or a forum setup editor. */
const view = { tab: "questions", overview: undefined, answers: undefined, runs: [], selected: undefined, error: undefined, panel: undefined, designing: false };
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
    container.innerHTML = `<section class="card"><h2>${denied ? "You don't have access to the server builder" : "The server builder is unavailable"}</h2><p class="microcopy">${denied ? "Ask a server admin for the Manage server builder permission (builder.manage)." : escapeHtml(view.error.message)}</p></section>`;
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

function describeCard() {
  if (!view.overview.aiAvailable)
    return `<div class="card">
      <h3>Describe your server</h3>
      <p class="microcopy">Describe-your-server needs an OpenAI API key on the host. Add OPENAI_API_KEY to the server's .env and restart.</p>
    </div>`;
  return `<form class="card form-grid readable-form" data-b-form="design">
    <h3 class="full">Describe your server</h3>
    <label class="full">What are you trying to do with the server?<textarea name="prompt" rows="4" maxlength="2000" required placeholder="${escapeHtml(DESCRIBE_PLACEHOLDER)}">${escapeHtml(view.answers.description ?? "")}</textarea></label>
    <div class="toolbar full">
      <button class="button primary" ${view.designing ? "disabled" : ""}>${view.designing ? "Designing..." : "Design it for me"}</button>
      <span class="microcopy">Uses AI to fill the questions and add custom categories. You can edit everything after.</span>
    </div>
  </form>`;
}

function questionsTab() {
  const a = view.answers;
  const templates = view.overview.templates;
  return `<div class="grid">
    ${describeCard()}
    <div class="feature-grid">${templates.map((template) => `<button type="button" class="feature-tile" data-b-template="${escapeHtml(template.type)}"><strong>${escapeHtml(template.label)}</strong><span class="microcopy">${escapeHtml(template.description)}</span></button>`).join("")}</div>
    <p class="microcopy">Pick a starting point, change the answers, then make a Blueprint (a preview of what will be built). You can edit it before anything is built.</p>
    <form class="form-grid readable-form" data-b-form="answers">
      ${selectField("serverType", "Server type", SERVER_TYPES, a.serverType)}
      ${textField("serverName", "Server name", a.serverName, "My City", true)}
      ${textArea("staffRanks", "Staff ranks, highest first (one per line)", a.staffRanks.join("\n"))}
      ${textArea("departments", "Departments, each gets a role and private channels (one per line)", a.departments.join("\n"), "Police\nEMS")}
      ${checkbox("staffAccess", "Staff can see every department channel", a.staffAccess !== "NONE")}
      ${numberField("voiceLounges", "Voice lounges", a.voiceLounges, 0, view.overview.limits.voiceLounges)}
      <fieldset class="full"><legend>Include</legend>
        ${SECTIONS.map(([key, label]) => checkbox(`include.${key}`, label, a.include[key])).join("")}
      </fieldset>
      ${checkbox("useMediaChannels", "Use Discord media channels for photos and clips (needs Community)", a.useMediaChannels)}
      ${checkbox("emojiCategories", "Emoji in category names, like 📢 INFORMATION", a.emojiCategories)}
      ${selectField("channelEmojis", "Emoji in channel names", CHANNEL_EMOJIS, a.channelEmojis ?? "ALL")}
      ${selectField("emojiSeparator", "Emoji style", EMOJI_SEPARATORS, a.emojiSeparator ?? "BAR")}
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
    staffAccess: form.elements.staffAccess?.checked === true ? "ALL" : "NONE",
    include: Object.fromEntries(SECTIONS.map(([key]) => [key, form.elements[`include.${key}`]?.checked === true])),
    voiceLounges: Number.parseInt(String(data.get("voiceLounges") ?? "0"), 10) || 0,
    useMediaChannels: form.elements.useMediaChannels?.checked === true,
    emojiCategories: form.elements.emojiCategories?.checked === true,
    channelEmojis: String(data.get("channelEmojis") || "ALL"),
    emojiSeparator: String(data.get("emojiSeparator") || "BAR"),
    ...(view.answers?.description ? { description: view.answers.description } : {}),
  };
}

/* ---------- Blueprint ---------- */

function noDraft() {
  return `<div class="empty-state"><p>There is no blueprint yet.</p><button class="button primary" data-b-tab="questions">Answer the questions</button></div>`;
}

function blueprintTab() {
  const draft = view.overview.draft;
  if (!draft) return noDraft();
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
  const blueprint = view.overview.draft.blueprint;
  const channels = category.channels.map((channel) => {
    const who = access[channel.key];
    const panel = view.panel?.key === channel.key ? view.panel : undefined;
    return `<li class="builder-channel">
      <select class="builder-type" data-b-retype-channel="${escapeHtml(channel.key)}" aria-label="Channel type" title="${escapeHtml(channel.type.toLowerCase())}">${CHANNEL_TYPES.map(([value, label]) => `<option value="${value}" ${value === channel.type ? "selected" : ""}>${TYPE_ICONS[value]} ${label}</option>`).join("")}</select>
      <input class="inline-name" data-b-rename-channel="${escapeHtml(channel.key)}" value="${escapeHtml(channel.name)}" aria-label="Channel name">
      <span>${channel.purpose ? badge(channel.purpose) : ""}</span>
      <span class="builder-actions">
        <button type="button" class="button compact ${panel?.kind === "access" ? "primary" : ""}" data-b-open-access="${escapeHtml(channel.key)}">Access</button>
        ${FORUM_TYPES.has(channel.type) ? `<button type="button" class="button compact ${panel?.kind === "forum" ? "primary" : ""}" data-b-open-forum="${escapeHtml(channel.key)}">Forum setup</button>` : ""}
        <button type="button" class="button compact" data-b-remove-channel="${escapeHtml(channel.key)}">Remove</button>
      </span>
      <small class="microcopy">${who ? accessLine(channel.type, who) : ""}</small>
    </li>${panel ? `<li class="builder-panel">${panel.kind === "access" ? accessEditor(blueprint, category, channel) : forumEditor(channel)}</li>` : ""}`;
  }).join("");
  const panel = view.panel?.key === category.key && view.panel.kind === "access" ? `<div class="builder-panel">${accessEditor(blueprint, category, undefined)}</div>` : "";
  return `<div class="card">
    <div class="split-line">
      <input class="inline-name strong" data-b-rename-category="${escapeHtml(category.key)}" value="${escapeHtml(category.name)}" aria-label="Category name">
      <span class="builder-actions">
        <button type="button" class="button compact ${panel ? "primary" : ""}" data-b-open-access="${escapeHtml(category.key)}">Access</button>
        <button type="button" class="button compact danger" data-b-remove-category="${escapeHtml(category.key)}">Remove category</button>
      </span>
    </div>
    ${panel}
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

function accessLine(type, who) {
  return `Sees: ${escapeHtml(who.see)} · ${isVoice(type) ? "Joins" : "Posts"}: ${escapeHtml(who.post.replace(/^join: /, ""))}`;
}

/* ---------- Access editor ---------- */

/** Which permissions "post" and "manage" mean for a channel type; a category covers both text and voice. */
function permissionSets(type) {
  if (!type) return { post: [...TEXT_POST, ...VOICE_POST], manage: [...TEXT_MANAGE, ...VOICE_MANAGE], primary: ["SendMessages", "Connect"] };
  return isVoice(type) ? { post: VOICE_POST, manage: VOICE_MANAGE, primary: ["Connect"] } : { post: TEXT_POST, manage: TEXT_MANAGE, primary: ["SendMessages"] };
}

/** Reads the editor choice an overwrite stands for. */
function choiceOf(overwrite, sets) {
  if (!overwrite) return { access: "default", manage: false };
  const manage = sets.manage.some((name) => overwrite.allow.includes(name));
  if (overwrite.deny.includes("ViewChannel")) return { access: "hidden", manage };
  if (sets.primary.some((name) => overwrite.deny.includes(name))) return { access: "see", manage };
  if (overwrite.allow.includes("ViewChannel") || sets.primary.some((name) => overwrite.allow.includes(name))) return { access: "post", manage };
  return { access: "default", manage };
}

/** Writes a choice for one target into a copy of `overwrites`, keeping any other permissions that target had. */
function applyChoice(overwrites, target, choice, sets) {
  const touched = new Set([...VIEW, ...sets.post, ...sets.manage, ...TEXT_MANAGE, ...VOICE_MANAGE]);
  const existing = overwrites.find((overwrite) => overwrite.target === target) ?? { target, allow: [], deny: [] };
  const allow = existing.allow.filter((name) => !touched.has(name));
  const deny = existing.deny.filter((name) => !touched.has(name));
  if (choice.access === "hidden") deny.push("ViewChannel");
  else if (choice.access === "see") allow.push(...VIEW), deny.push(...sets.post);
  else if (choice.access === "post") allow.push(...VIEW, ...sets.post);
  if (choice.manage && choice.access !== "hidden") allow.push(...sets.manage);
  const rest = overwrites.filter((overwrite) => overwrite.target !== target);
  return allow.length || deny.length ? [...rest, { target, allow, deny }] : rest;
}

/** @everyone, then staff ranks, departments, and the rest. The bot itself is left alone. */
function accessTargets(blueprint) {
  const rank = { staff: 0, department: 1 };
  const roles = blueprint.roles.map((role, index) => ({ role, index })).sort((a, b) => (rank[a.role.purpose] ?? 2) - (rank[b.role.purpose] ?? 2) || a.index - b.index);
  return [{ key: EVERYONE, name: "@everyone" }, ...roles.map(({ role }) => ({ key: role.key, name: role.name }))];
}

function openAccessEditor(key) {
  const blueprint = view.overview.draft.blueprint;
  const found = findTarget(blueprint, key);
  if (!found) return;
  const sets = permissionSets(found.channel?.type);
  const choices = Object.fromEntries(accessTargets(blueprint).map((target) => [target.key, choiceOf(found.item.overwrites.find((overwrite) => overwrite.target === target.key), sets)]));
  view.panel = { kind: "access", key, choices, touched: new Set() };
  render();
}

function findTarget(blueprint, key) {
  for (const category of blueprint.categories) {
    if (category.key === key) return { category, item: category };
    for (const channel of category.channels) if (channel.key === key) return { category, channel, item: channel };
  }
  return undefined;
}

/** The overwrites the open access editor would save. */
function editedOverwrites(item, type) {
  const sets = permissionSets(type);
  let overwrites = structuredClone(item.overwrites);
  for (const target of view.panel.touched) overwrites = applyChoice(overwrites, target, view.panel.choices[target], sets);
  return overwrites;
}

function accessEditor(blueprint, category, channel) {
  const item = channel ?? category;
  const panel = view.panel;
  const targets = accessTargets(blueprint);
  const postLabel = channel && isVoice(channel.type) ? "See & join" : "See & post";
  const rows = targets.map((target) => {
    const choice = panel.choices[target.key];
    return `<div class="access-row">
      <span class="access-target">${escapeHtml(target.name)}</span>
      <span class="segmented compact" role="group" aria-label="Access for ${escapeHtml(target.name)}">${ACCESS_CHOICES.map(([value, label]) => `<button type="button" class="${choice.access === value ? "active" : ""}" data-b-access="${escapeHtml(target.key)}" data-value="${value}">${value === "post" ? postLabel : label}</button>`).join("")}</span>
      ${target.key === EVERYONE ? "<span></span>" : `<label class="checkbox"><input type="checkbox" data-b-manage="${escapeHtml(target.key)}" ${choice.manage ? "checked" : ""} ${choice.access === "hidden" ? "disabled" : ""}> Manage</label>`}
    </div>`;
  }).join("");
  const preview = structuredClone(blueprint);
  const found = findTarget(preview, item.key);
  found.item.overwrites = editedOverwrites(item, channel?.type);
  const access = describeAccessLocally(preview);
  const summary = channel
    ? `<p class="microcopy">${accessLine(channel.type, access[channel.key])}</p>`
    : `<ul class="access-summary">${found.category.channels.map((each) => `<li><strong>${escapeHtml(each.name)}</strong> <span class="microcopy">${accessLine(each.type, access[each.key])}</span></li>`).join("") || "<li class=\"microcopy\">No channels.</li>"}</ul>`;
  return `<div class="split-line"><strong>Who can ${channel ? (isVoice(channel.type) ? "see and join" : "see and post in") : "see"} ${escapeHtml(item.name)}</strong><button type="button" class="button compact ghost" data-b-panel-close>Close</button></div>
    <p class="microcopy">Default keeps what the ${channel ? "category" : "server"} gives. Hidden, See only, and ${postLabel} set it for this ${channel ? "channel" : "category and its channels"}. Manage lets that role delete posts${channel && isVoice(channel.type) ? " and move or mute members" : " and manage threads"}.</p>
    <div class="access-rows">${rows}</div>
    ${summary}
    <div class="toolbar">
      <button type="button" class="button compact primary" data-b-access-save>Save</button>
      ${channel ? "" : `<button type="button" class="button compact" data-b-access-apply>Apply to all channels in this category</button>`}
      <button type="button" class="button compact" data-b-panel-close>Cancel</button>
    </div>`;
}

/** Same rules as the API's describeAccess, so the summary can update before saving. */
function mergeOverwrites(...lists) {
  const merged = new Map();
  for (const list of lists)
    for (const overwrite of list) {
      const entry = merged.get(overwrite.target) ?? { allow: new Set(), deny: new Set() };
      for (const name of overwrite.allow) { entry.deny.delete(name); entry.allow.add(name); }
      for (const name of overwrite.deny) { entry.allow.delete(name); entry.deny.add(name); }
      merged.set(overwrite.target, entry);
    }
  return [...merged].map(([target, entry]) => ({ target, allow: [...entry.allow], deny: [...entry.deny] }));
}

function describeAccessLocally(blueprint) {
  const names = new Map(blueprint.roles.map((role) => [role.key, role.name]));
  const staff = blueprint.roles.filter((role) => role.purpose === "staff").map((role) => role.key);
  const label = (keys) => {
    const shown = keys.filter((key) => key !== BOT);
    const allStaff = staff.length > 1 && staff.every((key) => shown.includes(key));
    const rest = allStaff ? shown.filter((key) => !staff.includes(key)) : shown;
    return [...(allStaff ? ["staff"] : []), ...rest.map((key) => (key === EVERYONE ? "everyone" : names.get(key) ?? key))].join(", ") || "admins only";
  };
  const withExceptions = (who, not) => `${label(who)}${not.length ? ` (not ${label(not)})` : ""}`;
  const result = {};
  for (const category of blueprint.categories)
    for (const channel of category.channels) {
      const voice = isVoice(channel.type);
      const overwrites = mergeOverwrites(category.overwrites, channel.overwrites);
      const everyone = overwrites.find((overwrite) => overwrite.target === EVERYONE);
      const roles = overwrites.filter((overwrite) => overwrite.target !== EVERYONE && overwrite.target !== BOT);
      const hidden = everyone?.deny.includes("ViewChannel") ?? false;
      const viewers = hidden ? roles.filter((overwrite) => overwrite.allow.includes("ViewChannel")).map((overwrite) => overwrite.target) : [EVERYONE];
      const blockedViewers = roles.filter((overwrite) => overwrite.deny.includes("ViewChannel")).map((overwrite) => overwrite.target);
      const postPermission = voice ? "Connect" : "SendMessages";
      const postBlocked = everyone?.deny.includes(postPermission) ?? false;
      const deniesPost = (overwrite) => overwrite.deny.includes(postPermission) || overwrite.deny.includes("ViewChannel");
      const posters = postBlocked
        ? roles.filter((overwrite) => overwrite.allow.includes(postPermission) && !overwrite.deny.includes("ViewChannel")).map((overwrite) => overwrite.target)
        : hidden ? roles.filter((overwrite) => overwrite.allow.includes("ViewChannel") && !deniesPost(overwrite)).map((overwrite) => overwrite.target) : [EVERYONE];
      const blockedPosters = postBlocked || hidden ? [] : roles.filter(deniesPost).map((overwrite) => overwrite.target);
      const see = withExceptions(viewers, hidden ? [] : blockedViewers);
      const post = postBlocked && posters.length === 0 ? (overwrites.some((overwrite) => overwrite.target === BOT) ? `${BRAND.name} only` : "admins only") : withExceptions(posters, blockedPosters);
      result[channel.key] = { see, post: voice ? `join: ${post}` : post };
    }
  return result;
}

/* ---------- Forum setup editor ---------- */

/** A plain forum setup for a channel that just became a forum. Media channels need an attachment per post, so no first post. */
function defaultForum(type) {
  return {
    guidelines: "One topic per post. Give it a clear title.",
    tags: [{ name: "Question", emoji: "❓" }, { name: "Discussion", emoji: "💬" }, { name: "Solved", emoji: "✅" }],
    defaultReactionEmoji: "👍",
    ...(type === "MEDIA" ? {} : { firstPost: { title: "Read me first", content: "Start a new post with the button above. Give it a clear title, pick a tag, and keep one topic per post.", pin: true } }),
  };
}

function openForumEditor(key) {
  const found = findTarget(view.overview.draft.blueprint, key);
  if (!found?.channel) return;
  view.panel = { kind: "forum", key, forum: structuredClone(found.channel.forum ?? defaultForum(found.channel.type)) };
  render();
}

function forumEditor(channel) {
  const forum = view.panel.forum;
  const media = channel.type === "MEDIA";
  const tags = forum.tags.map((tag, index) => `<div class="forum-tag">
      <input name="tagName" value="${escapeHtml(tag.name)}" maxlength="${FORUM_LIMITS.tagName}" placeholder="Tag name" aria-label="Tag name" required>
      <input name="tagEmoji" value="${escapeHtml(tag.emoji ?? "")}" maxlength="100" placeholder="Emoji" aria-label="Tag emoji">
      <button type="button" class="button compact" data-b-tag-remove="${index}">Remove</button>
    </div>`).join("");
  const post = forum.firstPost;
  return `<form class="form-grid" data-b-form="forum" data-channel="${escapeHtml(channel.key)}">
    <div class="split-line full"><strong>Forum setup for ${escapeHtml(channel.name)}</strong><button type="button" class="button compact ghost" data-b-panel-close>Close</button></div>
    <label class="full">Post guidelines<textarea name="guidelines" maxlength="${FORUM_LIMITS.guidelines}" placeholder="One post per problem. Say what you tried.">${escapeHtml(forum.guidelines ?? "")}</textarea></label>
    <div class="full">
      <div class="split-line"><strong>Tags</strong><span class="microcopy">${forum.tags.length} / ${FORUM_LIMITS.tags}</span></div>
      <div class="forum-tags">${tags || `<p class="microcopy">No tags yet.</p>`}</div>
      ${forum.tags.length < FORUM_LIMITS.tags ? `<button type="button" class="button compact" data-b-tag-add>Add tag</button>` : ""}
    </div>
    ${textField("defaultReactionEmoji", "Default reaction (an emoji, or name:id for a custom one)", forum.defaultReactionEmoji ?? "", "👍")}
    ${media
      ? `<p class="microcopy full">Media channels need a photo or video in every post, so ${BRAND.name} does not make a first post here.</p>`
      : `<h4>First post</h4>
        ${checkbox("postOn", "Make a first post after the channel is created", Boolean(post))}
        ${textField("postTitle", "Title", post?.title ?? "", "Read me first")}
        ${checkbox("postPin", "Pin it to the top", post?.pin ?? true)}
        <label class="full">Content<textarea name="postContent" maxlength="${FORUM_LIMITS.postContent}" placeholder="How to post here.">${escapeHtml(post?.content ?? "")}</textarea></label>`}
    <div class="toolbar full">
      <button class="button compact primary">Save</button>
      <button type="button" class="button compact" data-b-panel-close>Cancel</button>
    </div>
  </form>`;
}

/** Reads the forum editor form into a forum setup block. */
function forumFromForm(form, media) {
  const data = new FormData(form);
  const names = data.getAll("tagName").map((value) => String(value).trim());
  const emojis = data.getAll("tagEmoji").map((value) => String(value).trim());
  const tags = names.map((name, index) => ({ name, ...(emojis[index] ? { emoji: emojis[index] } : {}) }));
  const guidelines = String(data.get("guidelines") ?? "").trim();
  const reaction = String(data.get("defaultReactionEmoji") ?? "").trim();
  const on = !media && form.elements.postOn?.checked === true;
  return {
    tags,
    ...(guidelines ? { guidelines } : {}),
    ...(reaction ? { defaultReactionEmoji: reaction } : {}),
    ...(on ? { firstPost: { title: String(data.get("postTitle") ?? "").trim(), content: String(data.get("postContent") ?? "").trim(), pin: form.elements.postPin?.checked === true } } : {}),
  };
}

/** Applies `change` to a copy of the blueprint and saves it. */
async function editBlueprint(change, message) {
  const draft = view.overview.draft;
  const blueprint = structuredClone(draft.blueprint);
  change(blueprint);
  try {
    const saved = (await sendJson("builder/draft", "PUT", { answers: draft.answers, blueprint, expectedRevision: draft.revision })).data;
    view.overview.draft = saved;
    view.panel = undefined;
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
    ${preflight.messages.length ? `<ul class="checklist">${preflight.messages.map((message) => `<li>${escapeHtml(message)}</li>`).join("")}</ul>` : `<p class="microcopy">${BRAND.name} can create roles and channels.</p>`}
  </div>`;
  if (active) return `${status}${runProgress(view.selected)}`;
  if (!draft) return `${status}${noDraft()}`;
  const { summary, links } = draft;
  return `${status}
    <form class="card form-grid readable-form" data-b-form="build">
      <h3>How to build</h3>
      <label class="checkbox full"><input type="radio" name="mode" value="ADD" checked> Add to my server: skip roles and channels that already exist with the same name</label>
      <label class="checkbox full"><input type="radio" name="mode" value="FRESH"> Fresh layout: create everything, even if the names already exist</label>
      <p class="microcopy full">Nothing already in your server is ever deleted. You can undo a build later; that only removes what the build created.</p>
      <h3>Connect ${BRAND.name} features</h3>
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
  container.querySelectorAll("[data-b-retype-channel]").forEach((select) => select.addEventListener("change", () => {
    const key = select.dataset.bRetypeChannel;
    const type = select.value;
    void editBlueprint((blueprint) => {
      const found = findTarget(blueprint, key);
      if (!found?.channel) return;
      const channel = found.channel;
      const wasForum = FORUM_TYPES.has(channel.type);
      channel.type = type;
      if (FORUM_TYPES.has(type)) {
        if (!wasForum || !channel.forum) channel.forum = defaultForum(type);
        else if (type === "MEDIA") delete channel.forum.firstPost;
      } else delete channel.forum;
      if (TEXT_TYPES.has(type)) channel.name = channel.name.toLowerCase().replace(/\s+/g, "-");
    }, "Saved.");
  }));
  container.querySelectorAll("[data-b-open-access]").forEach((button) => button.addEventListener("click", () => {
    const key = button.dataset.bOpenAccess;
    if (view.panel?.kind === "access" && view.panel.key === key) { view.panel = undefined; return render(); }
    return openAccessEditor(key);
  }));
  container.querySelectorAll("[data-b-open-forum]").forEach((button) => button.addEventListener("click", () => {
    const key = button.dataset.bOpenForum;
    if (view.panel?.kind === "forum" && view.panel.key === key) { view.panel = undefined; return render(); }
    return openForumEditor(key);
  }));
  container.querySelectorAll("[data-b-panel-close]").forEach((button) => button.addEventListener("click", () => {
    view.panel = undefined;
    render();
  }));
  container.querySelectorAll("[data-b-access]").forEach((button) => button.addEventListener("click", () => {
    const target = button.dataset.bAccess;
    view.panel.choices[target] = { ...view.panel.choices[target], access: button.dataset.value };
    view.panel.touched.add(target);
    render();
  }));
  container.querySelectorAll("[data-b-manage]").forEach((input) => input.addEventListener("change", () => {
    const target = input.dataset.bManage;
    view.panel.choices[target] = { ...view.panel.choices[target], manage: input.checked };
    view.panel.touched.add(target);
    render();
  }));
  container.querySelectorAll("[data-b-access-save], [data-b-access-apply]").forEach((button) => button.addEventListener("click", () => {
    const applyToChannels = "bAccessApply" in button.dataset;
    const key = view.panel.key;
    void editBlueprint((blueprint) => {
      const found = findTarget(blueprint, key);
      if (!found) return;
      found.item.overwrites = editedOverwrites(found.item, found.channel?.type);
      if (!applyToChannels || found.channel) return;
      for (const channel of found.category.channels) {
        const sets = permissionSets(channel.type);
        for (const [target, choice] of Object.entries(view.panel.choices)) channel.overwrites = applyChoice(channel.overwrites, target, choice, sets);
      }
    }, applyToChannels ? "Access applied to every channel in the category." : "Access saved.");
  }));
  container.querySelectorAll("[data-b-tag-add], [data-b-tag-remove]").forEach((button) => button.addEventListener("click", () => {
    const form = button.closest("form");
    const found = findTarget(view.overview.draft.blueprint, view.panel.key);
    const forum = forumFromForm(form, found?.channel?.type === "MEDIA");
    if ("bTagRemove" in button.dataset) forum.tags.splice(Number(button.dataset.bTagRemove), 1);
    else forum.tags.push({ name: "" });
    view.panel.forum = forum;
    render();
    container.querySelector(".forum-tags input[name=tagName]:placeholder-shown")?.focus();
  }));
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
    case "design": {
      const prompt = String(new FormData(form).get("prompt") ?? "").trim();
      if (!prompt) return notify("Describe your server first.", "error");
      const draft = view.overview.draft;
      if (draft && !(await confirmAction({ title: "Design a new blueprint?", body: "This replaces your current blueprint, including any edits you made to it.", confirmText: "Design" }))) return undefined;
      view.designing = true;
      render();
      try {
        const result = (await sendJson("builder/design", "POST", { prompt, expectedRevision: draft?.revision ?? 0 })).data;
        view.overview.draft = result.draft;
        view.answers = structuredClone(result.draft.answers);
        notify(result.summary || "Blueprint designed. Check it before you build.");
        view.tab = "blueprint";
        history.replaceState({}, "", appPath("/builder?tab=blueprint"));
      } catch (error) {
        notify(error.message || "The AI designer did not answer. Try again.", "error");
        if (error.status === 409) await load();
      }
      view.designing = false;
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
        category.channels.push({ key: uniqueKey(blueprint, name), name, type, slowmodeSeconds: 0, nsfw: false, userLimit: 0, overwrites: [], ...(FORUM_TYPES.has(type) ? { forum: defaultForum(type) } : {}) });
      }, "Channel added.");
    }
    case "forum": {
      const key = form.dataset.channel;
      const found = findTarget(view.overview.draft.blueprint, key);
      const forum = forumFromForm(form, found?.channel?.type === "MEDIA");
      if (forum.tags.some((tag) => !tag.name)) return notify("Every tag needs a name.", "error");
      if (forum.firstPost && (!forum.firstPost.title || !forum.firstPost.content)) return notify("The first post needs a title and content.", "error");
      return editBlueprint((blueprint) => {
        const target = findTarget(blueprint, key);
        if (target?.channel) target.channel.forum = forum;
      }, "Forum setup saved.");
    }
    case "build": {
      const data = new FormData(form);
      const mode = String(data.get("mode"));
      const links = data.getAll("links");
      const { summary } = view.overview.draft;
      const ok = await confirmAction({
        title: "Build your server now?",
        body: `${BRAND.name} will create up to ${summary.roles} roles and ${summary.totalChannels} channels and categories${links.length ? `, then connect ${links.length} features` : ""}. ${mode === "ADD" ? "Items that already exist are skipped." : "Everything is created new."} Nothing is deleted.`,
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
