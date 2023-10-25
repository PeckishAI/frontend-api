import { useEffect, useState } from 'react';
import styles from './OnboardRestaurant.module.scss';
import Stepper from './components/Stepper/Stepper';
import {
  Button,
  Input,
  LabeledInput,
  useDebounce,
  useDebounceEffect,
  useDebounceMemo,
} from 'shared-ui';
import {
  Ingredient,
  Recipe,
  inventoryService,
  recipesService,
} from '../../services';
import { useRestaurantStore } from '../../store/useRestaurantStore';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import { FaCheck, FaSearch } from 'react-icons/fa';
import Fuse from 'fuse.js';
import OnboardProducts from './OnboardProducts/OnboardProducts';

type Props = {};

export const OnboardRestaurant = (props: Props) => {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);

  console.log('Rerender OnboardRestaurant');

  return (
    <div>
      <Stepper
        steps={['Select products', 'Create preparations', 'Create recipes']}
        currentStep={currentStep}
      />
      {/* <div style={{ display: 'flex', marginTop: 50, marginBottom: 25 }}>
        <button
          onClick={() => {
            setCurrentStep(currentStep - 1);
          }}>
          Back
        </button>

        <p>Step :{currentStep}</p>

        <button
          onClick={() => {
            setCurrentStep(currentStep + 1);
          }}>
          Next
        </button>
      </div> */}
      <p className={styles.description}>
        Pour commencer veuillez sélectionner dans vos recettes celles qui sont
        considérées comme des produits non transformés. Par exemple, le Coca
        Cola est un produit vendu tel quel, il n'est pas composé d'autres
        d'ingrédients.
      </p>
      Nous avons pré-sélectionné pour vous les produits les plus courants.
      <OnboardProducts />
      {/* <div className={styles.bottomSection}>
        <Button type="primary" value="aa" />
      </div> */}
      <div className={styles.buttonsContainer}>
        <a
          className={styles.continueLater}
          onClick={() => {
            navigate('/');
          }}>
          Continuer plus tard
        </a>

        <Button
          type="primary"
          value="Valider la sélection"
          onClick={() => {
            setCurrentStep(currentStep + 1);
          }}
        />
      </div>
    </div>
  );
};
