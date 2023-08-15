const local = {
  // API_URL: 'http://127.0.0.1:5000/api/',
  API_URL: 'https://restaurant-api-zqjpx7oxsq-ew.a.run.app/',
};

const server = {
  API_URL: '',
};

export const config = process.env.NODE_ENV === 'development' ? local : server;
