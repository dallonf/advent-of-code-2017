import { readLines } from './util';
import test, { equalResult } from './test';

// Mostly just copied and simplified the code from Day 18

type Value = string | number;
type SideEffect =
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
  sub: ((input, registers) => {
    if (typeof input.x !== 'string')
      throw new Error(
        'Expected X of sub instruction to be register, got ' + input.x
      );
    if (input.y == null)
      throw new Error('Sub instruction called without Y value');
    return {
      type: 'set',
      register: input.x,
      value: getValue(input.x, registers) - getValue(input.y, registers),
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
  jnz: ((input, registers) => {
    if (input.y == null)
      throw new Error('Jgz instruction called without Y value');
    if (getValue(input.x, registers) != 0) {
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

const debugInstructions = (instructions: Instruction[]) => {
  const registers = new Map<string, number>();
  const instructionsCalled = new Map<string, number>();
  for (let i = 0; i < instructions.length; i++) {
    const currentInstruction = instructions[i];
    instructionsCalled.set(
      currentInstruction.type,
      (instructionsCalled.get(currentInstruction.type) || 0) + 1
    );
    const fn = INSTRUCTION_FNS[currentInstruction.type];
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
      case 'noop':
        break;
      default:
        throw new Error(`Unrecognized side effect ${effect.type}`);
    }
  }
  return instructionsCalled;
};

const PUZZLE_INPUT = readLines('./day23input.txt').map(parseInstruction);

console.log('Part One');

test(
  'Part One answer',
  equalResult(debugInstructions(PUZZLE_INPUT).get('mul'), 0)
);
