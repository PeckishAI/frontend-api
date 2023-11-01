import Axios from './index';

export type ResponseMapPlaceApi = {
  name: string;
  placeId: string;
  address?: string;
  location?: { lat: number; lng: number };
};

const getAutocompletePlaces = (location: string) => {
  return Axios.get('/place/autocomplete/' + location);
};

const getPlaceLocation = (placeId: string) => {
  return Axios.get('/place/get-location/' + placeId);
};

export const mapService = { getAutocompletePlaces, getPlaceLocation };
