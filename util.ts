import * as fs from 'fs';
import * as os from 'os';

export const OS_EOL = /\r\n|\n/;

export const readLines = (path: string) =>
  fs.readFileSync(path, 'utf-8').split(OS_EOL);
