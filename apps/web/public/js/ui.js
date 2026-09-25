export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function badge(value) {
  const text = escapeHtml(value);
  const lower = text.toLowerCase();
  const kind =
    lower.includes("approved") || lower.includes("available") || lower.includes("running") || lower.includes("present") || lower.includes("open")
      ? "success"
      : lower.includes("denied") || lower.includes("ban") || lower.includes("closed") || lower.includes("offline")
        ? "danger"
        : lower.includes("pending") || lower.includes("waiting") || lower.includes("review") || lower.includes("busy")
          ? "warning"
          : "info";
  return `<span class="badge ${kind}">${text}</span>`;
}

/** Shown in place of any page until the visitor signs in with Discord. */
export function signInCard(loginHref, previewSite, liveHref) {
  const button = previewSite
    ? liveHref
      ? `<a class="button primary" href="${escapeHtml(liveHref)}/">Open the live platform</a>`
      : `<p class="microcopy">The live platform link has not been configured for this preview site yet.</p>`
    : `<a class="button primary" href="${escapeHtml(loginHref)}">Sign in with Discord</a>`;
  return `<section class="card sign-in-card">
    <div class="brand-mark large">QB</div>
    <h2>Sign in to manage your server</h2>
    <p class="microcopy">QboxPlatform uses your Discord account. You only see the tools your server roles allow.</p>
    ${button}
  </section>`;
}

export function notify(message, kind = "success") {
  const area = document.getElementById("notificationArea");
  const notice = document.createElement("div");
  notice.className = `notice ${kind}`;
  notice.textContent = message;
  area.append(notice);
  window.setTimeout(() => notice.remove(), 4200);
}

let activeConfirmation;

export function initializeModal() {
  const backdrop = document.getElementById("modalBackdrop");
  if (!backdrop) return;
  backdrop.hidden = true;
}

export function confirmAction({ title, body, confirmText = "Confirm" }) {
  if (activeConfirmation) activeConfirmation.close(false);

  const backdrop = document.getElementById("modalBackdrop");
  const modal = backdrop.querySelector(".modal");
  const titleElement = document.getElementById("modalTitle");
  const bodyElement = document.getElementById("modalBody");
  const cancel = document.getElementById("modalCancel");
  const confirm = document.getElementById("modalConfirm");
  const opener = document.activeElement instanceof HTMLElement ? document.activeElement : undefined;

  titleElement.textContent = title;
  bodyElement.textContent = body;
  confirm.textContent = confirmText;
  backdrop.hidden = false;
  confirm.focus();

  return new Promise((resolve) => {
    let settled = false;
    const close = (value) => {
      if (settled) return;
      settled = true;
      backdrop.hidden = true;
      cancel.removeEventListener("click", onCancel);
      confirm.removeEventListener("click", onConfirm);
      backdrop.removeEventListener("click", onBackdropClick);
      document.removeEventListener("keydown", onKeydown);
      if (activeConfirmation?.close === close) activeConfirmation = undefined;
      opener?.focus?.();
      resolve(value);
    };
    const onCancel = () => close(false);
    const onConfirm = () => close(true);
    const onBackdropClick = (event) => {
      if (!modal.contains(event.target)) close(false);
    };
    const onKeydown = (event) => {
      if (event.key === "Escape") close(false);
    };
    activeConfirmation = { close };
    cancel.addEventListener("click", onCancel);
    confirm.addEventListener("click", onConfirm);
    backdrop.addEventListener("click", onBackdropClick);
    document.addEventListener("keydown", onKeydown);
  });
}

export function formData(form) {
  return Object.fromEntries(new FormData(form).entries());
}

export function row(cells, attrs = "") {
  return `<tr ${attrs}>${cells.map(([label, value]) => `<td data-label="${escapeHtml(label)}">${value}</td>`).join("")}</tr>`;
}

export function table(headers, rows, empty = "No records to show.") {
  if (!rows.length) return `<div class="empty-state">${escapeHtml(empty)}</div>`;
  return `<div class="table-wrap"><table><thead><tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr></thead><tbody>${rows.join("")}</tbody></table></div>`;
}

export function timeline(items) {
  if (!items?.length) return `<div class="empty-state">No activity yet.</div>`;
  return `<ul class="timeline">${items.map((item) => `<li><strong>${escapeHtml(item.action || item.title)}</strong><small>${escapeHtml(item.at || item.area || "")} ${escapeHtml(item.time || "")}</small></li>`).join("")}</ul>`;
}
