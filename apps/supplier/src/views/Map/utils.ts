import { LatLng, LatLngExpression } from 'leaflet';

const hexCellSide = 0.5; // hexagons are set to 500m per side
const xHexSizeKm = hexCellSide * (3 / 2); // hexagon size on x axe
const yHexSizeKm = hexCellSide * Math.sqrt(3); // hexagon size on y axe

// Latitude coeficient to switch degree to distance
const latCoef = (latRef: number) => {
  const lat = latRef * (Math.PI / 180);
  return (
    (111132.954 - 559.822 * Math.cos(2 * lat) + 1.175 * Math.cos(4 * lat)) /
    1000
  );
};

// Longitude coeficient to switch degree to distance
const lngCoef = (latRef: number) => {
  const R0 = 6371; // earth radius in km refered to equator
  const e = 0.0818192; // exenctricity of the earth
  const e2 = Math.pow(e, 2);
  const lat = latRef * (Math.PI / 180);
  const R =
    (R0 * (1 - e2)) / Math.pow(1 - e2 * Math.pow(Math.sin(lat), 2), 1.5);

  return (2 * Math.PI * R * Math.cos(lat)) / 360;
};

// Convert latidude to distance in kilometers
const latToKm = (lat: number) => lat * latCoef(lat);

// Convert longitude to distance in kilometers
const lngToKm = (lng: number, latRef: number) => {
  return lngCoef(latRef) * lng;
};

// Convert distance in kilometers to latitude degree
const kmToLat = (distance: number, latRef: number) => {
  return distance / latCoef(latRef);
};

// Convert distance in kilometers to longitude degree
const kmToLng = (distance: number, latRef: number) => {
  return distance / lngCoef(latRef);
};

// Private function
// This fonction calculates and adjusts the distance of map corner related to the ref position ( equator in our case )
const calculateCornerDistance = (
  distance: number,
  type: 'lat' | 'lng',
  cornerType: 'northEast' | 'southWest'
) => {
  const hexSize = type === 'lat' ? yHexSizeKm : xHexSizeKm;

  const occurenceNb = distance / hexSize;
  let res = 0;
  if (cornerType === 'southWest') {
    res = Math.floor(occurenceNb) - 1; // -1 to apply an offset and cover bit more map screen
  } else {
    res = Math.ceil(occurenceNb) + 1; // 1 to apply an offset and cover bit more map screen
  }

  //   if (cornerType === 'southWest') {
  //     res = Math.ceil(occurenceNb);
  //   } else {
  //     res = Math.floor(occurenceNb);
  //   }

  // To fix the always even display of turf.
  // Bug explaination : first hex columns is always full but it shouldn't, this tip fixes this problem by adding a new row
  if (type === 'lng' && res % 2 === 0 && cornerType === 'southWest') {
    res--;
  }

  res *= hexSize;

  return res;
};

/**
 * Get the relatif latitude and longitude position for one corner by giving lat lng of a map corner
 * @param coordinates map corner position
 * @param cornerType the boundarie position (southWest or northEst)
 * @returns new corner position [lat, lng]
 */
const getGridCornerPosition = (
  coordinates: LatLng,
  cornerType: 'northEast' | 'southWest'
) => {
  // Convert coordinates to distance (from 0;0 => equator)
  const latDistance = latToKm(coordinates.lat);
  const lngDistance = lngToKm(coordinates.lng, coordinates.lat);

  // Get the distance of the computed point
  const yDistance = calculateCornerDistance(latDistance, 'lat', cornerType);
  const xDistance = calculateCornerDistance(lngDistance, 'lng', cornerType);

  const cornerPosition: LatLngExpression = {
    lat: kmToLat(yDistance, coordinates.lat),
    lng: kmToLng(xDistance, coordinates.lat),
  };
  return cornerPosition;
};

export const mapUtils = {
  latToKm,
  lngToKm,
  kmToLat,
  kmToLng,
  getGridCornerPosition,
};
