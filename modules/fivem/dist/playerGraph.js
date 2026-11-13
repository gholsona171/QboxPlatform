import { deflateSync } from "node:zlib";
/**
 * Renders the player-count history as a PNG for the Discord status message.
 * Pure TypeScript (no canvas, no native binaries, no outside service): an
 * RGBA buffer, anti-aliased lines, a 5x7 pixel font for the axis labels, and
 * a PNG encoded with node:zlib. Gaps mean no data; red ticks on the bottom
 * axis mark time the server was down.
 */
export function renderPlayerGraph(history, width = 800, height = 260) {
    const image = new Raster(width, height, BACKGROUND);
    const pad = { left: 52, right: 20, top: 18, bottom: 36 };
    const plotWidth = width - pad.left - pad.right;
    const plotHeight = height - pad.top - pad.bottom;
    const points = history.points;
    // The axis tops out at the server's slots (for example 64), or a round number when they are unknown.
    const slots = Math.max(0, ...points.map((point) => point.maxPlayers ?? 0));
    const peak = Math.max(0, ...points.map((point) => point.players ?? 0));
    const top = slots > 0 ? Math.max(slots, peak) : niceTop(Math.max(1, peak));
    const x = (index) => pad.left + (index / Math.max(1, points.length - 1)) * plotWidth;
    const y = (value) => pad.top + (1 - value / top) * plotHeight;
    const baseline = y(0);
    for (const fraction of [0.25, 0.5, 0.75, 1])
        image.fillRect(pad.left, Math.round(y(top * fraction)), plotWidth, 1, GRID);
    image.fillRect(pad.left, Math.round(baseline), plotWidth, 1, AXIS);
    for (const value of [top, top / 2, 0]) {
        const label = String(Math.round(value));
        image.text(label, pad.left - 8 - textWidth(label), Math.round(y(value)) - 7, LABEL);
    }
    const span = history.range === "24h" ? 24 : 168;
    const ticks = history.range === "24h" ? ["-24h", "-18h", "-12h", "-6h", "now"] : ["-7d", "-5d", "-3d", "-1d", "now"];
    ticks.forEach((label, index) => {
        const fraction = history.range === "24h" ? index / 4 : [0, 48, 96, 144, 168][index] / span;
        const at = pad.left + fraction * plotWidth;
        const left = index === 0 ? at : index === ticks.length - 1 ? at - textWidth(label) : at - textWidth(label) / 2;
        image.text(label, Math.round(left), height - pad.bottom + 12, LABEL);
    });
    const segments = [];
    let current = [];
    points.forEach((point, index) => {
        if (point.players === undefined) {
            if (current.length)
                segments.push(current);
            current = [];
        }
        else
            current.push({ x: x(index), y: y(point.players) });
    });
    if (current.length)
        segments.push(current);
    for (const segment of segments)
        image.fillUnder(segment, baseline, FILL);
    const mask = new Float32Array(width * height);
    for (const segment of segments) {
        if (segment.length === 1)
            strokeSegment(mask, width, height, segment[0], segment[0], 3);
        for (let index = 1; index < segment.length; index += 1)
            strokeSegment(mask, width, height, segment[index - 1], segment[index], 1.6);
    }
    image.composite(mask, LINE);
    points.forEach((point, index) => {
        if (point.online === false)
            image.fillRect(Math.round(x(index)) - 2, Math.round(baseline) + 2, 5, 5, DOWN);
    });
    if (segments.length === 0) {
        const message = "no data yet";
        image.text(message, Math.round(pad.left + plotWidth / 2 - textWidth(message) / 2), Math.round(pad.top + plotHeight / 2 - 7), LABEL);
    }
    return image.png();
}
const BACKGROUND = [43, 45, 49, 255];
const GRID = [63, 65, 71, 255];
const AXIS = [110, 114, 122, 255];
const LABEL = [181, 186, 193, 255];
const LINE = [87, 242, 135, 255];
const FILL = [87, 242, 135, 46];
const DOWN = [237, 66, 69, 255];
/** A round axis top: 1, 2, 5, 10, 20, 25, 50, 64, 100, ... at least `value`. */
function niceTop(value) {
    const magnitude = 10 ** Math.floor(Math.log10(value));
    for (const step of [1, 2, 2.5, 5, 10])
        if (step * magnitude >= value)
            return Math.max(1, Math.ceil(step * magnitude));
    return value;
}
function strokeSegment(mask, width, height, a, b, radius) {
    const minX = Math.max(0, Math.floor(Math.min(a.x, b.x) - radius - 1));
    const maxX = Math.min(width - 1, Math.ceil(Math.max(a.x, b.x) + radius + 1));
    const minY = Math.max(0, Math.floor(Math.min(a.y, b.y) - radius - 1));
    const maxY = Math.min(height - 1, Math.ceil(Math.max(a.y, b.y) + radius + 1));
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const length = dx * dx + dy * dy;
    for (let py = minY; py <= maxY; py += 1)
        for (let px = minX; px <= maxX; px += 1) {
            const cx = px + 0.5;
            const cy = py + 0.5;
            const t = length === 0 ? 0 : Math.max(0, Math.min(1, ((cx - a.x) * dx + (cy - a.y) * dy) / length));
            const distance = Math.hypot(cx - (a.x + t * dx), cy - (a.y + t * dy));
            const coverage = Math.max(0, Math.min(1, radius + 0.5 - distance));
            const index = py * width + px;
            if (coverage > (mask[index] ?? 0))
                mask[index] = coverage;
        }
}
class Raster {
    width;
    height;
    data;
    constructor(width, height, background) {
        this.width = width;
        this.height = height;
        this.data = new Uint8Array(width * height * 4);
        for (let index = 0; index < width * height; index += 1)
            this.data.set(background, index * 4);
    }
    blend(px, py, color, alpha) {
        if (px < 0 || py < 0 || px >= this.width || py >= this.height || alpha <= 0)
            return;
        const index = (py * this.width + px) * 4;
        const a = Math.min(1, alpha * (color[3] / 255));
        for (let channel = 0; channel < 3; channel += 1)
            this.data[index + channel] = Math.round(this.data[index + channel] * (1 - a) + color[channel] * a);
        this.data[index + 3] = 255;
    }
    fillRect(left, top, width, height, color) {
        for (let py = top; py < top + height; py += 1)
            for (let px = left; px < left + width; px += 1)
                this.blend(px, py, color, 1);
    }
    /** Fills between a polyline and the baseline, one pixel column at a time. */
    fillUnder(segment, baseline, color) {
        if (segment.length < 2)
            return;
        for (let index = 1; index < segment.length; index += 1) {
            const a = segment[index - 1];
            const b = segment[index];
            for (let px = Math.ceil(a.x); px < Math.ceil(b.x); px += 1) {
                const t = b.x === a.x ? 0 : (px + 0.5 - a.x) / (b.x - a.x);
                const top = a.y + (b.y - a.y) * Math.max(0, Math.min(1, t));
                for (let py = Math.floor(top); py < Math.round(baseline); py += 1)
                    this.blend(px, py, color, py < top ? 1 - (top - py) : 1);
            }
        }
    }
    composite(mask, color) {
        for (let index = 0; index < mask.length; index += 1) {
            const coverage = mask[index] ?? 0;
            if (coverage > 0)
                this.blend(index % this.width, Math.floor(index / this.width), color, coverage);
        }
    }
    /** Draws text in the 5x7 pixel font at 2x scale (12 px per character). */
    text(value, left, top, color) {
        let cursor = left;
        for (const character of value) {
            const glyph = FONT[character] ?? FONT[" "];
            glyph.forEach((row, rowIndex) => {
                for (let column = 0; column < row.length; column += 1)
                    if (row[column] === "#")
                        this.fillRect(cursor + column * SCALE, top + rowIndex * SCALE, SCALE, SCALE, color);
            });
            cursor += ADVANCE;
        }
    }
    png() {
        const rows = Buffer.alloc((this.width * 4 + 1) * this.height);
        for (let py = 0; py < this.height; py += 1) {
            const offset = py * (this.width * 4 + 1);
            rows[offset] = 0;
            Buffer.from(this.data.buffer, this.data.byteOffset + py * this.width * 4, this.width * 4).copy(rows, offset + 1);
        }
        const header = Buffer.alloc(13);
        header.writeUInt32BE(this.width, 0);
        header.writeUInt32BE(this.height, 4);
        header.set([8, 6, 0, 0, 0], 8);
        return Buffer.concat([PNG_SIGNATURE, chunk("IHDR", header), chunk("IDAT", deflateSync(rows, { level: 9 })), chunk("IEND", Buffer.alloc(0))]);
    }
}
const SCALE = 2;
const ADVANCE = 6 * SCALE;
const textWidth = (value) => value.length * ADVANCE - SCALE;
const FONT = {
    " ": [".....", ".....", ".....", ".....", ".....", ".....", "....."],
    "0": [".###.", "#...#", "#..##", "#.#.#", "##..#", "#...#", ".###."],
    "1": ["..#..", ".##..", "..#..", "..#..", "..#..", "..#..", ".###."],
    "2": [".###.", "#...#", "....#", "...#.", "..#..", ".#...", "#####"],
    "3": ["####.", "....#", "....#", ".###.", "....#", "....#", "####."],
    "4": ["...#.", "..##.", ".#.#.", "#..#.", "#####", "...#.", "...#."],
    "5": ["#####", "#....", "####.", "....#", "....#", "#...#", ".###."],
    "6": [".###.", "#....", "#....", "####.", "#...#", "#...#", ".###."],
    "7": ["#####", "....#", "...#.", "..#..", ".#...", ".#...", ".#..."],
    "8": [".###.", "#...#", "#...#", ".###.", "#...#", "#...#", ".###."],
    "9": [".###.", "#...#", "#...#", ".####", "....#", "....#", ".###."],
    "-": [".....", ".....", ".....", "#####", ".....", ".....", "....."],
    a: [".....", ".....", ".###.", "....#", ".####", "#...#", ".####"],
    d: ["....#", "....#", ".##.#", "#..##", "#...#", "#...#", ".####"],
    e: [".....", ".....", ".###.", "#...#", "#####", "#....", ".###."],
    h: ["#....", "#....", "#.##.", "##..#", "#...#", "#...#", "#...#"],
    n: [".....", ".....", "#.##.", "##..#", "#...#", "#...#", "#...#"],
    o: [".....", ".....", ".###.", "#...#", "#...#", "#...#", ".###."],
    t: [".#...", ".#...", "###..", ".#...", ".#...", ".#..#", "..##."],
    w: [".....", ".....", "#...#", "#...#", "#.#.#", "#.#.#", ".#.#."],
    y: [".....", ".....", "#...#", "#...#", ".####", "....#", ".###."],
};
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k += 1)
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
});
function crc32(buffer) {
    let crc = 0xffffffff;
    for (const byte of buffer)
        crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length, 0);
    const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body), 0);
    return Buffer.concat([length, body, crc]);
}
//# sourceMappingURL=playerGraph.js.map