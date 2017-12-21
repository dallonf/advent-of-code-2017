import test, { equalResult } from './test';
import { OS_EOL } from './util';

type Grid = boolean[][];
interface Rule {
  sourceRule: string;
  output: string;
  matchPatterns: Set<string>;
}

const STARTING_PATTERN = '.#./..#/###';

const getValue = (grid: Grid, x: number, y: number) => grid[y][x];
const patternToGrid = (input: string): Grid =>
  input.split('/').map(row => [...row].map(char => char === '#'));
const gridToPattern = (input: Grid): string =>
  input.map(row => row.map(cell => (cell ? '#' : '.')).join('')).join('/');

const rotateGrid = (grid: Grid): Grid =>
  grid.map((row, y) =>
    row.map((char, x) => getValue(grid, row.length - 1 - y, x))
  );
const flipGridVertical = (grid: Grid): Grid =>
  grid.map((row, y) =>
    row.map((char, x) => getValue(grid, x, row.length - 1 - y))
  );
const flipGridHorizontal = (grid: Grid): Grid =>
  grid.map((row, y) =>
    row.map((char, x) => getValue(grid, row.length - 1 - x, y))
  );

const parseRule = (input: string): Rule => {
  const match = input.match(/^([.#/]+) => ([.#/]+)$/);
  if (!match) throw new Error(`Could not parse rule "${input}"`);
  const sourceRule = match[1];
  const output = match[2];
  const matchPatterns = new Set<string>();
  matchPatterns.add(sourceRule);

  let rotatedGrid = patternToGrid(sourceRule);
  for (let rotateCount = 1; rotateCount < 4; rotateCount++) {
    rotatedGrid = rotateGrid(rotatedGrid);
    matchPatterns.add(gridToPattern(rotatedGrid));
    matchPatterns.add(gridToPattern(flipGridVertical(rotatedGrid)));
    matchPatterns.add(gridToPattern(flipGridHorizontal(rotatedGrid)));
    matchPatterns.add(
      gridToPattern(flipGridHorizontal(flipGridVertical(rotatedGrid)))
    );
  }

  return { sourceRule, output, matchPatterns };
};
const patternMatches = (input: string, rule: Rule): boolean =>
  rule.matchPatterns.has(input);

console.log('Part One');
const EXAMPLE_INPUT = `
../.# => ##./#../...
.#./..#/### => #..#/..../..../#..#
`
  .split(OS_EOL)
  .filter(x => x);

const sampleRule = parseRule('.#./..#/### => ..../..../..../....');
console.log(sampleRule);
test(
  'flipped match',
  equalResult(patternMatches('.#./..#/###', sampleRule), true)
);
test(
  'flipped match',
  equalResult(patternMatches('.#./#../###', sampleRule), true)
);
test(
  'flipped match',
  equalResult(patternMatches('#../#.#/##.', sampleRule), true)
);
test(
  'flipped match',
  equalResult(patternMatches('###/..#/.#.', sampleRule), true)
);
test(
  'flipped non-match',
  equalResult(patternMatches('#.#/..#/.#.', sampleRule), false)
);
