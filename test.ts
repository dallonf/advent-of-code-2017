import chalk from 'chalk';

interface TestFailure {
  failure: string;
}

const test = (testname: string, result: boolean | TestFailure) => {
  if (result === true) {
    console.log(chalk.green('✔ ' + testname));
  } else if (typeof result === 'object' && result.failure) {
    console.log(`${chalk.red('✖ ' + testname)} (${result.failure})`);
  } else {
    console.log(chalk.red('✖ ' + testname));
  }
};

export const equalResult = <T>(actual: T, expected: T) =>
  expected === actual ? true : { failure: `Got ${actual}` };

export const simpleTest = <TInput, TResult>(
  func: (input: TInput) => TResult,
  input: TInput,
  expectedOutput: TResult,
  prefix?: string
) =>
  test(
    `${prefix ? prefix + ' ' : ''}input:${
      typeof input === 'string' ? input : JSON.stringify(input)
    } = ${expectedOutput}`,
    equalResult(func(input), expectedOutput)
  );

export default test;
