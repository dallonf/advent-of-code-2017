import test, { simpleTest, equalResult } from './test';
import { OS_EOL } from './util';

// This one is kind of sloppy because I didn't have a lot of time

type Grid = Map<number, Map<number, boolean>>;

enum Direction {
  UP = 0,
  RIGHT = 1,
  DOWN = 2,
  LEFT = 3,
}

const checkNode = (grid: Grid, x: number, y: number) => {
  const column = grid.get(x);
  if (!column) return false;
  return column.get(y) || false;
};

const writeNode = (grid: Grid, x: number, y: number, value: boolean) => {
  let column = grid.get(x);
  if (!column) {
    column = new Map<number, boolean>();
    grid.set(x, column);
  }
  column.set(y, value);
};

const parseInput = (input: string[]) => {
  const ySize = input.length;
  const xSize = input[0].length;
  const originOffsetX = Math.floor(xSize / 2);
  const originOffsetY = Math.floor(ySize / 2);
  const grid = new Map<number, Map<number, boolean>>();
  input.forEach((row, y) =>
    [...row].forEach((val, x) => {
      writeNode(grid, x - originOffsetX, y - originOffsetY, val === '#');
    })
  );
  return grid;
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
const simulateStep = (
  grid: Grid,
  carrier: { currentX: number; currentY: number; direction: Direction }
) => {
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
    carrier.direction
  );

  return {
    carrier: { currentX: newX, currentY: newY, direction: newDirection },
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
