import * as _ from 'lodash';
import test, { simpleTest, equalResult } from './test';
const now = require('performance-now');

const GENERATOR_A_FACTOR = 16807;
const GENERATOR_B_FACTOR = 48271;
const GENERATOR_A_MULTIPLE = 4;
const GENERATOR_B_MULTIPLE = 8;

function* generator(startingNumber: number, factor: number) {
  let lastValue = startingNumber;
  while (true) {
    const nextValue = (lastValue * factor) % 2147483647;
    yield nextValue;
    lastValue = nextValue;
  }
}

function* pickyGenerator(
  startingNumber: number,
  factor: number,
  multiple: number
) {
  const baseGenerator = generator(startingNumber, factor);
  while (true) {
    const nextValue = baseGenerator.next().value;
    if (nextValue % multiple === 0) {
      yield nextValue;
    }
  }
}

const take = <T>(generator: IterableIterator<T>, count: number) => {
  const result: T[] = [];
  for (let index = 0; index < count; index++) {
    const next = generator.next();
    result.push(next.value);
    if (next.done) {
      break;
    }
  }
  return result;
};

const BITMASK = (1 << 16) - 1;
const getLast16Binary = (number: number) => {
  const last16 = number & BITMASK;
  const result = last16;
  return result;
};

const judge = (
  generatorA: IterableIterator<number>,
  generatorB: IterableIterator<number>,
  iterations: number
) => {
  let matches = 0;
  for (let index = 0; index < iterations; index++) {
    const aNumber = generatorA.next().value;
    const a = getLast16Binary(aNumber);
    const bNumber = generatorB.next().value;
    const b = getLast16Binary(bNumber);
    if (a === b) matches += 1;
  }
  return matches;
};

const EXAMPLE_GENERATOR_A_STARTING_VALUE = 65;
const EXAMPLE_GENERATOR_B_STARTING_VALUE = 8921;
const PUZZLE_INPUT_GENERATOR_A_STARTING_VALUE = 679;
const PUZZLE_INPUT_GENERATOR_B_STARTING_VALUE = 771;

console.log('Part One');
test(
  'generator A',
  equalResult(
    take(generator(EXAMPLE_GENERATOR_A_STARTING_VALUE, GENERATOR_A_FACTOR), 5),
    [1092455, 1181022009, 245556042, 1744312007, 1352636452],
    { deepEqual: true }
  )
);
test(
  'generator B',
  equalResult(
    take(generator(EXAMPLE_GENERATOR_B_STARTING_VALUE, GENERATOR_B_FACTOR), 5),
    [430625591, 1233683848, 1431495498, 137874439, 285222916],
    { deepEqual: true }
  )
);
simpleTest(
  x => getLast16Binary(x).toString(2),
  245556042,
  '1110001101001010',
  'getLast16Binary'
);
test(
  'judge',
  equalResult(
    judge(
      generator(EXAMPLE_GENERATOR_A_STARTING_VALUE, GENERATOR_A_FACTOR),
      generator(EXAMPLE_GENERATOR_B_STARTING_VALUE, GENERATOR_B_FACTOR),
      5
    ),
    1
  )
);

// just run it for a bit for performance testing
// const _beginStress = now();
// judge(
//   generator(EXAMPLE_GENERATOR_A_STARTING_VALUE, GENERATOR_A_FACTOR),
//   generator(EXAMPLE_GENERATOR_B_STARTING_VALUE, GENERATOR_B_FACTOR),
//   40000
// );
// const _endStress = now();
// console.log('stress test', _endStress - _beginStress);

// This takes about a minute to run, so comment it out while debugging
test(
  'Part One answer',
  equalResult(
    judge(
      generator(PUZZLE_INPUT_GENERATOR_A_STARTING_VALUE, GENERATOR_A_FACTOR),
      generator(PUZZLE_INPUT_GENERATOR_B_STARTING_VALUE, GENERATOR_B_FACTOR),
      40000000
    ),
    626
  )
);

console.log('Part Two');
test(
  'generator A',
  equalResult(
    take(
      pickyGenerator(
        EXAMPLE_GENERATOR_A_STARTING_VALUE,
        GENERATOR_A_FACTOR,
        GENERATOR_A_MULTIPLE
      ),
      5
    ),
    [1352636452, 1992081072, 530830436, 1980017072, 740335192],
    { deepEqual: true }
  )
);
test(
  'generator B',
  equalResult(
    take(
      pickyGenerator(
        EXAMPLE_GENERATOR_B_STARTING_VALUE,
        GENERATOR_B_FACTOR,
        GENERATOR_B_MULTIPLE
      ),
      5
    ),
    [1233683848, 862516352, 1159784568, 1616057672, 412269392],
    { deepEqual: true }
  )
);

// just run it for a bit for performance testing
// const _beginStress = now();
// judge(
//   pickyGenerator(
//     EXAMPLE_GENERATOR_A_STARTING_VALUE,
//     GENERATOR_A_FACTOR,
//     GENERATOR_A_MULTIPLE
//   ),
//   pickyGenerator(
//     EXAMPLE_GENERATOR_B_STARTING_VALUE,
//     GENERATOR_B_FACTOR,
//     GENERATOR_B_MULTIPLE
//   ),
//   5000
// );
// const _endStress = now();
// console.log('stress test', _endStress - _beginStress);

// This takes about a minute to run, so comment it out while debugging
test(
  'Part Two answer',
  equalResult(
    judge(
      pickyGenerator(
        PUZZLE_INPUT_GENERATOR_A_STARTING_VALUE,
        GENERATOR_A_FACTOR,
        GENERATOR_A_MULTIPLE
      ),
      pickyGenerator(
        PUZZLE_INPUT_GENERATOR_B_STARTING_VALUE,
        GENERATOR_B_FACTOR,
        GENERATOR_B_MULTIPLE
      ),
      5000000
    ),
    306
  )
);
