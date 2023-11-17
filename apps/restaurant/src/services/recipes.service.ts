import axios from './index';

export type RecipeCategory =
  | 'drinks'
  | 'starters'
  | 'mainCourses'
  | 'desserts'
  | 'snacks'
  | 'others';

export type RecipeType = 'recipe' | 'preparation' | 'product';

export type Recipe = {
  uuid: string;
  name: string;
  category: RecipeCategory;
  portion_price: number;
  portion_count: number;
  cost: number;
  margin: number;
  type: RecipeType;
  ingredients: {
    uuid: string;
    name: string;
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
  const res = await axios.get('/recipes/' + restaurantUUID, {
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
  pricePerPortion: number;
  portionsPerBatch: number;
  ingredients: {
    ingredient_uuid: string;
    quantity: number;
  }[];
};

const updateRecipe = (
  restaurantUUID: string,
  recipeUUID: string,
  data: FormRecipe
) => {
  return axios.post('/recipe/' + recipeUUID + '/update', {
    restaurant_uuid: restaurantUUID,
    recipe_name: data.name,
    category: data.category,
    portion_price: data.pricePerPortion,
    portion_count: data.portionsPerBatch,
    ingredients: data.ingredients,
  });
};

const createRecipe = (
  restaurantUUID: string,
  type: RecipeType,
  data: FormRecipe
) => {
  return axios.post('/recipes/' + restaurantUUID, {
    type,
    restaurant_uuid: restaurantUUID,
    recipe_name: data.name,
    category: data.category,
    portion_price: data.pricePerPortion,
    portion_count: data.portionsPerBatch,
    ingredients: data.ingredients,
  });
};

const deleteRecipe = (recipeId: string) => {
  return axios.post('/recipe/' + recipeId + '/delete');
};

export const recipesService = {
  getRecipes,
  createRecipe,
  updateRecipe,
  deleteRecipe,
};
