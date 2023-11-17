import { useEffect, useState } from 'react';
import styles from './OnboardRestaurant.module.scss';
import Stepper from './components/Stepper/Stepper';
import { useTitle } from 'shared-ui';

import OnboardProducts from './OnboardProducts/OnboardProducts';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { OnboardPreparations } from './OnboardPreparations/OnboardPreparations';

type RouteParams = {
  step: 'stock' | 'suppliers' | 'orders';
};

const getTabIndex = (tab?: string) => {
  if (tab === 'products') return 0;
  if (tab === 'preparations') return 1;
  if (tab === 'recipes') return 2;
  return 0;
};

const getTabName = (tabIndex: number) => {
  if (tabIndex === 0) return 'products';
  if (tabIndex === 1) return 'preparations';
  if (tabIndex === 2) return 'recipes';
  return 'products';
};

export const OnboardRestaurant = () => {
  const { t } = useTranslation();
  useTitle(t('pages.onboarding_selectProducts'));
  const navigate = useNavigate();

  const { step } = useParams<RouteParams>();

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    setCurrentStep(getTabIndex(step));
  }, [step]);

  return (
    <div>
      <Stepper
        steps={['Select products', 'Create preparations', 'Create recipes']}
        currentStep={currentStep}
        className={styles.stepper}
      />

      {currentStep === 0 ? (
        <OnboardProducts
          goNextStep={() => {
            // setCurrentStep(currentStep + 1);
            navigate({
              pathname: `/onboarding/${getTabName(currentStep + 1)}`,
            });
          }}
        />
      ) : currentStep === 1 ? (
        <OnboardPreparations />
      ) : null}

      {/* <div className={styles.bottomSection}>
        <Button type="primary" value="aa" />
      </div> */}
    </div>
  );
};
