import test, { simpleTest, equalResult } from './test';
import { readLines } from './util';

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

const puzzleInput = readLines('./day5input.txt').map(line =>
  parseInt(line, 10)
);

console.log('Part One');
simpleTest(jumpEscape1, [0, 3, 0, 1, -3], 5);
test('Part One Answer', equalResult(jumpEscape1(puzzleInput), 391540));
