import test, { simpleTest, equalResult } from './test';

const spinLock = (
  iterations: number,
  steps: number
): { buffer: number[]; insertion: number } => {
  const buffer = [0];
  let insertion = 0;
  for (let i = 1; i <= iterations; i++) {
    insertion += steps;
    insertion = insertion % buffer.length + 1;
    buffer.splice(insertion, 0, i);
  }
  return { buffer, insertion };
};

const getNumberAfterLastInsertion = (
  iterations: number,
  steps: number
): number => {
  const spinLockResult = spinLock(iterations, steps);
  return spinLockResult.buffer[spinLockResult.insertion + 1];
};

const PUZZLE_INPUT = 301;

console.log('Part One');
simpleTest(
  x => spinLock(x, 3),
  1,
  { buffer: [0, 1], insertion: 1 },
  undefined,
  { deepEqual: true }
);
simpleTest(
  x => spinLock(x, 3),
  3,
  { buffer: [0, 2, 3, 1], insertion: 2 },
  undefined,
  { deepEqual: true }
);
simpleTest(
  x => spinLock(x, 3),
  6,
  {
    buffer: [0, 5, 2, 4, 3, 6, 1],
    insertion: 5,
  },
  undefined,
  { deepEqual: true }
);
simpleTest(
  x => spinLock(x, 3),
  9,
  {
    buffer: [0, 9, 5, 7, 2, 4, 3, 8, 6, 1],
    insertion: 1,
  },
  undefined,
  { deepEqual: true }
);
simpleTest(x => getNumberAfterLastInsertion(x, 3), 9, 5);

test(
  'Part One answer',
  equalResult(getNumberAfterLastInsertion(2017, PUZZLE_INPUT), 1642)
);
