import React, { useState, useEffect, useRef } from 'react';
import Globe from 'react-globe.gl';
import * as d3 from 'd3';
import { request, getCoordinates, numberWithCommas, formatDate } from '../utils';
import './world.css';

const flagEndpoint = 'https://corona.lmao.ninja/assets/img/flags';
let flagName;
const colorScale = d3.scaleSequentialPow(d3.interpolateYlOrRd).exponent(1 / 4);

const getVal = (feat) => {
  return feat.properties.POP_EST / 7800000000;
};

//setup data
// world.polygonsData(countriesWithCovid);
//document.querySelector('.title-desc').innerHTML =
//  'Hover on a country or territory to see risk metrics';

//dates = Object.keys(countries.China);

// Set slider values
//slider.max = dates.length - 1;
//slider.value = dates.length - 1;

//slider.disabled = false;
//playButton.disabled = false;

//updateCounters();
//updatePolygonsData();

//updatePointOfView();

const World = ({ countryFeatureData, countryMetricData }) => {
  const globeEl = useRef();
  const [hoverD, setHoverD] = useState();
  const [transitionDuration, setTransitionDuration] = useState(1000);


  useEffect(() => {
    // setup
    setTimeout(() => {
      setTransitionDuration(4000);
    });
  }, [countryFeatureData.length]);
    

  useEffect(() => {
    // Auto-rotate
    globeEl.current.controls().autoRotate = true;
    globeEl.current.controls().autoRotateSpeed = 0.3;
    globeEl.current.pointOfView({ altitude: 4 }, 5000);
  }, []);

  
  return <Globe
    ref={globeEl}
    globeImageUrl="https://unpkg.com/three-globe/example/img/earth-dark.jpg"
    polygonsData={countryFeatureData.features}
    polygonAltitude={d => d === hoverD ? 0.12 : 0.06}
    polygonCapColor={d => d === hoverD ? 'steelblue' : colorScale(getVal(d))}
    polygonSideColor={() => 'rgba(0, 100, 0, 0.15)'}
    polygonLabel={({ properties: d, countryData: c }) => {
      if (d.ADMIN === 'France') {
        flagName = 'fr';
      } else if (d.ADMIN === 'Norway') {
        flagName = 'no';
      } else {
        flagName = d.ISO_A2.toLowerCase();
      }
      return `
        <div class="card">
          <img class="card-img" src="${flagEndpoint}/${flagName}.png" alt="flag" />
          <div class="container">
             <span class="card-title"><b>${d.NAME}</b></span> <br />
             <div class="card-spacer"></div>
             <hr />
             <div class="card-spacer"></div>
             <span>Population: ${d3.format('.3s')(d.POP_EST)}</span>
          </div>
        </div>
      `;
    }}
    onPolygonHover={setHoverD}
    polygonsTransitionDuration={transitionDuration}
  />;
};

export default World;
