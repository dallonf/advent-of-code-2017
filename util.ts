import * as fs from 'fs';
import * as os from 'os';

export const readLines = (path: string) =>
  fs.readFileSync(path, 'utf-8').split(os.EOL);
