import React from 'react';
import { CivicMap, CivicMapProps } from './CivicMap';

export interface MapPlaceholderProps extends CivicMapProps {}

export const MapPlaceholder: React.FC<MapPlaceholderProps> = (props) => {
  return <CivicMap {...props} />;
};

export { CivicMap };
export default MapPlaceholder;
