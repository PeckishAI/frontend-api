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
  portion_count?: number;
  quantity?: number; // For preparations
  unit_name?: string; // For preparations
  cost: number;
  margin?: number;
  type: RecipeType;
  ingredients: {
    uuid: string;
    name: string;
    conversion_factor: number;
    unit_name: string;
    unit_uuid: string;
    recipe_unit_name: string;
    recipe_unit_uuid: string;
    quantity: number;
    unit: string;
    cost: number | null;
  }[];
  isOnboarded: boolean;
};

// Updated getRecipes to handle fetching of both recipes and preparations
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
      conversion_factor: ingredient['conversion_factor'],
      unit_name: ingredient['unit_name'],
      unit_uuid: ingredient['unit_uuid'],
      recipe_unit_name: ingredient['recipe_unit_name'],
      recipe_unit_uuid: ingredient['recipe_unit_uuid'],
      quantity: ingredient['quantity'],
      cost: ingredient['cost'],
    })),
    quantity: res.data[key]['portion_count'] || undefined, // For preparations
    unit_name: res.data[key]['unit_name'] || undefined, // For preparations
    unit_uuid: res.data[key]['unit_uuid'] || undefined, // For preparations
  }));
  return convertedData;
};

// New function to get only preparations
const getPreparations = async (restaurantUUID: string): Promise<Recipe[]> => {
  return getRecipes(restaurantUUID, 'preparation');
};

type FormRecipe = {
  name: string;
  category: RecipeCategory;
  pricePerPortion?: number;
  portionsPerBatch?: number;
  quantity?: number; // For preparations
  unit_name?: string; // For preparations
  unit_uuid?: string; // For preparations
  type: RecipeType;
  ingredients: {
    ingredient_unit_uuid: string;
    quantity: number;
    type: string;
    conversion_factor: number;
    recipe_unit_name?: string;
    recipe_unit_uuid?: string;
  }[];
};

const updateRecipe = (
  restaurantUUID: string,
  recipeUUID: string,
  data: FormRecipe
) => {
  console.log('data', data);
  return axiosClient.post('/recipe/' + recipeUUID + '/update', {
    restaurant_uuid: restaurantUUID,
    type: data.type,
    recipe_name: data.name,
    category: data.category,
    portion_price:
      data.type === 'preparation' ? undefined : data.pricePerPortion,
    portion_count: data.type === 'preparation' ? undefined : data.portion_count,
    // For preparations, include quantity, unit_name, and unit_uuid
    quantity: data.type === 'preparation' ? data.quantity : undefined,
    unit_name: data.type === 'preparation' ? data.unit_name : undefined,
    unit_uuid: data.type === 'preparation' ? data.unit_uuid : undefined,
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
    portion_price: type === 'preparation' ? undefined : data.pricePerPortion,
    portion_count: type === 'preparation' ? undefined : data.quantity,
    quantity: type === 'preparation' ? data.quantity : undefined,
    unit_name: type === 'preparation' ? data.unit_name : undefined,
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
  getPreparations,
  createRecipe,
  updateRecipe,
  deleteRecipe,
};
