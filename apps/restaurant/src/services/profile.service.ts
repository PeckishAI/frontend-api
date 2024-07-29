import { axiosClient } from '.';

const BASE_URL = '/profile';

export type NotificationType =
  | 'IMPORT_INVENTORY'
  | 'SELECT_PRODUCTS'
  | 'CREATE_PREPARATIONS'
  | 'CREATE_RECIPES';

export type Notification = {
  notification_uuid: string;
  type: NotificationType;
  is_done: boolean;
  created_at: string;
};

const getNotifications = async (): Promise<Notification[]> => {
  const res = await axiosClient.get<Notification[]>(
    BASE_URL + '/notifications'
  );

  if (res.status !== 200) throw new Error('Error getting notifications');

  return res.data;
};

export default {
  getNotifications,
};
