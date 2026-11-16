/**
 * Runs the TypeScript compiler (no emit) and writes the errors to an HTML report,
 * grouped by file — the typecheck counterpart of `npm run lint:report`.
 *
 *   npm run typecheck:report                     -> typecheck-report.html
 *   npm run typecheck:report -- -o out/tsc.html  -> custom output path
 *
 * Exits 1 when there are type errors (like `tsc`), 0 otherwise, so it can run in CI.
 */
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';

const root = process.cwd();
const outFlag = process.argv.indexOf('-o');
const outFile = resolve(root, outFlag > -1 ? process.argv[outFlag + 1] : 'typecheck-report.html');

// Run the project's own tsc through node (avoids the .cmd shim on Windows).
const tscPath = createRequire(import.meta.url).resolve('typescript/bin/tsc');
const result = spawnSync(process.execPath, [tscPath, '--noEmit', '--pretty', 'false'], {
  cwd: root,
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
});

if (result.error) {
  console.error('Could not run tsc:', result.error.message);
  process.exit(2);
}

// tsc --pretty false prints:  path(line,col): error TS1234: message
// Long messages continue on following lines indented with spaces.
const DIAGNOSTIC = /^(.+?)\((\d+),(\d+)\): (error|warning) (TS\d+): (.*)$/;
const GLOBAL = /^(error|warning) (TS\d+): (.*)$/;
const diagnostics = [];

for (const line of `${result.stdout}${result.stderr}`.split(/\r?\n/)) {
  if (!line.trim()) continue;
  const match = DIAGNOSTIC.exec(line);
  if (match) {
    const [, file, ln, col, severity, code, message] = match;
    diagnostics.push({ file: relative(root, resolve(root, file)), line: +ln, col: +col, severity, code, message });
    continue;
  }
  const global = GLOBAL.exec(line);
  if (global) {
    const [, severity, code, message] = global;
    diagnostics.push({ file: '(project)', line: 0, col: 0, severity, code, message });
    continue;
  }
  const last = diagnostics[diagnostics.length - 1];
  if (last) last.message += `\n${line.trim()}`;
}

const byFile = new Map();
for (const d of diagnostics) {
  if (!byFile.has(d.file)) byFile.set(d.file, []);
  byFile.get(d.file).push(d);
}
const files = [...byFile.entries()].sort(([a], [b]) => a.localeCompare(b));

const byCode = new Map();
for (const d of diagnostics) byCode.set(d.code, (byCode.get(d.code) ?? 0) + 1);
const topCodes = [...byCode.entries()].sort((a, b) => b[1] - a[1]);

const errorCount = diagnostics.filter((d) => d.severity === 'error').length;
const escape = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const fileSections = files
  .map(
    ([file, items]) => `
  <details open>
    <summary><span class="path">${escape(file)}</span><span class="count">${items.length}</span></summary>
    <table>
      ${items
        .sort((a, b) => a.line - b.line || a.col - b.col)
        .map(
          (d) => `<tr>
        <td class="loc">${d.line ? `${d.line}:${d.col}` : ''}</td>
        <td><span class="sev ${d.severity}">${d.severity}</span></td>
        <td class="msg">${escape(d.message)}</td>
        <td class="code"><a href="https://typescript.tv/errors/#${d.code.toLowerCase()}" target="_blank" rel="noreferrer">${d.code}</a></td>
      </tr>`,
        )
        .join('')}
    </table>
  </details>`,
  )
  .join('');

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>TypeScript Report</title>
<style>
  body { margin: 0; font: 14px/1.5 Inter, ui-sans-serif, system-ui, sans-serif; color: #1f2937; background: #f8fafc; }
  header { padding: 20px 24px; color: #fff; background: ${errorCount ? '#b91c1c' : '#0f766e'}; }
  header h1 { margin: 0 0 4px; font-size: 20px; }
  main { max-width: 1200px; margin: 0 auto; padding: 16px; }
  .codes { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
  .codes span { padding: 2px 8px; border-radius: 999px; background: #e2e8f0; font-size: 12px; }
  details { margin-bottom: 10px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; overflow: hidden; }
  summary { display: flex; justify-content: space-between; gap: 12px; padding: 10px 14px; cursor: pointer; background: #f1f5f9; font-weight: 600; }
  .path { word-break: break-all; }
  .count { flex: none; padding: 0 8px; border-radius: 999px; background: #fee2e2; color: #b91c1c; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 6px 14px; border-top: 1px solid #f1f5f9; vertical-align: top; }
  .loc { width: 70px; color: #64748b; font-family: ui-monospace, monospace; }
  .msg { white-space: pre-wrap; }
  .code { width: 80px; font-family: ui-monospace, monospace; }
  .sev { padding: 0 6px; border-radius: 4px; font-size: 12px; }
  .sev.error { background: #fee2e2; color: #b91c1c; }
  .sev.warning { background: #fef3c7; color: #92400e; }
  .ok { padding: 24px; text-align: center; color: #0f766e; font-weight: 600; }
</style>
</head>
<body>
<header>
  <h1>TypeScript Report</h1>
  <div>${errorCount} error${errorCount === 1 ? '' : 's'} in ${files.length} file${files.length === 1 ? '' : 's'} · generated ${new Date().toLocaleString()}</div>
</header>
<main>
  ${topCodes.length ? `<div class="codes">${topCodes.map(([code, n]) => `<span>${code} × ${n}</span>`).join('')}</div>` : ''}
  ${files.length ? fileSections : '<p class="ok">No type errors found.</p>'}
</main>
</body>
</html>
`;

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, html, 'utf8');
console.log(`TypeScript: ${errorCount} error(s) in ${files.length} file(s). Report written to ${relative(root, outFile)}`);

// No parsed diagnostics but tsc still failed (e.g. a bad tsconfig): surface its output.
if (result.status !== 0 && diagnostics.length === 0) {
  console.error(result.stdout || result.stderr);
  process.exit(result.status ?? 1);
}
process.exit(errorCount ? 1 : 0);
