import { useTranslation } from 'react-i18next';
import { Tooltip } from 'react-tooltip';
import { IconButton } from 'shared-ui';
import { Menu, MenuItem } from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import '@szhsin/react-menu/dist/transitions/slide.css';

import styles from './NotificationCenter.module.scss';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import profileService, {
  Notification,
  NotificationType,
} from '../../services/profile.service';
import { NavigateFunction, useNavigate } from 'react-router-dom';

const notificationTypeMapping: {
  [key in NotificationType]: {
    title: string;
    description: string;
    action: (navigate: NavigateFunction) => void;
  };
} = {
  IMPORT_INVENTORY: {
    title: 'notification.import_inventory.title',
    description: 'notification.import_inventory.description',
    action: (navigate) => {
      // Navigate to inventory page
      navigate('/inventory/stock');
    },
  },
  SELECT_PRODUCTS: {
    title: 'notification.select_products.title',
    description: 'notification.select_products.description',
    action: (navigate) => {
      navigate('/onboarding/select-products');
    },
  },
  CREATE_PREPARATIONS: {
    title: 'notification.create_preparations.title',
    description: 'notification.create_preparations.description',
    action: () => {},
  },
  CREATE_RECIPES: {
    title: 'notification.create_recipes.title',
    description: 'notification.create_recipes.description',
    action: () => {},
  },
};

export const NotificationCenter = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    console.log('get notifications');
    profileService
      .getNotifications()
      .then((res) => {
        setNotifications(res);
      })
      .catch((err) => {
        console.log("couldn't get notifications", err);
      });
  }, []);

  const unreadedNumber = notifications.filter(
    (notification) => !notification.is_done
  ).length;

  return (
    <>
      <Menu
        transition
        align="end"
        gap={5}
        menuClassName={styles.notificationMenu}
        menuButton={
          <IconButton
            icon={
              <i
                className={classNames(
                  'fa-solid fa-bell',
                  !!unreadedNumber && styles.bellBubble
                )}
              />
            }
            tooltipMsg={t('notifications')}
            tooltipId="notif-tooltip"
          />
        }>
        <div className={styles.notificationHeader}>
          <h2 className={styles.notificationHeaderText}>Notifications</h2>
          <div className={styles.bubble}>
            <span>{unreadedNumber}</span>
          </div>
        </div>

        {notifications.map((notification) => (
          <MenuItem
            className={classNames(
              styles.notification,
              !notification.is_done && styles.unreaded
            )}
            key={notification.notification_uuid}
            onClick={() => {
              notificationTypeMapping[notification.type].action(navigate);
            }}>
            <h3 className={styles.notificationTitle}>
              {t(
                notificationTypeMapping[notification.type]
                  .title as unknown as TemplateStringsArray
              )}
            </h3>
            <p className={styles.description}>
              {t(
                notificationTypeMapping[notification.type]
                  .description as unknown as TemplateStringsArray
              )}
            </p>
          </MenuItem>
        ))}
      </Menu>

      <Tooltip className="tooltip" id="notif-tooltip" />
    </>
  );
};
