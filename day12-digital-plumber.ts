import test, { simpleTest, equalResult } from './test';
import { OS_EOL, readLines } from './util';

interface Program {
  id: number;
  pipes: number[];
}

const parseLine = (input: string): Program => {
  const matches = input.match(/([0-9]+) <-> ([0-9]+(?:, [0-9]+)*)/);
  if (!matches)
    throw new Error(`Input ${input} does not match expected format`);
  return {
    id: parseInt(matches[1], 10),
    pipes: matches[2].split(', ').map(x => parseInt(x, 10)),
  };
};

const crawlZeroGroup = (programs: Program[]) => {
  return crawlGroup(makeProgramMap(programs), 0).size;
};

const countGroups = (programs: Program[]) => {
  const programMap = makeProgramMap(programs);
  let groups = 0;
  const programsAccountedFor = new Set<number>();
  programs.forEach(p => {
    if (!programsAccountedFor.has(p.id)) {
      groups++;
      const newGroup = crawlGroup(programMap, p.id);
      newGroup.forEach(p => programsAccountedFor.add(p));
    }
  });
  return groups;
};

const makeProgramMap = (programs: Program[]): Map<number, Program> =>
  new Map<number, Program>(programs.map(p => [p.id, p] as [number, Program]));

const crawlGroup = (
  programMap: Map<number, Program>,
  startingId: number
): Set<number> => {
  const group = new Set<number>([startingId]);
  const crawlQueue = [startingId];
  while (crawlQueue.length) {
    const crawlId = crawlQueue.shift()!;
    const program = programMap.get(crawlId);
    if (!program) throw new Error(`There is no program ID ${crawlId}!`);
    program.pipes.forEach(p => {
      if (!group.has(p)) {
        group.add(p);
        crawlQueue.push(p);
      }
    });
  }
  return group;
};

const EXAMPLE_INPUT = `
0 <-> 2
1 <-> 1
2 <-> 0, 3, 4
3 <-> 2, 4
4 <-> 2, 3, 6
5 <-> 6
6 <-> 4, 5
`
  .split(OS_EOL)
  .filter(x => x)
  .map(parseLine);

const PUZZLE_INPUT = readLines('./day12input.txt')
  .filter(x => x)
  .map(parseLine);

console.log('Part One');
test('crawlZeroGroup, expect 6', equalResult(crawlZeroGroup(EXAMPLE_INPUT), 6));
test('Part One answer', equalResult(crawlZeroGroup(PUZZLE_INPUT), 113));
console.log('Part Two');
test('countGroups, expect 2', equalResult(countGroups(EXAMPLE_INPUT), 2));
test('Part Two answer', equalResult(countGroups(PUZZLE_INPUT), 202));
