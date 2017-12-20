import test, { simpleTest, equalResult } from './test';
import * as _ from 'lodash';
import { OS_EOL, readLines } from './util';

interface Vector3 {
  x: number;
  y: number;
  z: number;
}
interface Particle {
  position: Vector3;
  velocity: Vector3;
  acceleration: Vector3;
}

const parseInput = (line: string) => {
  const match = line.match(
    /^p=<(-?[0-9]+),(-?[0-9]+),(-?[0-9]+)>, v=<(-?[0-9]+),(-?[0-9]+),(-?[0-9]+)>, a=<(-?[0-9]+),(-?[0-9]+),(-?[0-9]+)>$/
  );
  if (!match) {
    throw new Error(`Input line "${line}" does not match expected format`);
  }
  // because the radix argument is annoying
  const parseInt = (x: string) => global.parseInt(x, 10);
  return {
    position: {
      x: parseInt(match[1]),
      y: parseInt(match[2]),
      z: parseInt(match[3]),
    },
    velocity: {
      x: parseInt(match[4]),
      y: parseInt(match[5]),
      z: parseInt(match[6]),
    },
    acceleration: {
      x: parseInt(match[7]),
      y: parseInt(match[8]),
      z: parseInt(match[9]),
    },
  };
};

const addVector = (a: Vector3, b: Vector3) => ({
  x: a.x + b.x,
  y: a.y + b.y,
  z: a.z + b.z,
});

const manhattanDistanceFromCenter = (a: Vector3) =>
  Math.abs(a.x) + Math.abs(a.y) + Math.abs(a.z);

const tickParticle = (particle: Particle) => {
  const newVelocity = addVector(particle.velocity, particle.acceleration);
  const newPosition = addVector(particle.position, newVelocity);
  return {
    position: newPosition,
    velocity: newVelocity,
    acceleration: particle.acceleration,
  };
};

const MAX_ITERATIONS = 1000000;
const MAX_STABLE_TICKS = 100;
const getOriginClosestParticle = (particles: Particle[]) => {
  let lastState = particles;
  let lastRanking: number[] = [];
  let stableTicks = 0;
  // Simulate particles until the ranking has not changed for a number of ticks
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const newState = lastState.map(tickParticle);
    const ranking = _.sortBy(
      newState.map((p, i) => ({
        ...p,
        i,
        distance: manhattanDistanceFromCenter(p.position),
      })),
      p => p.distance
    ).map(p => p.i);
    if (_.isEqual(ranking, lastRanking)) {
      stableTicks += 1;
    } else {
      stableTicks = 0;
    }

    if (stableTicks >= MAX_STABLE_TICKS) {
      return ranking[0];
    }

    lastRanking = ranking;
    lastState = newState;
  }
  throw new Error('Timed out without particles stabilizing');
};

const EXAMPLE_INPUT = `
p=<3,0,0>, v=<2,0,0>, a=<-1,0,0>
p=<4,0,0>, v=<0,0,0>, a=<-2,0,0>
`
  .split(OS_EOL)
  .filter(x => x);
const PUZZLE_INPUT = readLines('./day20input.txt');

console.log('Part One');
simpleTest(
  parseInput,
  EXAMPLE_INPUT[0],
  {
    position: { x: 3, y: 0, z: 0 },
    velocity: { x: 2, y: 0, z: 0 },
    acceleration: { x: -1, y: 0, z: 0 },
  },
  'parseInput',
  { deepEqual: true }
);
const exampleParticles = EXAMPLE_INPUT.map(parseInput);
const puzzleParticles = PUZZLE_INPUT.map(parseInput);
test(
  'tickParticle (p: 4, v: 1)',
  equalResult(
    tickParticle(exampleParticles[0]),
    {
      position: { x: 4, y: 0, z: 0 },
      velocity: { x: 1, y: 0, z: 0 },
      acceleration: { x: -1, y: 0, z: 0 },
    },
    { deepEqual: true }
  )
);
test(
  'getOriginClosestParticle',
  equalResult(getOriginClosestParticle(exampleParticles), 0)
);
test(
  'Part One answer',
  equalResult(getOriginClosestParticle(puzzleParticles), 364)
);
