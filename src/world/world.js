import React, { useState, useEffect, useRef } from 'react';
import Globe from 'react-globe.gl';

const World = (props) => {
  const globeEl = useRef();
  const [hoverD, setHoverD] = useState();
  const [transitionDuration, setTransitionDuration] = useState(1000);
  const countryFeatureData = props.countryFeatureData;
  const startingPointOfView = props.startingPointOfView;
  const getColorScale = props.getColorScale;
  const globalImageUrl = props.globalImageUrl;
  const backgroundColor= props.backgroundColor;

  useEffect(() => {
      setTimeout(() => {
        setTransitionDuration(4000);
        globeEl.current.pointOfView(startingPointOfView, 4000);
      }, 3000);
  }, [startingPointOfView]);

  useEffect(() => {
    // load data
      globeEl.current.pointOfView(props.pointOfView);
  }, [props.pointOfView]);

  return <Globe
    ref={globeEl}
    width={props.width}
    height={props.height}
    globeImageUrl={globalImageUrl}
    backgroundColor={backgroundColor}
    polygonsData={countryFeatureData}
    polygonAltitude={d => d === hoverD ? 0.12 : 0.06}
    polygonCapColor={d => d === hoverD ? 'steelblue' : getColorScale(d)}
    polygonSideColor={() => 'rgba(0, 100, 0, 0.15)'}
    polygonLabel={props.polygonLabel}
    onPolygonHover={setHoverD}
    polygonsTransitionDuration={transitionDuration}
  />;
};

export default World;
