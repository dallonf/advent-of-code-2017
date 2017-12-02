import test, { simpleTest } from './test';

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

console.log('Part One');
simpleTest(
  checksum1,
  `
5 1 9 5
7 5 3
2 4 6 8`,
  18
);
