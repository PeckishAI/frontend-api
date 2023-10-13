import { Input } from 'shared-ui';
import './style.scss';
import { useState } from 'react';
import { mapService, ResponseMapPlaceApi } from '../../../../services';

type Props = {
  onSuggestedPlaceClick: (place: ResponseMapPlaceApi) => void;
};

const SearchBar = (props: Props) => {
  const [researchPlace, setResearchPlace] = useState<string>('');
  const [autocompletePlaces, setAutocompletePLaces] = useState<
    ResponseMapPlaceApi[]
  >([]);

  const handleResearchPlaceChange = (value: string) => {
    setResearchPlace(value);
    mapService
      .getAutocompletePlaces(value)
      .then((res) => {
        const places: ResponseMapPlaceApi[] = [];
        res.data.results.forEach((element) => {
          places.push({
            name: element.name,
            address: element.formatted_address,
            location: element.geometry.location,
          });
        });
        setAutocompletePLaces(places);
      })
      .catch((err) => {});
  };

  const handleOnSuggestedPlaceClick = (place: ResponseMapPlaceApi) => {
    setResearchPlace(place.name);
    props.onSuggestedPlaceClick(place);
  };

  return (
    <div className="search-bar">
      <i className="fa-solid fa-location-dot location-icon"></i>
      <Input
        placeholder="Enter restaurant name or city place"
        value={researchPlace}
        onChange={handleResearchPlaceChange}
        className="map-input"
      />
      <div className="suggestion-dropdown">
        <ul>
          {autocompletePlaces.map((place, i) => (
            <li key={i} onClick={() => handleOnSuggestedPlaceClick(place)}>
              <p className="name">{place.name}</p>
              <p className="location">{place.address}</p>
            </li>
          ))}
        </ul>
      </div>
      <i className="fa-solid fa-magnifying-glass search-icon"></i>
    </div>
  );
};

export default SearchBar;
