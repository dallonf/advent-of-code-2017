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
  const programMap = new Map<number, Program>(
    programs.map(p => [p.id, p] as [number, Program])
  );
  const id = 0;
  const group = new Set<number>([id]);
  const crawlQueue = [id];
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
  return group.size;
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
