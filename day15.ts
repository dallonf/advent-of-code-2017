import * as _ from 'lodash';
import test, { simpleTest, equalResult } from './test';
import { Buffer } from 'buffer';
import { numberToBinary } from './util';
const now = require('performance-now');

const GENERATOR_A_FACTOR = 16807;
const GENERATOR_B_FACTOR = 48271;

function* generator(startingNumber: number, factor: number) {
  let lastValue = startingNumber;
  while (true) {
    const nextValue = (lastValue * factor) % 2147483647;
    yield nextValue;
    lastValue = nextValue;
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

const getLast16Binary = (number: number) =>
  numberToBinary(number, 32).slice(-16);

const judge = (
  generatorA: IterableIterator<number>,
  generatorB: IterableIterator<number>,
  iterations: number
) => {
  let matches = 0;
  for (let index = 0; index < iterations; index++) {
    const compareIterationBegin = now();
    const a = getLast16Binary(generatorA.next().value);
    const getOneBinary = now();
    const b = getLast16Binary(generatorB.next().value);
    const getTwoBinary = now();
    if (a === b) matches += 1;
    const compare = now();
    const compareIterationEnd = now();
    // console.log('getBinary', getOneBinary - compareIterationBegin);
    // console.log('getBinary', getTwoBinary - getOneBinary);
    console.log('one iteration', compareIterationEnd - compareIterationBegin);
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
simpleTest(getLast16Binary, 245556042, '1110001101001010', 'getLast16Binary');
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
judge(
  generator(EXAMPLE_GENERATOR_A_STARTING_VALUE, GENERATOR_A_FACTOR),
  generator(EXAMPLE_GENERATOR_B_STARTING_VALUE, GENERATOR_B_FACTOR),
  100
);

// test(
//   'judge',
//   equalResult(
//     judge(
//       generator(PUZZLE_INPUT_GENERATOR_A_STARTING_VALUE, GENERATOR_A_FACTOR),
//       generator(PUZZLE_INPUT_GENERATOR_B_STARTING_VALUE, GENERATOR_B_FACTOR),
//       40000000
//     ),
//     0
//   )
// );
