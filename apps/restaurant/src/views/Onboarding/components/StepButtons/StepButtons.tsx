import { Button } from 'shared-ui';
import styles from '../../OnboardRestaurant.module.scss';

type Props = {
  onValidate: () => void;
  onContinueLater: () => void;
};

const StepButtons = ({ onValidate, onContinueLater }: Props) => {
  return (
    <div className={styles.buttonsContainer}>
      <a className={styles.continueLater} onClick={onContinueLater}>
        Continuer plus tard
      </a>

      <Button
        type="primary"
        value="Valider la sélection"
        onClick={onValidate}
      />
    </div>
  );
};

export default StepButtons;
