import { promisifyExec } from './promisifyExec';
import { readdirSync, statSync } from 'fs';

const tailwindConfigFileName = 'tailwind.config.js';

const currentDir = 'e2e';

const watch = process.argv.slice(2).includes('--watch');

const testDirs = readdirSync(currentDir, {
  recursive: false,
}).filter(
  (file) =>
    statSync(`e2e/${file}`).isDirectory() &&
    readdirSync(`e2e/${file}`).includes(tailwindConfigFileName),
);

await Promise.all(
  testDirs.map((dirName) =>
    promisifyExec(
      `tailwindcss -c ${currentDir}/${dirName}/${tailwindConfigFileName} -i ${currentDir}/stylesin.css -o ${currentDir}/${dirName}/stylesout.css ${watch ? '-w' : ''}`,
    ),
  ),
);
