import classNames from 'classnames';
import './sidebarItem.scss';
import React from 'react';
import { NavLink } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

type Props = {
  name: string;
  icon: React.ReactNode;
  to: string;
  disable?: boolean;
};

const SidebarItem = (props: Props) => {
  const { t } = useTranslation(['onboarding']);

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (props.disable) {
      toast(t('onboarding.userNotOnboarded.msg'), {
        icon: (
          <i
            className="fa-solid fa-circle-info"
            style={{ color: 'var(--primaryColor)' }}></i>
        ),
        style: { textAlign: 'center' },
        duration: 4000,
      });
      e.preventDefault();
    }
  };

  return (
    <NavLink
      className={classNames(
        'sidebar-item',
        props.disable ? 'sidebar-item-disable' : ''
      )}
      to={props.to}
      onClick={handleClick}>
      <div className="icon-container">{props.icon}</div>
      <span>{props.name}</span>
    </NavLink>
  );
};

export default SidebarItem;
