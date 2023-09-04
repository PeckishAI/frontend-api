import './navbar.scss';
import { Tooltip } from 'react-tooltip';
import React from 'react';
import { useTranslation } from 'react-i18next';
type Props = {
  title: string;
  refreshIcon: React.ReactNode;
  onRefresh: () => void;
  onLogout: () => void;
};

const Navbar = (props: Props) => {
  const { t } = useTranslation('common');
  return (
    <div className="navbar">
      <h2 className="page-title">{props.title}</h2>
      <div className="nav-actions">
        <div
          className="refresh"
          onClick={props.onRefresh}
          data-tooltip-id="nav-tooltip"
          data-tooltip-content={t('refresh')}>
          {props.refreshIcon}
        </div>
        <div
          className="my-account icon"
          data-tooltip-id="nav-tooltip"
          data-tooltip-content={t('logout')}
          onClick={props.onLogout}>
          <i className="fa-solid fa-arrow-right-from-bracket"></i>
        </div>
        <Tooltip className="tooltip" id="nav-tooltip" />
      </div>
    </div>
  );
};

export default Navbar;
