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
  index: number;
  x: Value;
  y?: Value;
}

type Constraint = any;
type ConstraintExpression = any;

const INSTRUCTION_FNS = {
  begin: (() => ({ type: 'noop' })) as InstructionFn,
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
    .filter(a => a.type !== 'comment')
    .map((i, index) => ({ ...i, index })) as ExecutableInstruction[];
};

const parseInstruction = (input: string, line: number) => {
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

const debugLine = (line: ExecutableInstruction, instructionNum: number) =>
  `Instruction ${_.padStart(instructionNum.toString(), 3, ' ')} | ${
    line.type
  } ${line.x} ${line.y} (line #${line.line})`;

const executeInstructions = async (
  instructions: ExecutableInstruction[],
  {
    initialRegisterEntries = [],
    initialInstruction = 0,
    autoBreakOn = 'none',
  }: {
    initialRegisterEntries?: { [key: string]: number };
    initialInstruction?: number;
    autoBreakOn?: 'none' | 'all' | 'jnz';
  } = {}
) => {
  let breakpoint: number | null = null;
  const registers = new Map<string, number>(_.toPairs(initialRegisterEntries));
  const instructionsCalled = new Map<string, number>();
  for (let i = initialInstruction; i < instructions.length; i++) {
    const currentInstruction = instructions[i];
    instructionsCalled.set(
      currentInstruction.type,
      (instructionsCalled.get(currentInstruction.type) || 0) + 1
    );
    if (
      i === breakpoint ||
      (breakpoint == null &&
        (autoBreakOn === 'all' ||
          (autoBreakOn === 'jnz' && currentInstruction.type === 'jnz')))
    ) {
      breakpoint = null;
      console.log('Registers', registers);
      console.log(debugLine(currentInstruction, i));
      const result = await inquirer.prompt({
        name: 'continue',
        message:
          'Continue? (n to exit, number to continue until instruction #, prefix with l to continue until line #)',
      });
      let enteredBreakpoint: number;
      if (result['continue'] === 'n') {
        process.exit(0);
      } else if (
        (enteredBreakpoint = parseInt(result['continue'], 10)) &&
        !Number.isNaN(enteredBreakpoint)
      ) {
        console.log(`Setting breakpoint for instruction ${enteredBreakpoint}`);
        breakpoint = enteredBreakpoint;
      } else if (
        result['continue'].startsWith('l') &&
        (enteredBreakpoint = parseInt(result['continue'].slice(1), 10)) &&
        !Number.isNaN(enteredBreakpoint)
      ) {
        const foundBreakpoint = instructions.findIndex(
          i => i.line === enteredBreakpoint
        );
        if (foundBreakpoint === -1) {
          console.log(`Error: no instruction at line #${enteredBreakpoint}`);
        } else {
          console.log(
            `Setting breakpoint for line #${enteredBreakpoint} (instruction ${foundBreakpoint})`
          );
          breakpoint = foundBreakpoint;
        }
      }
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
    autoBreakOn: 'all',
  }).then(result => result.instructionsCalled.get('mul'));
};

const runProgram = (instructions: ExecutableInstruction[]) => {
  return executeInstructions(instructions, {
    initialRegisterEntries: { a: 1 },
  }).then(result => result.registers.get('h'));
};

const solveProgram = (instructions: ExecutableInstruction[]) => {
  const exitIndex = instructions.length;
  const vars = ['h'];

  const sources = getPossibleSources(exitIndex, instructions);

  const solutions = sources.map(s =>
    solveInstruction(s.index, s.constraints, vars, instructions)
  );

  console.log(solutions);
};

const getPossibleSources = (
  sourceIndex: number,
  instructions: ExecutableInstruction[]
) => {
  const canComeFromFallDown = sourceIndex - 1;
  const canComeFromJump = instructions
    .filter(
      i =>
        i.type == 'jnz' &&
        typeof i.y === 'number' &&
        sourceIndex == i.index + i.y
    )
    .map(i => i.index);

  const fallDownInstruction: ExecutableInstruction =
    canComeFromFallDown < 0
      ? { type: 'begin', line: -1, index: -1, x: -1 }
      : instructions[canComeFromFallDown];
  let fallDownConstraint: Constraint;
  if (fallDownInstruction.type === 'jnz') {
    if (typeof fallDownInstruction.x === 'number') {
      if (fallDownInstruction.x !== 0) {
        fallDownConstraint = { type: 'never' };
      } else {
        fallDownConstraint = null;
      }
    } else if (typeof fallDownInstruction.x === 'string') {
      fallDownConstraint = {
        type: 'isZero',
        expression: { type: 'valueOf', register: fallDownInstruction.x },
      };
    }
  } else {
    fallDownConstraint = null;
  }

  const jumpSources = canComeFromJump.map(i => {
    const instruction = instructions[i];
    let constraint: Constraint;
    if (instruction.type === 'jnz') {
      if (typeof instruction.x === 'number') {
        if (instruction.x === 0) {
          constraint = { type: 'never' };
        } else {
          constraint = null;
        }
      } else if (typeof instruction.x === 'string') {
        constraint = {
          type: 'isNotZero',
          expression: { type: 'valueOf', register: instruction.x },
        };
      }
    } else {
      constraint = null;
    }
    return { index: i, constraints: [constraint].filter(x => x) };
  });

  const sources = [
    {
      index: canComeFromFallDown,
      constraints: [fallDownConstraint].filter(x => x),
    },
  ].concat(jumpSources);

  return sources;
};

const deeplyReplaceExpression = (
  expression: ConstraintExpression,
  affectedRegister: string,
  replaceWith: (input: ConstraintExpression) => ConstraintExpression
): ConstraintExpression => {
  if (expression.type === 'valueOf') {
    if (expression.register === affectedRegister) {
      return replaceWith(expression);
    } else {
      return expression;
    }
  } else if (expression.type === 'literal') {
    return expression;
  } else if (expression.type === 'subtract' || expression.type === 'multiply') {
    return {
      type: expression.type,
      aExpression: deeplyReplaceExpression(
        expression.aExpression,
        affectedRegister,
        replaceWith
      ),
      bExpression: deeplyReplaceExpression(
        expression.bExpression,
        affectedRegister,
        replaceWith
      ),
    };
  } else {
    throw new Error(
      `Don't know how to deeplyReplace on expression type ${
        expression.type
      } yet`
    );
  }
};

// const simplifyConstraint = (constraint: Constraint) => {
// }

const logThru = (prefix: string, x: any) =>
  console.log(prefix, JSON.stringify(x, null, 2)) || x;

const solveInstruction = (
  index: number,
  constraints: Constraint[],
  vars: string[],
  instructions: ExecutableInstruction[]
): any => {
  if (constraints.some(c => c.type === 'never')) {
    return { type: 'impossible', at: index };
  }

  // We're at the start!
  if (index < 0) {
    console.log(JSON.stringify(constraints, null, 2));
    throw new Error('Reached the start!');
    // return constraints;
  }

  const instruction = instructions[index];

  let newConstraints: Constraint[] = [];

  if (instruction.type === 'jnz') {
    // no effect on constraints
    newConstraints = constraints;
  } else if (instruction.type === 'sub') {
    const affectedRegister = instruction.x as string;
    if (vars.indexOf(affectedRegister) !== -1) {
      // TODO: handle vars
      // console.log(JSON.stringify(constraints, null, 2), vars, index);
      // throw new Error(
      //   `Don't know how to handle sub on affected var ${affectedRegister} yet`
      // );
    }
    newConstraints = constraints.map(c => {
      if (c.type === 'isZero' || c.type == 'isNotZero') {
        return {
          ...c,
          expression: deeplyReplaceExpression(
            c.expression,
            affectedRegister,
            prevExpression => ({
              type: 'subtract',
              aExpression: prevExpression,
              bExpression:
                typeof instruction.y === 'number'
                  ? { type: 'literal', value: instruction.y }
                  : { type: 'valueOf', register: instruction.y },
            })
          ),
        };
      } else {
        throw new Error(
          `Don't know how to handle sub on affected constraint type ${
            c.type
          } yet`
        );
      }
    });
  } else if (instruction.type === 'set') {
    const affectedRegister = instruction.x as string;
    // TODO: handle vars
    // if (vars.indexOf(affectedRegister) !== -1) {
    //   throw new Error(
    //     `Don't know how to handle set on affected var ${affectedRegister} yet`
    //   );
    // }
    newConstraints = constraints.map(c => {
      if (c.type === 'isZero' || c.type == 'isNotZero') {
        return {
          ...c,
          expression: deeplyReplaceExpression(
            c.expression,
            affectedRegister,
            () =>
              typeof instruction.y === 'number'
                ? { type: 'literal', value: instruction.y }
                : { type: 'valueOf', register: instruction.y }
          ),
        };
      } else {
        throw new Error(
          `Don't know how to handle set on affected constraint type ${
            c.type
          } yet`
        );
      }
    });
  } else if (instruction.type === 'mul') {
    const affectedRegister = instruction.x as string;
    if (vars.indexOf(affectedRegister) !== -1) {
      // TODO: handle vars
      // console.log(JSON.stringify(constraints, null, 2), vars, index);
      // throw new Error(
      //   `Don't know how to handle mul on affected var ${affectedRegister} yet`
      // );
    }
    newConstraints = constraints.map(c => {
      if (c.type === 'isZero' || c.type == 'isNotZero') {
        return {
          ...c,
          expression: deeplyReplaceExpression(
            c.expression,
            affectedRegister,
            prevExpression => ({
              type: 'multiply',
              aExpression: prevExpression,
              bExpression:
                typeof instruction.y === 'number'
                  ? { type: 'literal', value: instruction.y }
                  : { type: 'valueOf', register: instruction.y },
            })
          ),
        };
      } else {
        throw new Error(
          `Don't know how to handle mul on affected constraint type ${
            c.type
          } yet`
        );
      }
    });
  } else {
    console.log(JSON.stringify(constraints, null, 2), vars, index);
    throw new Error(`Don't know how to handle "${instruction.type}" yet`);
  }

  const sources = getPossibleSources(index, instructions);

  const results = _.flatten(
    sources.map(source =>
      solveInstruction(
        source.index,
        [...newConstraints, ...source.constraints],
        vars,
        instructions
      )
    )
  );
  return results;
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

  // Setup
  // await executeInstructions(OPTIMIZED_INPUT, {
  //   autoBreakOn: 'none',
  //   initialRegisterEntries: { a: 1 },
  // });

  // First skip
  // await executeInstructions(OPTIMIZED_INPUT, {
  //   debugMode: true,
  //   initialInstruction: 19,
  //   initialRegisterEntries: {
  //     a: 1,
  //     b: 107900,
  //     c: 124900,
  //     f: 1,
  //     d: 2,
  //     e: 107900,
  //     g: 0,
  //   },
  // });

  // Second skip
  // await executeInstructions(OPTIMIZED_INPUT, {
  //   debugMode: true,
  //   initialInstruction: 23,
  //   initialRegisterEntries: {
  //     a: 1,
  //     b: 107900,
  //     c: 124900,
  //     f: 0,
  //     d: 107900,
  //     e: 107900,
  //     g: 0,
  //   },
  // });

  // Third skip
  // await executeInstructions(OPTIMIZED_INPUT, {
  //   autoBreakOn: 'jnz',
  //   initialInstruction: 19,
  //   initialRegisterEntries: {
  //     a: 1,
  //     b: 107917,
  //     c: 124900,
  //     f: 1,
  //     d: 2,
  //     e: 107917,
  //     g: 0,
  //     h: 1,
  //   },
  // });

  // Fourth skip
  // await executeInstructions(OPTIMIZED_INPUT, {
  //   autoBreakOn: 'jnz',
  //   initialInstruction: 23,
  //   initialRegisterEntries: {
  //     a: 1,
  //     b: 107917,
  //     c: 124900,
  //     f: 1,
  //     d: 107917,
  //     e: 107917,
  //     g: 0,
  //     h: 1,
  //   },
  // });

  // Fifth skip, b increments by 17 999 times to C (124900)
  // await executeInstructions(OPTIMIZED_INPUT, {
  //   autoBreakOn: 'jnz',
  //   initialInstruction: 23,
  //   initialRegisterEntries: {
  //     a: 1,
  //     b: 124900,
  //     c: 124900,
  //     f: 1,
  //     d: 124900,
  //     e: 124900,
  //     g: 0,
  //     h: 1,
  //   },
  // });

  // never mind, this is the wrong approach. Gonna try to implement loop detection in the interpreter itself
  const result = solveProgram(PUZZLE_INPUT);
  console.log(result);

  // test('Part Two answer', equalResult(await runProgram(PUZZLE_INPUT), 0));
};

runTests();

process.on('unhandledRejection', e => {
  console.log('Promise rejection:', e);
});
