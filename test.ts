import chalk from 'chalk';

const test = (testname: string, input: boolean) => {
  if (input) {
    console.log(chalk.green('✔ ' + testname));
  } else {
    console.log(chalk.red('✖ ' + testname));
  }
};

export const simpleTest = <TInput, TResult>(
  func: (input: TInput) => TResult,
  input: TInput,
  expectedOutput: TResult,
  prefix?: string
) =>
  test(
    `${prefix ? prefix + ' ' : ''}input:${input} = ${expectedOutput}`,
    func(input) === expectedOutput
  );

export default test;
