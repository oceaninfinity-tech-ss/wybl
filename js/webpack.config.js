const path = require("path");
const TypescriptDeclarationPlugin = require("typescript-declaration-webpack-plugin");

module.exports = {
    entry: "./ts/index.ts",
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.scss$/,
                use: [
                    "raw-loader",
                    "sass-loader",
                ],
            }
        ]
    },
    resolve: {
        extensions: [".js", ".ts", ".scss"],
        modules: ["node_modules"]
    },
    output: {
        filename: "guis.js",
        path: path.resolve(__dirname, "dist")
    },
    optimization: {
        minimize: true
    },
    plugins: [
        new TypescriptDeclarationPlugin({
            out: "sss-guis.d.ts",
            removeMergedDeclarations: false,
            removeComments: false
        })
    ]
};
