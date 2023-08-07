const local = {
  API_URL: 'http://127.0.0.1:5000/api/',
};

const server = {
  API_URL: '',
};

export const config = process.env.NODE_ENV === 'development' ? local : server;
