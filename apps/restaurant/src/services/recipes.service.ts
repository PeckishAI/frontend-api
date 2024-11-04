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
  recipeUUID: string;
  recipeName: string;
  category: RecipeCategory;
  portionCount?: number;
  pricePerPortion?: number;
  costPerPortion?: number;
  marginPerPortion?: number;
  quantity?: number; // For preparations
  unitName?: string; // For preparations
  unitUUID?: string; // For preparations
  type: RecipeType;
  ingredients: {
    ingredientUUID: string;
    ingredientName: string;
    conversionFactor: number;
    unitName: string;
    unitUUID: string;
    recipeUnitName: string;
    recipeUnitUUID: string;
    quantity: number;
    cost: number | null;
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
  console.log(res.data);
  const convertedData: Recipe[] = Object.keys(res.data).map<Recipe>((key) => ({
    recipeUUID: key,
    recipeName: res.data[key]['name'],
    category: res.data[key]['category'],
    portionCount: res.data[key]['portion_count'] || undefined,
    pricePerPortion: res.data[key]['portion_price'] || undefined,
    type: res.data[key]['type'],
    isOnboarded: res.data[key]['onboarded'],
    ingredients: res.data[key]['ingredients'].map((ingredient: any) => ({
      ingredientUUID: ingredient['ingredient_uuid'],
      ingredientName: ingredient['ingredient_name'],
      conversionFactor: ingredient['conversion_factor'],
      unitName: ingredient['unit_name'],
      unitUUID: ingredient['unit_uuid'],
      recipeUnitName: ingredient['recipe_unit_name'],
      recipeUnitUUID: ingredient['recipe_unit_uuid'],
      quantity: ingredient['quantity'],
      cost: ingredient['cost'],
    })),
    unitName: res.data[key]['unit_name'] || undefined, // For preparations
    unitUUID: res.data[key]['unit_uuid'] || undefined, // For preparations
  }));

  console.log(convertedData);

  return convertedData;
};

// New function to get only preparations
const getPreparations = async (restaurantUUID: string): Promise<Recipe[]> => {
  return getRecipes(restaurantUUID, 'preparation');
};

type FormRecipe = {
  recipeName: string;
  category: RecipeCategory;
  pricePerPortion?: number;
  portionsPerBatch?: number;
  quantity?: number; // For preparations
  unitName?: string; // For preparations
  unitUUID?: string; // For preparations
  type: RecipeType;
  ingredients: {
    ingredientUnitUUID: string;
    quantity: number;
    type: string;
    conversionFactor: number;
    recipeUnitName?: string;
    recipeUnitUUID?: string;
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
    recipe_name: data.recipeName,
    category: data.category,
    portion_price:
      data.type === 'preparation' ? undefined : data.pricePerPortion,
    portion_count:
      data.type === 'preparation' ? undefined : data.portionsPerBatch,
    // For preparations, include quantity, unit_name, and unit_uuid
    quantity: data.type === 'preparation' ? data.quantity : undefined,
    unit_name: data.type === 'preparation' ? data.unitName : undefined,
    unit_uuid: data.type === 'preparation' ? data.unitUUID : undefined,
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
    recipe_name: data.recipeName,
    category: data.category,
    portion_price: type === 'preparation' ? undefined : data.pricePerPortion,
    portion_count: type === 'preparation' ? undefined : data.quantity,
    quantity: type === 'preparation' ? data.quantity : undefined,
    unit_name: type === 'preparation' ? data.unitName : undefined,
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
