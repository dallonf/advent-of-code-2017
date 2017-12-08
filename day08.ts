import test, { simpleTest, equalResult } from './test';
import { OS_EOL } from './util';

interface Instruction {
  register: string;
  command: 'increment' | 'decrement';
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

const parseCommand = (input: string): Instruction['command'] => {
  switch (input) {
    case 'inc':
      return 'increment';
    case 'dec':
      return 'decrement';
    default:
      throw new Error(`Unexpected command type ${input}`);
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
const parseInstruction = (line: string): Instruction => {
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
    command: parseCommand(tokens[1]),
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
  .split(OS_EOL)
  .filter(x => x);

console.log('Part One');
simpleTest(
  parseInstruction,
  'b inc 5 if a > 1',
  {
    register: 'b',
    command: 'increment',
    parameter: 5,
    condition: { register: 'a', comparator: '>', value: 1 },
  },
  'parseLine',
  { deepEqual: true }
);
simpleTest(
  parseInstruction,
  'c dec -10 if b >= 2',
  {
    register: 'c',
    command: 'decrement',
    parameter: -10,
    condition: { register: 'b', comparator: '>=', value: 2 },
  },
  'parseLine',
  { deepEqual: true }
);

const sampleInstructions = SAMPLE_INPUT.map(parseInstruction);
