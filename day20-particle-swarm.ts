import test, { simpleTest, equalResult } from './test';
import * as _ from 'lodash';
import { OS_EOL, readLines } from './util';

console.log('Day 20: Particle Swarm');

interface Vector3 {
  x: number;
  y: number;
  z: number;
}
interface Particle {
  id: number;
  position: Vector3;
  velocity: Vector3;
  acceleration: Vector3;
}

const parseInput = (line: string, id: number) => {
  const match = line.match(
    /^p=<(-?[0-9]+),(-?[0-9]+),(-?[0-9]+)>, v=<(-?[0-9]+),(-?[0-9]+),(-?[0-9]+)>, a=<(-?[0-9]+),(-?[0-9]+),(-?[0-9]+)>$/
  );
  if (!match) {
    throw new Error(`Input line "${line}" does not match expected format`);
  }
  // because the radix argument is annoying
  const parseInt = (x: string) => global.parseInt(x, 10);
  return {
    id,
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
    id: particle.id,
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
      newState.map(p => ({
        ...p,
        distance: manhattanDistanceFromCenter(p.position),
      })),
      p => p.distance
    ).map(p => p.id);
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

const vectorString = (v: Vector3) => `${v.x},${v.y},${v.z}`;
const getNoncollidingParticles = (particles: Particle[]) => {
  let lastState = particles;
  let ticksWithoutCollision = 0;
  // Simulate particles until the ranking has not changed for a number of ticks
  // I know there's probably a more geometrically sound way to go about this, but
  // my geometry is rusty so ¯\_(ツ)_/¯
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const newState = lastState.map(tickParticle);
    // Find colliding particles and remove them
    const knownPositions = new Map<string, number>();
    newState.forEach(p => {
      const pString = vectorString(p.position);
      knownPositions.set(pString, (knownPositions.get(pString) || 0) + 1);
    });
    const newStateAfterCollisions = newState.filter(
      p => knownPositions.get(vectorString(p.position))! <= 1
    );
    if (newStateAfterCollisions.length < newState.length) {
      // there were collisions
      ticksWithoutCollision = 0;
    } else {
      ticksWithoutCollision += 1;
    }

    if (ticksWithoutCollision >= MAX_STABLE_TICKS) {
      return newStateAfterCollisions.map(p => p.id).sort();
    }
    lastState = newStateAfterCollisions;
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
  x => parseInput(x, 123),
  EXAMPLE_INPUT[0],
  {
    id: 123,
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
      id: 0,
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

console.log('Part Two');
const EXAMPLE_2_INPUT = `
p=<-6,0,0>, v=<3,0,0>, a=<0,0,0>
p=<-4,0,0>, v=<2,0,0>, a=<0,0,0>
p=<-2,0,0>, v=<1,0,0>, a=<0,0,0>
p=<3,0,0>, v=<-1,0,0>, a=<0,0,0>
`
  .split(OS_EOL)
  .filter(x => x)
  .map(parseInput);
test(
  'getNoncollidingParticles',
  equalResult(getNoncollidingParticles(EXAMPLE_2_INPUT), [3], {
    deepEqual: true,
  })
);
test(
  'Part Two answer',
  equalResult(getNoncollidingParticles(puzzleParticles).length, 420)
);
