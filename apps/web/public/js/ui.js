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

export function demoChip() {
  return `<span class="demo-chip">Demo data</span>`;
}

export function notify(message, kind = "success") {
  const area = document.getElementById("notificationArea");
  const notice = document.createElement("div");
  notice.className = `notice ${kind}`;
  notice.textContent = message;
  area.append(notice);
  window.setTimeout(() => notice.remove(), 4200);
}

export function confirmAction({ title, body, confirmText = "Confirm" }) {
  const backdrop = document.getElementById("modalBackdrop");
  const titleElement = document.getElementById("modalTitle");
  const bodyElement = document.getElementById("modalBody");
  const cancel = document.getElementById("modalCancel");
  const confirm = document.getElementById("modalConfirm");
  titleElement.textContent = title;
  bodyElement.textContent = body;
  confirm.textContent = confirmText;
  backdrop.hidden = false;
  confirm.focus();

  return new Promise((resolve) => {
    const close = (value) => {
      backdrop.hidden = true;
      cancel.removeEventListener("click", onCancel);
      confirm.removeEventListener("click", onConfirm);
      document.removeEventListener("keydown", onKeydown);
      resolve(value);
    };
    const onCancel = () => close(false);
    const onConfirm = () => close(true);
    const onKeydown = (event) => {
      if (event.key === "Escape") close(false);
    };
    cancel.addEventListener("click", onCancel);
    confirm.addEventListener("click", onConfirm);
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
