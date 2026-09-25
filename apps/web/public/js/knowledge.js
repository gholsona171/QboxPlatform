import { getJson, sendJson } from "./api.js";
import { appPath } from "./config.js";
import { bindPickers, boolValue, channelPicker, channelSelect, checkbox, dateTime, detail, intValue, loadDirectory, numberField, relative, selectField, textField } from "./forms.js";
import { renderMarkdown } from "./markdown.js";
import { badge, confirmAction, escapeHtml, notify, row, table } from "./ui.js";

const TABS = [
  ["articles", "Articles", false],
  ["editor", "Write", true],
  ["categories", "Categories", true],
  ["settings", "Settings", true],
];

const view = { tab: "articles", overview: undefined, articles: [], filters: { search: "", categoryId: "", status: "" }, selected: undefined, editing: undefined, error: undefined };
let container;

export async function renderKnowledgePage(target) {
  container = target;
  view.tab = new URLSearchParams(location.search).get("tab") || view.tab;
  container.innerHTML = `<section class="card"><p class="microcopy">Loading the knowledge base...</p></section>`;
  await load();
  render();
}

async function load() {
  try {
    const [overview, articles] = await Promise.all([getJson("knowledge/overview"), getJson(`knowledge/articles?${articlesQuery()}`)]);
    view.overview = overview.data;
    view.articles = articles.data;
    view.error = undefined;
    if (view.overview.can.manage) await loadDirectory();
  } catch (error) {
    view.error = error;
  }
}

function articlesQuery() {
  const query = new URLSearchParams();
  if (view.filters.search) query.set("search", view.filters.search);
  if (view.filters.categoryId) query.set("categoryId", view.filters.categoryId);
  if (view.filters.status) query.set("status", view.filters.status);
  return query.toString();
}

function render() {
  if (!container?.isConnected) return;
  if (view.error) {
    container.innerHTML = `<section class="card"><h2>The knowledge base is unavailable</h2><p class="microcopy">${escapeHtml(view.error.message)}</p></section>`;
    return;
  }
  const manage = view.overview.can.manage;
  const tabs = TABS.filter(([, , staff]) => manage || !staff);
  if (!tabs.some(([id]) => id === view.tab)) view.tab = "articles";
  container.innerHTML = `<section class="card">
    <nav class="tab-bar" aria-label="Knowledge base sections">${tabs.map(([id, label]) => `<button class="tab ${view.tab === id ? "active" : ""}" data-k-tab="${id}">${escapeHtml(label)}</button>`).join("")}</nav>
    <div>${tabContent()}</div>
  </section>`;
  bind();
}

function tabContent() {
  switch (view.tab) {
    case "editor": return editorTab();
    case "categories": return categoriesTab();
    case "settings": return settingsTab();
    default: return articlesTab();
  }
}

/* ---------- Articles ---------- */

function categoryName(id) {
  const category = view.overview.categories.find((item) => item.id === id);
  return category ? `${category.emoji ? `${category.emoji} ` : ""}${category.name}` : "—";
}

function articlesTab() {
  const manage = view.overview.can.manage;
  const rows = view.articles.map((item) => row([
    ["Title", `${item.pinned ? "📌 " : ""}<strong>${escapeHtml(item.title)}</strong><br><small>${escapeHtml(item.excerpt)}</small>`],
    ["Category", escapeHtml(categoryName(item.categoryId))],
    ...(manage ? [["Status", badge(item.published ? "published" : "draft")]] : []),
    ["Views", String(item.views)],
    ["Updated", escapeHtml(relative(item.updatedAt))],
  ], `data-k-article="${escapeHtml(item.id)}" class="${item.id === view.selected?.id ? "selected" : ""}" tabindex="0"`));
  return `
    <form class="toolbar" data-k-form="filters">
      <input name="search" placeholder="Search articles" value="${escapeHtml(view.filters.search)}">
      <select name="categoryId"><option value="">All categories</option>${view.overview.categories.map((category) => `<option value="${escapeHtml(category.id)}" ${view.filters.categoryId === category.id ? "selected" : ""}>${escapeHtml(categoryName(category.id))}</option>`).join("")}</select>
      ${manage ? `<select name="status"><option value="">Published and drafts</option><option value="published" ${view.filters.status === "published" ? "selected" : ""}>Published</option><option value="draft" ${view.filters.status === "draft" ? "selected" : ""}>Drafts</option></select>` : ""}
      <button class="button compact">Search</button>
      ${manage ? `<button type="button" class="button primary compact" data-k-action="new">New article</button>` : ""}
    </form>
    <section class="grid main-detail">
      <div>${table(["Title", "Category", ...(manage ? ["Status"] : []), "Views", "Updated"], rows, view.filters.search ? "No articles match." : "No articles yet.")}</div>
      <div class="card">${articleDetail()}</div>
    </section>`;
}

