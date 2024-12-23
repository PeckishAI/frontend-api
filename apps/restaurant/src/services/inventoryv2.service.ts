import { axiosClient, IngredientTMP } from './index';

const getIngredients = async (
  restaurantUUID: string
): Promise<IngredientTMP[]> => {
  const res = await axiosClient.get('/v2/ingredients/' + restaurantUUID);
  console.log('Res', res.data);

  return Object.keys(res.data).map<IngredientTMP>((key) => ({
    ingredient_uuid: key,
    ingredient_name: res.data[key]['ingredient_name'],
    par_level: res.data[key]['par_level'],
    quantity: res.data[key]['quantity'],
    base_unit: {
      unit_uuid: res.data[key]['unit_uuid'],
      unit_name: res.data[key]['unit_name'],
    },
    tags:
      res.data[key]['tags']?.map((tag: any) => ({
        tag_uuid: tag['tag_uuid'],
        tag_name: tag['tag_name'],
      })) || [],
    suppliers:
      res.data[key]['suppliers']?.map((supplier: any) => ({
        supplier_uuid: supplier['supplier_uuid'],
        supplier_name: supplier['supplier_name'],
        unit_cost: supplier['supplier_cost'],
        unit: {
          unit_uuid: supplier['supplier_unit_uuid'],
          unit_name: supplier['supplier_unit_name'],
        },
        conversion_factor: supplier['conversion_factor'],
        product_code: supplier['product_code'],
      })) || [],
    volume_unit: {
      unit_uuid: res.data[key]['volume_unit_uuid'],
      unit_name: res.data[key]['volume_unit_name'],
    },
    volume_quantity: res.data[key]['volume_quantity'],
  }));
};

const createIngredient = (
  restaurantUUID: string,
  ingredient: IngredientTMP
) => {
  console.log(ingredient);
  const FormattedIngredient = {
    ingredient_name: ingredient.ingredient_name,
    tags: ingredient.tags,
    par_level: ingredient.par_level,
    quantity: ingredient.quantity,
    unit_name: ingredient.base_unit?.unit_name,
    unit_uuid: ingredient.base_unit?.unit_uuid,
    suppliers: ingredient.suppliers,
    volume_unit_uuid: ingredient.volume_unit?.unit_uuid,
    volume_unit_name: ingredient.volume_unit?.unit_name,
    volume_quantity: ingredient.volume_quantity,
  };
  return axiosClient.post(
    '/v2/ingredients/' + restaurantUUID,
    FormattedIngredient
  );
};

const updateIngredient = (
  restaurantUUID: string,
  ingredient: IngredientTMP
) => {
  const ingredientFormated = {
    ingredient_uuid: ingredient.ingredient_uuid,
    ingredient_name: ingredient.ingredient_name,
    tags: ingredient.tags,
    par_level: ingredient.par_level,
    quantity: ingredient.quantity,
    suppliers: ingredient.suppliers,
    unit_uuid: ingredient.base_unit?.unit_uuid,
    unit_name: ingredient.base_unit?.unit_name,
    volume_unit_uuid: ingredient.volume_unit?.unit_uuid,
    volume_unit_name: ingredient.volume_unit?.unit_name,
    volume_quantity: ingredient.volume_quantity,
  };

  return axiosClient.post(
    `/v2/ingredients/${restaurantUUID}/ingredient/${ingredient.ingredient_uuid}/update`,
    ingredientFormated
  );
};

const deleteIngredient = (ingredient_uuid: string) => {
  return axiosClient.post('/inventory/' + ingredient_uuid + '/delete');
};

export const inventoryServiceV2 = {
  getIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
};
