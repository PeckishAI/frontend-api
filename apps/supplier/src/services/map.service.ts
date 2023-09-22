import axios from './index';

const getAutocompletePlaces = (location: string) => {
  return axios.get('http://127.0.0.1:8080/api/place/autocomplete/' + location);
};

export const mapService = { getAutocompletePlaces };
