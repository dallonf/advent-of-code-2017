import test, { equalResult, simpleTest } from './test';

console.log('Part One');

const lineRegex = /^([a-z]+) \(([0-9]+)\)(?: -> ([a-z]+(?:, [a-z]+)*))?$/;
const parseInputLine = (line: string) => {
  const match = line.match(lineRegex);
  if (!match) {
    throw new Error(`Line "${line}" does not match expected format`);
  }
  const [fullMatch, name, weightString, supportingString] = match;
  return {
    name,
    weight: parseInt(weightString, 10),
    supporting: supportingString
      ? supportingString.replace(/ /g, '').split(',')
      : undefined,
  };
};

simpleTest(
  parseInputLine,
  'fwft (72) -> ktlj, cntj, xhth',
  {
    name: 'fwft',
    weight: 72,
    supporting: ['ktlj', 'cntj', 'xhth'],
  },
  'parseInputLine',
  { deepEqual: true }
);

simpleTest(
  parseInputLine,
  'qoyq (66)',
  {
    name: 'qoyq',
    weight: 66,
    supporting: undefined,
  },
  'parseInputLine',
  { deepEqual: true }
);
