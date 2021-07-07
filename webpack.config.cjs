"use strict";
//import HtmlWebpackPlugin from "html-webpack-plugin";
const libName = 'bpdQueue';
var HtmlWebpackPlugin = require("html-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
var path = require("path");

const setPath = function (folderName) {
	return path.join(__dirname, folderName);
};
const isProd = function () {
	return process.env.NODE_ENV === "production" ? true : false;
};

module.exports = {
	mode: isProd ? "production" : "development",
	devtool: "source-map",
	optimization: {
		runtimeChunk: false,
		splitChunks: {
			chunks: "all", //Taken from https://gist.github.com/sokra/1522d586b8e5c0f5072d7565c2bee693
		},
	},
	resolveLoader: {
		modules: [setPath("node_modules")],
	},
	devServer: {
		historyApiFallback: true,
		noInfo: false,
	},
	entry: {
		queue: "./index.ts",
	},
	output: {
		filename: "[name].cjs",
		path: path.resolve(__dirname, "dist"),
		libraryTarget: "umd",
		globalObject: "this",
		library: libName,
		umdNamedDefine: true,
	},
	plugins: [new HtmlWebpackPlugin()],
	resolve: {
		extensions: [".ts", ".js"],
	},

	// loaders
	module: {
		rules: [
			{
				test: /\.tsx?/,
				exclude: /node_modules/,
				use: [
					{
						loader: "ts-loader",
						options: {
							// disable type checker - we will use it in fork plugin
							transpileOnly: true,
						},
					},
				],
			},
		],
	},
	plugins: [new ForkTsCheckerWebpackPlugin()],
};
