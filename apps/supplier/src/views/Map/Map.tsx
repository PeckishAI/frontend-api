import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { LatLngExpression, Map as LeafletMap } from 'leaflet';
import hexGrid from '@turf/hex-grid';
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson';
import 'leaflet/dist/leaflet.css'; // Importez les styles Leaflet
import './style.scss';
import POIWindow from './Components/POIWindow/POIWindow';
import Hexagon from './Components/Hexagon/Hexagon';
import { useEffect, useRef, useState } from 'react';
import { ResponseMapPlaceApi } from '../../services';
import SearchBar from './Components/SearchBar/SearchBar';
import ZoomControl from './Components/ZoomControl/ZoomControl';
import ControlLayer from './Components/ControlLayer/ControlLayer';

type RestaurantMap = {
  name: string;
  location: string;
  pos: { lat: number; lng: number };
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

const Map = () => {
  const [clickedRestaurant, setClickRestaurant] = useState<
    RestaurantMap | undefined
  >(undefined);
  const [clickedPlace, setClickedPlace] = useState<
    ResponseMapPlaceApi | undefined
  >(undefined);
  const mapRef = useRef<LeafletMap | null>(null);
  const [mapIsReady, setMapIsReady] = useState(false);
  const [hexagons, setHexagons] = useState<LatLngExpression[][]>([]);
  const [clickedHexagons, setClickedHexagon] = useState<
    LatLngExpression[][] | undefined
  >(undefined);
  const [hexagonEnable, setHexagonEnable] = useState(true);

  useEffect(() => {
    if (!mapRef.current || !mapIsReady) return;
    const map = mapRef.current;

    const getMapCornersCoordinates = () => {
      const bounds = mapRef.current?.getBounds();

      const bbox: BBox2d = [
        bounds!.getSouthWest().lng,
        bounds!.getSouthWest().lat,
        bounds!.getNorthEast().lng,
        bounds!.getNorthEast().lat,
      ]; // [minX, minY, maxX, maxY]

      const hexagon = hexGrid(bbox, 500, { units: 'meters' });
      const deuxiemeehexagonmgl: LatLngExpression[][] = hexagon.features.map(
        (feature) =>
          feature.geometry.coordinates[0].map(([lon, lat]) => [lat, lon])
      );

      setHexagons(deuxiemeehexagonmgl);
    };

    map.on('load', () => {
      getMapCornersCoordinates();
    });

    map.on('moveend', () => {
      getMapCornersCoordinates();
    });

    map.on('zoomend', () => {
      if (hexagonEnable) {
        mapRef.current!.setMaxZoom(15);
        mapRef.current!.setMinZoom(13);
      } else {
        mapRef.current!.setMaxZoom(19);
        mapRef.current!.setMinZoom(1);
      }
    });

    getMapCornersCoordinates();
  }, [mapIsReady, hexagonEnable]);

  const handleMarkerClicked = (index: number) => {
    setClickRestaurant(restaurantLocations[index]);
  };

  const handleOnWindowClose = () => {
    setClickRestaurant(undefined);
  };

  const handleClickedPlaceChange = (place: ResponseMapPlaceApi) => {
    setClickedPlace(place);
    mapRef.current?.setView([place.location.lat, place.location.lng], 14);
  };

  const handleOnHexagonClick = () => {};

  return (
    <div className="map">
      <MapContainer
        className="map-component"
        ref={(ref) => {
          mapRef.current = ref;
          setMapIsReady(true);
        }}
        center={
          clickedPlace !== undefined
            ? [clickedPlace.location.lat, clickedPlace.location.lng]
            : [52.370966, 4.898553]
        }
        zoom={14}
        maxZoom={hexagonEnable ? 15 : undefined}
        minZoom={hexagonEnable ? 13 : undefined}
        style={{ height: '80vh', width: '100%' }}
        scrollWheelZoom={true}
        zoomControl={false}
        doubleClickZoom={true}>
        <TileLayer
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
        <ZoomControl />
        {hexagonEnable &&
          hexagons.map((hexagon, i) => (
            <Hexagon
              key={i}
              hexagon={hexagon}
              onHexagonClick={handleOnHexagonClick}
            />
          ))}
        <ControlLayer
          hexagonEnable={hexagonEnable}
          onToogleHexagon={() => setHexagonEnable((state) => !state)}
        />
      </MapContainer>
      <POIWindow onClose={handleOnWindowClose} restaurant={clickedRestaurant} />
      <SearchBar onSuggestedPlaceClick={handleClickedPlaceChange} />
    </div>
  );
};

export default Map;
