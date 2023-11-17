import { FaCheck } from 'react-icons/fa';
import styles from './Stepper.module.scss';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

type Props = {
  currentStep: number;
  steps: string[];
  className?: string;
};

const Stepper = (props: Props) => {
  const { t } = useTranslation();

  return (
    <div className={classNames(styles.stepper, props.className)}>
      {props.steps.map((step, i) => {
        return (
          <div
            key={`${step}-${i}`}
            className={classNames(
              styles.step,
              i === props.currentStep && styles.stepInProgress,
              i < props.currentStep && styles.stepFilled
            )}>
            <div>
              <div className={styles.stepCircle}>
                {i < props.currentStep && (
                  <FaCheck className={styles.checkMark} />
                )}
              </div>

              {i < props.steps.length - 1 && (
                <div className={styles.connexionLineContainer}>
                  <div className={classNames(styles.connexionLineInner)} />
                </div>
              )}
            </div>

            <div className={styles.stepTextContainer}>
              <p className={styles.stepNumber}>
                {t('stepper.step', { step: i + 1 })}
              </p>
              <h3 className={styles.stepTitle}>{step}</h3>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Stepper;
