import { request, getCoordinates, numberWithCommas, formatDate } from '../utils';
import React, { useState, useEffect, useRef } from 'react';
import './worldDashboard.css';
import World from '../world/world';

const COUNTRY_FEATURE_DATA = 'http://localhost:3000/datasets/ne_110m_admin_0_countries.geojson';
const COUNTRY_METRIC_DATA = 'http://localhost:3000/datasets/ne_110m_admin_0_countries.geojson';

const WorldDashboard = () => {

    const [countryFeatureData, setCountryFeatureData] = useState({ features: [] });
    const [countryMetricData, setCountryMetricData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
          const countryData = await request(COUNTRY_FEATURE_DATA);
          const countryMetricData = await request(COUNTRY_METRIC_DATA);
          setCountryFeatureData(countryData);
          setCountryMetricData(countryMetricData);
        };
      
        fetchData();
      }, []);

    return <World 
        countryFeatureData={countryFeatureData}
        countryMetricData={countryMetricData} /> 


}

export default WorldDashboard;
