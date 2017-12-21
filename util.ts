import * as fs from 'fs';
import * as os from 'os';
import * as _ from 'lodash';
import { simpleTest } from './test';

export const OS_EOL = /\r\n|\n/;

export const readLines = (path: string, { filterNulls = true } = {}) => {
  const allLines = fs.readFileSync(path, 'utf-8').split(OS_EOL);
  if (filterNulls) {
    return allLines.filter(x => x);
  } else {
    return allLines;
  }
};

export const numberToBinary = (number: number, bits: number) => {
  return _.padStart(number.toString(2).slice(-bits), bits, '0');
};

export const hexToBinary = (hex: string) =>
  [...hex]
    .map(halfByte => {
      const value = parseInt(halfByte, 16);
      return numberToBinary(value, 4);
    })
    .join('');

console.log('Util Tests');
simpleTest(
  x => numberToBinary(x, 32),
  1092455,
  '00000000000100001010101101100111',
  'numberToBinary'
);
simpleTest(
  x => numberToBinary(x, 32),
  430625591,
  '00011001101010101101001100110111',
  'numberToBinary'
);
simpleTest(hexToBinary, 'f', '1111', 'hexToBinary');
simpleTest(hexToBinary, '0', '0000', 'hexToBinary');
simpleTest(hexToBinary, '3', '0011', 'hexToBinary');
simpleTest(
  hexToBinary,
  'a0c2017',
  '1010000011000010000000010111',
  'hexToBinary'
);
