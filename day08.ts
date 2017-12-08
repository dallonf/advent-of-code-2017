import test, { simpleTest, equalResult } from './test';

interface Instruction {
  register: string;
  instruction: 'increment' | 'decrement';
  parameter: number;
  condition: {
    register: string;
    comparator: '>' | '<' | '>=' | '==' | '<=' | '!=';
    value: number;
  };
}

interface Output {
  registers: Map<string, number>;
}

const parseInstruction = (input: string): Instruction['instruction'] => {
  switch (input) {
    case 'inc':
      return 'increment';
    case 'dec':
      return 'decrement';
    default:
      throw new Error(`Unexpected instruction type ${input}`);
  }
};
const parseComparator = (
  input: string
): Instruction['condition']['comparator'] => {
  switch (input) {
    case '>':
      return '>';
    case '<':
      return '<';
    case '>=':
      return '>=';
    case '==':
      return '==';
    case '<=':
      return '<=';
    case '!=':
      return '!=';
    default:
      throw new Error(`Unexpected comparator "${input}"`);
  }
};
const parseLine = (line: string): Instruction => {
  const tokens = line.split(' ');
  if (tokens.length !== 7) {
    throw new Error(
      'Expected 7 tokens separated by spaces, got ' + tokens.length
    );
  }
  if (tokens[3] !== 'if') {
    throw new Error(`Expected "if" at token 3, got "${tokens[3]}"`);
  }
  const instruction = {
    register: tokens[0],
    instruction: parseInstruction(tokens[1]),
    parameter: parseInt(tokens[2], 10),
    condition: {
      register: tokens[4],
      comparator: parseComparator(tokens[5]),
      value: parseInt(tokens[6], 10),
    },
  };
  return instruction;
};
// const executeInstructions = (instructions: Instruction[]): Output => {};
// const getLargestValueAfterInstructions = (
//   instructions: Instruction[]
// ): number => {};

const SAMPLE_INPUT = `
b inc 5 if a > 1
a inc 1 if b < 5
c dec -10 if a >= 1
c inc -20 if c == 10
`
  .split('\n')
  .filter(x => x);

simpleTest(
  parseLine,
  'b inc 5 if a > 1',
  {
    register: 'b',
    instruction: 'increment',
    parameter: 5,
    condition: { register: 'a', comparator: '>', value: 1 },
  },
  'parseLine',
  { deepEqual: true }
);
simpleTest(
  parseLine,
  'c dec -10 if b >= 2',
  {
    register: 'c',
    instruction: 'decrement',
    parameter: -10,
    condition: { register: 'b', comparator: '>=', value: 2 },
  },
  'parseLine',
  { deepEqual: true }
);
