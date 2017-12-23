import * as _ from 'lodash';
import * as inquirer from 'inquirer';
import { readLines } from './util';
import test, { equalResult } from './test';

// Mostly just copied and simplified the code from Day 18

type Value = string | number;
type SideEffect =
  | { type: 'jump'; by: number }
  | { type: 'set'; register: string; value: number }
  | { type: 'noop' };
type InstructionFn = (
  input: ExecutableInstruction,
  registers: Map<string, number>
) => SideEffect;
type InstructionType = keyof typeof INSTRUCTION_FNS;
interface ExecutableInstruction {
  type: InstructionType;
  line: number;
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

const parseProgram = (lines: string[]): ExecutableInstruction[] => {
  return lines
    .map((line, i) => {
      if (!line.trim() || line.startsWith('#')) {
        return { type: 'comment' as 'comment', content: line };
      } else {
        return parseInstruction(line, i + 1);
      }
    })
    .filter(a => a.type !== 'comment') as ExecutableInstruction[];
};

const parseInstruction = (
  input: string,
  line: number
): ExecutableInstruction => {
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

  return { type: type as InstructionType, x, y, line };
};

const debugLine = (line: ExecutableInstruction) =>
  `${_.padStart(line.line.toString(), 3, ' ')} | ${line.type} ${line.x} ${
    line.y
  }`;

const executeInstructions = async (
  instructions: ExecutableInstruction[],
  {
    initialRegisterEntries = [],
    debugMode = false,
  }: { initialRegisterEntries?: [string, number][]; debugMode?: boolean } = {}
) => {
  const registers = new Map<string, number>(initialRegisterEntries);
  const instructionsCalled = new Map<string, number>();
  for (let i = 0; i < instructions.length; i++) {
    const currentInstruction = instructions[i];
    instructionsCalled.set(
      currentInstruction.type,
      (instructionsCalled.get(currentInstruction.type) || 0) + 1
    );
    if (debugMode) {
      console.log('Registers', registers);
      console.log('Instruction', debugLine(currentInstruction));
      await inquirer.prompt({ name: 'continue', message: 'Continue?' });
      console.log();
    }
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
      // default:
      //   throw new Error(`Unrecognized side effect ${effect.type}`);
    }
  }
  return { instructionsCalled, registers };
};

const debugInstructions = (instructions: ExecutableInstruction[]) => {
  return executeInstructions(instructions, {
    debugMode: true,
  }).then(result => result.instructionsCalled.get('mul'));
};

const runProgram = (instructions: ExecutableInstruction[]) => {
  return executeInstructions(instructions, {
    initialRegisterEntries: [['a', 1]],
  }).then(result => result.registers.get('h'));
};

const runTests = async () => {
  const PUZZLE_INPUT = parseProgram(
    readLines('./day23input.txt', {
      filterNulls: false,
    })
  );

  console.log('Part One');
  test(
    'Part One answer',
    equalResult(
      await executeInstructions(PUZZLE_INPUT).then(result =>
        result.instructionsCalled.get('mul')
      ),
      5929
    )
  );

  console.log('Part Two');
  const OPTIMIZED_INPUT = parseProgram(
    readLines('./day23optimized.txt', {
      filterNulls: false,
    })
  );
  await executeInstructions(PUZZLE_INPUT, { debugMode: true });

  // test('Part Two answer', equalResult(await runProgram(PUZZLE_INPUT), 0));
};

runTests();

process.on('unhandledRejection', e => {
  console.log('Promise rejection:', e);
});
