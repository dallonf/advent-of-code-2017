import test from './test';

interface ReduceStep {
  lastDigit?: number;
  sum: number;
}

function captcha(input: string) {
  return [...input].reduce(
    (step: ReduceStep, digitStr, i) => {
      const digit = parseInt(digitStr, 10);
      if (Number.isNaN(digit)) {
        throw new Error(
          `Non-numeric character "${digitStr}" at index ${i} of input string "${
            input
          }"`
        );
      }

      const newSum =
        typeof step.lastDigit === 'number' && step.lastDigit === digit
          ? step.sum + digit
          : step.sum;

      return { lastDigit: digit, sum: newSum };
    },
    { sum: 0 }
  ).sum;
}

test('1122 = 3', captcha('1122') === 3);
test('1111 = 4', captcha('1111') === 4);
test('1234 = 0', captcha('1234') === 0);
test('91212129 = 9', captcha('91212129') === 9);
