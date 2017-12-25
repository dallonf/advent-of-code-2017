import * as fs from 'fs';
import test, { simpleTest, equalResult } from './test';

type Location = { x: number; y: number };
const HEX_STEPS = {
  n: { y: -2 } as Partial<Location>,
  ne: { x: 1, y: -1 } as Partial<Location>,
  se: { x: 1, y: 1 } as Partial<Location>,
  s: { y: 2 } as Partial<Location>,
  sw: { x: -1, y: 1 } as Partial<Location>,
  nw: { x: -1, y: -1 } as Partial<Location>,
};
type HEX_STEP = keyof typeof HEX_STEPS;

const addToLocation = (location: Location, add: Partial<Location>) => ({
  x: location.x + (add.x || 0),
  y: location.y + (add.y || 0),
});
// Manhattan distance, since each hex is exactly 2 hexes away from each of its neighbors
const manhattanDistance = (location: Location) =>
  (Math.abs(location.x) + Math.abs(location.y)) / 2;

const distanceFromCenter = (steps: HEX_STEP[]) => {
  const coords = steps.reduce(
    (location, step) => {
      return addToLocation(location, HEX_STEPS[step]);
    },
    { x: 0, y: 0 }
  );
  return manhattanDistance(coords);
};

const maxDistanceFromCenter = (steps: HEX_STEP[]) => {
  return steps.reduce(
    (prev, step) => {
      const newLocation = addToLocation(prev.location, HEX_STEPS[step]);
      const newDistance = manhattanDistance(newLocation);
      if (newDistance > prev.maxDistance) {
        return { location: newLocation, maxDistance: newDistance };
      } else {
        return { ...prev, location: newLocation };
      }
    },
    { location: { x: 0, y: 0 }, maxDistance: 0 }
  ).maxDistance;
};

const PUZZLE_INPUT = fs
  .readFileSync('./day11input.txt', 'utf-8')
  .trim()
  .split(',')
  .map(input => {
    if (input in HEX_STEPS) {
      return input as HEX_STEP;
    } else {
      throw new Error(`Unrecognized hex step "${input}"`);
    }
  });

console.log('Part One');
simpleTest(distanceFromCenter, [], 0);
simpleTest(distanceFromCenter, ['ne', 'ne', 'ne'] as HEX_STEP[], 3);
simpleTest(distanceFromCenter, ['ne', 'ne', 'sw', 'sw'] as HEX_STEP[], 0);
simpleTest(distanceFromCenter, ['ne', 'ne', 's', 's'] as HEX_STEP[], 2);
simpleTest(distanceFromCenter, ['se', 'sw', 'se', 'sw', 'sw'] as HEX_STEP[], 3);
test('Part One answer', equalResult(distanceFromCenter(PUZZLE_INPUT), 808));

console.log('Part Two');
test('Part Two answer', equalResult(maxDistanceFromCenter(PUZZLE_INPUT), 1556));
