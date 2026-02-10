import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { pokememeDatabase } from '../src/data/pokememeIndex';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Config ---
const API_KEY = process.env.GEMINI_API_KEY!;
const MODEL = 'gemini-2.5-flash-image';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
const OUTPUT_DIR = path.resolve(__dirname, '../public/assets/pokememe_sprites');
const PROGRESS_FILE = path.resolve(__dirname, 'generation-progress.json');
const DELAY_MS = 3000;
const MAX_RETRIES = 3;

// Meme character visual descriptions - what the meme character LOOKS LIKE
const memeVisuals: Record<string, string> = {
  // Pump.fun / Crypto meme coins
  'PEPE': 'a green Pepe the Frog character (green frog face with big eyes and wide smile)',
  'BONK': 'an orange Shiba Inu dog holding a wooden baseball bat',
  'DOGE': 'a happy smiling blue Shiba Inu dog (Doge meme, blue fur with light blue belly)',
  'SHIB': 'a Shiba Inu dog with red/orange fur and pointy ears',
  'WIF': 'a Shiba Inu dog wearing a cute pink knitted beanie hat (dogwifhat meme)',
  'POPCAT': 'a white cat with its mouth wide open in an O shape (PopCat meme, clicking cat)',
  'Fartcoin': 'a green cloud creature with a mischievous smelly gas trail behind it',
  'BRETT': 'a blue cartoon character (Pepe universe blue boy, simple round blue face)',
  'FLOKI': 'a Shiba Inu dog wearing a tiny Viking helmet with horns',
  'Ponke': 'a mischievous cartoon monkey with a crazy grin (Solana monkey meme)',
  'MOG': 'a cool cat wearing dark sunglasses with a smug confident grin (mogger cat)',
  'MYRO': 'a cute brown/tan puppy dog with floppy ears (Solana dog)',
  'BOME': 'a creature reading a glowing book of memes',
  'SLERF': 'a clumsy sloth-like creature that accidentally burns things',
  'GOAT': 'a majestic goat standing proud (Greatest Of All Time)',
  'TRUMP': 'an orange-tanned creature with golden swoopy hair',
  'PNUT': 'a small brown peanut-shaped creature with tiny eyes',
  'MICHI': 'an orange tabby cat with intense staring eyes (Michi cat meme)',
  'WEN': 'an impatient creature looking at a clock, asking "wen?"',
  'Glow Up': 'a creature that transforms from ugly to beautiful/majestic',

  // Internet memes
  'Trollface': 'the Trollface meme character (white face with huge mischievous grin and squinting eyes)',
  'Skibidi': 'a head sticking out of a toilet (Skibidi toilet meme)',
  'Hawk Tuah': 'a hawk bird with a big confident attitude and spitting pose',
  'Cheems': 'a small yellow Shiba Inu dog with a derpy face and speech impediment (Cheems meme)',
  'Amogus': 'a small bean-shaped astronaut crewmate (Among Us character, visor and backpack)',
  'Rickroll': 'an 80s-styled character with slicked reddish-brown hair dancing (Rick Astley)',
  'Nyan Cat': 'a pixel cat with a Pop-Tart body leaving a rainbow trail behind it (Nyan Cat meme)',
  'GigaChad': 'an extremely muscular character with a massive square jawline and confident pose (GigaChad meme)',
  'Bongo Cat': 'a simple white cat with paws hitting bongo drums (Bongo Cat meme)',
  'Coffin Dance': 'dark-suited pallbearers carrying a coffin and dancing (Coffin Dance / Astronomia meme)',
  'Cope': 'a creature inhaling from a copium tank with desperate eyes',
  'NPC': 'a grey featureless humanoid with empty eyes and blank expression (NPC meme)',
  'Keyboard Cat': 'a cat wearing a blue shirt playing a keyboard/piano (Keyboard Cat meme)',
  'Stonks': 'the Stonks meme man (bald mannequin head in a suit with green arrow going up)',
  'Harambe': 'a large silverback gorilla with a wise gentle expression (RIP Harambe)',
  'This is Fine': 'a dog sitting in a room on fire while drinking coffee calmly (This is Fine meme)',
  'Sigma': 'a dark mysterious lone wolf character with glowing eyes (Sigma male)',
  'Buff Doge': 'an extremely muscular bodybuilder Shiba Inu dog (Buff Doge / Swole Doge meme)',
  'Touch Grass': 'a creature made of grass reaching out to grab someone',
  'Diamond Hands': 'a creature with hands made of sparkling diamonds gripping tightly',
  'Degen': 'a wild-eyed creature surrounded by trading charts and fire',
  'Hide the Pain Harold': 'an older man-like creature with a forced smile hiding obvious pain (Harold meme)',
  'Dat Boi': 'a green frog riding a unicycle (Here come dat boi meme)',
  'Pudgy Penguins': 'a cute chubby round penguin with a winter hat (Pudgy Penguins NFT)',
  'Sus': 'an Among Us crewmate looking suspicious with shifty eyes',
  'Slay': 'a fabulous confident creature with sparkles and a crown',
  'Forgor': 'a confused ghost-like creature that forgot everything',
  'Long Cat': 'an extremely loooong stretched white cat (Longcat meme)',
  'Rizz': 'a smooth charming creature with a confident wink and finger guns',
  'Crab Rave': 'a crab dancing with party lights and rave energy (Crab Rave meme)',
  'HODL': 'a creature gripping with diamond-hard hands, refusing to let go',
  'Monke': 'a simple happy monkey/ape giving a thumbs up (Return to Monke meme)',
  'Soyjak': 'a pale round-faced character with wide open mouth pointing excitedly (Soyjak meme)',
  'Pog': 'a creature with its mouth in the PogChamp face (wide open in amazement)',
  'Based': 'a cool sunglasses-wearing creature with a thumbs up (Based and redpilled)',
  'Cap': 'a blue baseball cap on a floating gas cloud creature',
  'Wholesome': 'a round pink happy creature hugging everyone with heart eyes',
  'Karen': 'a creature with a short asymmetric haircut demanding to see the manager',
  'Ratio': 'a golden fish with a massive ratio counter above its head',
  'Galaxy Brain': 'a star creature with an enormous glowing cosmic brain',
  'Ligma': 'a mime-like trickster creature with a mischievous smirk',
  'Ohio': 'a mantis creature from the cursed land of Ohio (Only in Ohio meme)',
  'Bruh': 'a creature frozen in a "bruh" expression of disbelief',
  'Deez': 'a stag beetle creature with a smug grin',
  'WAGMI': 'a hopeful bull charging forward with determination (We Are Gonna Make It)',
  'Chill Guy': 'a relaxed chill dog in a sweater just vibing (Chill Guy meme)',
  'Deepfake': 'a shapeshifting blob that copies faces',
  'Wojak': 'a simple sad/emotional face creature (Wojak / Feels Guy meme)',
  'Doomer': 'a dark depressed creature in a black beanie smoking (Doomer Wojak)',
  'Zoomer': 'a hyperactive colorful creature with AirPods and broccoli hair (Zoomer Wojak)',
  'Bloomer': 'a happy optimistic creature surrounded by flowers (Bloomer Wojak)',
  'Glitch': 'a digital glitchy creature with corrupted pixels and MissingNo vibes',
  'Lord Helix': 'a tentacled fossil god with a spiral shell glowing with divine energy (Twitch Plays Pokemon)',
  'Dome': 'an armored horseshoe crab fossil creature with a dome shell',
  'Gamba': 'a creature surrounded by slot machine symbols and dice (gambling meme)',
  'Grumpy Cat': 'a very large grumpy fat cat with a permanent frown and annoyed face (Grumpy Cat / Tardar Sauce)',
  'Drip': 'a creature dripping with ice/frost wearing designer clothes (Drip meme)',
  'Bussin': 'an electric creature that is absolutely bussin (delicious/amazing energy)',
  "It's Lit": 'a fire creature that is literally lit on fire with party energy',
  'Rare': 'a mystical rare shiny creature with holographic rainbow aura',
  'GG': 'a powerful psychic creature with "game over" energy, hooded and mysterious',
  'OG': 'a small floating pink cat-like mythical creature, the original meme ancestor',
};

