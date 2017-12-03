import test, { simpleTest, equalResult } from './test';

enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT,
}

const spiralSteps1 = (input: number) => {
  let xCursor = 0,
    yCursor = 0,
    ring = 0,
    direction = Direction.RIGHT;

  for (let square = 1; square < input; square++) {
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
  return Math.abs(xCursor) + Math.abs(yCursor);
};

const spiralSteps2 = (input: number) => {};

console.log('Part One');
simpleTest(spiralSteps1, 1, 0);
simpleTest(spiralSteps1, 12, 3);
simpleTest(spiralSteps1, 23, 2);
simpleTest(spiralSteps1, 1024, 31);
test('Part One Answer', equalResult(spiralSteps1(277678), 475));
