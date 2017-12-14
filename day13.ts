import test, { equalResult } from './test';
import * as _ from 'lodash';
import { OS_EOL, readLines } from './util';

interface LayerDefinition {
  depth: number;
  range: number;
}

interface LayerState extends LayerDefinition {
  scannerPosition: number;
  direction: 1 | -1;
}

type LayerStateArray = (LayerState | undefined)[];

const parseLine = (input: string): LayerDefinition => {
  const match = input.match(/^([0-9]+): ([0-9]+)$/);
  if (!match) throw new Error(`Unexpected format of input line "${input}"`);
  return { depth: parseInt(match[1], 10), range: parseInt(match[2], 10) };
};

const makeLayerStateArray = (
  layerDefinitions: LayerDefinition[]
): LayerStateArray => {
  const layers: LayerStateArray = [];
  layerDefinitions.forEach(ld => {
    layers[ld.depth] = { ...ld, scannerPosition: 0, direction: 1 };
  });
  return layers;
};

const getSeverityOfTrip = (layerDefinitions: LayerDefinition[]) => {
  const layers = makeLayerStateArray(layerDefinitions);

  const caughtInLayers = [];
  for (let i = 0; i < layers.length; i++) {
    // Check for collision
    const playerCurrentLayer = layers[i];
    if (playerCurrentLayer) {
      if (playerCurrentLayer.scannerPosition === 0) {
        caughtInLayers.push(i);
      }
    }

    updateScanners(layers);
  }
  return caughtInLayers
    .map(layerIndex => {
      // coerce to defined; you can't get caught in an empty layer
      const layer = layers[layerIndex]!;
      return layer.depth * layer.range;
    })
    .reduce((a, b) => a + b);
};

interface PacketState {
  delay: number;
  position: number;
}
const calculateSafePassage = (layerDefinitions: LayerDefinition[]) => {
  const layers = makeLayerStateArray(layerDefinitions);

  let packetsInFlight: PacketState[] = [];
  for (let i = 0; i < 1000; i++) {
    // make a new packet
    const newPacket: PacketState = {
      delay: i,
      position: 0,
    };
    packetsInFlight.push(newPacket);
    // check if any packets have been caught
    packetsInFlight = packetsInFlight.filter(p => {
      const layer = layers[p.position];
      return !(layer && layer.scannerPosition === 0);
    });
    // check if any packets have made it to the end
    const winner = packetsInFlight.find(p => p.position >= layers.length - 1);
    if (winner) {
      return winner.delay;
    }

    updateScanners(layers);

    // advance all packets
    packetsInFlight.forEach(p => (p.position += 1));
  }
  throw new Error('Exited after high number of iterations without solution');
};

const updateScanners = (layers: LayerStateArray) => {
  for (let i2 = 0; i2 < layers.length; i2++) {
    const layer = layers[i2];
    if (layer) {
      // Move the scanner
      layer.scannerPosition += layer.direction;
      // See if scanner needs to reverse next tick
      if (layer.direction === 1 && layer.scannerPosition >= layer.range - 1) {
        layer.direction = -1;
      } else if (layer.direction === -1 && layer.scannerPosition <= 0) {
        layer.direction *= -1;
      }
    }
  }
};

const EXAMPLE_INPUT = `
0: 3
1: 2
4: 4
6: 4
`
  .split(OS_EOL)
  .filter(x => x)
  .map(parseLine);

const PUZZLE_INPUT = readLines('./day13input.txt').map(parseLine);

console.log('Part One');
test('Severity', equalResult(getSeverityOfTrip(EXAMPLE_INPUT), 24));
test('Part One Answer', equalResult(getSeverityOfTrip(PUZZLE_INPUT), 1728));

console.log('Part Two');
test('Safe Passage', equalResult(calculateSafePassage(EXAMPLE_INPUT), 10));
test('Part Two Answer', equalResult(calculateSafePassage(PUZZLE_INPUT), 0));
