import { promisifyExec } from './promisifyExec';
import { readdirSync, statSync, existsSync } from 'fs';

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
  testDirs.map((dirName) => {
    const stylesInOverride = `${currentDir}/${dirName}/stylesin.css`;
    const stylesInPath = existsSync(stylesInOverride)
      ? stylesInOverride
      : `${currentDir}/stylesin.css`;
    return promisifyExec(
      `tailwindcss -c ${currentDir}/${dirName}/${tailwindConfigFileName} -i ${stylesInPath} -o ${currentDir}/${dirName}/stylesout.css ${watch ? '-w' : ''}`,
    );
  }),
);
