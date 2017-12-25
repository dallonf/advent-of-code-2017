import test, { equalResult } from './test';
import { EXAMPLE_INPUT, Input, PUZZLE_INPUT } from './day25input';

const runToChecksum = (input: Input) => {
  const tape = new Map<number, boolean>();
  let cursor = 0;
  let state = input.initialState;
  for (let i = 0; i < input.checksumAt; i++) {
    const currentValue = tape.get(cursor) || false;
    const currentState = input.states[state];
    const behavior = currentValue ? currentState.true : currentState.false;
    tape.set(cursor, behavior.write);
    cursor += behavior.move;
    state = behavior.nextState;
  }
  const checksum = [...tape.values()].filter(v => v).length;
  return checksum;
};

console.log('Part One');

test('runToChecksum', equalResult(runToChecksum(EXAMPLE_INPUT), 3));
test('Part One answer', equalResult(runToChecksum(PUZZLE_INPUT), 2725));

// Oh, Part Two was a freebie
