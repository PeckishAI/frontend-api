export const prettyNumber = (x: number | string | undefined | null) => {
  if (x === undefined || x === null) return '--';

  if (typeof x === 'string') x = parseFloat(x);

  // Round to 2 decimals if neccessary
  x = Math.round((x + Number.EPSILON) * 100) / 100;

  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};
