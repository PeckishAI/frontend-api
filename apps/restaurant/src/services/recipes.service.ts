import { axiosClient } from './index';

export type RecipeCategory =
  | 'drinks'
  | 'starters'
  | 'mainCourses'
  | 'desserts'
  | 'modifiers'
  | 'snacks'
  | 'preparations'
  | 'others';

export type RecipeType = 'recipe' | 'preparation' | 'modifier';

export type Recipe = {
  uuid: string;
  name: string;
  category: RecipeCategory;
  portion_price?: number;
  portion_count: number;
  cost: number;
  margin?: number;
  type: RecipeType;
  ingredients: {
    uuid: string;
    name: string;
    conversion_factor: string;
    unit_name: string;
    unit_uuid: string;
    quantity: number;
    unit: string;
    cost: number | null;
  }[];
  isOnboarded: boolean;
};

const getRecipes = async (
  restaurantUUID: string,
  type: 'all' | RecipeType = 'all'
): Promise<Recipe[]> => {
  const res = await axiosClient.get('/recipes/' + restaurantUUID, {
    params: {
      type,
    },
  });
  const convertedData: Recipe[] = Object.keys(res.data).map<Recipe>((key) => ({
    ...res.data[key],
    isOnboarded: res.data[key]['onboarded'],
    uuid: key,
    ingredients: res.data[key]['ingredients'].map((ingredient: any) => ({
      uuid: ingredient['ingredient_uuid'],
      name: ingredient['ingredient_name'],
      quantity: ingredient['quantity'],
      cost: ingredient['cost'],
      unit: ingredient['unit'],
    })),
  }));

  return convertedData;
};

type FormRecipe = {
  name: string;
  category: RecipeCategory;
  pricePerPortion?: number;
  portionsPerBatch: number;
  type: string;
  ingredients: {
    ingredient_unit_uuid: string;
    quantity: number;
    type: string;
    conversion_factor: number;
    recipe_unit_name: string;
    recipe_unit_uuid: string;
  }[];
};

const updateRecipe = (
  restaurantUUID: string,
  recipeUUID: string,
  data: FormRecipe
) => {
  return axiosClient.post('/recipe/' + recipeUUID + '/update', {
    restaurant_uuid: restaurantUUID,
    type: data.type,
    recipe_name: data.name,
    category: data.category,
    portion_price: data.pricePerPortion,
    portion_count: data.portionsPerBatch,
    ingredients: data.ingredients,
  });
};

const createRecipe = async (
  restaurantUUID: string,
  type: RecipeType,
  data: FormRecipe
) => {
  const res = await axiosClient.post('/recipes/' + restaurantUUID, {
    type,
    restaurant_uuid: restaurantUUID,
    recipe_name: data.recipe_name,
    category: data.category,
    portion_price: data.pricePerPortion,
    portion_count: data.portionsPerBatch,
    ingredients: data.ingredients,
  });

  return res.data.recipe_uuid as string;
};

const deleteRecipe = (recipeId: string, category: string) => {
  return axiosClient.post(
    '/recipe/' + recipeId + `/delete?category=${category}`
  );
};

export const recipesService = {
  getRecipes,
  createRecipe,
  updateRecipe,
  deleteRecipe,
};
