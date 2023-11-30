import { useEffect, useState } from 'react';
import { Recipe, recipesService } from '../../../services';
import RecipeCard from '../../../components/RecipeCard/RecipeCard';
import styles from './OnboardPreparations.module.scss';
import { LoadingAbsolute, useTitle } from 'shared-ui';
import RecipeFormPanel from '../../../components/RecipeFormPanel/RecipeFormPanel';
import { useRestaurantStore } from '../../../store/useRestaurantStore';
import RecipeDetail from '../../../components/RecipeDetail/RecipeDetail';
import StepButtons from '../components/StepButtons/StepButtons';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

type Props = {
  goNextStep: () => void;
};

export const OnboardPreparations = (props: Props) => {
  const { t } = useTranslation();
  useTitle(t('pages.onboarding_createPreparations'));
  const navigate = useNavigate();

  const [addPreparationModalIsOpen, setAddPreparationModalIsOpen] =
    useState(false);
  const [preparationDetail, setPreparationDetail] = useState<Recipe | null>(
    null
  );
  const [preparations, setPreparations] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);

  const selectedRestaurantUUID = useRestaurantStore(
    (state) => state.selectedRestaurantUUID
  )!;

  useEffect(() => {
    if (!selectedRestaurantUUID) return;
    setLoading(true);
    recipesService
      .getRecipes(selectedRestaurantUUID, 'preparation')
      .then((preparations) => {
        setPreparations(preparations);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedRestaurantUUID]);

  const addPreparation = (preparation: Recipe) => {
    setPreparations([...preparations, preparation]);
  };

  // Handle recipe update or delete locally
  const handleRecipeChanged = (
    recipe: Recipe,
    action: 'deleted' | 'updated'
  ) => {
    if (action === 'deleted') {
      setPreparations(
        preparations.filter((preparation) => preparation.uuid !== recipe.uuid)
      );
      setPreparationDetail(null);
    } else if (action === 'updated') {
      setPreparationDetail(recipe);
      setPreparations(
        preparations.map((preparation) =>
          preparation.uuid === recipe.uuid ? recipe : preparation
        )
      );
    }
  };

  return (
    <div>
      <p className={styles.description}>
        {t('onboarding.restaurant.preparations.description')}
      </p>

      {loading && <LoadingAbsolute />}

      <div className={styles.cardGrid}>
        {preparations.map((preparation) => (
          <RecipeCard
            key={preparation.uuid}
            recipe={preparation}
            onClick={() => setPreparationDetail(preparation)}
          />
        ))}

        <div
          className={styles.addPreparationCard}
          onClick={() => setAddPreparationModalIsOpen(true)}>
          <i
            className={classNames(
              'fa-solid',
              'fa-plus',
              styles.addPreparationCardPlus
            )}
          />
          <p className={styles.addPreparationCardText}>
            {t('onboarding.restaurant.preparations.add-preparation')}
          </p>
        </div>
      </div>

      <RecipeDetail
        isOpen={!!preparationDetail}
        recipe={preparationDetail}
        onRecipeChanged={handleRecipeChanged}
        onRequestClose={() => setPreparationDetail(null)}
      />

      <RecipeFormPanel
        action="create"
        type="preparation"
        isOpen={addPreparationModalIsOpen}
        onRequestClose={() => setAddPreparationModalIsOpen(false)}
        onSubmitted={(preparation) => {
          setAddPreparationModalIsOpen(false);
          addPreparation(preparation);
        }}
      />

      <StepButtons
        onContinueLater={() => navigate('/')}
        onValidate={() => {
          props.goNextStep();
        }}
      />
    </div>
  );
};
