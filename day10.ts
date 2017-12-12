import test, { simpleTest, equalResult } from './test';
import * as _ from 'lodash';

const hash1 = ({ list, lengths }: { list: number[]; lengths: number[] }) => {
  let cursor = 0;
  let skipSize = 0;
  let knottedList = [...list];
  const loopIndex = (i: number) => i % list.length;
  lengths.forEach(length => {
    const section = _.range(0, length).map(
      i => knottedList[loopIndex(cursor + i)]
    );
    section.reverse();
    section.forEach((number, i) => {
      knottedList[loopIndex(cursor + i)] = number;
    });
    cursor += loopIndex(length + skipSize);
    skipSize += 1;
  });
  return knottedList[0] * knottedList[1];
};

const hash2 = (input: string) => {
  let cursor = 0;
  let skipSize = 0;
  let knottedList = _.range(0, 256);
  const loopIndex = (i: number) => i % 256;
  const lengths = [...input]
    .map(x => x.charCodeAt(0))
    .concat([17, 31, 73, 47, 23]);
  _.range(0, 64).forEach(round => {
    lengths.forEach(length => {
      const section = _.range(0, length).map(
        i => knottedList[loopIndex(cursor + i)]
      );
      section.reverse();
      section.forEach((number, i) => {
        knottedList[loopIndex(cursor + i)] = number;
      });
      cursor += loopIndex(length + skipSize);
      skipSize += 1;
    });
  });
  const denseHash = _.range(0, 16).map(blockIndex =>
    knottedList
      .slice(blockIndex * 16, blockIndex * 16 + 16)
      .reduce((a, b) => a ^ b)
  );
  const binary = new Buffer(denseHash);
  return binary.toString('hex');
};

const PUZZLE_INPUT = '102,255,99,252,200,24,219,57,103,2,226,254,1,0,69,216';
const part1PuzzleInput = PUZZLE_INPUT.split(',').map(x => parseInt(x, 10));

console.log('Part One');
simpleTest(hash1, { list: _.range(0, 5), lengths: [3, 4, 1, 5] }, 12);
test(
  'Part One answer',
  equalResult(hash1({ list: _.range(0, 256), lengths: part1PuzzleInput }), 5577)
);

console.log('Part Two');
simpleTest(hash2, '', 'a2582a3a0e66e6e86e3812dcb672a272');
simpleTest(hash2, 'AoC 2017', '33efeb34ea91902bb2f59c9920caa6cd');
simpleTest(hash2, '1,2,3', '3efbe78a8d82f29979031a4aa0b16a9d');
simpleTest(hash2, '1,2,4', '63960835bcdc130f0b66d7ff4f6a5a8e');
test(
  'Part Two answer',
  equalResult(hash2(PUZZLE_INPUT), '44f4befb0f303c0bafd085f97741d51d')
);
