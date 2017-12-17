import test, { simpleTest, equalResult } from './test';
import * as _ from 'lodash';
import { readLines } from './util';
const now = require('performance-now');

const DANCERS = _.range(16).map(i => String.fromCharCode(97 + i));

interface SpinMove {
  type: 'spin';
  number: number;
}

interface ExchangeMove {
  type: 'exchange';
  positionA: number;
  positionB: number;
}

interface PartnerMove {
  type: 'partner';
  dancerA: string;
  dancerB: string;
}

type Move = SpinMove | ExchangeMove | PartnerMove;

const parseMove = (moveString: string): Move => {
  if (moveString[0] === 's') {
    const match = moveString.match(/^s([0-9]+)$/);
    if (!match) throw new Error(`Invalid spin move ${moveString}`);
    return {
      type: 'spin',
      number: parseInt(match[1], 10),
    };
  } else if (moveString[0] === 'x') {
    const match = moveString.match(/^x([0-9]+)\/([0-9]+)$/);
    if (!match) throw new Error(`Invalid exchange move ${moveString}`);
    return {
      type: 'exchange',
      positionA: parseInt(match[1], 10),
      positionB: parseInt(match[2], 10),
    };
  } else if (moveString[0] === 'p') {
    const match = moveString.match(/^p([a-z])\/([a-z])$/);
    if (!match) throw new Error(`Invalid partner move ${moveString}`);
    return {
      type: 'partner',
      dancerA: match[1],
      dancerB: match[2],
    };
  } else {
    throw new Error(`Unrecognize move type ${moveString}`);
  }
};

const executeMove = (move: Move, dancers: string[]): string[] => {
  switch (move.type) {
    case 'spin': {
      const movingDancers = dancers.slice(-move.number);
      return [...movingDancers, ...dancers.slice(0, -move.number)];
    }
    case 'exchange': {
      return dancers.map((val, i) => {
        if (i === move.positionA) {
          return dancers[move.positionB];
        } else if (i === move.positionB) {
          return dancers[move.positionA];
        } else {
          return val;
        }
      });
    }
    case 'partner': {
      return dancers.map(val => {
        if (val === move.dancerA) {
          return move.dancerB;
        } else if (val === move.dancerB) {
          return move.dancerA;
        } else {
          return val;
        }
      });
    }
  }
};

const executeMoves = (moves: Move[], startingDancers = DANCERS) =>
  moves.reduce((dancers, move) => executeMove(move, dancers), startingDancers);

const danceALot = (
  moves: Move[],
  iterations: number,
  startingDancers = DANCERS
) => {
  let dancers = startingDancers;
  for (let index = 0; index < iterations; index++) {
    dancers = executeMoves(moves, dancers);
  }
  return dancers;
};

const EXAMPLE_DANCERS = DANCERS.slice(0, 5);
const PUZZLE_INPUT = readLines('./day16input.txt')[0]
  .split(',')
  .map(parseMove);

console.log('Part One');
const singleExampleMove = (move: string, dancers: string[]) =>
  executeMove(parseMove(move), dancers);

simpleTest(
  x => singleExampleMove(x, EXAMPLE_DANCERS),
  's1',
  [...'eabcd'],
  undefined,
  {
    deepEqual: true,
  }
);
simpleTest(
  x => singleExampleMove(x, [...'eabcd']),
  'x3/4',
  [...'eabdc'],
  undefined,
  {
    deepEqual: true,
  }
);
simpleTest(
  x => singleExampleMove(x, [...'eabdc']),
  'pe/b',
  [...'baedc'],
  undefined,
  {
    deepEqual: true,
  }
);
simpleTest(
  moves => executeMoves(moves.map(parseMove), EXAMPLE_DANCERS),
  ['s1', 'x3/4', 'pe/b'],
  [...'baedc'],
  undefined,
  { deepEqual: true }
);
test(
  'Part One answer',
  equalResult(executeMoves(PUZZLE_INPUT).join(''), 'cknmidebghlajpfo', {
    deepEqual: true,
  })
);

console.log('Part Two');
const PUZZLE_ITERATIONS = 1000000000;

const SAMPLE_ITERATIONS = 10;
const _sampleBegin = now();
danceALot(PUZZLE_INPUT, SAMPLE_ITERATIONS, DANCERS);
const _sampleEnd = now();
const _sampleLength = _sampleEnd - _sampleBegin;
console.log('Performance sample:', _sampleLength);
console.log(
  'Estimated runtime of entire solution',
  `${_sampleLength * (PUZZLE_ITERATIONS / SAMPLE_ITERATIONS) / 60000} minutes`
);

// test(
//   'Part Two answer',
//   equalResult(danceALot(PUZZLE_INPUT, PUZZLE_ITERATIONS).join(''), '', {
//     deepEqual: true,
//   })
// );
