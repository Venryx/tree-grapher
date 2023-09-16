import path, {dirname} from "path";
import {fileURLToPath} from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
	mode: "development",
	devtool: "inline-source-map",
	// options related to how webpack emits results
	output: {
		path: path.resolve(__dirname, "WebpackOut"), // the target directory for all output files; must be an absolute path (use the Node.js path module)
		filename: "Bundle.js", // the filename template for entry chunks
		//publicPath: 'http://localhost:8080/WebpackOut/Bundle.js',
	},

	entry: "./Source/index.tsx",
	resolve: {
		extensions: [".ts", ".tsx", ".js"],
	},
	module: {
		rules: [
			// all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
			{test: /\.tsx?$/, loader: "ts-loader"},
		],
	},

	devServer: {
		static: {
			directory: path.join(__dirname),
		},
		// use this to check the output/file-structure
		devMiddleware: {
			writeToDisk: true,
		},

		hot: false,
		liveReload: false,

		//compress: true,
		//port: 9000,

		//https: true, // this solves the disconnect problem, but causes annoying "safety" screen
		port: 8080,
		//public: "0.0.0.0:8080",
		//publicPath: "0.0.0.0:8080",
		//allowedHosts: ["all"],
		//host: "localhost:8080",
	},
};