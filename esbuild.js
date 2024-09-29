import esbuild from "esbuild";
import { GasPlugin } from "esbuild-gas-plugin";

esbuild
  .build({
    entryPoints: ["./src/main.ts"],
    bundle: true,
    minify: false,
    outfile: "./dist/main.js",
    format: 'cjs',
    globalName: undefined,  
    platform: 'browser',   
    plugins: [GasPlugin],
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
