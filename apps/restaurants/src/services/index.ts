export * from './inventory.service';

import { applyAxiosInterceptors } from 'user-management';
import axios from 'axios';
import { GLOBAL_CONFIG } from 'shared-config';

const axiosClient = axios.create({
  baseURL: GLOBAL_CONFIG.apiUrl,
});

export default axiosClient;

// Apply axios interceptors to handle authentification
applyAxiosInterceptors(axiosClient);
