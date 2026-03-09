/**
 * Inline selected process.env variables into the RN bundle at build time.
 * This avoids relying on runtime `process.env` in Hermes/JSC.
 */
module.exports = function inlineEnvPlugin({ types: t }) {
	return {
		name: "inline-selected-env",
		visitor: {
			MemberExpression(path, state) {
				const include = new Set(Array.isArray(state.opts?.include) ? state.opts.include : []);
				if (include.size === 0) {
					return;
				}

				const objectPath = path.get("object");
				const propertyPath = path.get("property");
				if (!objectPath.isMemberExpression()) {
					return;
				}

				const processPath = objectPath.get("object");
				const envPath = objectPath.get("property");
				if (!processPath.isIdentifier({ name: "process" }) || !envPath.isIdentifier({ name: "env" })) {
					return;
				}

				let key = null;
				if (path.node.computed && propertyPath.isStringLiteral()) {
					key = propertyPath.node.value;
				}
				if (!path.node.computed && propertyPath.isIdentifier()) {
					key = propertyPath.node.name;
				}
				if (!key || !include.has(key)) {
					return;
				}

				const value = process.env[key] ?? "";
				path.replaceWith(t.stringLiteral(value));
			},
		},
	};
};
