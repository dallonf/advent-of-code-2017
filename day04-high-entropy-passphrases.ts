import * as fs from 'fs';
import * as os from 'os';
import test, { simpleTest, equalResult } from './test';
import { equal } from 'assert';
import { readLines } from './util';

const validPassphrase1 = (input: string) => {
  const words = input.split(' ');
  const usedWords = new Map<string, boolean>();
  for (const word of words) {
    if (usedWords.get(word)) return false;
    usedWords.set(word, true);
  }
  return true;
};

const validPassphrase2 = (input: string) => {
  const words = input.split(' ');
  const usedWords = new Map<string, boolean>();
  for (const word of words) {
    const letters = [...word].sort().join('');
    if (usedWords.get(letters)) return false;
    usedWords.set(letters, true);
  }
  return true;
};

const countValidPassphrases = (
  passphrases: string[],
  validPassphase: (input: string) => boolean
) => passphrases.filter(validPassphase).length;

const puzzleInput = readLines('./day4input.txt');

console.log('Part One');
simpleTest(validPassphrase1, 'aa bb cc dd ee', true);
simpleTest(validPassphrase1, 'aa bb cc dd aa', false);
simpleTest(validPassphrase1, 'aa bb cc dd aaa', true);
test(
  'Part One answer',
  equalResult(countValidPassphrases(puzzleInput, validPassphrase1), 325)
);

console.log('Part Two');
simpleTest(validPassphrase2, 'abcde fghij', true);
simpleTest(validPassphrase2, 'abcde xyz ecdab', false);
simpleTest(validPassphrase2, 'a ab abc abd abf abj', true);
simpleTest(validPassphrase2, 'iiii oiii ooii oooi oooo', true);
simpleTest(validPassphrase2, 'oiii ioii iioi iiio', false);

test(
  'Part Two answer',
  equalResult(countValidPassphrases(puzzleInput, validPassphrase2), 119)
);
