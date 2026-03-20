import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import postcss from 'postcss';
import tailwindcss from '@tailwindcss/postcss';
import path from 'node:path';

const e2eDir = path.resolve('e2e');
const testDirs = readdirSync(e2eDir).filter((f) => {
  const dirPath = path.join(e2eDir, f);
  return statSync(dirPath).isDirectory() && !existsSync(path.join(dirPath, 'vite.config.ts'));
});

for (const dir of testDirs) {
  const inputPath = path.join(e2eDir, dir, 'input.css');
  const outputPath = path.join(e2eDir, dir, 'stylesout.css');
  const css = readFileSync(inputPath, 'utf8');
  const result = await postcss([tailwindcss()]).process(css, {
    from: inputPath,
    to: outputPath,
  });
  writeFileSync(outputPath, result.css);
  console.log(`Built: ${outputPath}`);
}
