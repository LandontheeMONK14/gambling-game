import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

function file(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function toBrowserGlobal(source, globalName) {
  const exportNames = [];
  const transformed = source
    .replace(/export\s+const\s+(\w+)\s*=/g, (_, name) => {
      exportNames.push(name);
      return `const ${name} =`;
    })
    .replace(/export\s+function\s+(\w+)\s*\(/g, (_, name) => {
      exportNames.push(name);
      return `function ${name}(`;
    })
    .replace(/export\s+class\s+(\w+)\s*/g, (_, name) => {
      exportNames.push(name);
      return `class ${name} `;
    });

  return `${transformed}\nwindow.${globalName} = { ${exportNames.join(', ')} };\n`;
}

export function buildStandaloneHtml() {
  const template = file('src/template.html');
  const shell = file('src/app-shell.html').trim();
  const styles = file('src/styles.css').trim();
  const engine = toBrowserGlobal(file('src/game/casino-engine.js'), 'CasinoEngine');
  const runtime = file('src/main.js').trim();
  const combinedRuntime = `${engine}\nwindow.__CASINO_HEAD_HTML__ = ${JSON.stringify('    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>Lucky Cascade Casino</title>')};\nwindow.__CASINO_BODY_HTML__ = ${JSON.stringify(shell)};\nwindow.__CASINO_STYLES__ = ${JSON.stringify(styles)};\nwindow.__CASINO_RUNTIME_SOURCE__ = ${JSON.stringify(`${engine}\n${runtime}`)};\n${runtime}`;

  return template
    .replace('__INLINE_STYLE__', styles)
    .replace('__APP_SHELL__', shell)
    .replace('__BOOTSTRAP__', combinedRuntime);
}

export function writeStandaloneFiles() {
  const html = buildStandaloneHtml();
  fs.writeFileSync(path.join(repoRoot, 'index.html'), html, 'utf8');
  fs.writeFileSync(path.join(repoRoot, 'casino.html'), html, 'utf8');
  fs.mkdirSync(path.join(repoRoot, 'dist'), { recursive: true });
  fs.writeFileSync(path.join(repoRoot, 'dist/index.html'), html, 'utf8');
  fs.writeFileSync(path.join(repoRoot, 'dist/casino.html'), html, 'utf8');
  return html;
}
