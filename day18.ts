import test, { simpleTest, equalResult } from './test';
import { OS_EOL, readLines } from './util';

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
    type: 'playSound',
    frequency: getValue(input.x, registers),
  })) as InstructionFn,
  set: ((input, registers) => {
    if (typeof input.x !== 'string')
      throw new Error(
        'Expected X of set instruction to be register, got ' + input.x
      );
    if (input.y == null)
      throw new Error('Set instruction called without Y value');
    return {
      type: 'set',
      register: input.x,
      value: getValue(input.y, registers),
    };
  }) as InstructionFn,
  add: ((input, registers) => {
    if (typeof input.x !== 'string')
      throw new Error(
        'Expected X of add instruction to be register, got ' + input.x
      );
    if (input.y == null)
      throw new Error('Set instruction called without Y value');
    return {
      type: 'set',
      register: input.x,
      value: getValue(input.x, registers) + getValue(input.y, registers),
    };
  }) as InstructionFn,
  mul: ((input, registers) => {
    if (typeof input.x !== 'string')
      throw new Error(
        'Expected X of mul instruction to be register, got ' + input.x
      );
    if (input.y == null)
      throw new Error('Mul instruction called without Y value');
    return {
      type: 'set',
      register: input.x,
      value: getValue(input.x, registers) * getValue(input.y, registers),
    };
  }) as InstructionFn,
  mod: ((input, registers) => {
    if (typeof input.x !== 'string')
      throw new Error(
        'Expected X of mod instruction to be register, got ' + input.x
      );
    if (input.y == null)
      throw new Error('Mod instruction called without Y value');
    return {
      type: 'set',
      register: input.x,
      value: getValue(input.x, registers) % getValue(input.y, registers),
    };
  }) as InstructionFn,
  rcv: ((input, registers) =>
    getValue(input.x, registers) !== 0
      ? { type: 'recover' }
      : { type: 'noop' }) as InstructionFn,
  jgz: ((input, registers) => {
    if (input.y == null)
      throw new Error('Jgz instruction called without Y value');
    if (getValue(input.x, registers) > 0) {
      // return { type: 'noop', by: getValue(input.y, registers) };
      return { type: 'jump', by: getValue(input.y, registers) };
    } else {
      return { type: 'noop' };
    }
  }) as InstructionFn,
};

const getValue = (input: Value, registers: Map<string, number>): number => {
  if (typeof input === 'number') return input;
  return registers.get(input) || 0;
};

const parseInstruction = (input: string): Instruction => {
  const tokens = input.split(' ');
  const type = tokens[0];
  if (!type) throw new Error('Empty instruction received');
  if (!type || !(type in INSTRUCTION_FNS))
    throw new Error(`Unsupported instructon type "${type}"`);

  let x: Value = tokens[1];
  if (!x) throw new Error(`Missing x token in command "${input}"`);
  if (x.match(/^-?[0-9]+$/)) x = parseInt(x, 10);

  let y: Value | undefined = tokens[2] || undefined;
  if (y && y.match(/^-?[0-9]+$/)) y = parseInt(y, 10);

  return { type: type as InstructionType, x, y };
};

const executeInstructions = (instructions: Instruction[]): number => {
  const registers = new Map<string, number>();
  let lastSoundPlayed: number | null = null;
  for (let i = 0; i < instructions.length; i++) {
    const currentInstruction = instructions[i];
    const fn = INSTRUCTION_FNS[currentInstruction.type];
    const effect = fn(currentInstruction, registers);

    switch (effect.type) {
      case 'jump':
        // The -1 offsets the i++ that happens after the loop.
        // dirty, but don't feel like fixing it
        i += effect.by - 1;
        break;
      case 'playSound':
        lastSoundPlayed = effect.frequency;
        break;
      case 'recover':
        if (!lastSoundPlayed) throw new Error('Nothing to recover');
        return lastSoundPlayed;
      case 'set':
        registers.set(effect.register, effect.value);
        break;
    }
  }
  throw new Error('Reached end of instructions without recovering sound');
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

const PUZZLE_INPUT = readLines('./day18input.txt').map(parseInstruction);

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
simpleTest(
  parseInstruction,
  'jgz a -1',
  { type: 'jgz', x: 'a', y: -1 },
  'parseInstruction handles negative input',
  { deepEqual: true }
);
test('execute example', equalResult(executeInstructions(EXAMPLE_INPUT), 4));
test('Part One answer', equalResult(executeInstructions(PUZZLE_INPUT), 2951));
