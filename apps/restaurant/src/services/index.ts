import { applyAxiosInterceptors } from 'user-management';
import axios from 'axios';
import { GLOBAL_CONFIG } from 'shared-config';

const axiosClient = axios.create({
  baseURL: GLOBAL_CONFIG.apiUrl,
});

// Apply axios interceptors to handle authentification
applyAxiosInterceptors(axiosClient);

export default axiosClient;
export * from './inventory.service';
export * from './restaurant.service';
export * from './onboarding.service';
export * from './recipes.service';
export * from './supplier.service';
export * from './types';
