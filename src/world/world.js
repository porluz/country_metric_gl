import React, { useState, useEffect, useCallback, useRef } from 'react';
import Globe from 'react-globe.gl';
import * as d3 from 'd3';
import './world.css';

const flagEndpoint = 'https://corona.lmao.ninja/assets/img/flags';

const World = (props) => {
  const globeEl = useRef();
  const [hoverD, setHoverD] = useState();
  const [transitionDuration, setTransitionDuration] = useState(1000);
  const countryFeatureData = props.countryFeatureData;
  //const pointOfView = props.pointOfView;
  const getColorScale = props.getColorScale;
  const selectedMetricName = props.selectedMetricName;
  const globalImageUrl = props.globalImageUrl;
  const backgroundColor= props.backgroundColor;

  useEffect(() => {
    // load data
      globeEl.current.pointOfView({lat: 39.6, lng: -98.5, altitude: 1.5}, 4000);
  }, []);

  useEffect(() => {
    // load data
      globeEl.current.pointOfView(props.pointOfView);
  }, [props.pointOfView]);

  return <Globe
    ref={globeEl}
    height={600}
    globeImageUrl={globalImageUrl}
    backgroundColor={backgroundColor}
    polygonsData={countryFeatureData}
    polygonAltitude={d => d === hoverD ? 0.12 : 0.06}
    polygonCapColor={d => d === hoverD ? 'steelblue' : getColorScale(d)}
    polygonSideColor={() => 'rgba(0, 100, 0, 0.15)'}
    polygonLabel={({ properties: d, metricData }) => {
      let flagName;
      if (d.ADMIN === 'France') {
        flagName = 'fr';
      } else if (d.ADMIN === 'Norway') {
        flagName = 'no';
      } else {
        flagName = d.ISO_A2.toLowerCase();
      }
      let metricHTML = ''
      for(let i = 0; i < metricData.length; i++) {
        const metricName = metricData[i].metricName;
        const metricVal = metricData[i].metricValue;
        if(metricName === selectedMetricName) {
          metricHTML = `<span class="card-selected-metric">${metricName}: ${metricVal}</span><br>` + metricHTML
        } else {
          metricHTML += `<span >${metricName}: ${metricVal}</span><br>`
        }
      }
      if(metricData) {
        return `
          <div class="card">
            <img class="card-img" src="${flagEndpoint}/${flagName}.png" alt="flag" />
            <div class="container">
              <span class="card-title"><b>${d.NAME}</b></span> <br />
              <div class="card-spacer"></div>
              <hr />
              <div class="card-spacer"></div>
              <span>Population: ${d3.format('.3s')(d.POP_EST)}</span><br>

          ` + metricHTML;
      }
    }}
    onPolygonHover={setHoverD}
    polygonsTransitionDuration={transitionDuration}
  />;
};

export default World;
