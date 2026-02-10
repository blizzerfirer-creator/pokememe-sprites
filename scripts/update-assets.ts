import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { pokememeDatabase } from '../src/data/pokememeIndex';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SPRITES_DIR = path.resolve(__dirname, '../public/assets/pokememe_sprites');
const ASSET_PACK_PATH = path.resolve(__dirname, '../public/assets/asset-pack.json');

// Data files to update
const DATA_FILES = [
  path.resolve(__dirname, '../src/data/pokememeData1.ts'),
  path.resolve(__dirname, '../src/data/pokememeData2.ts'),
  path.resolve(__dirname, '../src/data/pokememeData3.ts'),
];

function getSpriteFilename(id: number, name: string): string {
  return `${String(id).padStart(3, '0')}_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.png`;
}

function getSpriteKey(id: number, name: string): string {
  return `pokememe_${String(id).padStart(3, '0')}_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
}

function updateAssetPack(): void {
  console.log('=== Updating asset-pack.json ===');

  const assetPack = JSON.parse(fs.readFileSync(ASSET_PACK_PATH, 'utf-8'));

  // Build new sprite entries for generated files
  const generatedSprites: any[] = [];
  let found = 0;
  let missing = 0;

  for (const pokememe of pokememeDatabase) {
    const filename = getSpriteFilename(pokememe.id, pokememe.name);
    const filepath = path.join(SPRITES_DIR, filename);

    if (fs.existsSync(filepath)) {
      generatedSprites.push({
        type: 'image',
        key: getSpriteKey(pokememe.id, pokememe.name),
        url: `assets/pokememe_sprites/${filename}`
      });
      found++;
    } else {
      console.log(`  Missing sprite: #${pokememe.id} ${pokememe.name} (${filename})`);
      missing++;
    }
  }

  // Keep existing non-pokememe sprites (battle_background, etc.)
  const existingNonPokememe = (assetPack.pokememe_sprites?.files || []).filter(
    (f: any) => !f.key.startsWith('pokememe_') || f.key === 'battle_background_grass'
  );

  // Also keep the individual named sprites that already existed
  const existingNamedSprites = (assetPack.pokememe_sprites?.files || []).filter(
    (f: any) => ['pepasaur_sprite', 'bonkander_sprite', 'dogetle_sprite', 'catpuff_sprite', 'nakakarp_sprite', 'battle_background_grass'].includes(f.key)
  );

  assetPack.pokememe_sprites = {
    files: [...existingNamedSprites, ...generatedSprites]
  };

  fs.writeFileSync(ASSET_PACK_PATH, JSON.stringify(assetPack, null, 2));
  console.log(`  Updated: ${found} sprites added, ${missing} missing`);
}

function updateDataFiles(): void {
  console.log('\n=== Updating spriteKey in data files ===');

  for (const dataFile of DATA_FILES) {
    let content = fs.readFileSync(dataFile, 'utf-8');
    let updateCount = 0;

    for (const pokememe of pokememeDatabase) {
      const filename = getSpriteFilename(pokememe.id, pokememe.name);
      const filepath = path.join(SPRITES_DIR, filename);
      const newSpriteKey = getSpriteKey(pokememe.id, pokememe.name);

      if (fs.existsSync(filepath)) {
        // Find and replace spriteKey for this pokememe
        // Match pattern: after the name field of this pokememe, find spriteKey
        const namePattern = `name: "${pokememe.name}"`;
        if (content.includes(namePattern)) {
          // Find the spriteKey line near this pokememe's definition
          const nameIndex = content.indexOf(namePattern);
          // Find the next spriteKey after this name
          const afterName = content.substring(nameIndex);
          const spriteKeyMatch = afterName.match(/spriteKey:\s*"([^"]+)"/);

          if (spriteKeyMatch && spriteKeyMatch[1] !== newSpriteKey) {
            const oldSpriteKeyFull = spriteKeyMatch[0];
            const newSpriteKeyFull = `spriteKey: "${newSpriteKey}"`;

            // Replace only the first occurrence after the name
            const beforeName = content.substring(0, nameIndex);
            const afterNameUpdated = afterName.replace(oldSpriteKeyFull, newSpriteKeyFull);
            content = beforeName + afterNameUpdated;
            updateCount++;
          }
        }
      }
    }

    if (updateCount > 0) {
      fs.writeFileSync(dataFile, content);
      console.log(`  ${path.basename(dataFile)}: ${updateCount} spriteKeys updated`);
    } else {
      console.log(`  ${path.basename(dataFile)}: no changes needed`);
    }
  }
}

function main(): void {
  // Check how many sprites exist
  const existingSprites = fs.readdirSync(SPRITES_DIR).filter(f => f.endsWith('.png'));
  console.log(`Found ${existingSprites.length} sprite files in ${SPRITES_DIR}\n`);

  updateAssetPack();
  updateDataFiles();

  console.log('\n=== Done! ===');
}

main();
