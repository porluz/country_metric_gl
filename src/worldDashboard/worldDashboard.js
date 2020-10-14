import { request, getCoordinates, formatDate } from '../utils';
import React, { useState, useCallback, useEffect } from 'react';
import './worldDashboard.css';
import * as d3 from 'd3';
import World from '../world/world';

const COUNTRY_FEATURE_DATA = 'http://localhost:3000/datasets/ne_110m_admin_0_countries.geojson';
const COUNTRY_METRIC_DATA = 'http://localhost:3000/datasets/metricData.json';
const GLOBAL_IMAGE_URL = 'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-day.jpg';

const getVal = (feature, selectedMetric) => {
  if(!feature.metricData) {
    return 0.0;
  }
  let metric = feature.metricData.find( m => m.metricName === selectedMetric.name);
  return metric.metricValue / selectedMetric.max;
};

const getMetricItems = (metrics) => 
  metrics.map(m => 
  <option key={m.name} value={m.name}>{m.name}</option>
  );

let colorScale = d3.scaleSequentialPow(d3.interpolateYlOrRd);
const metrics = [
  {
    name: 'tre',
    max: 1.0,
  },
  {
    name: 'risk_rating',
    max: 5,
  },
  {
    name: 'utilized',
    max: 50000000,
  }
];

const WorldDashboard = () => {

  const [countryFeatureData, setCountryFeatureData] = useState([]);
  const [countryMetricData, setCountryMetricData] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState();
  const [dates, setDates] = useState([]);
  const [sliderVal, setSliderVal] = useState(0);
  const [sliderMax, setSliderMax] = useState(0);
  const [sliderDisabled, setSliderDisabled] = useState('disabled');
  const [pointOfView, setPointofView] = useState();
  const [selectedMetric, setSelectedMetric] = useState(metrics[0]);
  const [selectedMetricName, setSelectedMetricName] = useState('tre');
  const [totalUtilized, setTotalUtilized] = useState(0.0);

  const getColorScale  = (feature) => {
    return colorScale(getVal(feature, selectedMetric));
  };

  useEffect(() => {

    const fetchData = async () => {
      const countryData = await request(COUNTRY_FEATURE_DATA);
      const metricData = await request(COUNTRY_METRIC_DATA);
 
      // extract dates
      const dates = Object.keys(metricData.China);
      const countries = Object.keys(metricData);


      const total = countries
      .reduce((acc, curr) => {
          return acc + parseFloat(metricData[curr][dates[dates.length - 1]][2].metricValue);
      }, 0);
      
      setTotalUtilized(total.toFixed(2));
 
      // update slider
      setSliderMax(dates.length - 1);
      setSliderVal(dates.length - 1);
      setSliderDisabled('');
      setCountryMetricData(metricData);
      setCountryFeatureData(countryData.features);
      setDates(Object.keys(metricData.China));
      setCurrentDate(dates[dates.length - 1]);
      setDataLoading(false);
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
          -1002.5
        );
      } catch (e) {
        console.log('Unable to set point of view.');
      }
    }

    fetchData();
    updatePointOfView();
  }, []);

  
  useEffect(() => {
    if(currentDate !== undefined) {
      for (let x = 0; x < countryFeatureData.length; x++) {
        const country = countryFeatureData[x].properties.NAME;
        if (countryMetricData[country]) {
          countryFeatureData[x].metricData = 
            countryMetricData[country][currentDate];
        } else {
          countryFeatureData[x].metricData = [
            {
              metricName: 'tre',
              metricValue: 0
            },
            {
              metricName: 'risk_rating',
              metricValue: 0
            },
            {
              metricName: 'utilized',
              metricValue: 0
            }
          ]
        }
      }
 
      const countries = Object.keys(countryMetricData);
      const total = countries
      .reduce((acc, curr) => {
          return acc + parseFloat(countryMetricData[curr][currentDate][2].metricValue);
      }, 0);
      
      setTotalUtilized(total.toFixed(2));

      setCountryFeatureData(countryFeatureData);
    }
  }, [selectedMetricName, dates, currentDate, countryMetricData]);

  useEffect(() => {
    let metricObj = metrics.find( m => m.name === selectedMetricName);
    setSelectedMetric(metricObj);
  }, [selectedMetricName, metrics]);


  return (
    <>
      <div className="top-info-container">
        <div className="title">Country Metrics</div>
        <div className="title-desc">
          {dataLoading ? 'Loading country metric data...' : 'Hover on a country or territory to see risk metrics'}
        </div>
      </div>
       <World
        globalImageUrl={GLOBAL_IMAGE_URL}
        getColorScale={getColorScale}
        backgroundColor={'#fff'}
        countryFeatureData={countryFeatureData}
        pointOfView={pointOfView}
        selectedMetricName={selectedMetricName}
      />
      <input
        className="slider"
        disabled={sliderDisabled}
        type="range"
        min="0"
        value={sliderVal}
        max={sliderMax}
        step="1"
        onChange={(event) => {
          setSliderVal(event.target.value);
          setCurrentDate(dates[event.target.value]);
        }}
      />
      <select
        name='name'
        className="metric-select"
        value={selectedMetricName}
        onChange={(event) => {
          let metricName = event.target.value;
          setSelectedMetricName(metricName);
        }}>
        {getMetricItems(metrics)}
      </select>
      {<p className="metric-date">as of {formatDate(dates[sliderVal])}</p>}

      {<p className="metric-totals">Total Utilized: {totalUtilized}</p>}
    </>
  );


}

export default WorldDashboard;
