// Embeds a copyright notice into a PNG's own metadata (an iTXt chunk), so
// the notice survives even if the file is downloaded detached from its
// README/gallery context.

import zlib from "node:zlib";

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "latin1");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(zlib.crc32(Buffer.concat([typeBuf, data])) >>> 0, 0);
  return Buffer.concat([length, typeBuf, data, crc]);
}

// Inserts an iTXt chunk (UTF-8 text, unlike tEXt which is Latin-1 only —
// copyright notices here include non-Latin1 names) right after IHDR.
export function addPngCopyright(buffer, text) {
  const ihdrLength = buffer.readUInt32BE(8);
  const ihdrEnd = 8 + 4 + 4 + ihdrLength + 4; // sig + length + type + data + crc
  const head = buffer.subarray(0, ihdrEnd);
  const rest = buffer.subarray(ihdrEnd);

  const keyword = Buffer.from("Copyright", "latin1");
  // null-terminated keyword, compression flag/method (both 0 = uncompressed),
  // empty language tag + empty translated keyword (each null-terminated).
  const data = Buffer.concat([keyword, Buffer.from([0, 0, 0, 0, 0]), Buffer.from(text, "utf8")]);
  const textChunk = chunk("iTXt", data);

  return Buffer.concat([head, textChunk, rest]);
}
