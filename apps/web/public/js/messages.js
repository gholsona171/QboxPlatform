import { getJson, sendJson } from "./api.js";
import { appPath } from "./config.js";
import { channelSelect, checkbox, loadDirectory, selectField, textArea, textField } from "./forms.js";
import { badge, confirmAction, escapeHtml, notify } from "./ui.js";
import { BRAND } from "./brand.js";

const TABS = [["look", "Look"], ["messages", "Messages"]];
const FEATURE_LABELS = { tickets: "Tickets", moderation: "Moderation", levels: "Levels", giveaways: "Giveaways", community: "Welcome and goodbye", verification: "Verification", birthdays: "Birthdays", streams: "Streams", games: "Game servers" };
const MAX_FIELDS = 25;
const SAMPLE_EMBED = {
  title: "Ticket #12 · General support",
  description: "Thanks for reaching out, <@123456789012345678>. A member of the team will be with you shortly.",
  fields: [{ name: "Reason", value: "General support", inline: true }, { name: "Priority", value: "Normal", inline: true }],
};
const EMPTY_EMBED = () => ({ title: "", description: "", url: "", color: "", image: { url: "" }, thumbnail: { url: "" }, author: { name: "", icon_url: "" }, footer: { text: "", icon_url: "" }, fields: [] });

const view = { tab: "look", overview: undefined, error: undefined, look: undefined, editor: undefined };
let container;

export async function renderMessagesPage(target) {
  container = target;
  view.tab = new URLSearchParams(location.search).get("tab") || view.tab;
  container.innerHTML = `<section class="card"><p class="microcopy">Loading messages...</p></section>`;
  await load();
  render();
}

async function load() {
  try {
    view.overview = (await getJson("messages/overview")).data;
    view.look = { ...view.overview.look };
    view.error = undefined;
    await loadDirectory();
  } catch (error) {
    view.error = error;
  }
}

function render() {
  if (!container?.isConnected) return;
  if (view.error) {
    const denied = view.error.status === 403;
    container.innerHTML = `<section class="card"><h2>${denied ? "You don't have access to Look & Messages" : "Look & Messages is unavailable"}</h2>
      <p class="microcopy">${denied ? "Ask a server admin for the Manage messages permission (messages.manage)." : escapeHtml(view.error.message)}</p></section>`;
    return;
  }
  if (!TABS.some(([id]) => id === view.tab)) view.tab = "look";
  container.innerHTML = `${setupCard()}<section class="card">
    <nav class="tab-bar" aria-label="Look and messages sections">${TABS.map(([id, label]) => `<button class="tab ${view.tab === id ? "active" : ""}" data-m-tab="${id}">${escapeHtml(label)}</button>`).join("")}</nav>
    <div>${view.tab === "messages" ? messagesTab() : lookTab()}</div>
  </section>`;
  bind();
}

/* ---------- Setup card ---------- */

function customizedCount() {
  return view.overview.templates.filter((entry) => entry.customized).length;
}

function setupCard() {
  if (view.overview.look.revision > 0 || customizedCount() > 0) return "";
  return `<section class="card setup-card">
    <h2>Make the bot's messages your own</h2>
    <p class="microcopy">Two ways, use one or both.</p>
    <ul class="checklist">
      <li><span class="check" aria-hidden="true"></span><span><strong>Look</strong> sets one color, footer, and author for every embed ${BRAND.name} sends, from every feature.</span></li>
      <li><span class="check" aria-hidden="true"></span><span><strong>Messages</strong> replaces the text and embed of one message, for example the ticket welcome or the level-up post.</span></li>
    </ul>
    <div class="toolbar"><button class="button primary" data-m-tab="look">Set the look</button><button class="button" data-m-tab="messages">Customize a message</button></div>
  </section>`;
}

/* ---------- Look tab ---------- */

