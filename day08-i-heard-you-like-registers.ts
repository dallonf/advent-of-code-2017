import test, { simpleTest, equalResult } from './test';
import { OS_EOL, readLines } from './util';

type CommandFn = (registerVal: number, parameter: number) => number;
const COMMAND_FNS = {
  increment: ((a, b) => a + b) as CommandFn,
  decrement: ((a, b) => a - b) as CommandFn,
};
type Command = keyof typeof COMMAND_FNS;

type ComparatorFn = (a: number, b: number) => boolean;
const COMPARATOR_FNS = {
  '>': ((a, b) => a > b) as ComparatorFn,
  '<': ((a, b) => a < b) as ComparatorFn,
  '>=': ((a, b) => a >= b) as ComparatorFn,
  '==': ((a, b) => a == b) as ComparatorFn,
  '<=': ((a, b) => a <= b) as ComparatorFn,
  '!=': ((a, b) => a != b) as ComparatorFn,
};
type Comparator = keyof typeof COMPARATOR_FNS;

interface Instruction {
  register: string;
  command: Command;
  parameter: number;
  condition: {
    register: string;
    comparator: Comparator;
    value: number;
  };
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

const executeInstructions = (instructions: Instruction[]) => {
  const registers = new Map<string, number>();
  const getFromRegister = (key: string) => registers.get(key) || 0;
  let highestValue: number = Number.MIN_SAFE_INTEGER;
  instructions.forEach(instruction => {
    // First, evaluate condition
    const { condition } = instruction;
    const comparator = COMPARATOR_FNS[condition.comparator];
    if (!comparator(getFromRegister(condition.register), condition.value)) {
      return;
    }
    // Now apply changes
    const command = COMMAND_FNS[instruction.command];
    const newValue = command(
      getFromRegister(instruction.register),
      instruction.parameter
    );
    registers.set(instruction.register, newValue);
    // Check for the highest value
    if (newValue > highestValue) {
      highestValue = newValue;
    }
  });
  return { registers, highestValue };
};
const getLargestValueAfterInstructions = (
  instructions: Instruction[]
): number => Math.max(...executeInstructions(instructions).registers.values());
const getLargestValueDuringInstructions = (instructions: Instruction[]) =>
  executeInstructions(instructions).highestValue;

const SAMPLE_INPUT = `
b inc 5 if a > 1
a inc 1 if b < 5
c dec -10 if a >= 1
c inc -20 if c == 10
`
  .split(OS_EOL)
  .filter(x => x);
const PUZZLE_INPUT = readLines('./day08input.txt');

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
const puzzleInstructions = PUZZLE_INPUT.map(parseInstruction);
test(
  'getLargestValueAfterInstructions',
  equalResult(getLargestValueAfterInstructions(sampleInstructions), 1)
);
test(
  'Part One answer',
  equalResult(getLargestValueAfterInstructions(puzzleInstructions), 6012)
);

console.log('Part Two');
test(
  'getLargestValueDuringInstructions',
  equalResult(getLargestValueDuringInstructions(sampleInstructions), 10)
);
test(
  'Part Two answer',
  equalResult(getLargestValueDuringInstructions(puzzleInstructions), 6369)
);
