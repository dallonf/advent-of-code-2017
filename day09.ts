import * as fs from 'fs';
import test, { equalResult, simpleTest } from './test';

const scoreStream = (input: string) =>
  parseStream(input, parseGroup, { parentScore: 0, debugIndex: 0 }).score;
const getGarbageCharactersFromGroupStream = (input: string) =>
  parseStream(input, parseGroup, { parentScore: 0, debugIndex: 0 })
    .garbageCharacters;
const getGarbageCharactersFromGarbageStream = (input: string) =>
  parseStream(input, parseGarbage, { debugIndex: 0 }).garbageCharacters;

interface StreamContext {
  debugIndex: number;
}
interface ParseResult {
  remainingInput: string;
  debugIndex: number;
}

const parseStream = <
  TResult extends ParseResult,
  TContext extends StreamContext
>(
  input: string,
  parseFn: (input: string, context: TContext) => TResult,
  initialContext: TContext
) => {
  try {
    const trimmed = input.trim();
    const result = parseFn(trimmed, initialContext);
    if (result.remainingInput) {
      throw new Error(
        `${result.debugIndex}: Expected end of stream, got "${
          result.remainingInput
        }"`
      );
    }
    return result;
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
    case '<': {
      // garbage
      const garbageResult = parseGarbage(input, {
        debugIndex: context.debugIndex,
      });
      // keep parsing
      return parseGroupBody(garbageResult.remainingInput, {
        ...context,
        debugIndex: garbageResult.debugIndex,
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
        `${context.debugIndex}: Unrecognized group character "${char}"`
      );
  }
};

const parseGarbage = (input: string, context: { debugIndex: number }) => {
  if (input.charAt(0) !== '<') {
    throw new Error(
      `${
        context.debugIndex
      }: Expected < at beginning of garbage, instead got ${input.charAt(0)}`
    );
  }
  return parseGarbageBody(input.slice(1), {
    debugIndex: context.debugIndex + 1,
  });
};

const parseGarbageBody = (
  input: string,
  context: { debugIndex: number }
): { remainingInput: string; debugIndex: number } => {
  const char = input.charAt(0);
  switch (char) {
    case '>':
      return {
        remainingInput: input.slice(1),
        debugIndex: context.debugIndex + 1,
      };
    case '!':
      // skip the next character
      return parseGarbageBody(input.slice(2), {
        debugIndex: context.debugIndex + 2,
      });
    default:
      // ignore everything inside garbage
      return parseGarbageBody(input.slice(1), {
        debugIndex: context.debugIndex + 1,
      });
  }
};

const PUZZLE_INPUT = fs.readFileSync('./day09input.txt', 'utf-8');

console.log('Part One');
simpleTest(scoreStream, '{}', 1);
simpleTest(scoreStream, '{{{}}}', 6);
simpleTest(scoreStream, '{{},{}}', 5);
simpleTest(scoreStream, '{{{},{},{{}}}}', 16);
simpleTest(scoreStream, '{<a>,<a>,<a>,<a>}', 1);
simpleTest(scoreStream, '{{<ab>},{<ab>},{<ab>},{<ab>}}', 9);
simpleTest(scoreStream, '{{<!!>},{<!!>},{<!!>},{<!!>}}', 9);
simpleTest(scoreStream, '{{<a!>},{<a!>},{<a!>},{<ab>}}', 3);
test('Part One answer', equalResult(scoreStream(PUZZLE_INPUT), 10616));

console.log('Part Two');
simpleTest(getGarbageCharactersFromGarbageStream, '<>', 0);
simpleTest(getGarbageCharactersFromGarbageStream, '<random characters>', 17);
simpleTest(getGarbageCharactersFromGarbageStream, '<<<<>', 3);
simpleTest(getGarbageCharactersFromGarbageStream, '<{!>}>', 2);
simpleTest(getGarbageCharactersFromGarbageStream, '<!!>', 0);
simpleTest(getGarbageCharactersFromGarbageStream, '<!!!>>', 0);
simpleTest(getGarbageCharactersFromGarbageStream, '<{o"i!a,<{i<a>', 10);
test(
  'Part Two answer',
  equalResult(getGarbageCharactersFromGroupStream(PUZZLE_INPUT), 0)
);
