import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { LatLngExpression, Map as LeafletMap, Icon } from 'leaflet';
import hexGrid from '@turf/hex-grid';
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson';
import 'leaflet/dist/leaflet.css'; // Importez les styles Leaflet
import './style.scss';
import POIWindow from './Components/POIWindow/POIWindow';
import Hexagon, { HexagonType } from './Components/Hexagon/Hexagon';
import { useEffect, useRef, useState } from 'react';
import { ResponseMapPlaceApi } from '../../services';
import SearchBar from './Components/SearchBar/SearchBar';
import ZoomControl from './Components/ZoomControl/ZoomControl';
import ControlLayer from './Components/ControlLayer/ControlLayer';
import CustomerData from './Components/CustomerData/CustomerData';
import HexagonData from './Components/HexagonData/HexagonData';
import { mapUtils } from './utils';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl: icon,
  shadowUrl: iconShadow,
});

type RestaurantMap = {
  name: string;
  location: string;
  pos: { lat: number; lng: number };
};

const restaurantLocations: RestaurantMap[] = [
  {
    name: 'Cannibale Royale',
    location: 'Handboogstraat 17a, 1012 XM Amsterdam',
    pos: { lat: 52.368014, lng: 4.890343 },
  },
  {
    name: 'Poké Perfect',
    location: 'Nieuwendijk 13HS, 1012 LZ Amsterdam',
    pos: { lat: 52.378613, lng: 4.895055 },
  },
  {
    name: 'JOE & THE JUICE',
    location: 'Van Baerlestraat 40, 1071 CH Amsterdam',
    pos: { lat: 52.35841, lng: 4.878273 },
  },
  {
    name: 'The Butcher',
    location: 'Albert Cuypstraat 129, 1072 CS Amsterdam',
    pos: { lat: 52.355776, lng: 4.892097 },
  },
];

const Map = () => {
  const [clickedRestaurant, setClickRestaurant] = useState<
    RestaurantMap | undefined
  >(undefined);
  const [placeResearched, setResearchedPlace] = useState<
    ResponseMapPlaceApi | undefined
  >(undefined);
  const mapRef = useRef<LeafletMap | null>(null);
  const [mapIsReady, setMapIsReady] = useState(false);
  const [hexagons, setHexagons] = useState<HexagonType[]>([]);
  const [clickedHexagons, setClickedHexagon] = useState<HexagonType[]>([]);
  const [hexagonEnable, setHexagonEnable] = useState(true);
  const [showRestaurants, setShowRestaurants] = useState(true);
  const [POIWindowState, setPOIWindowState] = useState<
    'empty' | 'zone' | 'customer'
  >('empty');
  const [POIWindowIsReduce, setPOIWindowIsReduce] = useState(true);

  const [debugPoints, setDebugPoints] = useState<LatLngExpression[]>([]);

  useEffect(() => {
    if (!mapRef.current || !mapIsReady) return;
    const map = mapRef.current;

    const getMapCornersCoordinates = () => {
      const bounds = mapRef.current?.getBounds();

      const corners = {
        northEast: bounds!.getNorthEast(),
        southWest: bounds!.getSouthWest(),
      };

      const southWestCorner = mapUtils.getGridCornerPosition(
        corners.southWest,
        'southWest'
      );

      const northEastCorner = mapUtils.getGridCornerPosition(
        corners.northEast,
        'northEast'
      );

      setDebugPoints([
        [southWestCorner.lat, southWestCorner.lng],
        [northEastCorner.lat, northEastCorner.lng],
      ]);

      const bbox: BBox2d = [
        southWestCorner.lng,
        southWestCorner.lat,
        northEastCorner.lng,
        northEastCorner.lat,
      ]; // [minX, minY, maxX, maxY]

      const hexagonGrid = hexGrid(bbox, 500, { units: 'meters' });
      const hexagons: HexagonType[] = hexagonGrid.features.map(
        (feature, i) => ({
          id: i,
          coordinates: feature.geometry.coordinates[0].map(([lon, lat]) => [
            lat,
            lon,
          ]),
        })
      );

      setHexagons(hexagons);
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
    setPOIWindowState('customer');
    setPOIWindowIsReduce(false);
  };

  const handleClickedPlaceChange = (place: ResponseMapPlaceApi) => {
    setResearchedPlace(place);
    mapRef.current?.setView([place.location.lat, place.location.lng], 14);
  };

  const handleOnHexagonClicked = (hexagon: HexagonType, selected: boolean) => {
    const newList = [...(clickedHexagons ?? [])];

    if (!selected) {
      const selectedIndex = newList.findIndex((item) => item.id === hexagon.id);
      if (selectedIndex !== -1) {
        newList.splice(selectedIndex, 1);
      }
    } else {
      newList.push(hexagon);
    }
    setClickedHexagon(newList);
    if (clickedHexagons.length === 0 && newList.length !== 0) {
      // means that's the first hexagons clicked
      setPOIWindowIsReduce(false);
    }
    if (newList.length === 0) {
      setPOIWindowState('empty');
      setPOIWindowIsReduce(true);
    } else {
      setPOIWindowState('zone');
    }
  };

  const handleToggleHexagonEnable = () => {
    setHexagonEnable((state) => !state);
    setClickedHexagon([]);
    setPOIWindowState('empty');
  };

  const handleToggleShowRestaurants = () => {
    setShowRestaurants((state) => !state);
  };

  return (
    <div className="map">
      <MapContainer
        className="map-component"
        ref={(ref) => {
          mapRef.current = ref;
          setMapIsReady(true);
        }}
        center={
          placeResearched !== undefined
            ? [placeResearched.location.lat, placeResearched.location.lng]
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
        {showRestaurants &&
          restaurantLocations.map((restaurant, i) => (
            <Marker
              key={i}
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
        {debugPoints.map((point, i) => (
          <Marker key={i} position={point} />
        ))}
        <ZoomControl />
        {hexagonEnable &&
          hexagons.map((hexagon, i) => (
            <Hexagon
              key={i}
              hexagon={hexagon}
              onHexagonClicked={(selected) =>
                handleOnHexagonClicked(hexagon, selected)
              }
            />
          ))}
      </MapContainer>
      <SearchBar onSuggestedPlaceClick={handleClickedPlaceChange} />
      <ControlLayer
        hexagonEnable={hexagonEnable}
        toggleHexagon={handleToggleHexagonEnable}
        showRestaurants={showRestaurants}
        toggleShowRestaurants={handleToggleShowRestaurants}
      />
      <POIWindow
        isEmpty={POIWindowState === 'empty'}
        isReduce={POIWindowIsReduce}
        toggle={() => setPOIWindowIsReduce((state) => !state)}>
        {POIWindowState === 'customer' && (
          <CustomerData restaurant={clickedRestaurant} />
        )}
        {POIWindowState === 'zone' && (
          <HexagonData hexagonList={clickedHexagons} />
        )}
      </POIWindow>
    </div>
  );
};

export default Map;
