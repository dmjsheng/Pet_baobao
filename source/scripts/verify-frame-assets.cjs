const { existsSync, readdirSync, readFileSync } = require('node:fs');
const { join } = require('node:path');

const root = join(__dirname, '..', '..', 'assets', 'baobao', 'frames');
const expected = {
  'idle-look': 4,
  'pet-nuzzle': 6,
  'eat-treat': 6,
  'knead-paws': 8,
  'companion-sit': 4,
  'sleep-curl': 4,
};
const errors = [];
const sizes = new Set();

for (const [action, count] of Object.entries(expected)) {
  const directory = join(root, action);
  if (!existsSync(directory)) {
    errors.push(`Missing frame directory: ${action}`);
    continue;
  }
  const actual = readdirSync(directory).filter((file) => file.endsWith('.png')).sort();
  const wanted = Array.from({ length: count }, (_, index) => `${String(index).padStart(3, '0')}.png`);
  if (actual.join('|') !== wanted.join('|')) errors.push(`Unexpected frames for ${action}: ${actual.join(', ')}`);
  for (const file of actual) {
    const bytes = readFileSync(join(directory, file));
    if (bytes.subarray(1, 4).toString('ascii') !== 'PNG') {
      errors.push(`Not a PNG: ${action}/${file}`);
      continue;
    }
    sizes.add(`${bytes.readUInt32BE(16)}x${bytes.readUInt32BE(20)}`);
  }
}

if (sizes.size !== 1 || !sizes.has('512x512')) errors.push(`Expected only 512x512 frames, found: ${[...sizes].join(', ')}`);
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log('Verified 32 stable frame assets: six continuous groups, all 512x512 PNG.');
