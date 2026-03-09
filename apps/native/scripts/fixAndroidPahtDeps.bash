cd apps/native

mkdir -p node_modules/@react-native/codegen/lib/cli/combine

cat > node_modules/@react-native/codegen/lib/cli/combine/combine-js-to-schema-cli.js << 'EOF'
#!/usr/bin/env node
require('/Users/jojo/Documents/Projects/templates/node_modules/.bun/@react-native+codegen@0.84.1/node_modules/@react-native/codegen/lib/cli/combine/combine-js-to-schema-cli.js');
EOF

chmod +x node_modules/@react-native/codegen/lib/cli/combine/combine-js-to-schema-cli.js
