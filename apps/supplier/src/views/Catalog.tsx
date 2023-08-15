import { useTranslation } from 'react-i18next';

type Props = {};

const Catalog = (props: Props) => {
  const { t } = useTranslation('common');
  return <div>{t('catalog')}</div>;
};

export default Catalog;
