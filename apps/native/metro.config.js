// const { getDefaultConfig } = require("@react-native/metro-config");
// /** @type {import('@react-native/metro-config').MetroConfig} */
// const config = getDefaultConfig(__dirname);
// config.resolver.sourceExts.push("sql");
// module.exports = config;

const dotEnv = require("dotenv");
const path = require("node:path");

const { getDefaultConfig } = require("@react-native/metro-config");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");
dotEnv.config({
	path: [
		path.resolve(workspaceRoot, ".env"),
		path.resolve(workspaceRoot, ".env.local"),
		path.resolve(projectRoot, ".env"),
		path.resolve(projectRoot, ".env.metro"),
	],
	override: true,
});

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];

config.resolver.nodeModulesPaths = [
	path.resolve(projectRoot, "node_modules"),
	path.resolve(workspaceRoot, "node_modules"),
];

config.resolver.sourceExts.push("sql");

module.exports = config;
