const devConfig = {
  authentificationUrl: 'http://localhost:5123',
  restaurantUrl: 'http://localhost:5124',
  supplierUrl: 'http://localhost:5125',

  cookieDomain: 'localhost',

  apiUrl: 'https://api-gateway-k2w3p2ptza-ew.a.run.app',

  GOOGLE_CLIENT_ID:
    '167544806451-lhqrqpn83tje89en5n73af3tiu3sm11o.apps.googleusercontent.com',
};

const stagingConfig = {
  authentificationUrl: 'https://coucou.iampeckish.com',
  restaurantUrl: 'https://ok.iampeckish.com',
  supplierUrl: 'https://supplier.iampeckish.com',

  cookieDomain: 'iampeckish.com',

  apiUrl: 'https://api-gateway-k2w3p2ptza-ew.a.run.app',

  GOOGLE_CLIENT_ID:
    '167544806451-lhqrqpn83tje89en5n73af3tiu3sm11o.apps.googleusercontent.com',
};

const prodConfig = {
  authentificationUrl: 'https://platform.iampeckish.com',
  restaurantUrl: 'https://restaurant.iampeckish.com',
  supplierUrl: 'https://supplier.iampeckish.com',

  cookieDomain: 'iampeckish.com',

  apiUrl: 'https://api-gateway-zqjpx7oxsq-ew.a.run.app',

  GOOGLE_CLIENT_ID:
    '902125317537-r9ck7q1bi9m01f1ilopjlvi2itrupdut.apps.googleusercontent.com',
};

export const GLOBAL_CONFIG =
  import.meta.env.MODE === 'development'
    ? devConfig
    : import.meta.env.VITE_CONFIG_MODE === 'staging'
    ? stagingConfig
    : prodConfig;
