var path = require("path");
const merge = require("webpack-merge");
const common = require("./webpack.config.cjs");
const TerserPlugin = require("terser-webpack-plugin");
module.exports = merge(common, {
	mode: "production",
	devtool: "source-map",
	optimization: {
		runtimeChunk: false,
		minimize: true,
		minimizer: [
			new TerserPlugin({
				extractComments: false,
			}),
		],
	},
	output: {
		filename: "[name].min.js",
		path: path.resolve(__dirname, "dist"),
		libraryTarget: "umd",
		library: ["bpdDom", "[name]"],
		umdNamedDefine: true,
	},
});
