import { axiosClient, IngredientTMP, Unit } from './index';

const getUnits = async (restaurantUUID: string): Promise<Unit[]> => {
  try {
    const res = await axiosClient.get(`/units/${restaurantUUID}`);

    const units: Unit[] = res.data.map((unitData: any) => ({
      unit_name: unitData.unit_name,
      unit_uuid: unitData.unit_uuid,
    }));

    return units;
  } catch (error) {
    console.error('Error fetching units:', error);
    return [];
  }
};

const getReferenceUnits = async (): Promise<Unit[]> => {
  try {
    const res = await axiosClient.get(`/units_reference`);
    const units: Unit[] = res.data.map((unitData: any) => ({
      unit_name: unitData.unit_name,
      unit_uuid: unitData.unit_uuid,
    }));

    return units;
  } catch (error) {
    console.error('Error fetching units:', error);
    return [];
  }
};

const createUnit = async (restaurantUUID: string, unit_name: string) => {
  const FormattedIngredient = {
    unit_name: unit_name,
  };
  const res = await axiosClient.post(
    `/units/${restaurantUUID}`,
    FormattedIngredient
  );
  return res.data as Promise<Unit>;
};

export const unitServiceV2 = {
  getUnits,
  getReferenceUnits,
  createUnit,
};
