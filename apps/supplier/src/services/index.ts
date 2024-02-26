import { GLOBAL_CONFIG } from 'shared-config';
import axios from 'axios';
import { applyAxiosInterceptors } from '@peckishai/user-management';

const axiosClient = axios.create({
  baseURL: GLOBAL_CONFIG.apiUrl + '/supplier',
});

// Apply axios interceptors to handle authentification
applyAxiosInterceptors(axiosClient);

export default axiosClient;

export * from './orders.service';
export * from './customers.service';
export * from './catalog.service';
export * from './map.service';
export * from './integrations.service';
export * from './supplier.service';
export * from './types';
