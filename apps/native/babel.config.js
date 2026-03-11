const path = require("node:path");
const dotenv = require("dotenv");

dotenv.config({
	path: [
		path.resolve(__dirname, "../../.env"),
		path.resolve(__dirname, "../../.env.local"),
		path.resolve(__dirname, ".env"),
		path.resolve(__dirname, ".env.metro"),
	],
	override: true,
});

module.exports = {
	presets: ["module:@react-native/babel-preset"],
	plugins: [
		[
			"module-resolver",
			{
				alias: {
					crypto: "react-native-quick-crypto",
					stream: "readable-stream",
					buffer: "react-native-quick-crypto",
				},
			},
		],
		path.resolve(__dirname, "./scripts/inline-env-plugin.js"),
		"hot-updater/babel-plugin",
		["inline-import", { extensions: [".sql"] }],
		"react-native-worklets/plugin",
	],
};
