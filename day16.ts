import test, { simpleTest, equalResult } from './test';
import * as _ from 'lodash';

const DANCERS = _.range(16).map(i => String.fromCharCode(97 + i));

interface SpinMove {
  type: 'spin';
  number: number;
}

// interface ExchangeMove {
//   type: 'exchange';
//   positionA: number;
//   positionB: number;
// }

// interface PartnerMove {
//   type: 'partner';
//   dancerA: string;
//   dancerB: string;
// }

type Move = SpinMove /* | ExchangeMove | PartnerMove*/;

const parseMove = (moveString: string): Move => {
  if (moveString[0] === 's') {
    const match = moveString.match(/^s([0-9]+)$/);
    if (!match) throw new Error(`Invalid spin move ${moveString}`);
    return {
      type: 'spin',
      number: parseInt(match[1], 10),
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
  }
};

const EXAMPLE_DANCERS = DANCERS.slice(0, 5);

const singleExampleMove = (move: string) =>
  executeMove(parseMove(move), EXAMPLE_DANCERS);
simpleTest(singleExampleMove, 's1', [...'eabcd'], undefined, {
  deepEqual: true,
});
