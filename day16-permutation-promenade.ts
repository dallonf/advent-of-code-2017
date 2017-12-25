import test, { simpleTest, equalResult } from './test';
import * as _ from 'lodash';
import { readLines } from './util';

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
  startingDancers = DANCERS,
  { detectPatterns = true } = {}
) => {
  const pattern = [];
  const memoTable = new Map<string, string[]>();
  let dancers = startingDancers;
  let iteration;
  for (iteration = 0; iteration < iterations; iteration++) {
    let result = memoTable.get(dancers.join(''));
    if (!result) {
      result = executeMoves(moves, dancers);
      memoTable.set(dancers.join(''), result);
      multiDanceCacheStas.misses++;
    } else {
      multiDanceCacheStas.hits++;
      if (detectPatterns) {
        dancers = result;
        break;
      }
    }
    dancers = result;
    if (detectPatterns) pattern.push(dancers);
  }
  if (!detectPatterns) {
    return dancers;
  } else {
    // simulate the rest of the dance
    return pattern[(iterations - 1) % pattern.length];
  }
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

/*
I confess - I cheated a bit on this one. After optimizing an estimated runtime down to 1000 hours (!),
I gave up and went to Reddit to see if anybody else was having trouble with this. Apparently everybody
just knew you weren't supposed to actually run the simulation a billion times. Which makes sense in retrospect.
Seeing some people talking about memoization got me on the right track.

There's some weirdness going on here - sometimes the script seems to run non-deterministically. I don't know why
and I don't really have time to find out.
*/
console.log('Part Two');
const PUZZLE_ITERATIONS = 1000000000;

const SAMPLE_ITERATIONS = 423;
const result = danceALot(PUZZLE_INPUT, SAMPLE_ITERATIONS, DANCERS);
console.log('executeMove', executeMoveCacheStats);
console.log('multiDance', multiDanceCacheStas);

const normalResult = danceALot(PUZZLE_INPUT, SAMPLE_ITERATIONS, DANCERS, {
  detectPatterns: false,
});
test(
  `make sure it gets the right result when detecting patterns: ${normalResult.join(
    ''
  )}`,
  equalResult(result.join(''), normalResult.join(''), { deepEqual: true })
);

test(
  'Part Two answer',
  equalResult(
    danceALot(PUZZLE_INPUT, PUZZLE_ITERATIONS).join(''),
    'cbolhmkgfpenidaj',
    {
      deepEqual: true,
    }
  )
);
