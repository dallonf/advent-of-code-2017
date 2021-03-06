import * as _ from 'lodash';
import test, { simpleTest, equalResult } from './test';
import { hexToBinary } from './util';
import { hash2 } from './day10-knot-hash';

console.log('Day 14: Disk Defragmentation');

type Grid = boolean[][];

const LENGTH = 128;
const createGrid = (key: string): Grid =>
  _.range(LENGTH)
    .map(i => hash2(`${key}-${i}`))
    .map(hexToBinary)
    .map(binary => [...binary].map(bit => bit === '1'));

const gridEntries = function*(input: Grid) {
  for (let y = 0; y < input.length; y++) {
    const row = input[y];
    for (let x = 0; x < row.length; x++) {
      const bit = row[x];
      yield { y, x, bit };
    }
  }
};

const usedSquares = (key: string) =>
  [...gridEntries(createGrid(key))].filter(square => square.bit).length;

const squareKey = ({ x, y }: { x: number; y: number }) => `${x},${y}`;
const countRegions = (key: string) => {
  const grid = createGrid(key);
  const accountedForSquares = new Set<string>();

  const groups = [];
  for (const square of gridEntries(grid)) {
    if (accountedForSquares.has(squareKey(square))) {
      // This square is already part of a group, or is blank
      continue;
    } else if (square.bit) {
      // Find its group
      let groupSize = 0;
      const groupCrawlQueue: { x: number; y: number }[] = [];
      groupCrawlQueue.push(square);
      while (groupCrawlQueue.length) {
        const currentSquare = groupCrawlQueue.shift()!;
        if (
          currentSquare.x < 0 ||
          currentSquare.x >= LENGTH ||
          currentSquare.y < 0 ||
          currentSquare.y >= LENGTH
        ) {
          // square is out of bounds
          continue;
        }
        if (accountedForSquares.has(squareKey(currentSquare))) {
          // Don't check this square, we already know where it belongs
          continue;
        }
        if (grid[currentSquare.y][currentSquare.x]) {
          groupSize += 1;
          // add adjacent squares to queue
          groupCrawlQueue.push({ x: currentSquare.x - 1, y: currentSquare.y });
          groupCrawlQueue.push({ x: currentSquare.x + 1, y: currentSquare.y });
          groupCrawlQueue.push({ x: currentSquare.x, y: currentSquare.y - 1 });
          groupCrawlQueue.push({ x: currentSquare.x, y: currentSquare.y + 1 });
        }
        accountedForSquares.add(squareKey(currentSquare));
      }
      groups.push(groupSize);
    }
  }
  return groups.length;
};

const EXAMPLE_INPUT = 'flqrgnkx';
const PUZZLE_INPUT = 'hfdlxzhv';

console.log('Part One');
simpleTest(usedSquares, EXAMPLE_INPUT, 8108);
test('Part One answer', equalResult(usedSquares(PUZZLE_INPUT), 8230));

console.log('Part Two');
simpleTest(countRegions, EXAMPLE_INPUT, 1242);
test('Part Two answer', equalResult(countRegions(PUZZLE_INPUT), 1103));
