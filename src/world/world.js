import React, { useState, useEffect, useRef } from 'react';
import Globe from 'react-globe.gl';
import * as d3 from 'd3';
import './world.css';

const flagEndpoint = 'https://corona.lmao.ninja/assets/img/flags';
let flagName;
const colorScale = d3.scaleSequentialPow(d3.interpolateYlOrRd).exponent(1 / 4);

const getVal = (feat) => {
  return feat.properties.POP_EST / 7800000000;
};

const getLabel = () => {

}
const World = ({ countryFeatureData, countryMetricData, dates, currentDate,
  selectedMetric, onUpdateCountryFeatureData, pointOfView }) => {
  const globeEl = useRef();
  const [hoverD, setHoverD] = useState();
  const [transitionDuration, setTransitionDuration] = useState(1000);

  useEffect(() => {
    setTimeout(() => {
      setTransitionDuration(4000);
    });
  }, [countryFeatureData.length]);


  // useEffect(() => {
  //   // Auto-rotate
  //   globeEl.current.controls().autoRotate = true;
  //   globeEl.current.controls().autoRotateSpeed = 0.3;
  //   globeEl.current.pointOfView({ altitude: 4 }, 5000);
  // }, []);
  

  return <Globe
    ref={globeEl}
    globeImageUrl="https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg"
    //pointOfView={pointOfView}
    polygonsData={countryFeatureData.features}
    polygonAltitude={d => d === hoverD ? 0.12 : 0.06}
    polygonCapColor={d => d === hoverD ? 'steelblue' : colorScale(getVal(d))}
    polygonSideColor={() => 'rgba(0, 100, 0, 0.15)'}
    polygonLabel={({ properties: d, metricData: metricData }) => {
      if (d.ADMIN === 'France') {
        flagName = 'fr';
      } else if (d.ADMIN === 'Norway') {
        flagName = 'no';
      } else {
        flagName = d.ISO_A2.toLowerCase();
      }
      
      let metric = metricData.find( m => m.metricName === selectedMetric);
      const metricVal = metric.metricValue;
      return `
        <div class="card">
          <img class="card-img" src="${flagEndpoint}/${flagName}.png" alt="flag" />
          <div class="container">
             <span class="card-title"><b>${d.NAME}</b></span> <br />
             <div class="card-spacer"></div>
             <hr />
             <div class="card-spacer"></div>
             <span>Population: ${d3.format('.3s')(d.POP_EST)}</span>
             <span>${selectedMetric}: ${metricVal}</span>
        `;
    }}
    onPolygonHover={setHoverD}
    polygonsTransitionDuration={transitionDuration}
  />;
};

export default World;
