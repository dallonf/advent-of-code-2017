import test, { equalResult, simpleTest } from './test';
import { debug } from 'util';

const scoreStream = (input: string) => {
  try {
    return parseGroup(input, { parentScore: 0, debugIndex: 0 }).score;
  } catch (err) {
    throw new Error(`Error parsing "${input}": ${err.message}`);
  }
};

const parseGroup = (
  input: string,
  context: { parentScore: number; debugIndex: number }
) => {
  const baseScore = context.parentScore + 1;
  if (input.charAt(0) !== '{') {
    throw new Error(
      `${
        context.debugIndex
      }: Expected { at beginning of group, instead got ${input.charAt(0)}`
    );
  }
  return parseGroupBody(input.slice(1), {
    groupBaseScore: baseScore,
    innerScore: 0,
    debugIndex: context.debugIndex + 1,
  });
};

const parseGroupBody = (
  input: string,
  context: { groupBaseScore: number; innerScore: number; debugIndex: number }
): { score: number; remainingInput: string; debugIndex: number } => {
  const char = input.charAt(0);
  switch (char) {
    case '}':
      // end group
      return {
        score: context.groupBaseScore + context.innerScore,
        remainingInput: input.slice(1),
        debugIndex: context.debugIndex + 1,
      };
    case '{': {
      // new group
      const groupResult = parseGroup(input, {
        parentScore: context.groupBaseScore,
        debugIndex: context.debugIndex,
      });
      // keep parsing
      return parseGroupBody(groupResult.remainingInput, {
        groupBaseScore: context.groupBaseScore,
        innerScore: context.innerScore + groupResult.score,
        debugIndex: groupResult.debugIndex,
      });
    }
    case ',':
      // ignore
      return parseGroupBody(input.slice(1), {
        ...context,
        debugIndex: context.debugIndex + 1,
      });
    default:
      throw new Error(
        `${context.debugIndex}: Unrecognized character "${char}"`
      );
  }
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
