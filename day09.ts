import test, { equalResult, simpleTest } from './test';

const scoreStream = (input: string) => {
  return parseGroup(input, 0, 0).score;
};

const parseGroup = (input: string, parentScore: number, debugIndex: number) => {
  const baseScore = parentScore + 1;
  let cursor = 0;
  let innerScore = 0;
  if (input.charAt(0) !== '{') {
    throw new Error(
      `${
        debugIndex
      }: Expected { at beginning of group, instead got ${input.charAt(0)}`
    );
  }
  ++cursor;
  while (cursor < input.length) {
    const char = input.charAt(cursor);
    switch (char) {
      case '}':
        // end group
        return { score: parentScore + 1 + innerScore, length: cursor };
      case '{': {
        // new group
        const substring = input.slice(cursor);
        const groupResult = parseGroup(
          substring,
          baseScore,
          debugIndex + cursor
        );
        innerScore += groupResult.score;
        cursor += groupResult.length;
        break;
      }
      case ',':
        // ignore
        break;
      default:
        throw new Error(
          `${debugIndex + cursor}: Unrecognized character "${char}"`
        );
    }
    ++cursor;
  }
  throw new Error(
    'Expected } to end group, but was not found by the end of input'
  );
};

console.log('Part One');
simpleTest(scoreStream, '{}', 1);
simpleTest(scoreStream, '{{{}}}', 6);
simpleTest(scoreStream, '{{},{}}', 5);
simpleTest(scoreStream, '{{{},{},{{}}}}', 16);
simpleTest(scoreStream, '{<a>,<a>,<a>,<a>}', 1);
simpleTest(scoreStream, '{{<ab>},{<ab>},{<ab>},{<ab>}}', 9);
simpleTest(scoreStream, '{{<!!>},{<!!>},{<!!>},{<!!>}}', 9);
simpleTest(scoreStream, '{{<a!>},{<a!>},{<a!>},{<ab>}}', 3);
