import { Restaurant } from '../types/restaurant';

const API_BASE_URL = 'http://localhost:8080';

export const restaurantService = {
  async getRestaurants(): Promise<Restaurant[]> {
    const response = await fetch(`${API_BASE_URL}/restaurants/v2`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data as Restaurant[];
  }
};
