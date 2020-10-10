import { request, getCoordinates, numberWithCommas, formatDate } from '../utils';
import React, { useState, useEffect, useRef } from 'react';
import './worldDashboard.css';
import * as d3 from 'd3';
import World from '../world/world';

const COUNTRY_FEATURE_DATA = 'http://localhost:3000/datasets/ne_110m_admin_0_countries.geojson';
const COUNTRY_METRIC_DATA = 'http://localhost:3000/datasets/metricData.json';
const colorScale = d3.scaleSequentialPow(d3.interpolateYlOrRd).exponent(1 / 4);
const getVal = (feat) => {
  return feat.properties.POP_EST / 7800000000;
};

const WorldDashboard = () => {

  const [countryFeatureData, setCountryFeatureData] = useState({ features: [] });
  const [countryMetricData, setCountryMetricData] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [currentDate, setCurrentDate] = useState();
  const [dates, setDates] = useState([]);
  const [sliderVal, setSliderVal] = useState(0);
  const [sliderMax, setSliderMax] = useState(0);
  const [sliderDisabled, setSliderDisabled] = useState('');
  const [pointOfView, setPointofView] = useState();

  useEffect(() => {
    const fetchData = async () => {
      const countryData = await request(COUNTRY_FEATURE_DATA);
      const countryMetricData = await request(COUNTRY_METRIC_DATA);
      setCountryFeatureData(countryData);
      setCountryMetricData(countryMetricData);
      setDataLoading(false);

      // extract dates
      const dates = Object.keys(countryMetricData.China);
      setDates(Object.keys(countryMetricData.China));
      setCurrentDate(dates.length - 1);
      // update slider
      setSliderMax(dates.length - 1);
      setSliderVal(dates.length - 1);
      setSliderDisabled('disabled');
    };

    const updatePointOfView = async () => {
      // Get coordinates
      try {
        const { latitude, longitude } = await getCoordinates();

        setPointofView(
          {
            lat: latitude,
            lng: longitude,
          },
          1000
        );
      } catch (e) {
        console.log('Unable to set point of view.');
      }
    }
    fetchData();
    updatePointOfView();
  }, []);

  useEffect(() => {
    if(!currentDate) {
      return;
    }
    for (let x = 0; x < countryFeatureData.features.length; x++) {
      const country = countryFeatureData.features[x].properties.NAME;
      if (countryMetricData[country]) {
        countryFeatureData.features[x].metricData = 
          countryMetricData[country][dates[currentDate]]
      } else {
        countryFeatureData.features[x].metricData = [
          {
            metricName: 'tre',
            metricValue: 0
          }
        ]
      }
    }
  
    const maxVal = Math.max(...countryFeatureData.features.map(getVal));
    colorScale.domain([0, maxVal]);
    setCountryFeatureData(countryFeatureData);
  }, [currentDate]);

  return (
    <>
      <div className="top-info-container">
        <div className="title">Country Metrics</div>
        <div className="title-desc">
          {dataLoading ? 'Loading country metric data...' : 'Hover on a country or territory to see risk metrics'}
        </div>
      </div>
      <World
        countryFeatureData={countryFeatureData}
        countryMetricData={countryMetricData}
        currentDate={currentDate}
        dates={dates}
        onUpdateCountryFeatureData={setCountryFeatureData}
        pointOfView={pointOfView}
        selectedMetric={'tre'}
      />
      <input
        className="slider"
        disabled={sliderDisabled}
        type="range"
        min="0"
        max={sliderMax}
        step="1"
        onChange={() => setCurrentDate(sliderVal)}
      />
      {/* <p>as of {formatDate(dates[sliderVal])}</p> */}
    </>
  );


}

export default WorldDashboard;
