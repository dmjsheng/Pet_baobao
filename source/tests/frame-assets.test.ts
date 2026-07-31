import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const assetRoot = join(process.cwd(), '..', 'assets', 'baobao', 'frames');
const expectedFrames = {
  'idle-look': 4,
  'pet-nuzzle': 6,
  'eat-treat': 8,
  'yarn-chase': 8,
  'companion-sit': 4,
  'sleep-curl': 4,
} as const;

function pngSize(path: string): [number, number] {
  const bytes = readFileSync(path);
  expect(bytes.subarray(1, 4).toString('ascii')).toBe('PNG');
  return [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
}

describe('V3 frame assets', () => {
  it.each(Object.entries(expectedFrames))('%s has continuously numbered frames', (action, count) => {
    const directory = join(assetRoot, action);
    expect(existsSync(directory)).toBe(true);
    expect(readdirSync(directory).filter((file) => file.endsWith('.png')).sort())
      .toEqual(Array.from({ length: count }, (_, index) => `${String(index).padStart(3, '0')}.png`));
  });

  it('keeps every generated frame on the same square canvas', () => {
    const sizes = Object.keys(expectedFrames).flatMap((action) =>
      readdirSync(join(assetRoot, action)).filter((file) => file.endsWith('.png'))
        .map((file) => pngSize(join(assetRoot, action, file))),
    );
    expect(new Set(sizes.map(([width, height]) => `${width}x${height}`))).toEqual(new Set(['512x512']));
  });

  it('keeps non-empty raster data in every frame', () => {
    const frames = Object.keys(expectedFrames).flatMap((action) =>
      readdirSync(join(assetRoot, action)).filter((file) => file.endsWith('.png')).map((file) => join(assetRoot, action, file)),
    );
    expect(frames.map((path) => statSync(path).size).every((bytes) => bytes > 10_000)).toBe(true);
  });
});
