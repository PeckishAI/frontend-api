import { useTranslation } from 'react-i18next';

const Catalog = () => {
  const { t } = useTranslation('common');
  return <div>{t('catalog')}</div>;
};

export default Catalog;
