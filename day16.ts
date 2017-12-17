import test, { simpleTest, equalResult } from './test';
import * as _ from 'lodash';
import { readLines } from './util';
const now = require('performance-now');

const DANCERS = _.range(16).map(i => String.fromCharCode(97 + i));

interface SpinMove {
  moveString: string;
  type: 'spin';
  number: number;
}

interface ExchangeMove {
  moveString: string;
  type: 'exchange';
  positionA: number;
  positionB: number;
}

interface PartnerMove {
  moveString: string;
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
      moveString,
      type: 'spin',
      number: parseInt(match[1], 10),
    };
  } else if (moveString[0] === 'x') {
    const match = moveString.match(/^x([0-9]+)\/([0-9]+)$/);
    if (!match) throw new Error(`Invalid exchange move ${moveString}`);
    return {
      moveString,
      type: 'exchange',
      positionA: parseInt(match[1], 10),
      positionB: parseInt(match[2], 10),
    };
  } else if (moveString[0] === 'p') {
    const match = moveString.match(/^p([a-z])\/([a-z])$/);
    if (!match) throw new Error(`Invalid partner move ${moveString}`);
    return {
      moveString,
      type: 'partner',
      dancerA: match[1],
      dancerB: match[2],
    };
  } else {
    throw new Error(`Unrecognize move type ${moveString}`);
  }
};

const _executeMove = (move: Move, dancers: string[]): string[] => {
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

const executeMoveCacheStats = {
  hits: 0,
  misses: 0,
};
const executeMoveMemoTable = new Map<string, string[]>();
const executeMove: typeof _executeMove = (move, dancers) => {
  const key = `${dancers.join('')}_${move.moveString}`;
  let result = executeMoveMemoTable.get(key);
  if (!result) {
    executeMoveCacheStats.misses++;
    result = _executeMove(move, dancers);
    executeMoveMemoTable.set(key, result);
  } else {
    executeMoveCacheStats.hits++;
  }
  return result;
};

const executeMoves = (moves: Move[], startingDancers = DANCERS) =>
  moves.reduce((dancers, move) => executeMove(move, dancers), startingDancers);

const multiDanceCacheStas = {
  hits: 0,
  misses: 0,
};
const danceALot = (
  moves: Move[],
  iterations: number,
  startingDancers = DANCERS
) => {
  const memoTable = new Map<string, string[]>();
  let dancers = startingDancers;
  for (let index = 0; index < iterations; index++) {
    let result = memoTable.get(dancers.join(''));
    if (!result) {
      result = executeMoves(moves, dancers);
      memoTable.set(dancers.join(''), result);
      multiDanceCacheStas.misses++;
    } else {
    }
    multiDanceCacheStas.hits++;
    dancers = result;
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

const SAMPLE_ITERATIONS = 200;
const _sampleBegin = now();
danceALot(PUZZLE_INPUT, SAMPLE_ITERATIONS, DANCERS);
const _sampleEnd = now();
const _sampleLength = _sampleEnd - _sampleBegin;
console.log('Performance sample:', _sampleLength);
console.log(
  'Estimated runtime of entire solution',
  `${_sampleLength * (PUZZLE_ITERATIONS / SAMPLE_ITERATIONS) / 60000} minutes`
);

console.log('executeMove', executeMoveCacheStats);
console.log('multiDance', multiDanceCacheStas);

// test(
//   'Part Two answer',
//   equalResult(danceALot(PUZZLE_INPUT, PUZZLE_ITERATIONS).join(''), '', {
//     deepEqual: true,
//   })
// );
