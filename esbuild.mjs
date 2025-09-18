import * as esbuild from 'esbuild';

let ctx = await esbuild.context ({
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


await ctx.watch();

let { hosts, port } = await ctx.serve({
  servedir: '/.',
})