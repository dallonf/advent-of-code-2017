type Diff<T extends string, U extends string> = ({ [P in T]: P } &
  { [P in U]: never } & { [x: string]: never })[T];
type Omit<T, K extends keyof T> = { [P in Diff<keyof T, K>]: T[P] };

interface BaseType {
  x: string;
}

const fnWithDefault = <T extends BaseType>(
  input: Omit<T, keyof BaseType>
): T => {
  // Error: Spread types may only be created from object types
  const attempt1 = { ...input, x: 'foo' };
  // Type 'Omit<T, "x"> & { x: string; }' is not assignable to type 'T'.
  return Object.assign({}, input, { x: 'foo' });
};

fnWithDefault<{ x: string; y: string }>({ y: 'bar' });
