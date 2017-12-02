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

export const simpleTest = <TInput, TResult>(
  func: (input: TInput) => TResult,
  input: TInput,
  expectedOutput: TResult,
  prefix?: string
) => {
  const result = func(input);
  test(
    `${prefix ? prefix + ' ' : ''}input:${
      typeof input === 'string' ? input : JSON.stringify(input)
    } = ${expectedOutput}`,
    result === expectedOutput ? true : { failure: `Got ${result}` }
  );
};

export default test;
