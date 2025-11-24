// TODO: overload with `min == 0`

/** Get a random integer in the range */
export const random = (min : number, max : number) =>
  Math.floor(Math.random() * (max - min)) + min;
