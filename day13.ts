import test, { equalResult } from './test';
import { OS_EOL, readLines } from './util';

interface LayerDefinition {
  depth: number;
  range: number;
}

interface LayerState extends LayerDefinition {
  scannerPosition: number;
  direction: 1 | -1;
}

const parseLine = (input: string): LayerDefinition => {
  const match = input.match(/^([0-9]+): ([0-9]+)$/);
  if (!match) throw new Error(`Unexpected format of input line "${input}"`);
  return { depth: parseInt(match[1], 10), range: parseInt(match[2], 10) };
};

const getSeverityOfTrip = (layerDefinitions: LayerDefinition[]) => {
  const layers: (LayerState | undefined)[] = [];
  layerDefinitions.forEach(ld => {
    layers[ld.depth] = { ...ld, scannerPosition: 0, direction: 1 };
  });

  const caughtInLayers = [];
  for (let i = 0; i < layers.length; i++) {
    // Check for collision
    const playerCurrentLayer = layers[i];
    if (playerCurrentLayer) {
      if (playerCurrentLayer.scannerPosition === 0) {
        caughtInLayers.push(i);
      }
    }
    // Update scanners
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
  }
  return caughtInLayers
    .map(layerIndex => {
      // coerce to defined; you can't get caught in an empty layer
      const layer = layers[layerIndex]!;
      return layer.depth * layer.range;
    })
    .reduce((a, b) => a + b);
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
