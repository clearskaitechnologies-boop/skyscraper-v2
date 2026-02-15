declare module "react-map-gl/mapbox" {
  import { ComponentType } from "react";

  export interface MapProps {
    initialViewState?: {
      longitude: number;
      latitude: number;
      zoom: number;
    };
    style?: React.CSSProperties;
    mapStyle?: string;
    mapboxAccessToken?: string;
  }

  export const Map: ComponentType<MapProps>;
}

declare module "mapbox-gl/dist/mapbox-gl.css";
