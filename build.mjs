import { rollup } from 'rollup';
import esbuild from 'rollup-plugin-esbuild';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const pluginsDir = 'plugins';

async function buildPlugin(pluginName) {
    const pluginDir = join(pluginsDir, pluginName);
    const manifest = JSON.parse(await readFile(join(pluginDir, 'manifest.json'), 'utf-8'));
    
    const bundle = await rollup({
        input: join(pluginDir, 'src/index.ts'),
        plugins: [
            nodeResolve(),
            commonjs(),
            esbuild({ minify: true, target: 'esnext' })
        ]
    });

    const { output } = await bundle.generate({
        format: 'iife',
        compact: true,
        exports: 'default'
    });

    await writeFile(join(pluginDir, 'dist.js'), output[0].code);
    console.log(`✓ Built ${pluginName}`);
}

const plugins = await readdir(pluginsDir);
for (const plugin of plugins) {
    await buildPlugin(plugin);
}