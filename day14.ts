import * as _ from 'lodash';
import test, { simpleTest, equalResult } from './test';
import { hash2 } from './day10';

const HALF_BYTE = _.range(3, -1, -1).map(i => Math.pow(2, i));
const hexToBinary = (hex: string) =>
  [...hex]
    .map(halfByte => {
      const value = parseInt(halfByte, 16);
      let remainingValue = value;
      return HALF_BYTE.map(place => {
        if (remainingValue >= place) {
          remainingValue -= place;
          return '1';
        } else {
          return '0';
        }
      }).join('');
    })
    .join('');

type Grid = boolean[][];

const LENGTH = 128;
const createGrid = (key: string): Grid =>
  _.range(LENGTH)
    .map(i => hash2(`${key}-${i}`))
    .map(hexToBinary)
    .map(binary => [...binary].map(bit => bit === '1'));

const gridEntries = function*(input: Grid) {
  for (let x = 0; x < input.length; x++) {
    const column = input[x];
    for (let y = 0; y < column.length; y++) {
      const bit = column[y];
      yield { x, y, bit };
    }
  }
};

const usedSquares = (key: string) =>
  [...gridEntries(createGrid(key))].filter(square => square.bit).length;

const EXAMPLE_INPUT = 'flqrgnkx';
const PUZZLE_INPUT = 'hfdlxzhv';

console.log('Part One');
simpleTest(hexToBinary, 'f', '1111', 'hexToBinary');
simpleTest(hexToBinary, '0', '0000', 'hexToBinary');
simpleTest(hexToBinary, '3', '0011', 'hexToBinary');
simpleTest(
  hexToBinary,
  'a0c2017',
  '1010000011000010000000010111',
  'hexToBinary'
);
simpleTest(usedSquares, EXAMPLE_INPUT, 8108);
test('Part One answer', equalResult(usedSquares(PUZZLE_INPUT), 8230));

console.log('Part Two');
