import test, { simpleTest, equalResult } from './test';
import * as _ from 'lodash';
import { readLines } from './util';
const now = require('performance-now');

const DANCERS = _.range(16).map(i => String.fromCharCode(97 + i));
const PERFORMANCE_MEASUREMENTS: { [key: string]: number[] } = {};

const measure = (key: string, number: number) => {
  if (!PERFORMANCE_MEASUREMENTS[key]) PERFORMANCE_MEASUREMENTS[key] = [];
  PERFORMANCE_MEASUREMENTS[key].push(number);
};

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
  // const _beginSingleMove = now();
  // try {
  switch (move.type) {
    case 'spin': {
      const sub = dancers.splice(dancers.length - move.number, move.number);
      dancers.splice(0, 0, ...sub);
      break;
    }
    case 'exchange': {
      const tmp = dancers[move.positionA];
      dancers[move.positionA] = dancers[move.positionB];
      dancers[move.positionB] = tmp;
      break;
    }
    case 'partner': {
      const indexA = dancers.indexOf(move.dancerA);
      const indexB = dancers.indexOf(move.dancerB);
      dancers[indexA] = move.dancerB;
      dancers[indexB] = move.dancerA;
      break;
    }
  }
  return dancers;
  // } finally {
  //   const _endSingleMove = now();
  //   measure('singleMove', _endSingleMove - _beginSingleMove);
  //   measure(`singleMove_${move.type}`, _endSingleMove - _beginSingleMove);
  // }
};

const executeMoves = (moves: Move[], startingDancers = [...DANCERS]) => {
  // const _beginExecuteMoves = now();
  let dancerState = startingDancers;
  for (let index = 0; index < moves.length; index++) {
    const move = moves[index];
    executeMove(move, dancerState);
  }
  // const _endExecuteMoves = now();
  // measure('executeMoves', _endExecuteMoves - _beginExecuteMoves);
  return dancerState;
};

const danceALot = (
  moves: Move[],
  iterations: number,
  startingDancers = DANCERS
) => {
  let dancers = [...startingDancers];
  for (let index = 0; index < iterations; index++) {
    executeMoves(moves, dancers);
  }
  return dancers;
};

const EXAMPLE_DANCERS = DANCERS.slice(0, 5);
const PUZZLE_INPUT = readLines('./day16input.txt')[0]
  .split(',')
  .map(parseMove);

console.log('Part One');
const singleExampleMove = (move: string, dancers: string[]) =>
  executeMove(parseMove(move), [...dancers]);

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
  moves => executeMoves(moves.map(parseMove), [...EXAMPLE_DANCERS]),
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

const SAMPLE_ITERATIONS = 100;
const _sampleBegin = now();
danceALot(PUZZLE_INPUT, SAMPLE_ITERATIONS, DANCERS);
const _sampleEnd = now();
const _sampleLength = _sampleEnd - _sampleBegin;
console.log('Performance sample:', _sampleLength);
console.log(
  'Estimated runtime of entire solution',
  `${_sampleLength * (PUZZLE_ITERATIONS / SAMPLE_ITERATIONS) / 60000} minutes`
);
const avg = (input: number[] | undefined) =>
  input ? input.reduce((a, b) => a + b) / input.length : 'N/A';
console.log('singleMove avg:', avg(PERFORMANCE_MEASUREMENTS['singleMove']));
// console.log(
//   'singleMove_spin:',
//   avg(PERFORMANCE_MEASUREMENTS['singleMove_spin'])
// );
// console.log(
//   'singleMove_exchange:',
//   avg(PERFORMANCE_MEASUREMENTS['singleMove_exchange'])
// );
// console.log(
//   'singleMove_partner:',
//   avg(PERFORMANCE_MEASUREMENTS['singleMove_partner'])
// );
const expectedExecutionBasedOnSingleMove =
  (avg(PERFORMANCE_MEASUREMENTS['singleMove']) as number) * PUZZLE_INPUT.length;
const executeMovesOverhead =
  (avg(PERFORMANCE_MEASUREMENTS['executeMoves']) as number) -
  expectedExecutionBasedOnSingleMove;
console.log('Overhead:', executeMovesOverhead);

// test(
//   'Part Two answer',
//   equalResult(danceALot(PUZZLE_INPUT, PUZZLE_ITERATIONS).join(''), '', {
//     deepEqual: true,
//   })
// );
