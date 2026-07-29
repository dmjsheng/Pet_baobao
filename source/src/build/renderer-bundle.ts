import { build } from 'esbuild';

export interface RendererBundleOptions {
  entry: string;
  output: string;
}

export async function bundleRenderer({ entry, output }: RendererBundleOptions): Promise<void> {
  await build({
    entryPoints: [entry],
    outfile: output,
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: ['chrome120'],
    logLevel: 'silent',
  });
}
