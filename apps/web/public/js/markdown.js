import { escapeHtml } from "./ui.js";

/**
 * Small, safe Markdown renderer: HTML is escaped first, then headings, bold,
 * italic, links (http and https only), lists, and code are formatted.
 */
export function renderMarkdown(source) {
  const lines = escapeHtml(source ?? "").replace(/\r\n/g, "\n").split("\n");
  const out = [];
  let list;
  let code;
  const closeList = () => {
    if (list) out.push(`</${list}>`);
    list = undefined;
  };
  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      if (code) {
        out.push(`<pre><code>${code.join("\n")}</code></pre>`);
        code = undefined;
      } else {
        closeList();
        code = [];
      }
      continue;
    }
    if (code) {
      code.push(line);
      continue;
    }
    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    const item = /^\s*[-*]\s+(.+)$/.exec(line) ?? /^\s*\d+[.)]\s+(.+)$/.exec(line);
    if (heading) {
      closeList();
      const level = heading[1].length + 2;
      out.push(`<h${level}>${inline(heading[2])}</h${level}>`);
    } else if (item) {
      const tag = /^\s*[-*]\s/.test(line) ? "ul" : "ol";
      if (list !== tag) {
        closeList();
        out.push(`<${tag}>`);
        list = tag;
      }
      out.push(`<li>${inline(item[1])}</li>`);
    } else {
      closeList();
      if (line.trim()) out.push(`<p>${inline(line)}</p>`);
    }
  }
  if (code) out.push(`<pre><code>${code.join("\n")}</code></pre>`);
  closeList();
  return out.join("");
}

/** Formats one line of already-escaped text. Code and links are set aside first so their text is left alone. */
function inline(text) {
  const kept = [];
  const keep = (html) => `\u0000${kept.push(html) - 1}\u0000`;
  return text
    .replace(/`([^`]+)`/g, (_match, value) => keep(`<code>${value}</code>`))
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (_match, label, url) => keep(`<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`))
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>")
    .replace(/(^|[\s(])_([^_]+)_(?=[\s).,!?]|$)/g, "$1<em>$2</em>")
    .replace(/\u0000(\d+)\u0000/g, (_match, index) => kept[Number(index)]);
}
