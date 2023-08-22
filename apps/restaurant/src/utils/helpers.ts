export const prettyNumber = (x: number | string | undefined | null) => {
  if (x === undefined || x === null) return '--';

  if (typeof x === 'string') x = parseFloat(x);
  x = x.toFixed(2);

  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};
