import Axios from './index';

export type ResponseMapPlaceApi = {
  name: string;
  address: string;
  location: { lat: number; lng: number };
};

const getAutocompletePlaces = (location: string) => {
  return Axios.get('/place/autocomplete/' + location);
};

export const mapService = { getAutocompletePlaces };
