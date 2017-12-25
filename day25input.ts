// I'm not gonna try to parse the text input, I'll just format it here

export interface Input {
  initialState: string;
  checksumAt: number;
  states: { [state: string]: State };
}

interface State {
  false: StateBehavior;
  true: StateBehavior;
}

interface StateBehavior {
  write: boolean;
  move: 1 | -1;
  nextState: string;
}

export const EXAMPLE_INPUT: Input = {
  initialState: 'a',
  checksumAt: 6,
  states: {
    a: {
      false: {
        write: true,
        move: 1,
        nextState: 'b',
      },
      true: {
        write: false,
        move: -1,
        nextState: 'b',
      },
    },
    b: {
      false: {
        write: true,
        move: -1,
        nextState: 'a',
      },
      true: {
        write: true,
        move: 1,
        nextState: 'a',
      },
    },
  },
};

export const PUZZLE_INPUT: Input = {
  initialState: 'a',
  checksumAt: 12368930,
  states: {
    a: {
      false: {
        write: true,
        move: 1,
        nextState: 'b',
      },
      true: {
        write: false,
        move: 1,
        nextState: 'c',
      },
    },
    b: {
      false: {
        write: false,
        move: -1,
        nextState: 'a',
      },
      true: {
        write: false,
        move: 1,
        nextState: 'd',
      },
    },
    c: {
      false: {
        write: true,
        move: 1,
        nextState: 'd',
      },
      true: {
        write: true,
        move: 1,
        nextState: 'a',
      },
    },
    d: {
      false: {
        write: true,
        move: -1,
        nextState: 'e',
      },
      true: {
        write: false,
        move: -1,
        nextState: 'd',
      },
    },
    e: {
      false: {
        write: true,
        move: 1,
        nextState: 'f',
      },
      true: {
        write: true,
        move: -1,
        nextState: 'b',
      },
    },
    f: {
      false: {
        write: true,
        move: 1,
        nextState: 'a',
      },
      true: {
        write: true,
        move: 1,
        nextState: 'e',
      },
    },
  },
};
