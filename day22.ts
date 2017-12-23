import test, { simpleTest, equalResult } from './test';
import * as _ from 'lodash';
import { OS_EOL, readLines } from './util';

// This one is kind of sloppy because I didn't have a lot of time

enum NodeState {
  CLEAN,
  WEAKENED,
  INFECTED,
  FLAGGED,
}

type Grid = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  map: { [x: number]: { [y: number]: NodeState } };
  // map: Map<number, Map<number, NodeState>>;
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

const checkNodeInfected = (grid: Grid, x: number, y: number) => {
  return checkNode(grid, x, y) === NodeState.INFECTED;
};

const checkNode = (grid: Grid, x: number, y: number) => {
  const column = grid.map[x];
  if (!column) return NodeState.CLEAN;
  return column[y] || NodeState.CLEAN;
};

/**
 * @param grid WARNING: will mutate the grid
 */
const writeNodeLegacy = (grid: Grid, x: number, y: number, value: boolean) => {
  writeNode(grid, x, y, value ? NodeState.INFECTED : NodeState.CLEAN);
};

/**
 * @param grid WARNING: will mutate the grid
 */
const writeNode = (grid: Grid, x: number, y: number, value: NodeState) => {
  const { map } = grid;
  let column = map[x];
  if (!column) {
    column = map[x] = {};
  }
  column[y] = value;
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
    map: {},
  };
  input.forEach((row, y) =>
    [...row].forEach((val, x) => {
      writeNode(
        grid,
        x - originOffsetX,
        y - originOffsetY,
        val === '#' ? NodeState.INFECTED : NodeState.CLEAN
      );
    })
  );
  return grid;
};

const debugGrid = (grid: Grid, carrier?: Carrier) => {
  console.log('---- grid ----');
  for (let y = grid.minY; y <= grid.maxY; y++) {
    console.log(
      _.range(grid.minX, grid.maxX + 1)
        .map(x => {
          switch (checkNode(grid, x, y)) {
            case NodeState.CLEAN:
              return '.';
            case NodeState.FLAGGED:
              return 'F';
            case NodeState.INFECTED:
              return '#';
            case NodeState.WEAKENED:
              return 'W';
          }
        })
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

const reverse = (direction: Direction) => {
  switch (direction) {
    case Direction.UP:
      return Direction.DOWN;
    case Direction.DOWN:
      return Direction.UP;
    case Direction.LEFT:
      return Direction.RIGHT;
    case Direction.RIGHT:
      return Direction.LEFT;
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
  carrier: Carrier,
  { complexMode = false } = {}
) => {
  const currentNodeState = checkNode(grid, carrier.currentX, carrier.currentY);
  const isCurrentNodeInfected = currentNodeState === NodeState.INFECTED;

  let newDirection;
  switch (currentNodeState) {
    case NodeState.CLEAN:
      newDirection = turnLeft(carrier.direction);
      break;
    case NodeState.INFECTED:
      newDirection = turnRight(carrier.direction);
      break;
    case NodeState.WEAKENED:
      newDirection = carrier.direction;
      break;
    case NodeState.FLAGGED:
      newDirection = reverse(carrier.direction);
      break;
    default:
      throw new Error(`Unrecognized node state ${currentNodeState}`);
  }

  let newValue;
  if (complexMode) {
    switch (currentNodeState) {
      case NodeState.CLEAN:
        newValue = NodeState.WEAKENED;
        break;
      case NodeState.WEAKENED:
        newValue = NodeState.INFECTED;
        break;
      case NodeState.INFECTED:
        newValue = NodeState.FLAGGED;
        break;
      case NodeState.FLAGGED:
        newValue = NodeState.CLEAN;
        break;
      default:
        throw new Error(`Unrecognized node state ${currentNodeState}`);
    }
  } else {
    newValue = isCurrentNodeInfected ? NodeState.CLEAN : NodeState.INFECTED;
  }

  writeNode(grid, carrier.currentX, carrier.currentY, newValue);

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

  // debugGrid(grid, newCarrier);

  return {
    carrier: newCarrier,
    didInfect: newValue === NodeState.INFECTED,
  };
};

/**
 * @param grid WARNING: will mutate the grid
 */
const countInfectionsAfterIterations = (
  grid: Grid,
  iterations: number,
  { complexMode = false } = {}
) => {
  let infections = 0;
  let carrier = { currentX: 0, currentY: 0, direction: Direction.UP };
  for (let i = 0; i < iterations; i++) {
    const result = simulateStep(grid, carrier, { complexMode });
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
test('-1,0 is infected', checkNodeInfected(exampleGrid, -1, 0));
test('1,-1 is infected', checkNodeInfected(exampleGrid, 1, -1));
test('0,0 is clean', !checkNodeInfected(exampleGrid, 0, 0));
test('2,0 is clean', !checkNodeInfected(exampleGrid, 2, 0));
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
    5552
  )
);

console.log('Part Two');
test(
  'countInfectionsAfterIterations',
  equalResult(
    countInfectionsAfterIterations(parseInput(EXAMPLE_INPUT), 100, {
      complexMode: true,
    }),
    26
  )
);
test(
  'countInfectionsAfterIterations',
  equalResult(
    countInfectionsAfterIterations(parseInput(EXAMPLE_INPUT), 10000000, {
      complexMode: true,
    }),
    2511944
  )
);
test(
  'Part Two answer',
  equalResult(
    countInfectionsAfterIterations(parseInput(PUZZLE_INPUT), 10000000, {
      complexMode: true,
    }),
    2511527
  )
);
