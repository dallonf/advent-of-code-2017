import chalk from 'chalk';

const test = (testname: string, input: boolean) => {
  if (input) {
    console.log(chalk.green('✔ ' + testname));
  } else {
    console.log(chalk.red('✖ ' + testname));
  }
};

export default test;
