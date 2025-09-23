import * as esbuild from 'esbuild';
import chokidar from 'chokidar';
import liveServer from 'live-server';

( async () => {

let ctx = await esbuild.build ({
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


chokidar
  .watch("./src/css/**/*", {
    interval: 1000
  })
  .on("all", () =>{
    ctx.rebuild();
  })

  liveServer.start({
		// Opens the local server on start.
		open: true,
		// Uses `PORT=...` or 8080 as a fallback.
		port: +process.env.PORT || 8080,
	})
})()