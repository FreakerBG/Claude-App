// Generates the app's PNG icons with no external dependencies.
// A dependency-free PNG encoder (zlib is built into Node) draws a white
// checkmark on an indigo→violet gradient — matching favicon.svg.
//
// Run with: npm run icons
import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = resolve(__dirname, '..', 'public', 'icons')
mkdirSync(outDir, { recursive: true })

// ---- CRC32 (for PNG chunks) ----
const crcTable = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()
function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([len, typeBuf, data, crcBuf])
}

function encodePng(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type RGBA
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0
  // raw scanlines with filter byte 0 per row
  const raw = Buffer.alloc((width * 4 + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4)
  }
  const idat = deflateSync(raw, { level: 9 })
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

// ---- drawing helpers ----
const C1 = [0x63, 0x66, 0xf1] // indigo-500
const C2 = [0x8b, 0x5c, 0xf6] // violet-500
const lerp = (a, b, t) => a + (b - a) * t
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)

function distToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax
  const dy = by - ay
  const len2 = dx * dx + dy * dy
  let t = len2 === 0 ? 0 : ((px - ax) * dx + (py - ay) * dy) / len2
  t = clamp01(t)
  const cx = ax + t * dx
  const cy = ay + t * dy
  return Math.hypot(px - cx, py - cy)
}

function render(size) {
  const rgba = Buffer.alloc(size * size * 4)
  // checkmark points (normalized) and stroke half-width in px
  const A = [0.3 * size, 0.53 * size]
  const B = [0.45 * size, 0.68 * size]
  const C = [0.73 * size, 0.34 * size]
  const half = 0.055 * size

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const cx = x + 0.5
      const cy = y + 0.5
      // gradient background (top-left -> bottom-right)
      const t = (x + y) / (2 * size)
      let r = lerp(C1[0], C2[0], t)
      let g = lerp(C1[1], C2[1], t)
      let b = lerp(C1[2], C2[2], t)
      // checkmark coverage (anti-aliased over ~1px)
      const d = Math.min(
        distToSegment(cx, cy, A[0], A[1], B[0], B[1]),
        distToSegment(cx, cy, B[0], B[1], C[0], C[1]),
      )
      const cov = clamp01(half + 0.75 - d)
      r = lerp(r, 255, cov)
      g = lerp(g, 255, cov)
      b = lerp(b, 255, cov)
      const i = (y * size + x) * 4
      rgba[i] = Math.round(r)
      rgba[i + 1] = Math.round(g)
      rgba[i + 2] = Math.round(b)
      rgba[i + 3] = 255
    }
  }
  return encodePng(size, size, rgba)
}

const targets = [
  ['icon-192.png', 192],
  ['icon-512.png', 512],
  ['apple-touch-icon.png', 180],
]
for (const [name, size] of targets) {
  writeFileSync(resolve(outDir, name), render(size))
  console.log('wrote', name, `${size}x${size}`)
}
console.log('done')
