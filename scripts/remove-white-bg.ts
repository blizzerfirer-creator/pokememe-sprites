import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SPRITES_DIR = path.resolve(__dirname, '../public/assets/pokememe_sprites');
const THRESHOLD = 240; // Pixels with R,G,B all above this are considered "white"
const EDGE_FEATHER = 2; // Pixels near edge of sprite get partial transparency

async function removeWhiteBg(filePath: string): Promise<void> {
  const image = sharp(filePath);
  const { width, height, channels } = await image.metadata();

  if (!width || !height) return;

  // Get raw pixel data
  const { data, info } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = Buffer.from(data);

  // First pass: identify non-white pixels (the actual sprite)
  const isSprite = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const r = pixels[i * 4];
    const g = pixels[i * 4 + 1];
    const b = pixels[i * 4 + 2];
    // If any channel is below threshold, it's part of the sprite
    if (r < THRESHOLD || g < THRESHOLD || b < THRESHOLD) {
      isSprite[i] = 1;
    }
  }

  // Second pass: make white pixels transparent, keep sprite pixels
  for (let i = 0; i < width * height; i++) {
    const r = pixels[i * 4];
    const g = pixels[i * 4 + 1];
    const b = pixels[i * 4 + 2];

    if (!isSprite[i]) {
      // White background pixel - make fully transparent
      pixels[i * 4 + 3] = 0;
    }
    // Sprite pixels keep their original alpha (255)
  }

  // Write back
  await sharp(pixels, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4
    }
  })
    .png()
    .toFile(filePath + '.tmp');

  // Replace original
  fs.renameSync(filePath + '.tmp', filePath);
}

async function main(): Promise<void> {
  const files = fs.readdirSync(SPRITES_DIR)
    .filter(f => f.endsWith('.png'))
    .sort();

  console.log(`Processing ${files.length} sprites to remove white backgrounds...`);

  let processed = 0;
  for (const file of files) {
    const filePath = path.join(SPRITES_DIR, file);
    try {
      await removeWhiteBg(filePath);
      processed++;
      if (processed % 10 === 0) {
        console.log(`  ${processed}/${files.length} done`);
      }
    } catch (err: any) {
      console.error(`  Error processing ${file}: ${err.message}`);
    }
  }

  console.log(`\nDone! ${processed}/${files.length} sprites processed.`);
}

main().catch(console.error);
