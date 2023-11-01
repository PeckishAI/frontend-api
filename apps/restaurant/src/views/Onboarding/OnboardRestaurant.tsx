import { useState } from 'react';
import styles from './OnboardRestaurant.module.scss';
import Stepper from './components/Stepper/Stepper';
import { useTitle } from 'shared-ui';

import OnboardProducts from './OnboardProducts/OnboardProducts';
import { useTranslation } from 'react-i18next';

export const OnboardRestaurant = () => {
  const { t } = useTranslation();
  useTitle(t('pages.onboarding_selectProducts'));

  const [currentStep, setCurrentStep] = useState(0);

  return (
    <div>
      <Stepper
        steps={['Select products', 'Create preparations', 'Create recipes']}
        currentStep={currentStep}
      />

      <p className={styles.description}>
        Pour commencer veuillez sélectionner dans vos recettes celles qui sont
        considérées comme des produits non transformés. Par exemple, le Coca
        Cola est un produit vendu tel quel, il n'est pas composé d'autres
        d'ingrédients.
        <br />
        <br />
        Nous avons pré-sélectionné pour vous les produits les plus courants.
      </p>

      <OnboardProducts goNextStep={() => setCurrentStep(currentStep + 1)} />
      {/* <div className={styles.bottomSection}>
        <Button type="primary" value="aa" />
      </div> */}
    </div>
  );
};