interface Progress {
  completed: number[];
  failed: number[];
}

function loadProgress(): Progress {
  if (fs.existsSync(PROGRESS_FILE)) {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
  }
  return { completed: [], failed: [] };
}

function saveProgress(progress: Progress): void {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

function buildPrompt(pokememe: typeof pokememeDatabase[0]): string {
  const memeDesc = memeVisuals[pokememe.memeToken] || `a creature themed around ${pokememe.memeToken}`;
  const typeNames = pokememe.types.join('/');

  return `Create a pixel art creature sprite for a Pokémon fangame. This is "${pokememe.name}", a ${typeNames}-type creature that fuses the Pokémon "${pokememe.originalName}" with ${memeDesc}.

It keeps the body shape and silhouette of ${pokememe.originalName} but its face, color palette, and surface texture resemble ${memeDesc}.

MANDATORY STYLE RULES (follow ALL of these EXACTLY):
1. POSE: Three-quarter front view (facing slightly left), like a Game Boy Advance Pokémon battle sprite. EVERY sprite must use this EXACT same angle. NOT full front-facing, NOT side view.
2. SIZE: The creature is small and compact, centered in the frame, occupying roughly 64x64 pixels of detail. Keep proportions consistent - small creatures stay small, large creatures stay large, but all fit within the same frame.
3. PIXEL ART: Classic GBA-era Pokémon sprite style. Clean sharp pixels, visible pixel grid, thick dark outlines around the body, 2-3 shading tones per color. Limited color palette (16-24 colors max).
4. BACKGROUND: Pure flat white (#FFFFFF) background. Nothing else behind the creature.
5. DETAIL LEVEL: Medium detail, NOT hyper-detailed, NOT too simple. Every sprite must have the SAME level of detail as a GBA Pokémon sprite. Think Pokémon FireRed/LeafGreen front sprites.
6. COLORS: Vibrant saturated colors with clear shading. Dark outline, base color, highlight color, shadow color for each body part.
7. COMPOSITION: Single creature only, centered, with a tiny drop shadow beneath its feet/base. Creature fills about 70% of the canvas.

ABSOLUTELY FORBIDDEN:
- NO text, letters, numbers, words, or labels of ANY kind
- NO symbols (no dollar signs, no crypto symbols, no currency symbols, no logos)
- NO watermarks or UI elements
- NO multiple characters - only ONE creature
- NO realistic or semi-realistic art - ONLY pixel art
- NO anti-aliasing, smooth gradients, or blur
- NO gray or colored backgrounds - ONLY pure white
- NO varying art styles between sprites - must look like they all belong in the same game`;
}

async function generateSprite(pokememe: typeof pokememeDatabase[0]): Promise<Buffer | null> {
  const prompt = buildPrompt(pokememe);

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ['IMAGE', 'TEXT'],
    }
  };

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error ${response.status}: ${error}`);
  }

  const data = await response.json();

  const candidates = data.candidates || [];
  for (const candidate of candidates) {
    const parts = candidate.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.mimeType?.startsWith('image/')) {
        return Buffer.from(part.inlineData.data, 'base64');
      }
    }
  }

  throw new Error('No image found in API response');
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main(): Promise<void> {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const progress = loadProgress();
  const total = pokememeDatabase.length;
  const toGenerate = pokememeDatabase.filter(p => !progress.completed.includes(p.id));

  console.log(`\n=== PokeMeme Sprite Generator v2 ===`);
  console.log(`Style: Pokemon + Meme Fusion (chunky pixel art, white bg)`);
  console.log(`Total PokeMemes: ${total}`);
  console.log(`Already generated: ${progress.completed.length}`);
  console.log(`Remaining: ${toGenerate.length}`);
  console.log(`Delay between requests: ${DELAY_MS}ms`);
  console.log(`Estimated time: ~${Math.ceil(toGenerate.length * DELAY_MS / 60000)} minutes\n`);

  if (toGenerate.length === 0) {
    console.log('All sprites already generated!');
    return;
  }

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < toGenerate.length; i++) {
    const pokememe = toGenerate[i];
    const spriteFilename = `${String(pokememe.id).padStart(3, '0')}_${pokememe.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.png`;
    const spritePath = path.join(OUTPUT_DIR, spriteFilename);

    if (fs.existsSync(spritePath)) {
      console.log(`[${i + 1}/${toGenerate.length}] #${pokememe.id} ${pokememe.name} - file exists, skipping`);
      progress.completed.push(pokememe.id);
      saveProgress(progress);
      continue;
    }

    let success = false;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`[${i + 1}/${toGenerate.length}] #${pokememe.id} ${pokememe.name} (${pokememe.originalName} + ${pokememe.memeToken}) - attempt ${attempt}/${MAX_RETRIES}...`);

        const imageBuffer = await generateSprite(pokememe);
        if (imageBuffer) {
          fs.writeFileSync(spritePath, imageBuffer);
          console.log(`  -> Saved: ${spriteFilename} (${(imageBuffer.length / 1024).toFixed(1)}KB)`);
          progress.completed.push(pokememe.id);
          saveProgress(progress);
          successCount++;
          success = true;
          break;
        }
      } catch (error: any) {
        console.error(`  -> Error: ${error.message}`);

        if (error.message.includes('429') || error.message.includes('RESOURCE_EXHAUSTED')) {
          const waitTime = DELAY_MS * attempt * 2;
          console.log(`  -> Rate limited, waiting ${waitTime / 1000}s...`);
          await sleep(waitTime);
        } else if (attempt < MAX_RETRIES) {
          await sleep(DELAY_MS);
        }
      }
    }

    if (!success) {
      console.error(`  -> FAILED after ${MAX_RETRIES} attempts: #${pokememe.id} ${pokememe.name}`);
      if (!progress.failed.includes(pokememe.id)) {
        progress.failed.push(pokememe.id);
      }
      saveProgress(progress);
      failCount++;
    }

    if (i < toGenerate.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  console.log(`\n=== Generation Complete ===`);
  console.log(`Success: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  console.log(`Total completed: ${progress.completed.length}/${total}`);

  if (progress.failed.length > 0) {
    console.log(`\nFailed IDs (can retry): ${progress.failed.join(', ')}`);
  }
}

main().catch(console.error);
