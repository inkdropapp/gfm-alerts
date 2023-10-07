import babel from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import tsPlugin from '@rollup/plugin-typescript';
import packageJson from './package.json';
const deps = Object.keys(packageJson.dependencies || {});

export default [
    {
        input: 'src/gfm-blockquote-admonitions.ts',
        output: {
            dir: 'lib',
            format: 'cjs',
            strict: true,
            sourcemap: true,
            exports: 'auto'
        },
        external: ['react', 'codemirror', 'inkdrop', ...deps],
        plugins: [
            nodeResolve(),
            babel({
                presets: ['@babel/typescript', '@babel/preset-react'],
                babelHelpers: 'bundled'
            }),
            tsPlugin()
        ]
    }
];
