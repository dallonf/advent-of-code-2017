import * as _ from 'lodash';
import test, { equalResult } from './test';
import { OS_EOL, readLines } from './util';

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

const pixelsOnAfterIterations = (rules: Rule[], iterations: number): number => {
  let currentState = patternToGrid(STARTING_PATTERN);
  for (let index = 0; index < iterations; index++) {
    currentState = gridIteration(currentState, rules);
  }
  return currentState
    .map(row => row.map(pixel => Number(pixel ? 1 : 0)).reduce((a, b) => a + b))
    .reduce((a, b) => a + b);
};

const gridIteration = (gridState: Grid, rules: Rule[]): Grid => {
  const size = gridState[0].length;
  let numSquares: number, squareSize: number;
  if (size % 2 === 0) {
    numSquares = size / 2;
    squareSize = 2;
  } else if (size % 3 == 0) {
    numSquares = size / 3;
    squareSize = 3;
  } else {
    throw new Error(`Grid size ${size} not divisible by 2 or 3`);
  }

  const sourceSquares = _.flatten(
    _.range(numSquares).map(x =>
      _.range(numSquares).map(y => {
        const offsetX = x * squareSize;
        const offsetY = y * squareSize;
        return {
          x,
          y,
          square: _.range(squareSize).map(squareX =>
            _.range(squareSize).map(squareY =>
              getValue(gridState, offsetX + squareX, offsetY + squareY)
            )
          ) as Grid,
        };
      })
    )
  );

  const outputSquares = sourceSquares.map(square => {
    const pattern = gridToPattern(square.square);
    const matchingRule = rules.find(rule => patternMatches(pattern, rule));
    if (!matchingRule) {
      throw new Error(`No matching rule for grid square "${pattern}"`);
    }
    return { ...square, square: patternToGrid(matchingRule.output) };
  });

  const newSquareSize = squareSize + 1;
  const newGrid = _.range(numSquares * newSquareSize).map(squareX =>
    _.range(numSquares * newSquareSize).map(() => false)
  );
  outputSquares.forEach(square => {
    const offsetX = square.x * newSquareSize;
    const offsetY = square.y * newSquareSize;
    square.square.forEach((row, squareX) =>
      row.forEach((value, squareY) => {
        newGrid[offsetY + squareY][offsetX + squareX] = value;
      })
    );
  });

  return newGrid;
};

console.log('Part One');
const EXAMPLE_INPUT = `
../.# => ##./#../...
.#./..#/### => #..#/..../..../#..#
`
  .split(OS_EOL)
  .filter(x => x);

const PUZZLE_INPUT = readLines('./day21input.txt');

const sampleRule = parseRule('.#./..#/### => ..../..../..../....');
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

const exampleRules = EXAMPLE_INPUT.map(parseRule);
const puzzleRules = PUZZLE_INPUT.map(parseRule);

test(
  'pixelsOnAfterIterations',
  equalResult(pixelsOnAfterIterations(exampleRules, 2), 12)
);

test(
  'Part One answer',
  equalResult(pixelsOnAfterIterations(puzzleRules, 5), 190)
);
