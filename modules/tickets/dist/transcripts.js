import { BRAND } from "@qbox/shared/brand";
/** Discord lets bots send 10 MB per file without boosts; transcripts stay under 8 MB. */
export const TRANSCRIPT_BYTE_LIMIT = 8 * 1024 * 1024;
/** "Ticket #12 - Donations #5" (reason and its own count when the ticket has one). */
export function ticketLabel(ticket) {
    const reason = ticket.categoryName ? ` - ${ticket.categoryName}${ticket.categoryNumber ? ` #${ticket.categoryNumber}` : ""}` : "";
    return `Ticket #${ticket.number}${reason}`;
}
/** The last line of a transcript cut to fit Discord's file size limit. */
export function truncationLine(deletionDate) {
    return deletionDate
        ? `Transcript truncated; the full ticket is in the portal until ${deletionDate.toISOString().slice(0, 10)}`
        : "Transcript truncated; the full ticket is in the portal";
}
function visibleMessages(input) {
    return input.messages.filter((message) => input.includeStaffChat || !message.internal);
}
/** Plain-text transcript. Discord previews .txt files inline on desktop and mobile. */
export function renderTextTranscript(input) {
    const { ticket } = input;
    const header = [
        ticketLabel(ticket),
        ...(input.serverName ? [`Server: ${input.serverName}`] : []),
        `Opened by ${ticket.openerName} (${ticket.openerId}) at ${ticket.createdAt.toISOString()}`,
        `Status: ${ticket.status}  Priority: ${ticket.priority}${ticket.claimedById ? `  Claimed by: ${ticket.claimedById}` : ""}`,
        ...(ticket.subject ? [`Subject: ${ticket.subject}`] : []),
        ...ticket.answers.map((answer) => `${answer.question}: ${answer.answer}`),
        ...(ticket.closedAt ? [`Closed at ${ticket.closedAt.toISOString()} by ${ticket.closedById ?? "system"}${ticket.closeReason ? ` - ${ticket.closeReason}` : ""}`] : []),
        "-".repeat(60),
    ].join("\n");
    const blocks = visibleMessages(input).map((message) => [
        `[${message.createdAt.toISOString()}] ${message.internal ? "[staff chat] " : ""}${message.authorName}: ${message.content}`,
        ...message.attachments.map((url) => `    attachment: ${url}`),
    ].join("\n"));
    const content = fit(`${header}\n`, blocks.map((block) => `${block}\n`), "", `${truncationLine(input.deletionDate)}\n`, input.byteLimit);
    return { fileName: `ticket-${ticket.number}-transcript.txt`, content, contentType: "text/plain; charset=utf-8" };
}
/**
 * One self-contained HTML page: inline CSS, no scripts, no external requests,
 * every value HTML-escaped. Opens in any browser and can be kept forever.
 */
