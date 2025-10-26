import { build } from "esbuild";
import { sassPlugin } from "esbuild-sass-plugin";

build({
    entryPoints: ["ts/index.ts"],
    bundle: true,
    outfile: "dist/guis.js",
    target: "esnext",
    platform: "browser",
    minify: true,
    sourcemap: false,
    plugins: [
        sassPlugin({
            type: "css-text",
            style: "compressed",
        }),
    ]
}).catch((error) => {
    console.error("Build failed:", error);
    process.exit(1);
});
