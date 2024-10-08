const devConfig = {
  authentificationUrl: 'http://localhost:5123',
  restaurantUrl: 'http://localhost:5124',
  supplierUrl: 'http://localhost:5125',

  cookieDomain: 'localhost',

  apiUrl: 'https://api-gateway-k2w3p2ptza-ew.a.run.app',
  apiUrlIntegration: 'https://integrations-api-k2w3p2ptza-ew.a.run.app',

  GOOGLE_CLIENT_ID:
    '167544806451-lhqrqpn83tje89en5n73af3tiu3sm11o.apps.googleusercontent.com',
  APPLE_CLIENT_ID: 'com.peckish.web.dev',
};

const stagingConfig = {
  authentificationUrl: 'https://auth-frontend-k2w3p2ptza-ew.a.run.app',
  restaurantUrl: 'https://restaurant-frontend-k2w3p2ptza-ew.a.run.app',
  supplierUrl: 'https://supplier.iampeckish.com',

  cookieDomain: 'run.app',

  apiUrl: 'https://api-gateway-k2w3p2ptza-ew.a.run.app',
  apiUrlIntegration: 'https://integrations-api-k2w3p2ptza-ew.a.run.app',

  GOOGLE_CLIENT_ID:
    '167544806451-lhqrqpn83tje89en5n73af3tiu3sm11o.apps.googleusercontent.com',
  APPLE_CLIENT_ID: 'com.peckish.web.dev',
};

const prodConfig = {
  authentificationUrl: 'https://platform.iampeckish.com',
  restaurantUrl: 'https://restaurant.iampeckish.com',
  supplierUrl: 'https://supplier.iampeckish.com',

  cookieDomain: 'iampeckish.com',

  apiUrl: 'https://api-gateway-zqjpx7oxsq-ew.a.run.app',
  apiUrlIntegration: 'https://integrations-api-zqjpx7oxsq-ew.a.run.app',
  GOOGLE_CLIENT_ID:
    '902125317537-r9ck7q1bi9m01f1ilopjlvi2itrupdut.apps.googleusercontent.com',
  APPLE_CLIENT_ID: 'com.peckish.web',
};

export const GLOBAL_CONFIG =
  import.meta.env.MODE === 'development'
    ? devConfig
    : import.meta.env.VITE_CONFIG_MODE === 'staging'
      ? stagingConfig
      : prodConfig;
