const devConfig = {
  authentificationUrl: 'http://app.localhost:5123',
  restaurantUrl: 'http://restaurant.app.localhost:5124',
  supplierUrl: 'http://app.localhost:5125',

  cookieDomain: 'app.localhost',

  apiUrl: 'https://api-gateway-k2w3p2ptza-ew.a.run.app',

  GOOGLE_CLIENT_ID:
    '167544806451-lhqrqpn83tje89en5n73af3tiu3sm11o.apps.googleusercontent.com',
};

const prodConfig = {
  authentificationUrl: 'https://iampeckish.com',
  restaurantUrl: 'https://restaurant.iampeckish.com',
  supplierUrl: 'https://supplier.iampeckish.com',

  cookieDomain: 'iampeckish.com',

  apiUrl: 'https://api-gateway-k2w3p2ptza-ew.a.run.app',

  GOOGLE_CLIENT_ID:
    '167544806451-lhqrqpn83tje89en5n73af3tiu3sm11o.apps.googleusercontent.com',
};

export const GLOBAL_CONFIG =
  process.env.NODE_ENV === 'development' ? devConfig : prodConfig;
