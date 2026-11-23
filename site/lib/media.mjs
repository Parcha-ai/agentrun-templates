// Sample media: the file types a template's samples/<template>/<case>/media/ may hold, the budget check.mjs holds
// them to, and the pixel size of an image or an mp4, read from the file's own header with no dependency.
// lib/server.mjs keeps its own copy of the content types, because the server image ships that one file alone;
// a test keeps the two lists equal.

import { extname } from "node:path";

/** Extension -> what the page renders it as, and its content type. */
export const MEDIA_TYPES = {
  ".jpg": { kind: "image", type: "image/jpeg" },
  ".jpeg": { kind: "image", type: "image/jpeg" },
  ".png": { kind: "image", type: "image/png" },
  ".webp": { kind: "image", type: "image/webp" },
  ".gif": { kind: "image", type: "image/gif" },
  ".mp4": { kind: "video", type: "video/mp4" },
  ".mp3": { kind: "audio", type: "audio/mpeg" },
  ".m4a": { kind: "audio", type: "audio/mp4" },
  ".wav": { kind: "audio", type: "audio/wav" },
  ".ogg": { kind: "audio", type: "audio/ogg" },
  ".vtt": { kind: "captions", type: "text/vtt; charset=utf-8" },
  // A document is a link only, never shown inline: the server sends it as plain text so no browser renders it.
  ".md": { kind: "document", type: "text/plain; charset=utf-8" },
  ".txt": { kind: "document", type: "text/plain; charset=utf-8" },
};

/** A media file name: one path segment of plain characters, so its URL and its Markdown href are the same text. */
export const MEDIA_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;

/** At most this many bytes of sample media per template, and a video's shorter side at most this many pixels. */
export const MEDIA_BUDGET_BYTES = 8 * 1024 * 1024;
export const VIDEO_MAX_SHORT_SIDE = 720;

export function mediaKind(file) {
  return MEDIA_TYPES[extname(file).toLowerCase()]?.kind;
}

/** {width, height} of an image or mp4 in `buf`, or null when the header doesn't say. */
export function mediaSize(buf, file) {
  const ext = extname(file).toLowerCase();
  try {
    if (ext === ".png") return pngSize(buf);
    if (ext === ".jpg" || ext === ".jpeg") return jpegSize(buf);
    if (ext === ".gif") return gifSize(buf);
    if (ext === ".webp") return webpSize(buf);
    if (ext === ".mp4") return mp4Size(buf);
  } catch {}
  return null;
}

const ascii = (buf, at, n) => buf.toString("latin1", at, at + n);
const size = (width, height) => (width > 0 && height > 0 ? { width, height } : null);

function pngSize(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47 || ascii(buf, 12, 4) !== "IHDR") return null;
  return size(buf.readUInt32BE(16), buf.readUInt32BE(20));
}

function gifSize(buf) {
  if (!/^GIF8[79]a$/.test(ascii(buf, 0, 6))) return null;
  return size(buf.readUInt16LE(6), buf.readUInt16LE(8));
}

// The first start-of-frame marker (C0 to CF, less C4 DHT, C8 JPG and CC DAC) holds the height, then the width.
function jpegSize(buf) {
  if (buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let at = 2;
  while (at + 4 <= buf.length) {
    if (buf[at] !== 0xff) return null;
    const marker = buf[at + 1];
    if (marker === 0xff) { at += 1; continue; }
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd9)) { at += 2; continue; }
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return size(buf.readUInt16BE(at + 7), buf.readUInt16BE(at + 5));
    }
    at += 2 + buf.readUInt16BE(at + 2);
  }
  return null;
}

function webpSize(buf) {
  if (ascii(buf, 0, 4) !== "RIFF" || ascii(buf, 8, 4) !== "WEBP") return null;
  const chunk = ascii(buf, 12, 4);
  if (chunk === "VP8 ") {
    if (buf[23] !== 0x9d || buf[24] !== 0x01 || buf[25] !== 0x2a) return null;
    return size(buf.readUInt16LE(26) & 0x3fff, buf.readUInt16LE(28) & 0x3fff);
  }
  if (chunk === "VP8L") {
    if (buf[20] !== 0x2f) return null;
    const bits = buf.readUInt32LE(21);
    return size((bits & 0x3fff) + 1, ((bits >>> 14) & 0x3fff) + 1);
  }
  if (chunk === "VP8X") return size(buf.readUIntLE(24, 3) + 1, buf.readUIntLE(27, 3) + 1);
  return null;
}

// moov > trak > tkhd carries each track's presentation width and height as 16.16 fixed point. Audio tracks say 0x0;
// the largest visual track is the video's size.
function mp4Size(buf) {
  let best = null;
  const boxes = function* (start, end) {
    let at = start;
    while (at + 8 <= end) {
      let len = buf.readUInt32BE(at);
      let head = 8;
      if (len === 1) { len = Number(buf.readBigUInt64BE(at + 8)); head = 16; }
      else if (len === 0) len = end - at;
      if (len < head || at + len > end) return;
      yield { type: ascii(buf, at + 4, 4), body: at + head, end: at + len };
      at += len;
    }
  };
  for (const moov of boxes(0, buf.length)) {
    if (moov.type !== "moov") continue;
    for (const trak of boxes(moov.body, moov.end)) {
      if (trak.type !== "trak") continue;
      for (const tkhd of boxes(trak.body, trak.end)) {
        if (tkhd.type !== "tkhd") continue;
        const at = tkhd.body + (buf[tkhd.body] === 1 ? 88 : 76);
        if (at + 8 > tkhd.end) continue;
        const found = size(Math.round(buf.readUInt32BE(at) / 65536), Math.round(buf.readUInt32BE(at + 4) / 65536));
        if (found && (!best || found.width * found.height > best.width * best.height)) best = found;
      }
    }
  }
  return best;
}
