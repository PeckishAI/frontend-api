import i18n from '../translation/i18n';

// Pretty print big number (e.g. 1000000 -> 1 000 000)
export const prettyNumber = (x: number | string | undefined | null) => {
  if (x === undefined || x === null) return '--';

  if (typeof x === 'string') x = parseFloat(x);

  // Round to 2 decimals if neccessary
  x = Math.round((x + Number.EPSILON) * 100) / 100;

  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

// currency : ISO 4217 currency code
export const formatCurrency = (
  value: number | string | undefined | null,
  currency?: string | null
) => {
  if (value === undefined || value === null) return '--';
  if (typeof value === 'string') value = parseFloat(value);

  const options = { style: 'currency', currency: currency ?? 'EUR' };
  return new Intl.NumberFormat(i18n.language, options).format(value);
};
