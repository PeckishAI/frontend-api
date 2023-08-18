const local = {
  // API_URL: 'http://127.0.0.1:5000/api/',
  // API_URL: 'https://restaurant-api-zqjpx7oxsq-ew.a.run.app/',
  API_URL: 'https://api-gateway-k2w3p2ptza-ew.a.run.app',
};

const server = {
  API_URL: '',
};

export const config = process.env.NODE_ENV === 'development' ? local : server;
