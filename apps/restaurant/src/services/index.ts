import { applyAxiosInterceptors } from '@peckishai/user-management';
import axios from 'axios';
import { GLOBAL_CONFIG } from 'shared-config';

// Create an axios instance for the restaurant API
const axiosClient = axios.create({
  baseURL: GLOBAL_CONFIG.apiUrl + '/restaurant',
});

// Create an axios instance for the integrations API
const axiosIntegrationClient = axios.create({
  baseURL: GLOBAL_CONFIG.apiUrlIntegration,
});

// Apply axios interceptors to handle authentication
applyAxiosInterceptors(axiosClient);
applyAxiosInterceptors(axiosIntegrationClient);

// Export the axios instances and other services
export { axiosClient, axiosIntegrationClient };
export * from './inventory.service';
export * from './restaurant.service';
export * from './onboarding.service';
export * from './recipes.service';
export * from './supplier.service';
export * from './types';
export * from './transfer.service';
export * from './unit.service';
