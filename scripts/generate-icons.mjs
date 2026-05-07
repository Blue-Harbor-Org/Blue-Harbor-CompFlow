/**
 * Generate PWA icons from an inline SVG (navy + gold BH).
 * Run: node scripts/generate-icons.mjs
 */
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const outputDir = path.join(root, "public", "icons");

const svg = `
<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" fill="#050c1a" rx="180"/>
  <text
    x="512" y="620"
    font-family="Georgia, serif"
    font-size="480"
    font-weight="bold"
    fill="#d4a843"
    text-anchor="middle"
  >BH</text>
</svg>
`.trim();

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  const sourcePng = await sharp(Buffer.from(svg)).png().toBuffer();

  for (const size of sizes) {
    await sharp(sourcePng)
      .resize(size, size)
      .toFile(path.join(outputDir, `icon-${size}x${size}.png`));
    console.log(`✓ icon-${size}x${size}.png`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
