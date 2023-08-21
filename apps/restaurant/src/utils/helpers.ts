export const prettyNumber = (x: number | string | undefined | null) => {
  if (x === undefined || x === null) return '--';

  if (typeof x === 'string') x = parseFloat(x);

  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};