function lookTab() {
  const l = view.look;
  return `<section class="grid editor-layout">
    <form class="form-grid" data-m-form="look">
      <p class="microcopy full">The look applies to every embed ${BRAND.name} sends, from every feature, without changing their text.</p>
      ${checkbox("enabled", "Apply the look", l.enabled)}
      ${selectField("mode", "How to apply it", [["fill", "Fill: only where an embed leaves it empty"], ["override", "Override: always use my color, footer, and author"]], l.mode)}
      ${textField("accentColor", "Accent color", l.accentColor, "#5865F2")}
      ${textField("authorName", "Author name", l.authorName, "{server}")}
      ${textField("authorIconUrl", "Author icon link", l.authorIconUrl, "https://...png", false, "full")}
      ${textField("footerText", "Footer text", l.footerText, "{server} · powered by {brand}")}
      ${textField("footerIconUrl", "Footer icon link", l.footerIconUrl, "https://...png")}
      ${textField("thumbnailUrl", "Thumbnail link (top right of each embed)", l.thumbnailUrl, "https://...png", false, "full")}
      ${checkbox("showTimestamp", "Add the time the message was sent", l.showTimestamp)}
      <p class="microcopy full">Text fields understand {server} (your server's name) and {brand} (${BRAND.name}).</p>
      <button class="button primary full">Save look</button>
    </form>
    <div class="card">
      <h3>Preview</h3>
      <p class="microcopy">A sample ticket message with your look applied.</p>
      <div data-m-look-preview>${discordMessage({ embeds: [applyLook(SAMPLE_EMBED, l)] })}</div>
    </div>
  </section>`;
}

function lookFromForm(form) {
  const data = new FormData(form);
  const text = (name) => String(data.get(name) ?? "").trim();
  return {
    enabled: form.elements.enabled.checked,
    mode: text("mode") || "fill",
    accentColor: text("accentColor"),
    footerText: text("footerText"),
    footerIconUrl: text("footerIconUrl"),
    authorName: text("authorName"),
    authorIconUrl: text("authorIconUrl"),
    thumbnailUrl: text("thumbnailUrl"),
    showTimestamp: form.elements.showTimestamp.checked,
  };
}

