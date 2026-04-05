#!/usr/bin/env node

/**
 * rename-app.mjs
 *
 * Renames the React Native app in apps/native:
 *   - Display name (what the user sees on the home screen)
 *   - Internal module name (JS registration name)
 *   - Android package name (com.xxx.yyy)
 *   - iOS directory names & project references
 *
 * Usage:
 *   node scripts/rename-app.mjs --name "MyApp" --package "com.mycompany.myapp"
 *
 * Options:
 *   --name       New display name & JS module name (e.g. "MyApp")
 *   --package    New Android package name (e.g. "com.mycompany.myapp")
 *   --dry-run    Print what would change without modifying files
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

// ───── Parse CLI args ─────

const args = process.argv.slice(2);

function getArg(flag) {
	const idx = args.indexOf(flag);
	return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
}

const DRY_RUN = args.includes("--dry-run");
const newDisplayName = getArg("--name");
const newPackage = getArg("--package");

if (!newDisplayName && !newPackage) {
	console.error(
		"Usage: node scripts/rename-app.mjs --name \"MyApp\" --package \"com.mycompany.myapp\"",
	);
	process.exit(1);
}

// ───── Resolve paths ─────

const root = path.resolve(process.cwd());
const androidDir = path.join(root, "android");
const iosDir = path.join(root, "ios");

// ───── Current values ─────

const appJson = JSON.parse(
	fs.readFileSync(path.join(root, "app.json"), "utf-8"),
);
const OLD_NAME = appJson.name; // e.g. "rn_template"
const OLD_DISPLAY = appJson.displayName; // e.g. "rn_template"

// Detect old Android package from build.gradle
const oldBuildGradle = fs.readFileSync(
	path.join(androidDir, "app/build.gradle"),
	"utf-8",
);
const oldPkgMatch = oldBuildGradle.match(/namespace\s+"([^"]+)"/);
const OLD_PACKAGE = oldPkgMatch ? oldPkgMatch[1] : `com.${OLD_NAME}`;

const NEW_NAME = newDisplayName
	? newDisplayName.replace(/\s+/g, "").toLowerCase()
	: OLD_NAME;
const NEW_DISPLAY = newDisplayName || OLD_DISPLAY;
const NEW_PACKAGE = newPackage || OLD_PACKAGE;

// Module name used in JS registration (camelCase, no spaces)
const NEW_MODULE = newDisplayName ? newDisplayName.replace(/\s+/g, "") : OLD_NAME;
// Lowercase version for directory names / file names
const NEW_MODULE_LOWER = NEW_MODULE.toLowerCase();

console.log("┌─────────────────────────────────────┐");
console.log("│         React Native Rename          │");
console.log("├─────────────────────────────────────┤");
console.log(`│ Old name:    ${OLD_NAME}`);
console.log(`│ Old display: ${OLD_DISPLAY}`);
console.log(`│ Old package: ${OLD_PACKAGE}`);
console.log("│                                     │");
console.log(`│ New module:  ${NEW_MODULE}`);
console.log(`│ New display: ${NEW_DISPLAY}`);
console.log(`│ New package: ${NEW_PACKAGE}`);
console.log(`│ Dry run:     ${DRY_RUN}`);
console.log("└─────────────────────────────────────┘");

// ───── Helpers ─────

function replaceInFile(filePath, replacements) {
	if (!fs.existsSync(filePath)) {
		console.log(`  ⚠️  File not found, skipping: ${filePath}`);
		return;
	}
	let content = fs.readFileSync(filePath, "utf-8");
	let changed = false;
	for (const [search, replace] of replacements) {
		if (typeof search === "string") {
			if (content.includes(search)) {
				content = content.replaceAll(search, replace);
				changed = true;
			}
		} else {
			// Regex
			if (search.test(content)) {
				content = content.replace(search, replace);
				changed = true;
			}
		}
	}
	if (changed) {
		const rel = path.relative(root, filePath);
		if (DRY_RUN) {
			console.log(`  [dry-run] Would modify: ${rel}`);
		} else {
			fs.writeFileSync(filePath, content);
			console.log(`  ✏️  Modified: ${rel}`);
		}
	}
}

function renameIfExists(oldPath, newPath) {
	if (!fs.existsSync(oldPath)) return;
	if (oldPath === newPath) return;
	const relOld = path.relative(root, oldPath);
	const relNew = path.relative(root, newPath);
	if (DRY_RUN) {
		console.log(`  [dry-run] Would rename: ${relOld} → ${relNew}`);
	} else {
		fs.renameSync(oldPath, newPath);
		console.log(`  📁 Renamed: ${relOld} → ${relNew}`);
	}
}

function mkdirp(dirPath) {
	if (!fs.existsSync(dirPath)) {
		if (!DRY_RUN) {
			fs.mkdirSync(dirPath, { recursive: true });
		}
		console.log(
			`  ${DRY_RUN ? "[dry-run] Would create" : "📁 Created"}: ${path.relative(root, dirPath)}`,
		);
	}
}

function moveFiles(srcDir, destDir) {
	if (!fs.existsSync(srcDir)) return;
	mkdirp(destDir);
	for (const file of fs.readdirSync(srcDir)) {
		const srcPath = path.join(srcDir, file);
		const destPath = path.join(destDir, file);
		if (DRY_RUN) {
			console.log(
				`  [dry-run] Would move: ${path.relative(root, srcPath)} → ${path.relative(root, destPath)}`,
			);
		} else {
			fs.renameSync(srcPath, destPath);
		}
	}
	// Remove old empty dirs
	if (!DRY_RUN) {
		const oldParts = OLD_PACKAGE.split(".");
		let current = path.join(androidDir, "app/src/main/java");
		const dirsToClean = [];
		for (const part of oldParts) {
			current = path.join(current, part);
			dirsToClean.push(current);
		}
		// Remove from deepest to shallowest
		for (const dir of dirsToClean.reverse()) {
			if (
				fs.existsSync(dir) &&
				fs.readdirSync(dir).length === 0
			) {
				fs.rmdirSync(dir);
				console.log(`  🗑️  Removed empty: ${path.relative(root, dir)}`);
			}
		}
	}
}

// ═══════════════════════════════════════════════════
// 1. app.json
// ═══════════════════════════════════════════════════
console.log("\n📱 Updating app.json...");
const newAppJson = { name: NEW_MODULE, displayName: NEW_DISPLAY };
if (DRY_RUN) {
	console.log(`  [dry-run] Would write: ${JSON.stringify(newAppJson)}`);
} else {
	fs.writeFileSync(
		path.join(root, "app.json"),
		`${JSON.stringify(newAppJson, null, "\t")}\n`,
	);
	console.log("  ✏️  Modified: app.json");
}

// ═══════════════════════════════════════════════════
// 2. package.json — only the "name" field
// ═══════════════════════════════════════════════════
console.log("\n📦 Updating package.json...");
replaceInFile(path.join(root, "package.json"), [
	[`"name": "${OLD_NAME}"`, `"name": "${NEW_MODULE_LOWER}"`],
]);

// ═══════════════════════════════════════════════════
// 3. ANDROID
// ═══════════════════════════════════════════════════
console.log("\n🤖 Updating Android...");

// build.gradle
replaceInFile(path.join(androidDir, "app/build.gradle"), [
	[`namespace "${OLD_PACKAGE}"`, `namespace "${NEW_PACKAGE}"`],
	[`applicationId "${OLD_PACKAGE}"`, `applicationId "${NEW_PACKAGE}"`],
]);

// settings.gradle
replaceInFile(path.join(androidDir, "settings.gradle"), [
	[`rootProject.name = "${OLD_NAME}"`, `rootProject.name = "${NEW_MODULE}"`],
]);

// strings.xml
replaceInFile(
	path.join(androidDir, "app/src/main/res/values/strings.xml"),
	[[`>${OLD_DISPLAY}<`, `>${NEW_DISPLAY}<`]],
);

// MainActivity.kt
replaceInFile(
	path.join(
		androidDir,
		`app/src/main/java/${OLD_PACKAGE.replace(/\./g, "/")}/MainActivity.kt`,
	),
	[
		[`package ${OLD_PACKAGE}`, `package ${NEW_PACKAGE}`],
		[`"${OLD_NAME}"`, `"${NEW_MODULE}"`],
	],
);

// MainApplication.kt
replaceInFile(
	path.join(
		androidDir,
		`app/src/main/java/${OLD_PACKAGE.replace(/\./g, "/")}/MainApplication.kt`,
	),
	[[`package ${OLD_PACKAGE}`, `package ${NEW_PACKAGE}`]],
);

// Move Kotlin files to new package directory
if (OLD_PACKAGE !== NEW_PACKAGE) {
	console.log("\n  📂 Moving Android source files to new package...");
	const oldJavaDir = path.join(
		androidDir,
		`app/src/main/java/${OLD_PACKAGE.replace(/\./g, "/")}`,
	);
	const newJavaDir = path.join(
		androidDir,
		`app/src/main/java/${NEW_PACKAGE.replace(/\./g, "/")}`,
	);
	moveFiles(oldJavaDir, newJavaDir);
}

// ═══════════════════════════════════════════════════
// 4. iOS
// ═══════════════════════════════════════════════════
console.log("\n🍎 Updating iOS...");

// Info.plist
replaceInFile(path.join(iosDir, OLD_NAME, "Info.plist"), [
	[
		`<key>CFBundleDisplayName</key>\n\t\t<string>${OLD_DISPLAY}</string>`,
		`<key>CFBundleDisplayName</key>\n\t\t<string>${NEW_DISPLAY}</string>`,
	],
]);

// AppDelegate.swift
replaceInFile(path.join(iosDir, OLD_NAME, "AppDelegate.swift"), [
	[`withModuleName: "${OLD_NAME}"`, `withModuleName: "${NEW_MODULE}"`],
]);

// Podfile
replaceInFile(path.join(iosDir, "Podfile"), [
	[`target '${OLD_NAME}'`, `target '${NEW_MODULE}'`],
]);

// project.pbxproj — replace all occurrences of old name
const pbxprojPath = path.join(
	iosDir,
	`${OLD_NAME}.xcodeproj`,
	"project.pbxproj",
);
replaceInFile(pbxprojPath, [[OLD_NAME, NEW_MODULE]]);

// xcworkspace contents
replaceInFile(
	path.join(iosDir, `${OLD_NAME}.xcworkspace`, "contents.xcworkspacedata"),
	[[OLD_NAME, NEW_MODULE]],
);

// Rename iOS directories & project files
console.log("\n  📂 Renaming iOS directories...");

// Source directory: ios/rn_template → ios/NewModule
renameIfExists(
	path.join(iosDir, OLD_NAME),
	path.join(iosDir, NEW_MODULE),
);

// .xcodeproj
renameIfExists(
	path.join(iosDir, `${OLD_NAME}.xcodeproj`),
	path.join(iosDir, `${NEW_MODULE}.xcodeproj`),
);

// .xcworkspace
renameIfExists(
	path.join(iosDir, `${OLD_NAME}.xcworkspace`),
	path.join(iosDir, `${NEW_MODULE}.xcworkspace`),
);

// ═══════════════════════════════════════════════════
// 5. iOS scheme (inside xcodeproj if exists)
// ═══════════════════════════════════════════════════
const schemesDir = path.join(
	iosDir,
	`${NEW_MODULE}.xcodeproj`,
	"xcshareddata",
	"xcschemes",
);
if (fs.existsSync(schemesDir)) {
	console.log("\n  📂 Renaming iOS schemes...");
	for (const file of fs.readdirSync(schemesDir)) {
		if (file.includes(OLD_NAME)) {
			const oldScheme = path.join(schemesDir, file);
			const newScheme = path.join(
				schemesDir,
				file.replaceAll(OLD_NAME, NEW_MODULE),
			);
			replaceInFile(oldScheme, [[OLD_NAME, NEW_MODULE]]);
			renameIfExists(oldScheme, newScheme);
		}
	}
}

// ═══════════════════════════════════════════════════
// Done!
// ═══════════════════════════════════════════════════
console.log("\n🎉 Rename complete!");
if (!DRY_RUN) {
	console.log("\n⚠️  Next steps:");
	console.log("  1. cd ios && rm -rf Pods Podfile.lock build");
	console.log("  2. bundle exec pod install");
	console.log("  3. cd ../android && ./gradlew clean");
	console.log("  4. Rebuild both platforms");
}
