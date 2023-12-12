import * as fs from 'fs';
import test, { simpleTest, equalResult } from './test';

console.log('Day 2: Corruption Checksum');

const parseInput = (input: string) =>
  input
    .split('\n')
    .filter(i => i)
    .map(row => row.split(/[\s]/).map(i => parseInt(i, 10)));

function checksum1(input: string) {
  const differences = parseInput(input).map(row => {
    const largest = Math.max(...row);
    const smallest = Math.min(...row);
    return largest - smallest;
  });
  return differences.reduce((a, b) => a + b);
}

const TEST_INPUT = fs.readFileSync('./day02input.txt', 'utf-8');

console.log('Part One');
simpleTest(
  checksum1,
  `
5 1 9 5
7 5 3
2 4 6 8`,
  18
);
test('Part One answer', equalResult(checksum1(TEST_INPUT), 54426));

const checksum2 = (input: string) =>
  parseInput(input)
    .map(row => {
      const sortedRow = [...row].sort();
      // walk backward through the row (higher numbers are more likely to divide cleanly)
      for (let i = sortedRow.length - 1; i > 0; i--) {
        const high = sortedRow[i];
        // only check numbers that are lower than this
        // find a number than divides cleanly
        const low = sortedRow.filter(n => n < high).find(n => high % n === 0);
        if (low != null) {
          return high / low;
        }
      }
      throw new Error(
        `Could not find any numbers in ${JSON.stringify(
          row
        )} that are cleanly divisible`
      );
    })
    .reduce((a, b) => a + b);

simpleTest(
  checksum2,
  `
5 9 2 8
9 4 7 3
3 8 6 5`,
  9
);
test('Part Two answer', equalResult(checksum2(TEST_INPUT), 333));
