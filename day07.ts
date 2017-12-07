import test, { equalResult, simpleTest } from './test';
import * as _ from 'lodash';
import { EOL } from 'os';
import { readLines } from './util';

interface Node {
  name: string;
  weight: number;
  supporting: string[] | undefined;
}

interface GraphNode extends Node {
  parent: string | null;
}

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

const buildGraphTools = (input: Node[]) => {
  const parentMap = new Map(
    _.flatten(
      input.map(n =>
        (n.supporting || []).map(parent => [parent, n.name] as [string, string])
      )
    )
  );
  const graphNodes = input.map(n => ({
    ...n,
    parent: parentMap.get(n.name) || null,
  }));
  const nodeByName = new Map<string, GraphNode>(
    graphNodes.map(n => [n.name, n] as [string, typeof n])
  );
  const root = graphNodes.find(n => n.parent == null);
  if (!root) throw new Error('Graph has no root node');
  return { nodeByName, root };
};

const getRoot = (input: Node[]) => {
  return buildGraphTools(input).root.name;
};

const EXAMPLE_1 = `
pbga (66)
xhth (57)
ebii (61)
havc (66)
ktlj (57)
fwft (72) -> ktlj, cntj, xhth
qoyq (66)
padx (45) -> pbga, havc, qoyq
tknk (41) -> ugml, padx, fwft
jptl (61)
ugml (68) -> gyxo, ebii, jptl
gyxo (61)
cntj (57)`;

const PUZZLE_INPUT = readLines('./day07input.txt');
const parsedPuzzleInput = PUZZLE_INPUT.map(parseInputLine);

console.log('Part One');
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

const parsedExample1 = EXAMPLE_1.split(EOL)
  .filter(x => x)
  .map(parseInputLine);

test('getRoot', equalResult(getRoot(parsedExample1), 'tknk'));
test('Part One Answer', equalResult(getRoot(parsedPuzzleInput), 'qibuqqg'));
