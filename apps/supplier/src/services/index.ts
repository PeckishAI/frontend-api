import { GLOBAL_CONFIG } from 'shared-config';
import axios from 'axios';

const Axios = axios.create({
  baseURL: GLOBAL_CONFIG.apiUrl + '/supplier',
});

export default Axios;

export * from './orders.service';
export * from './customers.service';
export * from './catalog.service';
export * from './map.service';
export * from './integrations.service';
export * from './types';
