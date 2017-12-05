import * as fs from 'fs';
import * as os from 'os';
import test, { simpleTest, equalResult } from './test';
import { equal } from 'assert';

const validPassphrase1 = (input: string) => {
  const words = input.split(' ');
  const usedWords = new Map<string, boolean>();
  for (const word of words) {
    if (usedWords.get(word)) return false;
    usedWords.set(word, true);
  }
  return true;
};

const countValidPassphrases1 = (passphrases: string[]) =>
  passphrases.filter(validPassphrase1).length;

const puzzleInput = fs.readFileSync('./day4input.txt', 'utf-8').split(os.EOL);

console.log('Part One');
simpleTest(validPassphrase1, 'aa bb cc dd ee', true);
simpleTest(validPassphrase1, 'aa bb cc dd aa', false);
simpleTest(validPassphrase1, 'aa bb cc dd aaa', true);
test('Part One answer', equalResult(countValidPassphrases1(puzzleInput), 325));
