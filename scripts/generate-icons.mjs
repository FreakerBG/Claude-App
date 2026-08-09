// Generates the app's PNG icons with no external dependencies.
// A dependency-free PNG encoder (zlib is built into Node) draws a white
// reactor-style Momentum mark on a deep navy background — matching favicon.svg.
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
const C1 = [0x04, 0x0a, 0x12]
const C2 = [0x0d, 0x33, 0x44]
const lerp = (a, b, t) => a + (b - a) * t
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)

function render(size) {
  const rgba = Buffer.alloc(size * size * 4)
  const center = size / 2
  const ring = size * 0.225
  const outer = size * 0.305
  const ringWidth = size * 0.025
  const outerWidth = size * 0.009

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const cx = x + 0.5
      const cy = y + 0.5
      const d = Math.hypot(cx - center, cy - center)
      const t = clamp01(1 - d / (size * 0.72))
      let r = lerp(C1[0], C2[0], t)
      let g = lerp(C1[1], C2[1], t)
      let b = lerp(C1[2], C2[2], t)

      const glow = clamp01(1 - Math.abs(d - ring) / (size * 0.12)) * 0.22
      r = lerp(r, 20, glow)
      g = lerp(g, 209, glow)
      b = lerp(b, 236, glow)

      const outerCov = clamp01(outerWidth + 0.8 - Math.abs(d - outer))
      r = lerp(r, 22, outerCov * 0.72)
      g = lerp(g, 121, outerCov * 0.72)
      b = lerp(b, 144, outerCov * 0.72)

      const ringCov = clamp01(ringWidth + 0.8 - Math.abs(d - ring))
      r = lerp(r, 84, ringCov)
      g = lerp(g, 234, ringCov)
      b = lerp(b, 255, ringCov)

      const core = clamp01((size * 0.095 - d) / (size * 0.025))
      r = lerp(r, 183, core)
      g = lerp(g, 249, core)
      b = lerp(b, 255, core)
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
