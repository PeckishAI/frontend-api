import { GLOBAL_CONFIG } from 'shared-config';
import { Restaurant } from '../../../restaurant/src/store/useRestaurantStore';
import { Customer } from '../views/Customers/Customers';
import axios, { IngredientForCustomers } from './index';

type CustomersResponse = {
  restaurant_uuid: string;
  restaurant_name: string;
  city: string;
  country: string;
  street: string;
  postal_code: string;
}[];

type CustomersDetailResponse = {};

const getCustomers = async (supplierUUID: string): Promise<Customer[]> => {
  try {
    const res = await axios.get<CustomersResponse>(
      '/customers/' + supplierUUID
    );
    const customers: Customer[] = res.data.map((c) => ({
      uuid: c.restaurant_uuid,
      name: c.restaurant_name,
      address: c.street,
      city: c.city,
      country: c.country,
    }));
    return customers;
  } catch (error) {
    console.log(error);

    throw new Error(`Error fetching customers: ${error}`);
  }
};

const getCustomerDetail = async (
  restaurantId: string
): Promise<IngredientForCustomers[]> => {
  const res = await axios.get<CustomersDetailResponse>(
    GLOBAL_CONFIG.apiUrl + '/restaurant/inventory/' + restaurantId
  );

  // make mapping with res info
  const details: IngredientForCustomers[] = [
    { id: '', name: '', quantity: 0, safetyStock: 0, unit: '', ordered: false },
  ];
  return details;
};

const getShareLink = () => {
  console.log('request for getting share link');

  return axios.get('http://127.0.0.1:8080/api/customer/share-link');
};

export const customersService = {
  getCustomers,
  getCustomerDetail,
  getShareLink,
};
