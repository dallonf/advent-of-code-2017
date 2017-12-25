import test, { simpleTest, equalResult } from './test';

console.log('Day 3: Spiral Memory');

enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT,
}

const spiral = <TResult>(
  callback: (
    x: number,
    y: number
  ) => { shouldContinue: true } | { shouldContinue: false; result: TResult }
) => {
  let xCursor = 0,
    yCursor = 0,
    ring = 0,
    direction = Direction.RIGHT;

  while (true) {
    const callbackReturn = callback(xCursor, yCursor);
    if (!callbackReturn.shouldContinue) {
      return callbackReturn.result;
    }
    switch (direction) {
      case Direction.RIGHT:
        xCursor += 1;
        if (xCursor > ring) {
          ring += 1;
          direction = Direction.UP;
        }
        break;
      case Direction.UP:
        yCursor -= 1;
        if (yCursor <= -ring) {
          direction = Direction.LEFT;
        }
        break;
      case Direction.LEFT:
        xCursor -= 1;
        if (xCursor <= -ring) {
          direction = Direction.DOWN;
        }
        break;
      case Direction.DOWN:
        yCursor += 1;
        if (yCursor >= ring) {
          direction = Direction.RIGHT;
        }
    }
  }
};

const spiralSteps1 = (input: number) => {
  let number = 1;
  const { x, y } = spiral((x, y) => {
    if (number >= input) {
      return { shouldContinue: false, result: { x, y } };
    } else {
      number += 1;
      return { shouldContinue: true };
    }
  });

  return Math.abs(x) + Math.abs(y);
};

const spiralSteps2 = (input: number) => {
  const memory = new Map<number, Map<number, number>>();
  const numberAt = (x: number, y: number) => {
    const column = memory.get(x);
    if (column) return column.get(y) || 0;
    else return 0;
  };
  const write = (x: number, y: number, value: number) => {
    let column = memory.get(x);
    if (!column) {
      column = new Map<number, number>();
      memory.set(x, column);
    }
    column.set(y, value);
  };
  return spiral((x, y) => {
    // special case: start the center at 1
    const sum =
      x === 0 && y === 0
        ? 1
        : numberAt(x - 1, y) +
          numberAt(x - 1, y - 1) +
          numberAt(x, y - 1) +
          numberAt(x + 1, y - 1) +
          numberAt(x + 1, y) +
          numberAt(x + 1, y + 1) +
          numberAt(x, y + 1) +
          numberAt(x - 1, y + 1);
    if (sum > input) {
      return { shouldContinue: false, result: sum };
    } else {
      // write number to grid
      write(x, y, sum);
      return { shouldContinue: true };
    }
  });
};

console.log('Part One');
simpleTest(spiralSteps1, 1, 0);
simpleTest(spiralSteps1, 12, 3);
simpleTest(spiralSteps1, 23, 2);
simpleTest(spiralSteps1, 1024, 31);
test('Part One Answer', equalResult(spiralSteps1(277678), 475));

console.log('Part Two');
simpleTest(spiralSteps2, 2, 4);
simpleTest(spiralSteps2, 11, 23);
simpleTest(spiralSteps2, 122, 133);
simpleTest(spiralSteps2, 362, 747);
test('Part Two Answer', equalResult(spiralSteps2(277678), 279138));
