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

const usedSquares = (key: string) =>
  _.range(128)
    .map(i => hash2(`${key}-${i}`))
    .map(hexToBinary)
    .map(binary => [...binary].filter(bit => bit === '1').length)
    .reduce((a, b) => a + b);

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
test('Part One answer', equalResult(usedSquares(PUZZLE_INPUT), 0));
