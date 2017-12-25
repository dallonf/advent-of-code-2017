import * as _ from 'lodash';
import test, { simpleTest, equalResult } from './test';
import { OS_EOL, readLines } from './util';
const now = require('performance-now');

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

const bridgeStrength = (bridge: Component[]) =>
  bridge.map(c => c.portA + c.portB).reduce((a, b) => a + b);

const buildStrongestBridge = (components: Component[]) => {
  components = _.sortBy(components, c => -(c.portA + c.portB));

  let maxStrength = 0;
  let _possibilitiesTested = 0;
  const queue: BridgeComponent[][] = [[]];

  while (queue.length) {
    const currentBridgeInProgress = queue.shift()!;

    let openPort: number;
    if (currentBridgeInProgress.length) {
      const lastComponent =
        currentBridgeInProgress[currentBridgeInProgress.length - 1];
      openPort = lastComponent.reversed
        ? lastComponent.portA
        : lastComponent.portB;
    } else {
      openPort = 0;
    }

    // Don't allow using any components already in use
    const availableComponents = components.filter(c => {
      return currentBridgeInProgress.findIndex(bc => bc.id === c.id) === -1;
    });

    const supportedParts = availableComponents
      .filter(c => c.portA === openPort || c.portB === openPort)
      .map(c => ({ ...c, reversed: c.portA !== openPort }));

    supportedParts.forEach(part => {
      const bridge = [...currentBridgeInProgress, part];
      const strength = bridgeStrength(bridge);
      if (strength > maxStrength) {
        maxStrength = strength;
      }
      _possibilitiesTested += 1;
      queue.push(bridge);
    });

    console.log('possibilities tested', _possibilitiesTested);
  }

  return maxStrength;
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
const SMALLER_PUZZLE_INPUT = PUZZLE_INPUT.slice(
  Math.floor(PUZZLE_INPUT.length * 0.5)
);

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

// console.log('begin performance testing');
// buildStrongestBridge(PUZZLE_INPUT);
// console.log('end performance testing');

// test('Part One answer', equalResult(buildStrongestBridge(PUZZLE_INPUT), 0));
