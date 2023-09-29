import { GLOBAL_CONFIG } from 'shared-config';
import { userSession } from '@peckishai/user-management';
import { useFromStore } from './FromContext';

export const handleAuthentification = (
  accessToken: string,
  app: 'supplier' | 'restaurant'
) => {
  userSession.save(accessToken, true);

  const from = useFromStore.getState().from ?? '';

  if (app === 'restaurant')
    window.location.href =
      GLOBAL_CONFIG.restaurantUrl + from + '?token=' + accessToken;
  else
    window.location.href =
      GLOBAL_CONFIG.supplierUrl + from + '?token=' + accessToken;
};
