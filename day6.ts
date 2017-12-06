import test, { equalResult, simpleTest } from './test';
import * as _ from 'lodash';

const hashState = (banks: number[]) => banks.map(n => n.toString()).join('-');

const redistribute1 = (banks: number[]) => {
  const stateMemory = new Set<string>();
  let steps = 0,
    currentState = banks;

  while (!stateMemory.has(hashState(currentState))) {
    stateMemory.add(hashState(currentState));

    const {
      index: maxIndex,
      blocks: blocksToRedistribute,
    } = currentState.reduce(
      (lastStep, blocks, i) => {
        if (blocks > lastStep.blocks) {
          return { index: i, blocks };
        } else {
          return lastStep;
        }
      },
      {
        index: -1,
        blocks: 0,
      }
    );

    const newState = currentState.map(
      (blocks, i) => (i === maxIndex ? 0 : blocks)
    );
    let cursor = (maxIndex + 1) % newState.length;
    for (let index = 0; index < blocksToRedistribute; index++) {
      newState[cursor] += 1;
      cursor = (cursor + 1) % newState.length;
    }

    steps += 1;
    currentState = newState;
  }
  return steps;
};

const PUZZLE_INPUT = [10, 3, 15, 10, 5, 15, 5, 15, 9, 2, 5, 8, 5, 2, 3, 6];

console.log('Part One');
simpleTest(redistribute1, [0, 2, 7, 0], 5);
test('Part One answer', equalResult(redistribute1(PUZZLE_INPUT), 14029));
