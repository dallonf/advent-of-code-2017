import * as _ from 'lodash';
import test, { simpleTest, equalResult } from './test';
import { OS_EOL, readLines } from './util';

// I tried a lot of strategies for this one.
//
// * Brute force: worked but takes a long time
// * Do a depth-first search, and don't keep crawling the graph if you couldn't exceed the best bridge seen so far, even if you hypothetically connected every remaining piece in the graph (excluding orphaned pieces): didn't actually exclude any possibilities.
// * Just find the best single piece at every step: returned a very suboptimal answer
// * Find the best combination of N pieces at a time, then lock it in and find the next combination: returned a suboptimal answer. To my surprise, increasing N didn't seem to be correlated with a more optimal solution.

// Wound up just going with brute force. It didn't take THAT long. /shrug
// It's an NP-hard problem and I just can't think of any heuristics that would help (and still provide the most optimal solution)

interface Component {
  id: number;
  portA: number;
  portB: number;
}
interface BridgeComponent extends Component {
  reversed: boolean;
}

const parseComponent = (line: string, id: number): Component => {
  const match = line.match(/^([0-9]+)\/([0-9]+)$/);
  if (!match) throw new Error(`Invalid input format: ${line}`);
  return {
    id,
    portA: parseInt(match[1], 10),
    portB: parseInt(match[2], 10),
  };
};

const bridgeStrength = (bridge: BridgeComponent[]) =>
  bridge.map(c => c.portA + c.portB).reduce((a, b) => a + b);

const buildStrongestBridge = (components: Component[]) => {
  const allBridges = buildBridges([], components);
  return _.max(allBridges.map(bridgeStrength));
};

const buildLongestBridge = (components: Component[]) => {
  const allBridges = buildBridges([], components);
  const sortedBridges = _.sortBy(
    allBridges,
    b => b.length,
    b => bridgeStrength(b)
  );
  return bridgeStrength(sortedBridges[sortedBridges.length - 1]);
};

const buildBridges = (
  bridge: BridgeComponent[],
  availableComponents: Component[]
): BridgeComponent[][] => {
  let openPort: number;
  if (bridge.length) {
    const lastComponent = bridge[bridge.length - 1];
    openPort = lastComponent.reversed
      ? lastComponent.portA
      : lastComponent.portB;
  } else {
    openPort = 0;
  }

  const supportedParts = availableComponents
    .filter(c => c.portA === openPort || c.portB === openPort)
    .map(c => ({ ...c, reversed: c.portA !== openPort }));

  if (supportedParts.length === 0) {
    return [bridge];
  } else {
    return _.flatten(
      supportedParts.map(bc =>
        buildBridges(
          [...bridge, bc],
          availableComponents.filter(c => c.id != bc.id)
        )
      )
    );
  }
};

const EXAMPLE_INPUT = `
0/2
2/2
2/3
3/4
3/5
0/1
10/1
9/10
`
  .split(OS_EOL)
  .filter(x => x)
  .map(parseComponent);

const PUZZLE_INPUT = readLines('./day24input.txt').map(parseComponent);

console.log('Part One');
simpleTest(
  bridgeStrength,
  [
    { id: 0, portA: 0, portB: 1, reversed: false },
    { id: 1, portA: 10, portB: 1, reversed: true },
    { id: 2, portA: 9, portB: 10, reversed: true },
  ],
  31,
  'bridgeStrength'
);
test(
  'buildStrongestBridge',
  equalResult(buildStrongestBridge(EXAMPLE_INPUT), 31)
);

test('Part One answer', equalResult(buildStrongestBridge(PUZZLE_INPUT), 1868));

console.log('Part Two');

test('buildLongestBridge', equalResult(buildLongestBridge(EXAMPLE_INPUT), 19));

test('Part Two answer', equalResult(buildLongestBridge(PUZZLE_INPUT), 1841));
