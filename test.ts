import chalk from 'chalk';
import * as _ from 'lodash';

interface TestFailure {
  failure: string;
}

interface EqualOptions {
  deepEqual?: boolean;
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

export const equalResult = <T>(
  actual: T,
  expected: T,
  options: EqualOptions = {}
) =>
  (options.deepEqual ? _.isEqual(expected, actual) : expected === actual)
    ? true
    : { failure: `Got ${stringRepresentation(actual)}` };

const stringRepresentation = (value: any) =>
  typeof value === 'string' ? value : JSON.stringify(value);

export const simpleTest = <TInput, TResult>(
  func: (input: TInput) => TResult,
  input: TInput,
  expectedOutput: TResult,
  prefix?: string,
  options?: EqualOptions
) =>
  test(
    `${prefix ? prefix + ' ' : ''}input:${stringRepresentation(
      input
    )} = ${stringRepresentation(expectedOutput)}`,
    equalResult(func(input), expectedOutput, options)
  );

export default test;
