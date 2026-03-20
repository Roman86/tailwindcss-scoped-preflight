import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import postcss from 'postcss';
import tailwindcss from '@tailwindcss/postcss';
import path from 'node:path';

const v4Dir = path.resolve('e2e/v4');
const testDirs = readdirSync(v4Dir).filter((f) => {
  const dirPath = path.join(v4Dir, f);
  return statSync(dirPath).isDirectory() && !existsSync(path.join(dirPath, 'vite.config.ts'));
});

for (const dir of testDirs) {
  const inputPath = path.join(v4Dir, dir, 'input.css');
  const outputPath = path.join(v4Dir, dir, 'stylesout.css');
  const css = readFileSync(inputPath, 'utf8');
  const result = await postcss([tailwindcss()]).process(css, {
    from: inputPath,
    to: outputPath,
  });
  writeFileSync(outputPath, result.css);
  console.log(`Built: ${outputPath}`);
}