export function renderHtmlTranscript(input) {
    const { ticket } = input;
    const title = `${ticketLabel(ticket)}${input.serverName ? ` · ${input.serverName}` : ""}`;
    const facts = [
        ["Ticket", `#${ticket.number}${ticket.categoryNumber ? ` · Reason #${ticket.categoryNumber}` : ""}`],
        ...(input.serverName ? [["Server", input.serverName]] : []),
        ["Reason", ticket.categoryName ?? "General support"],
        ["Opened by", ticket.openerName],
        ["Opened", timestamp(ticket.createdAt)],
        ...(ticket.closedAt ? [["Closed", timestamp(ticket.closedAt)]] : []),
        ...(ticket.closeReason ? [["Close reason", ticket.closeReason]] : []),
    ];
    const opening = ticket.subject || ticket.answers.length > 0
        ? `<section class="embed"><div class="embed-title">Opening form</div>${ticket.subject ? `<div class="field"><b>Subject</b><p>${escapeHtml(ticket.subject)}</p></div>` : ""}${ticket.answers
            .map((answer) => `<div class="field"><b>${escapeHtml(answer.question)}</b><p>${escapeHtml(answer.answer)}</p></div>`)
            .join("")}</section>`
        : "";
    const head = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="referrer" content="no-referrer">
<title>${escapeHtml(title)}</title>
<style>${CSS}</style></head>
<body><main>
<header><h1>${escapeHtml(ticketLabel(ticket))}</h1><dl>${facts.map(([name, value]) => `<div><dt>${escapeHtml(name)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}</dl></header>
${opening}
<ol class="messages">
`;
    const blocks = visibleMessages(input).map((message) => {
        const staff = message.internal;
        const attachments = message.attachments.map((url) => (safeUrl(url) ? `<a href="${escapeHtml(url)}" rel="noreferrer noopener">${escapeHtml(fileNameOf(url))}</a>` : `<span>${escapeHtml(url)}</span>`));
        return `<li class="message${staff ? " staff" : ""}"><div class="avatar">${escapeHtml(initial(message.authorName))}</div><div class="body"><div class="meta"><span class="author">${escapeHtml(message.authorName)}</span>${staff ? '<span class="tag">staff chat</span>' : ""}${message.source === "WEB" ? '<span class="tag">portal</span>' : ""}<time datetime="${message.createdAt.toISOString()}">${escapeHtml(timestamp(message.createdAt))}</time></div>${message.content ? `<div class="content">${escapeHtml(message.content)}</div>` : ""}${attachments.length ? `<div class="attachments">${attachments.join("")}</div>` : ""}</div></li>\n`;
    });
    const empty = blocks.length === 0 ? `<li class="empty">No messages.</li>\n` : "";
    const tail = `${empty}</ol>
<footer>Saved by ${escapeHtml(BRAND.name)} on ${escapeHtml(timestamp(ticket.closedAt ?? ticket.updatedAt))}.</footer>
</main></body></html>
`;
    const truncated = `<li class="truncated">${escapeHtml(truncationLine(input.deletionDate))}</li>\n`;
    const content = fit(head, blocks, tail, truncated, input.byteLimit);
    return { fileName: `ticket-${ticket.number}-transcript.html`, content, contentType: "text/html; charset=utf-8" };
}
/** Joins head, as many blocks as fit, and tail; adds the truncation marker when blocks were left out. */
function fit(head, blocks, tail, truncated, limit = TRANSCRIPT_BYTE_LIMIT) {
    const all = head + blocks.join("") + tail;
    if (Buffer.byteLength(all, "utf8") <= limit)
        return all;
    const budget = limit - Buffer.byteLength(head + tail + truncated, "utf8");
    let used = 0;
    const kept = [];
    for (const block of blocks) {
        const size = Buffer.byteLength(block, "utf8");
        if (used + size > budget)
            break;
        kept.push(block);
        used += size;
    }
    return head + kept.join("") + truncated + tail;
}
export function escapeHtml(value) {
    return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
function safeUrl(value) {
    return /^https?:\/\/[^\s"'<>]+$/i.test(value);
}
function fileNameOf(url) {
    try {
        const name = decodeURIComponent(new URL(url).pathname.split("/").pop() ?? "");
        return name || "attachment";
    }
    catch {
        return "attachment";
    }
}
function initial(name) {
    return [...name.trim()][0]?.toUpperCase() ?? "?";
}
function timestamp(date) {
    return `${date.toISOString().slice(0, 16).replace("T", " ")} UTC`;
}
const CSS = `
*{box-sizing:border-box}
body{margin:0;background:#313338;color:#dbdee1;font:15px/1.4 "gg sans","Noto Sans","Helvetica Neue",Helvetica,Arial,sans-serif}
main{max-width:960px;margin:0 auto;padding:24px 16px}
header{background:#2b2d31;border-radius:8px;padding:16px 20px;margin-bottom:16px}
h1{margin:0 0 12px;font-size:20px;color:#f2f3f5}
dl{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px 16px;margin:0}
dt{font-size:12px;text-transform:uppercase;color:#949ba4;font-weight:600}
dd{margin:2px 0 0;color:#f2f3f5;overflow-wrap:anywhere}
.embed{background:#2b2d31;border-left:4px solid #5865f2;border-radius:4px;padding:12px 16px;margin-bottom:16px}
.embed-title{font-weight:600;color:#f2f3f5;margin-bottom:8px}
.field b{display:block;font-size:13px;color:#f2f3f5}
.field p{margin:2px 0 8px;white-space:pre-wrap;overflow-wrap:anywhere}
.messages{list-style:none;margin:0;padding:0}
.message{display:flex;gap:16px;padding:8px 4px;border-radius:4px}
.message:hover{background:#2e3035}
.message.staff{background:#3a2f1b;border-left:3px solid #f0b232}
.avatar{flex:0 0 40px;height:40px;border-radius:50%;background:#5865f2;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:600}
.body{min-width:0;flex:1}
.meta{display:flex;flex-wrap:wrap;align-items:baseline;gap:8px}
.author{font-weight:600;color:#f2f3f5}
.tag{font-size:11px;text-transform:uppercase;background:#4e5058;color:#fff;border-radius:3px;padding:0 4px}
.staff .tag{background:#f0b232;color:#1e1f22}
time{font-size:12px;color:#949ba4}
.content{white-space:pre-wrap;overflow-wrap:anywhere;margin-top:2px}
.attachments{display:flex;flex-wrap:wrap;gap:8px;margin-top:6px}
.attachments a,.attachments span{background:#2b2d31;border:1px solid #1e1f22;border-radius:4px;padding:6px 10px;color:#00a8fc;text-decoration:none;overflow-wrap:anywhere}
.empty,.truncated{color:#949ba4;padding:12px 4px;font-style:italic}
footer{color:#949ba4;font-size:12px;margin-top:24px;text-align:center}
`;
//# sourceMappingURL=transcripts.js.map