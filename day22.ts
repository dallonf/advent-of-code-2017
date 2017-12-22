import test, { simpleTest, equalResult } from './test';
import * as _ from 'lodash';
import { OS_EOL, readLines } from './util';

// This one is kind of sloppy because I didn't have a lot of time

type Grid = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  map: Map<number, Map<number, boolean>>;
};

type Carrier = {
  currentX: number;
  currentY: number;
  direction: Direction;
};

enum Direction {
  UP = 0,
  RIGHT = 1,
  DOWN = 2,
  LEFT = 3,
}

const checkNode = (grid: Grid, x: number, y: number) => {
  const column = grid.map.get(x);
  if (!column) return false;
  return column.get(y) || false;
};

/**
 * @param grid WARNING: will mutate the grid
 */
const writeNode = (grid: Grid, x: number, y: number, value: boolean) => {
  const { map } = grid;
  let column = map.get(x);
  if (!column) {
    column = new Map<number, boolean>();
    map.set(x, column);
  }
  column.set(y, value);
  if (x > grid.maxX) grid.maxX = x;
  if (x < grid.minX) grid.minX = x;
  if (y > grid.maxY) grid.maxY = y;
  if (y < grid.minY) grid.minY = y;
};

const parseInput = (input: string[]) => {
  const ySize = input.length;
  const xSize = input[0].length;
  const originOffsetX = Math.floor(xSize / 2);
  const originOffsetY = Math.floor(ySize / 2);
  const grid = {
    minX: 0,
    maxX: 0,
    minY: 0,
    maxY: 0,
    map: new Map<number, Map<number, boolean>>(),
  };
  input.forEach((row, y) =>
    [...row].forEach((val, x) => {
      writeNode(grid, x - originOffsetX, y - originOffsetY, val === '#');
    })
  );
  return grid;
};

const debugGrid = (grid: Grid, carrier?: Carrier) => {
  console.log('---- grid ----');
  for (let y = grid.minY; y <= grid.maxY; y++) {
    console.log(
      _.range(grid.minX, grid.maxX + 1)
        .map(x => (checkNode(grid, x, y) ? '#' : '.'))
        .join(' ')
    );
  }
  if (carrier)
    console.log({ ...carrier, direction: Direction[carrier.direction] });
};

const turnRight = (direction: Direction) => {
  switch (direction) {
    case Direction.UP:
      return Direction.RIGHT;
    case Direction.RIGHT:
      return Direction.DOWN;
    case Direction.DOWN:
      return Direction.LEFT;
    case Direction.LEFT:
      return Direction.UP;
  }
};

const turnLeft = (direction: Direction) => {
  switch (direction) {
    case Direction.UP:
      return Direction.LEFT;
    case Direction.LEFT:
      return Direction.DOWN;
    case Direction.DOWN:
      return Direction.RIGHT;
    case Direction.RIGHT:
      return Direction.UP;
  }
};

const move = (x: number, y: number, direction: Direction) => {
  switch (direction) {
    case Direction.UP:
      return { x, y: y - 1 };
    case Direction.RIGHT:
      return { x: x + 1, y };
    case Direction.DOWN:
      return { x, y: y + 1 };
    case Direction.LEFT:
      return { x: x - 1, y };
  }
};

/**
 * @param grid WARNING: will mutate the grid
 */
const simulateStep = (grid: Grid, carrier: Carrier) => {
  const isCurrentNodeInfected = checkNode(
    grid,
    carrier.currentX,
    carrier.currentY
  );
  const newDirection = isCurrentNodeInfected
    ? turnRight(carrier.direction)
    : turnLeft(carrier.direction);
  writeNode(grid, carrier.currentX, carrier.currentY, !isCurrentNodeInfected);

  const { x: newX, y: newY } = move(
    carrier.currentX,
    carrier.currentY,
    newDirection
  );

  const newCarrier = {
    currentX: newX,
    currentY: newY,
    direction: newDirection,
  };

  return {
    carrier: newCarrier,
    didInfect: !isCurrentNodeInfected,
  };
};

/**
 * @param grid WARNING: will mutate the grid
 */
const countInfectionsAfterIterations = (grid: Grid, iterations: number) => {
  let infections = 0;
  let carrier = { currentX: 0, currentY: 0, direction: Direction.UP };
  for (let i = 0; i < iterations; i++) {
    const result = simulateStep(grid, carrier);
    if (result.didInfect) infections += 1;
    carrier = result.carrier;
  }
  return infections;
};

const EXAMPLE_INPUT = `
..#
#..
...
`
  .split(OS_EOL)
  .filter(x => x);

const PUZZLE_INPUT = readLines('./day22input.txt');

console.log('Part One');
const exampleGrid = parseInput(EXAMPLE_INPUT);
test('-1,0 is infected', checkNode(exampleGrid, -1, 0));
test('1,-1 is infected', checkNode(exampleGrid, 1, -1));
test('0,0 is clean', !checkNode(exampleGrid, 0, 0));
test('2,0 is clean', !checkNode(exampleGrid, 2, 0));
test(
  'countInfectionsAfterIterations',
  equalResult(countInfectionsAfterIterations(parseInput(EXAMPLE_INPUT), 7), 5)
);
test(
  'countInfectionsAfterIterations',
  equalResult(countInfectionsAfterIterations(parseInput(EXAMPLE_INPUT), 70), 41)
);
test(
  'countInfectionsAfterIterations',
  equalResult(
    countInfectionsAfterIterations(parseInput(EXAMPLE_INPUT), 10000),
    5587
  )
);

test(
  'Part One answer',
  equalResult(
    countInfectionsAfterIterations(parseInput(PUZZLE_INPUT), 10000),
    0
  )
);
