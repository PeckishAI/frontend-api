import './navbar.scss';
import { Tooltip } from 'react-tooltip';
import React from 'react';
import { useTranslation } from 'react-i18next';
import IconButton from '../../IconButton/IconButton';
type Props = {
  title: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  onLogout: () => void;
};

const Navbar = (props: Props) => {
  const { t } = useTranslation('common');
  return (
    <div className="navbar">
      <h2 className="page-title">{props.title}</h2>
      <div className="nav-actions">
        <IconButton
          icon={<i className="fa-solid fa-rotate"></i>}
          onClick={props.onRefresh}
          tooltipMsg={t('refresh')}
          tooltipId="nav-tooltip"
          loading={props.isRefreshing}
        />
        <IconButton
          icon={<i className="fa-solid fa-arrow-right-from-bracket"></i>}
          onClick={props.onLogout}
          tooltipMsg={t('logout')}
          tooltipId="nav-tooltip"
        />
        <Tooltip className="tooltip" id="nav-tooltip" />
      </div>
    </div>
  );
};

export default Navbar;
