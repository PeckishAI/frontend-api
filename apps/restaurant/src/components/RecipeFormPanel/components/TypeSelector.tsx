import { Button, Popup } from 'shared-ui';
import { useTranslation } from 'react-i18next';
import styles from './TypeSelector.module.scss';

type Props = {
  isVisible: boolean;
  itemName: string;
  onRequestClose: () => void;
  onSelectType: (type: 'ingredient' | 'preparation') => void;
};

const TypeSelector = ({
  isVisible,
  itemName,
  onRequestClose,
  onSelectType,
}: Props) => {
  const { t } = useTranslation(['common']);

  return (
    <Popup
      isVisible={isVisible}
      onRequestClose={onRequestClose}
      title={t('recipes.typeSelector.title', { name: itemName })}>
      <div className={styles.content}>
        <p className={styles.description}>
          {t('recipes.typeSelector.description')}
        </p>
        <div className={styles.buttonContainer}>
          <Button
            type="secondary"
            value={t('recipes.typeSelector.ingredient')}
            onClick={() => onSelectType('ingredient')}
          />
          <Button
            type="secondary"
            value={t('recipes.typeSelector.preparation')}
            onClick={() => onSelectType('preparation')}
          />
        </div>
      </div>
    </Popup>
  );
};

export default TypeSelector;