function articleDetail() {
  const item = view.selected;
  if (!item) return `<p class="microcopy">Select an article to read it. Members can also use <code>/faq</code> in Discord.</p>`;
  const manage = view.overview.can.manage;
  return `<div class="detail-stack">
    <div class="split-line"><h2>${escapeHtml(item.title)}</h2>${item.published ? "" : badge("draft")}</div>
    <div class="markdown">${renderMarkdown(item.body)}</div>
    ${item.tags.length ? detail("Tags", item.tags.map((tag) => `<code>${escapeHtml(tag)}</code>`).join(" ")) : ""}
    ${detail("Category", escapeHtml(categoryName(item.categoryId)))}
    ${detail("Views", String(item.views))}
    ${detail("Written by", escapeHtml(item.authorName))}
    ${item.updatedByName ? detail("Last edited by", escapeHtml(item.updatedByName)) : ""}
    ${detail("Updated", escapeHtml(dateTime(item.updatedAt)))}
    ${manage ? `${detail("Slug", `<code>${escapeHtml(item.slug)}</code>`)}
      <div class="toolbar"><button class="button compact" data-k-action="edit">Edit</button><button class="button danger compact" data-k-action="delete">Delete</button></div>
      ${item.published ? `<form class="form-grid" data-k-form="post">${channelSelect("channelId", "Post in a channel", "", "TEXT", "Choose a channel", true)}<button class="button full">Post article</button></form>` : ""}` : ""}
  </div>`;
}

/* ---------- Editor ---------- */

function editorTab() {
  const item = view.editing ?? { title: "", slug: "", body: "", tags: [], published: false, pinned: false };
  const categories = [["", "No category"], ...view.overview.categories.map((category) => [category.id, categoryName(category.id)])];
  return `<section class="grid cols-2">
    <form class="form-grid" data-k-form="article">
      <h3>${item.id ? "Edit article" : "New article"}</h3>
      ${textField("title", "Title", item.title, "How do I join the server?", true, "full")}
      ${textField("slug", "Slug (optional)", item.slug, "how-to-join")}
      ${selectField("categoryId", "Category", categories, item.categoryId ?? "")}
      ${textField("tags", "Tags (comma separated)", item.tags.join(", "), "join, connect", false, "full")}
      <label class="full">Article (Markdown)<textarea name="body" rows="16" required data-k-body>${escapeHtml(item.body)}</textarea></label>
      <p class="microcopy full"># Heading, **bold**, *italic*, [link](https://...), - lists, \`code\`.</p>
      ${checkbox("published", "Published (members can read it)", item.published)}
      ${checkbox("pinned", "Pinned to the top", item.pinned)}
      <button class="button primary full">${item.id ? "Save article" : "Create article"}</button>
      ${item.id ? `<button type="button" class="button full" data-k-action="cancel">Cancel</button>` : ""}
    </form>
    <div class="card"><h3>Preview</h3><div class="markdown" data-k-preview>${renderMarkdown(item.body)}</div></div>
  </section>`;
}

/* ---------- Categories ---------- */

function categoriesTab() {
  const rows = view.overview.categories.map((category) => `<form class="category-row full" data-k-form="category" data-id="${escapeHtml(category.id)}">
      <input name="emoji" value="${escapeHtml(category.emoji ?? "")}" placeholder="Emoji" aria-label="Emoji" maxlength="64">
      <input name="name" value="${escapeHtml(category.name)}" required maxlength="50" aria-label="Name">
      <input type="number" name="order" value="${category.order}" min="0" max="1000" aria-label="Order">
      <span class="toolbar"><button class="button compact">Save</button><button type="button" class="button danger compact" data-k-action="delete-category" data-value="${escapeHtml(category.id)}">Delete</button></span>
    </form>`).join("");
  return `<div class="readable-form">
    <p class="microcopy">Lower order numbers show first. Deleting a category keeps its articles without a category.</p>
    ${rows || `<div class="empty-state">No categories yet.</div>`}
    <form class="card form-grid" data-k-form="category">
      <h3>Add a category</h3>
      ${textField("emoji", "Emoji (optional)", "", "📘")}
      ${textField("name", "Name", "", "Getting started", true)}
      ${numberField("order", "Order", view.overview.categories.length, 0, 1000)}
      <button class="button primary full">Add category</button>
    </form>
  </div>`;
}

/* ---------- Settings ---------- */

function settingsTab() {
  const s = view.overview.settings;
  return `<form class="form-grid readable-form" data-k-form="settings">
    <h3>Automatic answers</h3>
    <p class="microcopy full">When a message in these channels closely matches an article, Qbox replies with it. This needs the Message Content intent on the bot.</p>
    ${checkbox("autoAnswerEnabled", "Suggest articles automatically", s.autoAnswerEnabled)}
    ${channelPicker("autoAnswerChannelIds", "Channels to watch", s.autoAnswerChannelIds, "TEXT")}
    ${numberField("autoAnswerThreshold", "Match needed (1-100, higher is stricter)", s.autoAnswerThreshold, 1, 100)}
    ${numberField("autoAnswerCooldownSeconds", "Wait between answers per channel (seconds)", s.autoAnswerCooldownSeconds, 0, 86400)}
    <h3>AI answers</h3>
    <p class="microcopy full"><code>/ask</code> uses AI when <code>OPENAI_API_KEY</code> is set on the bot (model from <code>OPENAI_MODEL</code>). Without it, <code>/ask</code> shows the best matching article.</p>
    <input type="hidden" name="expectedRevision" value="${s.revision}">
    <button class="button primary full">Save settings</button>
  </form>`;
}

