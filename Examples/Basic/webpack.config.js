import path, {dirname} from "path";
import {fileURLToPath} from "url";
import {default as webpack} from "webpack";
const __dirname = dirname(fileURLToPath(import.meta.url));

// get require function from import meta
/*import {createRequire} from "module";
const require = createRequire(import.meta.url);
const NormalModuleReplacementPlugin = require("webpack").NormalModuleReplacementPlugin;*/

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
		extensions: [".ts", ".tsx", ".js", ".jsx"],
		// allow typescript files to import other typescript files using ".js" extension
		// approach 1 (see: https://github.com/webpack/webpack/issues/13252#issuecomment-828580249)
		//alias: {"./test.js": "./test"},
		// approach 2 (see: https://github.com/webpack/webpack/issues/13252#issuecomment-828587290)
		// see plugins section below for code
		// approach 3 (see: https://github.com/webpack/webpack/issues/13252#issuecomment-1519146192)
		extensionAlias: {
			".js": [".ts", ".tsx", ".js", ".jsx"],
			//".mjs": [".mts", ".mjs"],
		},
	},
	/*plugins: [
		new webpack.NormalModuleReplacementPlugin(new RegExp(/.+\.js$/), (resource=>{
			resource.request = resource.request.replace(new RegExp(/\.js$/), "");
		})),
	],*/
	module: {
		rules: [
			// all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
			{test: /\.tsx?$/, loader: "ts-loader"},
			//{test: /\.(jsx?|tsx?)$/, loader: "ts-loader"},
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