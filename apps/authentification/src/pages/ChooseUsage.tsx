import { useState } from 'react';

import authService from '../services/auth.service';
import { isAxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import { BsBoxes } from 'react-icons/bs';
import { GiCook } from 'react-icons/gi';
import { Navigate, useLocation } from 'react-router-dom';
import { Lottie } from 'shared-ui';
import { handleAuthentification } from '../utils';

export const ChooseUsage = () => {
  const { t } = useTranslation(['error', 'common']);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { state } = useLocation();

  const handleChoice = (type: 'supplier' | 'restaurant') => () => {
    if (loading) return;
    setLoading(true);

    authService
      .chooseUsage(type, state.access_token)
      .then(() => {
        handleAuthentification(state.access_token, type);
      })
      .catch((err) => {
        if (isAxiosError(err) && err.response) {
          switch (err.response.status) {
            case 400:
              setErrorMessage(t('error:choose-usage.bad-args'));
              break;
            case 500:
              setErrorMessage(t('error:unknown-error'));
              break;
          }
        }
      })
      .finally(() => setLoading(false));
  };

  if (!state || !state.access_token || state.user.client_type) {
    return <Navigate to={'/'} />;
  }

  return (
    <main className="Auth">
      <div className="image-section">
        <img />
      </div>
      <div className="form-section">
        <h1 className="company-name">peckish</h1>

        <h1 className="title">{t('common:choose-usage.title')}</h1>
        <p className="description">{t('common:choose-usage.description')}</p>
        {errorMessage && <p className="form-error">{errorMessage}</p>}

        <div className="choice-row">
          <div className="choice-card" onClick={handleChoice('supplier')}>
            <BsBoxes className="icon" />
            <p className="title">{t('common:choose-usage.supplier.name')}</p>
            <p className="description">
              {t('common:choose-usage.supplier.description')}
            </p>
          </div>
          <div className="choice-card" onClick={handleChoice('restaurant')}>
            <GiCook className="icon" />
            <p className="title">{t('common:choose-usage.restaurant.name')}</p>
            <p className="description">
              {t('common:choose-usage.restaurant.description')}
            </p>
          </div>
        </div>
      </div>
      {loading && (
        <div className="loading-fullscreen">
          <Lottie width={'150px'} type="loading" />
        </div>
      )}
    </main>
  );
};
