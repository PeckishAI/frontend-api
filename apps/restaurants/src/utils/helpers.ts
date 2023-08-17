export const prettyNumber = (x: number | string) => {
  if (typeof x === 'string') x = parseFloat(x);

  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};
