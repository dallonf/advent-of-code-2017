import test, { simpleTest } from './test';
import * as fs from 'fs';

console.log('Day 1: Inverse Captcha');

const parseDigits = (input: string) =>
  [...input].map((digitStr, i) => {
    const digit = parseInt(digitStr, 10);
    if (Number.isNaN(digit)) {
      throw new Error(
        `Non-numeric character "${digitStr}" at index ${i} of input string "${input}"`
      );
    }
    return digit;
  });

function captcha1(input: string) {
  const digits = parseDigits(input);

  return digits.reduce((sum, digit, i, list) => {
    let lastDigitIndex = i - 1;
    if (lastDigitIndex < 0) lastDigitIndex = list.length + lastDigitIndex;
    return list[lastDigitIndex] === digit ? sum + digit : sum;
  }, 0);
}

const TEST_INPUT = fs.readFileSync('./day01input.txt', 'utf-8')

console.log('Part 1');
simpleTest(captcha1, '1122', 3);
simpleTest(captcha1, '1111', 4);
simpleTest(captcha1, '1234', 0);
simpleTest(captcha1, '91212129', 9);
test('Part One answer', captcha1(TEST_INPUT) === 1253);

function captcha2(input: string) {
  const digits = parseDigits(input);
  if (digits.length % 2 !== 0) {
    throw new Error(
      `Expected input to have an even number of digits, but its length was ${
        digits.length
      }`
    );
  }

  return digits.reduce((sum, digit, i, list) => {
    const oppositeIndex = (i + list.length / 2) % list.length;
    if (digit === list[oppositeIndex]) return sum + digit;
    else return sum;
  }, 0);
}

console.log('Part 2');
simpleTest(captcha2, '1212', 6);
simpleTest(captcha2, '1221', 0);
simpleTest(captcha2, '123425', 4);
simpleTest(captcha2, '123123', 12);
simpleTest(captcha2, '12131415', 4);
test('Part Two answer', captcha2(TEST_INPUT) === 1278);
