import test, { equalResult, simpleTest } from './test';

console.log('Day 6: Memory Reallocation');

const hashState = (banks: number[]) => banks.map(n => n.toString()).join('-');

const redistribute = (banks: number[]) => {
  const stateMemory = new Map<string, { index: number }>();
  let steps = 0,
    currentState = banks;

  while (!stateMemory.has(hashState(currentState))) {
    stateMemory.set(hashState(currentState), { index: steps });

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
  const cycleStart = stateMemory.get(hashState(currentState))!;
  return { steps, result: currentState, cycleLength: steps - cycleStart.index };
};

const stepsToLoop = (banks: number[]) => {
  return redistribute(banks).steps;
};

const stepsBetweenLoops = (banks: number[]) => {
  return redistribute(banks).cycleLength;
};

const PUZZLE_INPUT = [10, 3, 15, 10, 5, 15, 5, 15, 9, 2, 5, 8, 5, 2, 3, 6];

console.log('Part One');
simpleTest(stepsToLoop, [0, 2, 7, 0], 5);
test('Part One answer', equalResult(stepsToLoop(PUZZLE_INPUT), 14029));

console.log('Part Two');
simpleTest(stepsBetweenLoops, [0, 2, 7, 0], 4);
test('Part Two answer', equalResult(stepsBetweenLoops(PUZZLE_INPUT), 2765));
