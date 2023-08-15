export * from './inventory.service';

import { config } from '../local_config/config';
import axios from 'axios';

const Axios = axios.create({
  baseURL: config.API_URL,
});

export default Axios;
