import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const root = process.cwd()
const srcSvgPath = path.join(root, 'public', 'icons', 'icon.svg')
const outDir = path.join(root, 'public', 'icons')

const svg = await fs.readFile(srcSvgPath)

async function render(size) {
  const outPath = path.join(outDir, `icon-${size}.png`)
  await sharp(svg, { density: 384 })
    .resize(size, size)
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(outPath)
  return outPath
}

await fs.mkdir(outDir, { recursive: true })
const out192 = await render(192)
const out512 = await render(512)

console.log('Generated:', out192)
console.log('Generated:', out512)

