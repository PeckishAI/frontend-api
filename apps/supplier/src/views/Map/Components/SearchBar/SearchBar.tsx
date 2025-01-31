import { Input, useDebounce, useDebounceEffect } from 'shared-ui';
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

  useDebounceEffect(
    () => {
      if (!researchPlace) {
        setAutocompletePLaces([]);
        return;
      }

      mapService
        .getAutocompletePlaces(researchPlace)
        .then((res) => {
          const places: ResponseMapPlaceApi[] = [];
          res.data.predictions.forEach((element) => {
            places.push({
              name: element.description,
              placeId: element.place_id,
            });
          });
          setAutocompletePLaces(places);
        })
        .catch((err) => {});
    },
    250,
    [researchPlace]
  );

  // const handleResearchPlaceChange = (value: string) => {

  // };

  const handleOnSuggestedPlaceClick = (place: ResponseMapPlaceApi) => {
    const newPlace = { ...place };
    mapService
      .getPlaceLocation(place.placeId)
      .then((res) => {
        newPlace.location = res.data.result.geometry.location;
        newPlace.address = res.data.result.formatted_address;
        props.onSuggestedPlaceClick(newPlace);
      })
      .catch((err) => {});
    setResearchPlace(newPlace.name);
  };

  return (
    <div className="search-bar">
      <i className="fa-solid fa-location-dot location-icon"></i>
      <Input
        placeholder="Enter restaurant name or city place"
        value={researchPlace}
        onChange={(value) => setResearchPlace(value)}
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
