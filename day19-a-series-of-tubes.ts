import test, { simpleTest, equalResult } from './test';
import { readLines } from './util';

console.log('Day 19: A Series of Tubes');

type GridCell =
  | { type: 'empty' }
  | { type: 'pipe'; direction: 'vertical' | 'horizontal' }
  | { type: 'intersection' }
  | { type: 'letter'; value: string };

const parseInput = (rows: string[]): GridCell[][] => {
  return rows.map(row =>
    [...row].map((char): GridCell => {
      if (char === ' ') {
        return { type: 'empty' };
      } else if (char === '|') {
        return { type: 'pipe', direction: 'vertical' };
      } else if (char === '-') {
        return { type: 'pipe', direction: 'horizontal' };
      } else if (char === '+') {
        return { type: 'intersection' };
      } else if (char.match(/^[A-Z]$/)) {
        return { type: 'letter', value: char };
      } else {
        throw new Error(`Unrecognized character "${char}"`);
      }
    })
  );
};

const MAX_STEPS = 1000000;
const getCell = (grid: GridCell[][], x: number, y: number): GridCell => {
  const row = grid[y];
  if (!row) return { type: 'empty' };
  const cell = row[x];
  if (!cell) return { type: 'empty' };
  return cell;
};
const navigate = (input: GridCell[][]) => {
  let x = input[0].findIndex(
      p => p.type === 'pipe' && p.direction === 'vertical'
    ),
    y = 0;
  let direction = { x: 0, y: 1 };
  let letters = '';

  if (x === -1) throw new Error('Expected vertical pipe on top row');

  for (let i = 0; i < MAX_STEPS; i++) {
    const cell = getCell(input, x, y);
    if (cell.type === 'pipe') {
      // just keep going
    } else if (cell.type === 'letter') {
      letters += cell.value;
    } else if (cell.type === 'intersection') {
      const neighbors = [
        { x, y: y - 1, direction: 'vertical' },
        { x: x - 1, y, direction: 'horizontal' },
        { x, y: y + 1, direction: 'vertical' },
        { x: x + 1, y, direction: 'horizontal' },
      ]
        // but not where you came from
        .filter(n => !(n.x === x - direction.x && n.y === y - direction.y))
        .map(n => ({ ...n, cell: getCell(input, n.x, n.y) }))
        .filter(
          n =>
            (n.cell.type === 'pipe' && n.cell.direction === n.direction) ||
            n.cell.type === 'letter'
        );
      if (neighbors.length !== 1) {
        throw new Error(
          `Expected only one valid neighbor, got ${neighbors.length}`
        );
      }
      const target = neighbors[0];
      direction = { x: target.x - x, y: target.y - y };
    } else if (cell.type === 'empty') {
      // We've reached the end
      return { letters, steps: i };
    }

    x += direction.x;
    y += direction.y;
  }
  throw new Error('Timed out');
};
const getLetters = (input: GridCell[][]) => navigate(input).letters;
const getSteps = (input: GridCell[][]) => navigate(input).steps;

const EXAMPLE_INPUT = parseInput(readLines('./day19exampleinput.txt'));
const PUZZLE_INPUT = parseInput(readLines('./day19input.txt'));

console.log('Part One');
test(
  'Example navigation = ABCDEF',
  equalResult(getLetters(EXAMPLE_INPUT), 'ABCDEF')
);
test('Part One answer', equalResult(getLetters(PUZZLE_INPUT), 'LIWQYKMRP'));

console.log('Part Two');
test('Example navigation = 38', equalResult(getSteps(EXAMPLE_INPUT), 38));
test('Part Two answer', equalResult(getSteps(PUZZLE_INPUT), 16764));
