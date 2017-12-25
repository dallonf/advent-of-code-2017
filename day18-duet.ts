import test, { simpleTest, equalResult } from './test';
import { OS_EOL, readLines } from './util';

console.log('Day 18: Duet');

type Value = string | number;
type SideEffect =
  | { type: 'playSound'; frequency: number }
  | { type: 'send'; value: number }
  | { type: 'recover' }
  | { type: 'receive'; register: string }
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
      throw new Error('Add instruction called without Y value');
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
      return { type: 'jump', by: getValue(input.y, registers) };
    } else {
      return { type: 'noop' };
    }
  }) as InstructionFn,
};

const INSTRUCTION_FUNCTIONS_PART_TWO: typeof INSTRUCTION_FNS = {
  ...INSTRUCTION_FNS,
  snd: (input, registers) => ({
    type: 'send',
    value: getValue(input.x, registers),
  }),
  rcv: (input, registers) => {
    if (typeof input.x !== 'string')
      throw new Error(
        'Expected X of rcv instruction to be register, got ' + input.x
      );
    return { type: 'receive', register: input.x };
  },
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
      case 'noop':
        break;
      default:
        throw new Error(`Unrecognized side effect ${effect.type}`);
    }
  }
  throw new Error('Reached end of instructions without recovering sound');
};

function* executeDuetProgram(instructions: Instruction[], programId: number) {
  const registers = new Map<string, number>();
  registers.set('p', programId);
  for (let i = 0; i < instructions.length; i++) {
    const currentInstruction = instructions[i];
    const fn = INSTRUCTION_FUNCTIONS_PART_TWO[currentInstruction.type];
    const effect = fn(currentInstruction, registers);

    switch (effect.type) {
      case 'jump':
        // The -1 offsets the i++ that happens after the loop.
        // dirty, but don't feel like fixing it
        i += effect.by - 1;
        break;
      case 'set':
        registers.set(effect.register, effect.value);
        break;
      case 'send':
        yield effect.value;
        break;
      case 'receive':
        const message: number = yield;
        registers.set(effect.register, message);
      case 'noop':
        break;
      default:
        throw new Error(`Unrecognized side effect ${effect.type}`);
    }
  }
  throw new Error('Reached end of instructions without reaching deadlock');
}

// Generators are cool and all, but I'm not really happy with this solution.
// Maybe later I'll find a fully functional approach.
const executeDuet = (instructions: Instruction[]): number => {
  const program0 = executeDuetProgram(instructions, 0);
  const program0Queue: number[] = [];
  let program0Waiting = false;
  const program1 = executeDuetProgram(instructions, 1);
  const program1Queue: number[] = [];
  let program1Waiting = false;

  let program1ValuesSent = 0;

  while (true) {
    const program0Yield: IteratorResult<number> | null = program0Waiting
      ? program0Queue.length ? program0.next(program0Queue.shift()) : null
      : program0.next();
    if (!program0Yield) {
      /* no-op */
    } else if (program0Yield.value != null) {
      program0Waiting = false;
      program1Queue.push(program0Yield.value);
    } else {
      program0Waiting = true;
    }
    const program1Yield: IteratorResult<number> | null = program1Waiting
      ? program1Queue.length ? program1.next(program1Queue.shift()) : null
      : program1.next();
    if (!program1Yield) {
      /* no-op */
    } else if (program1Yield.value != null) {
      program1Waiting = false;
      program1ValuesSent += 1;
      program0Queue.push(program1Yield.value);
    } else {
      program1Waiting = true;
    }

    if (
      program0Waiting &&
      program1Waiting &&
      !program0Queue.length &&
      !program1Queue.length
    ) {
      // If both programs are waiting and have no values in their queue, it's a deadlock
      return program1ValuesSent;
    }
  }
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

console.log('Part Two');
const PART_TWO_EXAMPLE_INPUT = `
snd 1
snd 2
snd p
rcv a
rcv b
rcv c
rcv d
`
  .split(OS_EOL)
  .filter(x => x)
  .map(parseInstruction);

test('execute example', equalResult(executeDuet(PART_TWO_EXAMPLE_INPUT), 3));
test('Part Two answer', equalResult(executeDuet(PUZZLE_INPUT), 7366));
