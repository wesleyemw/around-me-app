import * as esbuild from 'esbuild';

await esbuild.build ({
    entryPoints: [
		'./src/js/*.js',
		'./src/css/*.css',
	],
	outbase: 'src',
	outdir: 'dist',
    bundle: true,
    write: true,
    sourcemap: true,
})