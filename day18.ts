import test, { simpleTest, equalResult } from './test';
import { OS_EOL } from './util';

type Value = string | number;
type SideEffect =
  | { type: 'playSound'; frequency: number }
  | { type: 'recover' }
  | { type: 'jump'; by: number }
  | { type: 'set'; register: string; value: number }
  | { type: 'noop' };
type InstructionFn = (
  input: Instruction,
  registers: Map<string, number>
) => SideEffect;
type InstructionType = keyof typeof INSTRUCTION_FNS;
interface Instruction {
  type: InstructionType;
  x: Value;
  y?: Value;
}

const INSTRUCTION_FNS = {
  snd: ((input, registers) => ({
    type: 'noop',
  })) as InstructionFn,
  set: ((input, registers) => ({
    type: 'noop',
  })) as InstructionFn,
  add: ((input, registers) => ({
    type: 'noop',
  })) as InstructionFn,
  mul: ((input, registers) => ({
    type: 'noop',
  })) as InstructionFn,
  mod: ((input, registers) => ({
    type: 'noop',
  })) as InstructionFn,
  rcv: ((input, registers) => ({
    type: 'noop',
  })) as InstructionFn,
  jgz: ((input, registers) => ({
    type: 'noop',
  })) as InstructionFn,
};

const getValue = (input: Value, registers: Map<string, number>): number => {
  return 0;
};

const parseInstruction = (input: string): Instruction => {
  const tokens = input.split(' ');
  const type = tokens[0];
  if (!type) throw new Error('Empty instruction received');
  if (!type || !(type in INSTRUCTION_FNS))
    throw new Error(`Unsupported instructon type "${type}"`);

  let x: Value = tokens[1];
  if (!x) throw new Error(`Missing x token in command "${input}"`);
  if (x.match(/^[0-9]+$/)) x = parseInt(x, 10);

  let y: Value | undefined = tokens[2] || undefined;
  if (y && y.match(/^[0-9]+$/)) y = parseInt(y, 10);

  return { type: type as InstructionType, x, y };
};

const EXAMPLE_INPUT = `
set a 1
add a 2
mul a a
mod a 5
snd a
set a 0
rcv a
jgz a -1
set a 1
jgz a -2
`
  .split(OS_EOL)
  .filter(x => x)
  .map(parseInstruction);

console.log('Part One');
test(
  'parse input',
  equalResult(
    EXAMPLE_INPUT.slice(0, 5),
    [
      { type: 'set', x: 'a', y: 1 },
      { type: 'add', x: 'a', y: 2 },
      { type: 'mul', x: 'a', y: 'a' },
      { type: 'mod', x: 'a', y: 5 },
      { type: 'snd', x: 'a', y: undefined },
    ],
    { deepEqual: true }
  )
);
