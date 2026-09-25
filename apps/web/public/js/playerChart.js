import { escapeHtml } from "./ui.js";

/**
 * Player count over time as an inline SVG line chart, shared by the game
 * server pages. `history` is `{ range: "24h" | "7d", points: [{ at, players?, online? }], peak }`.
 * Gaps mean no data; red marks mean the server was down.
 */
export function playerChart(history) {
  const width = 720;
  const height = 200;
  const pad = { left: 36, right: 8, top: 10, bottom: 24 };
  const points = history.points;
  const top = Math.max(1, ...points.map((point) => Math.max(point.players ?? 0, point.maxPlayers ?? 0)));
  const x = (index) => pad.left + (index / Math.max(1, points.length - 1)) * (width - pad.left - pad.right);
  const y = (value) => pad.top + (1 - value / top) * (height - pad.top - pad.bottom);
  const segments = [];
  let current = [];
  points.forEach((point, index) => {
    if (point.players === undefined) {
      if (current.length) segments.push(current);
      current = [];
    } else current.push(`${x(index).toFixed(1)},${y(point.players).toFixed(1)}`);
  });
  if (current.length) segments.push(current);
  if (!segments.length) return `<div class="empty-state">No data yet. The bot records the player count while it runs.</div>`;
  const down = points.map((point, index) => (point.online === false ? `<rect x="${(x(index) - 2).toFixed(1)}" y="${height - pad.bottom}" width="4" height="4" class="chart-down"/>` : "")).join("");
  const label = (value) => new Date(value).toLocaleString([], history.range === "24h" ? { hour: "2-digit", minute: "2-digit" } : { weekday: "short", hour: "2-digit" });
  return `<svg class="player-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Player count, ${history.range === "24h" ? "last 24 hours" : "last 7 days"}, peak ${history.peak}">
    <line x1="${pad.left}" x2="${width - pad.right}" y1="${y(top)}" y2="${y(top)}" class="chart-grid"/>
    <line x1="${pad.left}" x2="${width - pad.right}" y1="${y(top / 2)}" y2="${y(top / 2)}" class="chart-grid"/>
    <line x1="${pad.left}" x2="${width - pad.right}" y1="${y(0)}" y2="${y(0)}" class="chart-axis"/>
    <text x="${pad.left - 6}" y="${y(top) + 4}" text-anchor="end">${top}</text>
    <text x="${pad.left - 6}" y="${y(0) + 4}" text-anchor="end">0</text>
    ${segments.map((segment) => `<polyline points="${segment.join(" ")}" class="chart-line"/>`).join("")}
    ${down}
    <text x="${pad.left}" y="${height - 4}">${escapeHtml(label(points[0].at))}</text>
    <text x="${width - pad.right}" y="${height - 4}" text-anchor="end">now</text>
  </svg>`;
}
