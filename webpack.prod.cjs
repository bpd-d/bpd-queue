"use strict"
const {merge} = require("webpack-merge");
const common = require("./webpack.config.cjs");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = merge(common, {
	mode: "production",
	devtool: "source-map",
	optimization: {
		runtimeChunk: false,
		minimize: false,
	},
	plugins: [new CleanWebpackPlugin()],
});
