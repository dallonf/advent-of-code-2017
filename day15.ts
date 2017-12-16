import * as _ from 'lodash';
import test, { simpleTest, equalResult } from './test';

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

const EXAMPLE_GENERATOR_A_STARTING_VALUE = 65;
const EXAMPLE_GENERATOR_B_STARTING_VALUE = 8921;

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
