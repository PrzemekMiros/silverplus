import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(import.meta.dirname, '../public');
let checked = 0;
const errors = [];
function requireFile(file) {
  checked++;
  if (!fs.existsSync(file)) errors.push(`Missing: ${path.relative(root, file)}`);
}
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}
const files = walk(root);
for (const file of files.filter(file => file.endsWith('.gltf'))) {
  const model = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const resource of [...(model.buffers ?? []), ...(model.images ?? [])]) {
    if (resource.uri && !resource.uri.startsWith('data:')) {
      requireFile(path.resolve(path.dirname(file), decodeURIComponent(resource.uri)));
    }
  }
}
for (const file of files.filter(file => file.startsWith(path.join(root, 'scripts') + path.sep))) {
  const text = fs.readFileSync(file, 'utf8');
  new vm.Script(text, { filename: file });
  if (text.includes('d1hl9u9k5hiqxp.cloudfront.net/')) errors.push(`Old CDN reference: ${file}`);
  for (const match of text.matchAll(/url:\s*"((?:fonts|images|textures|compressed)\/[^"\n]+\.(?:png|json|ktx))"/g)) {
    requireFile(path.join(root, match[1].replace('[format]', 's3tc')));
    if (match[1].includes('[format]')) {
      requireFile(path.join(root, match[1].replace('[format]', 'png').replace(/\.ktx$/, '.png')));
    }
  }
  for (const match of text.matchAll(/"(\/?(?:models|assets|documents)\/[^"\n]+\.(?:gltf|pdf))"/g)) {
    requireFile(path.join(root, match[1].replace(/^\//, '')));
  }
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else console.log(`OK: ${checked} asset references and legacy JavaScript syntax verified.`);