/** Mirrors the server's applyLook for the live preview. */
function applyLook(embed, look) {
  if (!look.enabled) return embed;
  const server = view.overview.templates[0]?.samples?.server ?? "Your Server";
  const fill = (text) => String(text).replaceAll("{server}", server).replaceAll("{brand}", BRAND.name);
  const override = look.mode === "override";
  const result = { ...embed };
  if (/^#?[0-9a-f]{6}$/i.test(look.accentColor ?? "") && (override || embed.color === undefined)) result.color = Number.parseInt(look.accentColor.replace("#", ""), 16);
  if (look.footerText && (override || !embed.footer)) result.footer = { text: fill(look.footerText), ...(look.footerIconUrl ? { icon_url: look.footerIconUrl } : {}) };
  if (look.authorName && (override || !embed.author)) result.author = { name: fill(look.authorName), ...(look.authorIconUrl ? { icon_url: look.authorIconUrl } : {}) };
  if (look.thumbnailUrl && !embed.thumbnail) result.thumbnail = { url: look.thumbnailUrl };
  if (look.showTimestamp && !embed.timestamp) result.timestamp = new Date().toISOString();
  return result;
}

async function saveLook(form) {
  const look = lookFromForm(form);
  const optional = (name) => (look[name] ? { [name]: look[name] } : {});
  try {
    const saved = (await sendJson("messages/look", "PUT", {
      enabled: look.enabled,
      mode: look.mode,
      showTimestamp: look.showTimestamp,
      ...optional("accentColor"),
      ...optional("footerText"),
      ...optional("footerIconUrl"),
      ...optional("authorName"),
      ...optional("authorIconUrl"),
      ...optional("thumbnailUrl"),
      expectedRevision: view.overview.look.revision,
    })).data;
    view.overview.look = saved;
    view.look = { ...saved };
    notify("Look saved. New embeds use it within a minute.");
    render();
  } catch (error) {
    notify(error.message || "That did not work.", "error");
  }
}

/* ---------- Messages tab ---------- */

function messagesTab() {
  if (view.editor) return editor();
  const groups = new Map();
  for (const entry of view.overview.templates) {
    if (!groups.has(entry.feature)) groups.set(entry.feature, []);
    groups.get(entry.feature).push(entry);
  }
  return `<p class="microcopy">Each message ${BRAND.name} sends has a default. Customize one to replace its text and embed; reset it to go back to the default.</p>
    ${[...groups.entries()].map(([feature, entries]) => `<div class="card"><h3>${escapeHtml(FEATURE_LABELS[feature] ?? feature)}</h3>
      <div class="message-list">${entries.map((entry) => `<div class="message-row">
        <div class="message-info"><strong>${escapeHtml(entry.name)}</strong>${entry.customized ? badge("customized") : ""}${entry.directMessage ? `<small class="microcopy">Direct message</small>` : ""}<small class="microcopy">${escapeHtml(entry.description)}</small></div>
        <div class="toolbar">
          <button class="button compact primary" data-m-edit="${escapeHtml(entry.key)}">${entry.customized ? "Edit" : "Customize"}</button>
          ${entry.customized ? `<button class="button compact" data-m-test="${escapeHtml(entry.key)}">Send test</button><button class="button compact" data-m-reset="${escapeHtml(entry.key)}">Reset</button>` : ""}
        </div>
      </div>`).join("")}</div>
    </div>`).join("")}`;
}

function entryOf(key) {
  return view.overview.templates.find((entry) => entry.key === key);
}

function openEditor(key) {
  const entry = entryOf(key);
  const draft = entry.template ? cloneDraft(entry.template) : { content: "", embeds: [EMPTY_EMBED()] };
  if (!draft.embeds.length) draft.embeds = [EMPTY_EMBED()];
  view.editor = { key, mode: "form", draft, jsonText: toJson(draft), jsonError: undefined, channelId: "", focused: undefined };
  render();
}

function cloneDraft(template) {
  return { content: template.content ?? "", embeds: (template.embeds ?? []).map((embed) => ({ ...EMPTY_EMBED(), ...embed, color: typeof embed.color === "number" ? `#${embed.color.toString(16).padStart(6, "0").toUpperCase()}` : String(embed.color ?? ""), image: { url: embed.image?.url ?? "" }, thumbnail: { url: embed.thumbnail?.url ?? "" }, author: { name: embed.author?.name ?? "", icon_url: embed.author?.icon_url ?? "" }, footer: { text: embed.footer?.text ?? "", icon_url: embed.footer?.icon_url ?? "" }, fields: (embed.fields ?? []).map((field) => ({ ...field })) })) };
}

/** Discord message JSON without empty parts: what gets saved and what the JSON tab shows. */
function cleanDraft(draft) {
  const embeds = draft.embeds.map((embed) => {
    const out = {};
    if (embed.title?.trim()) out.title = embed.title.trim();
    if (embed.description?.trim()) out.description = embed.description.trim();
    if (embed.url?.trim()) out.url = embed.url.trim();
    if (typeof embed.color === "number") out.color = embed.color;
    else if (embed.color?.trim()) out.color = embed.color.trim();
    if (embed.timestamp) out.timestamp = embed.timestamp;
    if (embed.author?.name?.trim()) out.author = { name: embed.author.name.trim(), ...(embed.author.icon_url?.trim() ? { icon_url: embed.author.icon_url.trim() } : {}), ...(embed.author.url ? { url: embed.author.url } : {}) };
    if (embed.thumbnail?.url?.trim()) out.thumbnail = { url: embed.thumbnail.url.trim() };
    if (embed.image?.url?.trim()) out.image = { url: embed.image.url.trim() };
    const fields = (embed.fields ?? []).filter((field) => field.name?.trim() || field.value?.trim()).map((field) => ({ name: field.name ?? "", value: field.value ?? "", ...(field.inline ? { inline: true } : {}) }));
    if (fields.length) out.fields = fields;
    if (embed.footer?.text?.trim()) out.footer = { text: embed.footer.text.trim(), ...(embed.footer.icon_url?.trim() ? { icon_url: embed.footer.icon_url.trim() } : {}) };
    return out;
  }).filter((embed) => Object.keys(embed).length > 0);
  return { ...(draft.content?.trim() ? { content: draft.content } : {}), embeds };
}

function toJson(draft) {
  return JSON.stringify(cleanDraft(draft), null, 2);
}

function editor() {
  const e = view.editor;
  const entry = entryOf(e.key);
  const embed = e.draft.embeds[0] ?? EMPTY_EMBED();
  const extra = e.draft.embeds.length - 1;
  return `<div class="split-line"><h3>${escapeHtml(entry.name)}</h3><button class="button compact" data-m-back>Back to the list</button></div>
    <p class="microcopy">${escapeHtml(entry.description)} Discord embeds are JSON, not HTML: what you write here is sent to Discord as is, with Discord's own markdown.</p>
    <section class="grid editor-layout">
      <div>
        <div class="segmented" role="tablist" aria-label="Editor mode">
          <button type="button" class="${e.mode === "form" ? "active" : ""}" data-m-mode="form" role="tab" aria-selected="${e.mode === "form"}">Form</button>
          <button type="button" class="${e.mode === "json" ? "active" : ""}" data-m-mode="json" role="tab" aria-selected="${e.mode === "json"}">JSON</button>
        </div>
        ${e.mode === "json" ? `<form class="form-grid" data-m-form="json">
          <p class="microcopy full">Standard Discord message JSON: <code>{ "content": "...", "embeds": [ ... ] }</code>. Paste what an embed builder such as Discohook exports, or write your own. Up to 10 embeds.</p>
          <label class="full">JSON<textarea name="json" class="json-editor" spellcheck="false">${escapeHtml(e.jsonText)}</textarea></label>
          <p class="microcopy full ${e.jsonError ? "danger-text" : ""}" data-m-json-error>${e.jsonError ? escapeHtml(e.jsonError) : "Valid JSON."}</p>
        </form>` : `<form class="form-grid" data-m-form="template">
          ${textArea("content", "Message text (above the embed)", e.draft.content, "Hi {user}, welcome to {server}!")}
          <h4>Embed</h4>
          ${extra > 0 ? `<p class="microcopy full">This message has ${extra + 1} embeds. The form edits the first one; use JSON for the others.</p>` : ""}
          ${textField("title", "Title", embed.title, "", false, "full")}
          ${textArea("description", "Description", embed.description)}
          ${textField("color", "Color", embed.color, "#5865F2")}
          ${textField("url", "Title link", embed.url, "https://")}
          ${textField("imageUrl", "Image link", embed.image.url, "https://...png")}
          ${textField("thumbnailUrl", "Thumbnail link", embed.thumbnail.url, "https://...png")}
          ${textField("authorName", "Author name", embed.author.name)}
          ${textField("authorIconUrl", "Author icon link", embed.author.icon_url, "https://...png")}
          ${textField("footerText", "Footer text", embed.footer.text)}
          ${textField("footerIconUrl", "Footer icon link", embed.footer.icon_url, "https://...png")}
          <h4>Fields (up to ${MAX_FIELDS})</h4>
          <div class="field-list full" data-m-fields>${embed.fields.map((field, index) => fieldRow(field, index)).join("")}</div>
          <div class="toolbar full"><button type="button" class="button compact" data-m-add-field ${embed.fields.length >= MAX_FIELDS ? "disabled" : ""}>Add a field</button></div>
        </form>`}
        <div class="toolbar">
          <button class="button primary" data-m-save>Save</button>
          ${entry.customized ? `<button class="button" data-m-reset="${escapeHtml(entry.key)}">Reset to default</button>` : ""}
        </div>
      </div>
      <div class="card">
        <h3>Preview</h3>
        <p class="microcopy">Shown with sample values${view.overview.look.enabled && view.overview.look.revision > 0 ? " and your look" : ""}.</p>
        <div data-m-preview>${previewHtml()}</div>
        <h4>Placeholders</h4>
        <p class="microcopy">Click one to insert it where you were typing.</p>
        <div class="chip-row">${entry.placeholders.map((placeholder) => `<button type="button" class="chip" data-m-insert="{${escapeHtml(placeholder.name)}}" title="${escapeHtml(placeholder.description)}">{${escapeHtml(placeholder.name)}}</button>`).join("")}</div>
        <h4>Send a test</h4>
        <form class="form-grid" data-m-form="test">
          ${channelSelect("channelId", "Channel", e.channelId, "TEXT", "Choose a channel")}
          <button class="button full">Send test</button>
        </form>
      </div>
    </section>`;
}

function fieldRow(field, index) {
  return `<div class="message-field" data-m-field="${index}">
    <input name="fieldName${index}" value="${escapeHtml(field.name ?? "")}" placeholder="Name" aria-label="Field ${index + 1} name">
    <input name="fieldValue${index}" value="${escapeHtml(field.value ?? "")}" placeholder="Value" aria-label="Field ${index + 1} value">
    <label class="checkbox"><input type="checkbox" name="fieldInline${index}" ${field.inline ? "checked" : ""}> Inline</label>
    <button type="button" class="button compact" data-m-remove-field="${index}" aria-label="Remove field ${index + 1}">×</button>
  </div>`;
}

function draftFromForm(form) {
  const e = view.editor;
  const value = (name) => String(form.elements[name]?.value ?? "");
  const embed = { ...(e.draft.embeds[0] ?? EMPTY_EMBED()) };
  embed.title = value("title");
  embed.description = value("description");
  embed.color = value("color");
  embed.url = value("url");
  embed.image = { url: value("imageUrl") };
  embed.thumbnail = { url: value("thumbnailUrl") };
  embed.author = { ...embed.author, name: value("authorName"), icon_url: value("authorIconUrl") };
  embed.footer = { text: value("footerText"), icon_url: value("footerIconUrl") };
  embed.fields = [...form.querySelectorAll("[data-m-field]")].map((row) => {
    const index = row.dataset.mField;
    return { name: value(`fieldName${index}`), value: value(`fieldValue${index}`), inline: form.elements[`fieldInline${index}`]?.checked === true };
  });
  e.draft = { content: value("content"), embeds: [embed, ...e.draft.embeds.slice(1)] };
  e.jsonText = toJson(e.draft);
}

function draftFromJson(text) {
  const e = view.editor;
  e.jsonText = text;
  try {
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("The JSON must be an object with content and embeds.");
    if (parsed.embeds !== undefined && !Array.isArray(parsed.embeds)) throw new Error('"embeds" must be a list.');
    if (parsed.content !== undefined && parsed.content !== null && typeof parsed.content !== "string") throw new Error('"content" must be text.');
    e.draft = cloneDraft({ content: parsed.content ?? "", embeds: (parsed.embeds ?? []).map((embed) => (embed && typeof embed === "object" ? { ...embed, color: typeof embed.color === "string" ? Number.parseInt(embed.color.replace("#", ""), 16) : embed.color } : {})) });
    e.jsonError = undefined;
  } catch (error) {
    e.jsonError = error instanceof SyntaxError ? `Invalid JSON: ${error.message}` : error.message;
  }
}

/* ---------- Preview ---------- */

function fillSamples(text, samples) {
  return String(text ?? "").replaceAll(/\{([a-zA-Z0-9_.]+)\}/g, (token, name) => (name in samples ? samples[name] : token));
}

function previewHtml() {
  const e = view.editor;
  const samples = entryOf(e.key).samples;
  const message = cleanDraft(e.draft);
  const fill = (text) => fillSamples(text, samples);
  const embeds = message.embeds.map((embed) => {
    const filled = {
      ...embed,
      ...(embed.title ? { title: fill(embed.title) } : {}),
      ...(embed.description ? { description: fill(embed.description) } : {}),
      ...(typeof embed.color === "string" ? { color: /^#?[0-9a-f]{6}$/i.test(embed.color) ? Number.parseInt(embed.color.replace("#", ""), 16) : undefined } : {}),
      ...(embed.author ? { author: { ...embed.author, name: fill(embed.author.name) } } : {}),
      ...(embed.footer ? { footer: { ...embed.footer, text: fill(embed.footer.text) } } : {}),
      ...(embed.fields ? { fields: embed.fields.map((field) => ({ ...field, name: fill(field.name), value: fill(field.value) })) } : {}),
    };
    return view.overview.look.revision > 0 ? applyLook(filled, view.overview.look) : filled;
  });
  return discordMessage({ ...(message.content ? { content: fill(message.content) } : {}), embeds });
}

/** Discord markup people would see: mentions and timestamps become readable. */
function discordText(text) {
  return escapeHtml(text)
    .replaceAll(/&lt;@!?\d+&gt;/g, `<span class="dc-mention">@Alex</span>`)
    .replaceAll(/&lt;@&amp;\d+&gt;/g, `<span class="dc-mention">@Role</span>`)
    .replaceAll(/&lt;#\d+&gt;/g, `<span class="dc-mention">#channel</span>`)
    .replaceAll(/&lt;t:(\d+)(?::[a-zA-Z])?&gt;/g, (_match, seconds) => escapeHtml(new Date(Number(seconds) * 1000).toLocaleString()))
    .replaceAll(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

function discordMessage(message) {
  const embeds = (message.embeds ?? []).filter((embed) => embed && Object.keys(embed).length);
  const color = (embed) => (typeof embed.color === "number" ? `#${embed.color.toString(16).padStart(6, "0")}` : "#1e1f22");
  const image = (label, url) => (url ? `<img class="dc-image" alt="${escapeHtml(label)}" src="${escapeHtml(url)}" onerror="this.replaceWith(Object.assign(document.createElement('p'), { className: 'microcopy', textContent: '[${escapeHtml(label)}]' }))">` : "");
  return `<div class="dc-message">
    <div class="dc-avatar">${escapeHtml(BRAND.name.slice(0, 2).toUpperCase())}</div>
    <div class="dc-body">
      <div class="dc-author">${escapeHtml(BRAND.name)} <span class="dc-bot">APP</span></div>
      ${message.content ? `<p class="dc-content">${discordText(message.content)}</p>` : ""}
      ${embeds.map((embed) => `<div class="dc-embed ${embed.thumbnail ? "has-thumb" : ""}" style="border-left-color:${escapeHtml(color(embed))}">
        ${embed.author ? `<div class="dc-embed-author">${embed.author.icon_url ? `<img alt="" src="${escapeHtml(embed.author.icon_url)}">` : ""}<span>${discordText(embed.author.name)}</span></div>` : ""}
        ${embed.title ? `<strong>${discordText(embed.title)}</strong>` : ""}
        ${embed.description ? `<p>${discordText(embed.description)}</p>` : ""}
        ${embed.fields?.length ? `<div class="dc-fields">${embed.fields.map((field) => `<div class="dc-field ${field.inline ? "" : "full"}"><strong>${discordText(field.name)}</strong><p>${discordText(field.value)}</p></div>`).join("")}</div>` : ""}
        ${embed.image ? image("image", embed.image.url) : ""}
        ${embed.thumbnail ? `<div class="dc-thumb">${image("thumbnail", embed.thumbnail.url)}</div>` : ""}
        ${embed.footer || embed.timestamp ? `<div class="dc-embed-footer">${embed.footer?.icon_url ? `<img alt="" src="${escapeHtml(embed.footer.icon_url)}">` : ""}<small>${embed.footer ? discordText(embed.footer.text) : ""}${embed.footer && embed.timestamp ? " • " : ""}${embed.timestamp ? escapeHtml(new Date(embed.timestamp).toLocaleString()) : ""}</small></div>` : ""}
      </div>`).join("")}
      ${!message.content && !embeds.length ? `<p class="microcopy">Write some text or fill in the embed.</p>` : ""}
    </div>
  </div>`;
}

/* ---------- Events ---------- */

function bind() {
  container.querySelectorAll("[data-m-tab]").forEach((button) => button.addEventListener("click", () => {
    view.tab = button.dataset.mTab;
    view.editor = undefined;
    history.replaceState({}, "", appPath(`/messages?tab=${view.tab}`));
    render();
  }));
  const lookForm = container.querySelector('form[data-m-form="look"]');
  lookForm?.addEventListener("input", () => {
    const preview = container.querySelector("[data-m-look-preview]");
    if (preview) preview.innerHTML = discordMessage({ embeds: [applyLook(SAMPLE_EMBED, lookFromForm(lookForm))] });
  });
  lookForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    void saveLook(lookForm);
  });

  container.querySelectorAll("[data-m-edit]").forEach((button) => button.addEventListener("click", () => openEditor(button.dataset.mEdit)));
  container.querySelectorAll("[data-m-reset]").forEach((button) => button.addEventListener("click", () => void resetTemplate(button.dataset.mReset)));
  container.querySelectorAll("[data-m-test]").forEach((button) => button.addEventListener("click", () => {
    openEditor(button.dataset.mTest);
    container.querySelector('form[data-m-form="test"] select, form[data-m-form="test"] input')?.focus();
  }));
  if (view.editor) bindEditor();
}

function bindEditor() {
  const e = view.editor;
  container.querySelector("[data-m-back]")?.addEventListener("click", () => {
    view.editor = undefined;
    render();
  });
  container.querySelectorAll("[data-m-mode]").forEach((button) => button.addEventListener("click", () => switchMode(button.dataset.mMode)));
  const templateForm = container.querySelector('form[data-m-form="template"]');
  const jsonForm = container.querySelector('form[data-m-form="json"]');
  const refreshPreview = () => {
    const preview = container.querySelector("[data-m-preview]");
    if (preview) preview.innerHTML = previewHtml();
  };
  templateForm?.addEventListener("input", () => {
    draftFromForm(templateForm);
    refreshPreview();
  });
  templateForm?.addEventListener("submit", (event) => event.preventDefault());
  templateForm?.querySelector("[data-m-add-field]")?.addEventListener("click", () => {
    draftFromForm(templateForm);
    const embed = e.draft.embeds[0];
    if (embed.fields.length >= MAX_FIELDS) return;
    embed.fields.push({ name: "", value: "", inline: false });
    render();
    container.querySelector(`[name="fieldName${embed.fields.length - 1}"]`)?.focus();
  });
  templateForm?.querySelectorAll("[data-m-remove-field]").forEach((button) => button.addEventListener("click", () => {
    draftFromForm(templateForm);
    e.draft.embeds[0].fields.splice(Number(button.dataset.mRemoveField), 1);
    render();
  }));
  jsonForm?.addEventListener("input", () => {
    draftFromJson(jsonForm.elements.json.value);
    const error = container.querySelector("[data-m-json-error]");
    if (error) {
      error.textContent = e.jsonError ?? "Valid JSON.";
      error.classList.toggle("danger-text", Boolean(e.jsonError));
    }
    if (!e.jsonError) refreshPreview();
  });
  jsonForm?.addEventListener("submit", (event) => event.preventDefault());
  container.addEventListener("focusin", (event) => {
    const target = event.target;
    if ((target instanceof HTMLInputElement && target.type === "text") || target instanceof HTMLTextAreaElement) {
      if (target.closest('form[data-m-form="template"], form[data-m-form="json"]')) e.focused = target;
    }
  });
  container.querySelectorAll("[data-m-insert]").forEach((button) => button.addEventListener("click", () => insertPlaceholder(button.dataset.mInsert)));
  container.querySelector("[data-m-save]")?.addEventListener("click", () => void saveTemplate());
  const testForm = container.querySelector('form[data-m-form="test"]');
  testForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    e.channelId = String(new FormData(testForm).get("channelId") ?? "");
    void sendTest();
  });
}

function switchMode(mode) {
  const e = view.editor;
  if (mode === e.mode) return;
  if (mode === "form" && e.jsonError) return notify("Fix the JSON first, or go back to the form and lose these changes by reloading.", "error");
  if (mode === "json") e.jsonText = toJson(e.draft);
  e.mode = mode;
  e.focused = undefined;
  return render();
}

function insertPlaceholder(token) {
  const e = view.editor;
  const target = e.focused && e.focused.isConnected ? e.focused : container.querySelector(e.mode === "json" ? 'textarea[name="json"]' : 'textarea[name="content"]');
  if (!target) return;
  const start = target.selectionStart ?? target.value.length;
  const end = target.selectionEnd ?? start;
  target.value = `${target.value.slice(0, start)}${token}${target.value.slice(end)}`;
  target.selectionStart = target.selectionEnd = start + token.length;
  target.focus();
  target.dispatchEvent(new Event("input", { bubbles: true }));
}

function currentDraft() {
  const e = view.editor;
  if (e.mode === "json" && e.jsonError) throw new Error(e.jsonError);
  const message = cleanDraft(e.draft);
  return { content: message.content ?? "", embeds: message.embeds };
}

async function saveTemplate() {
  const e = view.editor;
  try {
    const saved = (await sendJson(`messages/templates/${encodeURIComponent(e.key)}`, "PUT", currentDraft())).data;
    replaceEntry(saved);
    notify("Message saved. It is used within a minute.");
    view.editor = undefined;
    render();
  } catch (error) {
    notify(error.message || "That did not work.", "error");
  }
}

async function resetTemplate(key) {
  const entry = entryOf(key);
  if (!(await confirmAction({ title: `Reset "${entry.name}"?`, body: `${BRAND.name} goes back to its built-in message. Your custom text and embed are deleted.`, confirmText: "Reset" }))) return;
  try {
    replaceEntry((await sendJson(`messages/templates/${encodeURIComponent(key)}`, "DELETE")).data);
    notify("Back to the default message.");
    view.editor = undefined;
    render();
  } catch (error) {
    notify(error.message || "That did not work.", "error");
  }
}

async function sendTest() {
  const e = view.editor;
  if (!e.channelId) return notify("Choose a channel first.", "error");
  try {
    await sendJson(`messages/templates/${encodeURIComponent(e.key)}/test`, "POST", { channelId: e.channelId, ...currentDraft() });
    notify("Test message sent.");
  } catch (error) {
    notify(error.message || "That did not work.", "error");
  }
  return undefined;
}

function replaceEntry(entry) {
  view.overview.templates = view.overview.templates.map((item) => (item.key === entry.key ? entry : item));
}
