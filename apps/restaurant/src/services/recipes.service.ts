import { axiosClient } from './index';

export type RecipeCategory =
  | 'drinks'
  | 'starters'
  | 'mainCourses'
  | 'desserts'
  | 'modifiers'
  | 'snacks'
  | 'preparations'
  | 'others'
  | string;

export type RecipeType = 'recipe' | 'preparation' | 'modifier';

export type Recipe = {
  recipe_uuid: string;
  name: string;
  category: RecipeCategory;
  portion_price?: number;
  portion_count?: number;
  unit_name?: string;
  unit_uuid?: string;
  total_cost: number;
  total_margin?: number;
  type: RecipeType;
  ingredients: {
    item_uuid: string;
    item_name: string;
    conversion_factor: number;
    base_unit_name: string;
    base_unit_uuid: string;
    unit_name: string;
    unit_uuid: string;
    quantity: number;
    unit_cost?: number | null;
    type: string;
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
  console.log('Recipes : ', res.data);
  const convertedData: Recipe[] = Object.keys(res.data).map<Recipe>((key) => ({
    recipe_uuid: key,
    ...res.data[key],
  }));
  console.log('Recipes', convertedData);
  return convertedData;
};

// New function to get only preparations
const getPreparations = async (restaurantUUID: string): Promise<Recipe[]> => {
  return getRecipes(restaurantUUID, 'preparation');
};

type FormRecipe = {
  recipe_name: string;
  category: RecipeCategory;
  pricePerPortion?: number;
  portionsPerBatch?: number;
  quantity?: number; // For preparations
  unit_name?: string; // For preparations
  unit_uuid?: string; // For preparations
  type?: string;
  ingredients: {
    item_uuid: string;
    quantity: number;
    type?: string;
    conversion_factor: number;
    unit_uuid?: string;
    unit_name?: string;
  }[];
};

type FormPreparation = {
  preparation_name: string;
  portionsPerBatch?: number;
  quantity?: number;
  unit_name?: string;
  unit_uuid?: string;
  type?: string;
  ingredients: {
    item_uuid: string;
    quantity: number;
    type?: string;
    conversion_factor: number;
    unit_uuid?: string;
    unit_name?: string;
  }[];
};

const updateRecipe = (
  restaurantUUID: string,
  recipeUUID: string,
  data: any
) => {
  console.log('UpdateRecipe called with:', {
    restaurantUUID,
    recipeUUID,
    data,
  });
  return axiosClient.post(`/recipe/${restaurantUUID}/${recipeUUID}/update`, {
    type: data.type,
    recipe_name: data.recipe_name,
    category: data.category,
    portion_price: data.portion_price,
    portion_count: data.portion_count,
    unit_name: data.unit_name,
    unit_uuid: data.unit_uuid,
    ingredients: data.ingredients,
  });
};

const createRecipe = async (restaurantUUID: string, data: any) => {
  const res = await axiosClient.post('/recipes/' + restaurantUUID, {
    type: 'recipe',
    restaurant_uuid: restaurantUUID,
    recipe_name: data.recipe_name,
    category: data.category,
    portion_price: data.portion_price,
    portion_count: data.portion_count,
    ingredients: data.ingredients,
  });
  return res.data.recipe_uuid as string;
};

const deleteRecipe = (recipeId: string, category: string) => {
  return axiosClient.post(
    '/recipe/' + recipeId + `/delete?category=${category}`
  );
};

const createPreparation = async (restaurantUUID: string, data: any) => {
  const res = await axiosClient.post('/recipes/' + restaurantUUID, {
    type: 'preparation',
    restaurant_uuid: restaurantUUID,
    preparation_name: data.preparation_name,
    portion_count: data.portion_count,
    unit_uuid: data.unit_uuid,
    ingredients: data.ingredients,
  });
  return res.data.recipe_uuid as string;
};

const getImpactedRecipes = async (ingredientId: string): Promise<string[]> => {
  try {
    const response = await axiosClient.get(
      `/ingredients/${ingredientId}/impacted-recipes`
    );
    return response.data;
  } catch (error) {
    console.error('Error getting impacted recipes:', error);
    throw error;
  }
};

export const recipesService = {
  getRecipes,
  getPreparations,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getImpactedRecipes,
  createPreparation,
};