/* ---------- Events ---------- */

function bind() {
  container.querySelectorAll("[data-k-tab]").forEach((button) => button.addEventListener("click", () => {
    view.tab = button.dataset.kTab;
    history.replaceState({}, "", appPath(`/knowledge?tab=${view.tab}`));
    render();
  }));
  container.querySelectorAll("[data-k-article]").forEach((element) => {
    const open = () => void openArticle(element.dataset.kArticle);
    element.addEventListener("click", open);
    element.addEventListener("keydown", (event) => { if (event.key === "Enter") open(); });
  });
  container.querySelectorAll("[data-k-action]").forEach((button) => button.addEventListener("click", () => void action(button.dataset.kAction, button.dataset.value)));
  container.querySelectorAll("form[data-k-form]").forEach((form) => form.addEventListener("submit", (event) => {
    event.preventDefault();
    void submit(form);
  }));
  const body = container.querySelector("[data-k-body]");
  const preview = container.querySelector("[data-k-preview]");
  body?.addEventListener("input", () => { preview.innerHTML = renderMarkdown(body.value); });
  bindPickers(container);
}

async function openArticle(id) {
  try {
    view.selected = (await getJson(`knowledge/articles/${encodeURIComponent(id)}`)).data;
    render();
  } catch (error) {
    notify(error.message, "error");
  }
}

async function run(message, operation) {
  try {
    const result = await operation();
    if (message) notify(typeof message === "function" ? message(result) : message);
    await load();
    render();
    return result;
  } catch (error) {
    notify(error.message || "That did not work.", "error");
    return undefined;
  }
}

function showTab(tab) {
  view.tab = tab;
  history.replaceState({}, "", appPath(`/knowledge?tab=${tab}`));
  render();
}

async function action(name, value) {
  switch (name) {
    case "new":
      view.editing = undefined;
      return showTab("editor");
    case "edit":
      view.editing = view.selected;
      return showTab("editor");
    case "cancel":
      view.editing = undefined;
      return showTab("articles");
    case "delete":
      if (!(await confirmAction({ title: "Delete this article?", body: `"${view.selected.title}" will be removed for everyone.`, confirmText: "Delete" }))) return undefined;
      await run("Article deleted.", () => sendJson(`knowledge/articles/${encodeURIComponent(view.selected.id)}`, "DELETE"));
      view.selected = undefined;
      return render();
    case "delete-category":
      if (!(await confirmAction({ title: "Delete this category?", body: "Its articles stay, without a category.", confirmText: "Delete" }))) return undefined;
      return run("Category deleted.", () => sendJson(`knowledge/categories/${encodeURIComponent(value)}`, "DELETE"));
    default:
      return undefined;
  }
}

async function submit(form) {
  const data = new FormData(form);
  const text = (name) => String(data.get(name) ?? "").trim();
  switch (form.dataset.kForm) {
    case "filters":
      view.filters = { search: text("search"), categoryId: text("categoryId"), status: text("status") };
      return run(undefined, async () => undefined);
    case "article": {
      const editing = view.editing;
      const payload = {
        title: text("title"),
        ...(text("slug") ? { slug: text("slug") } : {}),
        body: String(data.get("body") ?? ""),
        tags: text("tags").split(",").map((tag) => tag.trim()).filter(Boolean),
        ...(text("categoryId") ? { categoryId: text("categoryId") } : {}),
        published: boolValue(form, "published"),
        pinned: boolValue(form, "pinned"),
      };
      const saved = await run(editing ? "Article saved." : "Article created.", () => sendJson(editing ? `knowledge/articles/${encodeURIComponent(editing.id)}` : "knowledge/articles", editing ? "PUT" : "POST", payload));
      if (!saved) return undefined;
      view.editing = undefined;
      view.selected = saved.data;
      return showTab("articles");
    }
    case "post":
      return run("Article posted.", () => sendJson(`knowledge/articles/${encodeURIComponent(view.selected.id)}/post`, "POST", { channelId: text("channelId") }));
    case "category": {
      const id = form.dataset.id;
      const payload = { name: text("name"), ...(text("emoji") ? { emoji: text("emoji") } : {}), order: intValue(data, "order", 0) };
      return run(id ? "Category saved." : "Category added.", () => sendJson(id ? `knowledge/categories/${encodeURIComponent(id)}` : "knowledge/categories", id ? "PUT" : "POST", payload));
    }
    case "settings":
      return run("Settings saved.", () => sendJson("knowledge/settings", "PUT", {
        autoAnswerEnabled: boolValue(form, "autoAnswerEnabled"),
        autoAnswerChannelIds: data.getAll("autoAnswerChannelIds"),
        autoAnswerThreshold: intValue(data, "autoAnswerThreshold", 70),
        autoAnswerCooldownSeconds: intValue(data, "autoAnswerCooldownSeconds", 300),
        expectedRevision: view.overview.settings.revision,
      }));
    default:
      return undefined;
  }
}
