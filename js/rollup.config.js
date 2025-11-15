import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import scss from "rollup-plugin-scss";
import terser from "@rollup/plugin-terser";
import dts from "rollup-plugin-dts";

const bundleName = "guis";

const jsBundleConfig = {
    input: "ts/index.ts",
    output: {
        file: `dist/${bundleName}.js`,
        format: "iife",
        sourcemap: false,
    },
    plugins: [
        resolve(),
        typescript(),
        scss({
            output: false,
            outputStyle: "compressed",
        }),
        terser(),
    ],
};

const dtsBundleConfig = {
    input: "dist/types/exported.d.ts",
    output: [{
        file: `dist/${bundleName}.d.ts`,
        format: "esm"
    }],
    plugins: [
        dts(),
    ],
};

export default [jsBundleConfig, dtsBundleConfig];
