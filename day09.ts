import test, { equalResult, simpleTest } from './test';

const scoreStream = (input: string) => {
  return 0;
};

console.log('Part One');
simpleTest(scoreStream, '{}', 1);
simpleTest(scoreStream, '{{{}}}', 6);
simpleTest(scoreStream, '{{}, {}}', 5);
simpleTest(scoreStream, '{{{},{},{{}}}}', 16);
simpleTest(scoreStream, '{<a>,<a>,<a>,<a>}', 1);
simpleTest(scoreStream, '{{<ab>},{<ab>},{<ab>},{<ab>}}', 9);
simpleTest(scoreStream, '{{<!!>},{<!!>},{<!!>},{<!!>}}', 9);
simpleTest(scoreStream, '{{<a!>},{<a!>},{<a!>},{<ab>}}', 3);
