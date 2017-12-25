import test, { simpleTest, equalResult } from './test';
import { readLines } from './util';

console.log('Day 5: A Maze of Twisty Trampolines, All Alike');

const jumpEscape1 = (offsets: number[]) => {
  const mutableOffsets = [...offsets];
  let cursor = 0,
    steps = 0;
  while (cursor >= 0 && cursor < offsets.length) {
    const offset = mutableOffsets[cursor];
    mutableOffsets[cursor] += 1;
    steps += 1;
    cursor += offset;
  }
  return steps;
};

const jumpEscape2 = (offsets: number[]) => {
  const mutableOffsets = [...offsets];
  let cursor = 0,
    steps = 0;
  while (cursor >= 0 && cursor < offsets.length) {
    const offset = mutableOffsets[cursor];
    mutableOffsets[cursor] += offset >= 3 ? -1 : 1;
    steps += 1;
    cursor += offset;
  }
  return steps;
};

const puzzleInput = readLines('./day05input.txt').map(line =>
  parseInt(line, 10)
);

console.log('Part One');
simpleTest(jumpEscape1, [0, 3, 0, 1, -3], 5);
test('Part One Answer', equalResult(jumpEscape1(puzzleInput), 391540));

console.log('Part Two');
simpleTest(jumpEscape2, [0, 3, 0, 1, -3], 10);
test('Part Two Answer', equalResult(jumpEscape2(puzzleInput), 30513679));
