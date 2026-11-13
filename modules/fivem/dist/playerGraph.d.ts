import type { PlayerHistory } from "./types.js";
/**
 * Renders the player-count history as a PNG for the Discord status message.
 * Pure TypeScript (no canvas, no native binaries, no outside service): an
 * RGBA buffer, anti-aliased lines, a 5x7 pixel font for the axis labels, and
 * a PNG encoded with node:zlib. Gaps mean no data; red ticks on the bottom
 * axis mark time the server was down.
 */
export declare function renderPlayerGraph(history: PlayerHistory, width?: number, height?: number): Buffer;
//# sourceMappingURL=playerGraph.d.ts.map