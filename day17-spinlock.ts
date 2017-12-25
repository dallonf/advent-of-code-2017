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
  return getNumberAfter(iterations, iterations, steps);
};

const getNumberAfterNaive = (
  targetNumber: number,
  iterations: number,
  steps: number
) => {
  const { buffer } = spinLock(iterations, steps);
  for (let index = 0; index < buffer.length; index++) {
    const number = buffer[index];
    if (number === targetNumber) return buffer[index + 1];
  }
};

const getNumberAfter = (
  targetNumber: number,
  iterations: number,
  steps: number
): number => {
  // Find the target number's index
  let targetNumberIndex = targetNumber === 0 ? 0 : -1;
  let insertion = 0;
  let length = 1;
  for (let i = 1; i <= iterations; i++) {
    insertion += steps;
    insertion = insertion % length + 1;
    length += 1;
    if (i === targetNumber) {
      targetNumberIndex = insertion;
    } else if (targetNumberIndex > -1 && insertion <= targetNumberIndex) {
      targetNumberIndex += 1;
    }
  }

  // use this to calculate the final insertion after that index
  let trackingPosition = targetNumberIndex + 1;
  // Step backwards through the array, to find the origin of the value
  for (let i = iterations - 1; i > 0; i--) {
    // remove the new item
    length -= 1;
    if (insertion < trackingPosition) {
      // The tracking position has been displaced
      // by an element before it being removed
      trackingPosition -= 1;
    }
    insertion -= steps + 1;
    insertion = insertion % length;
    if (insertion < 0) {
      insertion = length - -insertion;
    }
    if (insertion === trackingPosition) {
      // We've found where the tracked position was written
      return i;
    }
  }
  throw new Error("Couldn't find the number");
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
simpleTest(x => getNumberAfterLastInsertion(x, 3), 2017, 638);

test(
  'Part One answer',
  equalResult(getNumberAfterLastInsertion(2017, PUZZLE_INPUT), 1642)
);

console.log('Part Two');
const ITERATIONS = 50000000;
test(
  'Find number after arbitrary point (151)',
  equalResult(getNumberAfter(1134, 2017, 3), 151)
);

test(
  'Part Two answer',
  equalResult(getNumberAfter(0, ITERATIONS, PUZZLE_INPUT), 33601318)
);
