export * from './inventory.service';
export * from './inventory.service';
export * from './restaurant.service';
export * from './onboarding.service';
export * from './types';

import { applyAxiosInterceptors } from 'user-management';
import axios from 'axios';
import { GLOBAL_CONFIG } from 'shared-config';

const axiosClient = axios.create({
  baseURL: GLOBAL_CONFIG.apiUrl,
});

export default axiosClient;

// Apply axios interceptors to handle authentification
applyAxiosInterceptors(axiosClient);
