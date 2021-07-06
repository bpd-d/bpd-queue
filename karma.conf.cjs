module.exports = function (config) {
	const tests = ["./tests/*.test.ts"];

	const files = tests.map((test) => {
		return {
			pattern: test,
			watched: true,
			served: true,
			type: "js",
			//included: true,
		};
	});

	config.set({
		basePath: "",
		singleRun: true,
		frameworks: ["jasmine", "webpack"],
		failOnEmptyTestSuite: false,
		files: files,
		preprocessors: {
			[tests]: ["webpack"],
		},
		webpack: webpackConfig(),
		webpackMiddleware: {
			noInfo: true,
			stats: "errors-only",
		},
		colors: true,
		browsers: ["Chrome"],
		client: {
			captureConsole: true,
			clearContext: false,
			runInParent: false,
			useIframe: true,
			jasmine: {
				//tells jasmine to run specs in semi random order, false is default
				random: false,
			},
		},
	});
};

function webpackConfig() {
	const config = require("./webpack.dev.cjs");
	return config;
}
