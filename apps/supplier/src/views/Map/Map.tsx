import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { Map as LeafletMap, divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Importez les styles Leaflet
import './style.scss';
import POIWindow from './Components/POIWindow/POIWindow';
import { useRef, useState } from 'react';
import { Input } from 'shared-ui';
import { mapService } from '../../services';

type RestaurantMap = {
  name: string;
  location: string;
  pos: { lat: number; lng: number };
};

type ResponseMapPlaceApi = {
  name: string;
  address: string;
  location: { lat: number; lng: number };
};
const restaurantLocations: RestaurantMap[] = [
  {
    name: 'Restaurant A',
    location: '23 street A, City A, Cuntry A',
    pos: { lat: 52.380427, lng: 4.888123 },
  },
  {
    name: 'Restaurant B',
    location: '23 street B, City B, Cuntry B',
    pos: { lat: 52.370327, lng: 4.894656 },
  },
  {
    name: 'Restaurant C',
    location: '23 street C, City C, Cuntry C',
    pos: { lat: 52.356783, lng: 4.890065 },
  },
  {
    name: 'Restaurant D',
    location: '23 street D, City D, Cuntry D',
    pos: { lat: 52.367583, lng: 4.882814 },
  },
];
function CustomZoomButtons() {
  const map = useMap();

  const handleZoomIn = () => {
    map.zoomIn();
  };

  const handleZoomOut = () => {
    map.zoomOut();
  };

  return (
    <div className="zoom-control">
      <i className="fa-solid fa-plus" onClick={handleZoomIn}></i>
      <i className="fa-solid fa-minus" onClick={handleZoomOut}></i>
    </div>
  );
}
const markerIcon = divIcon({
  html: '<i class="fa fa-map-marker fa-4x">',
  iconSize: [40, 40],
  className: 'myDivIcon',
  iconAnchor: [0, 0],
});

const Map = () => {
  const [clickedRestaurant, setClickRestaurant] = useState<
    RestaurantMap | undefined
  >(undefined);
  const [placeResearch, setplaceResearch] = useState<string>('');
  const [autocompletePlaces, setAutocompletePLaces] = useState<
    ResponseMapPlaceApi[]
  >([]);
  const [clickedPlace, setClickedPlace] = useState<
    ResponseMapPlaceApi | undefined
  >(undefined);
  const mapRef = useRef<LeafletMap | null>(null);

  const handleMarkerClicked = (index: number) => {
    setClickRestaurant(restaurantLocations[index]);
  };

  const handleOnWindowClose = () => {
    setClickRestaurant(undefined);
  };

  const handlePlaceReasearchChange = (value: string) => {
    setplaceResearch(value);
    mapService
      .getAutocompletePlaces(value)
      .then((res) => {
        let places: ResponseMapPlaceApi[] = [];
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

  return (
    <div className="map">
      <MapContainer
        className="map-component"
        ref={mapRef}
        center={
          clickedPlace !== undefined
            ? [clickedPlace.location.lat, clickedPlace.location.lng]
            : [52.370966, 4.898553]
        }
        zoom={14}
        style={{ height: '80vh', width: '100%' }}
        scrollWheelZoom={true}
        zoomControl={false}
        doubleClickZoom={true}>
        <TileLayer
          // attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://api.mapbox.com/styles/v1/peckishmap/clmoz2ujr01zr01qufplwc2pl/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoicGVja2lzaG1hcCIsImEiOiJjbG1veXhheXYwMTJrMnNuMnY1bDlldWQxIn0.U8tKZ1H0NJyM0BQCz9zS8w"
          maxZoom={19}
        />
        {restaurantLocations.map((restaurant, i) => (
          <Marker
            position={[restaurant.pos.lat, restaurant.pos.lng]}
            eventHandlers={{
              click: () => handleMarkerClicked(i),
              mouseover: (event) => event.target.openPopup(),
              mouseout: (event) => event.target.closePopup(),
            }}>
            <Popup className="popup-marker">
              <span className="popup-marker-text">{restaurant.name}</span>
            </Popup>
          </Marker>
        ))}

        <CustomZoomButtons />
      </MapContainer>
      <POIWindow onClose={handleOnWindowClose} restaurant={clickedRestaurant} />
      <div className="toolbar">
        <i className="fa-solid fa-location-dot location-icon"></i>
        <Input
          placeholder="Enter restaurant name or city place"
          value={placeResearch}
          onChange={handlePlaceReasearchChange}
          className="map-input"
        />
        <div className="suggestion-dropdown">
          <ul>
            {autocompletePlaces.map((place, i) => (
              <li
                key={i}
                onClick={() => {
                  setClickedPlace(place);
                  setplaceResearch(place.name);
                  mapRef.current?.setView(
                    [place.location.lat, place.location.lng],
                    14
                  );
                }}>
                <p className="name">{place.name}</p>
                <p className="location">{place.address}</p>
              </li>
            ))}
          </ul>
        </div>
        <i className="fa-solid fa-magnifying-glass search-icon"></i>
      </div>
    </div>
  );
};

export default Map;
