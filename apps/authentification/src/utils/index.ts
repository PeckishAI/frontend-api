import { GLOBAL_CONFIG } from 'shared-config';
import { userSession } from 'user-management';

export const redirectToApplication = (
  accessToken: string,
  app: 'supplier' | 'restaurant'
) => {
  userSession.storeAuthentification(accessToken);
  if (app === 'restaurant') window.location.href = GLOBAL_CONFIG.restaurantUrl;
  else window.location.href = GLOBAL_CONFIG.supplierUrl;
};
