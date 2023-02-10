import { request, formatDate } from "../utils";
import React, { useState, useEffect, useCallback } from "react";
import "./worldDashboard.css";
import * as d3 from "d3";
import World from "../world/world";

import useWindowSize from "../useWindowSize";

const COUNTRY_FEATURE_DATA = "./datasets/ne_110m_admin_0_countries.geojson";
const COUNTRY_METRIC_DATA = "./datasets/metricData.json";
const GLOBAL_IMAGE_URL =
  "https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-day.jpg";
const FLAG_ENDPOINT = "https://flagcdn.com/120x90";
const STARTING_POV_USA = { lat: 39.6, lng: -98.5, altitude: 2.6 };
const METRICS = [
  {
    name: "tre",
    max: 1.0,
  },
  {
    name: "risk_rating",
    max: 5,
  },
  {
    name: "utilized",
    max: 50000000,
  },
];

// determine color based on value from 0-1
const colorScale = d3.scaleSequentialPow(d3.interpolateYlOrRd);

// get value from 0-1 for the color scale
const getVal = (feature, selectedMetric) => {
  if (!feature.metricData) {
    return 0.0;
  }
  let metric = feature.metricData.find(
    (m) => m.metricName === selectedMetric.name
  );
  return metric.metricValue / selectedMetric.max;
};

// metric select items
const getMetricItems = () =>
  METRICS.map((m) => (
    <option key={m.name} value={m.name}>
      {m.name}
    </option>
  ));

// sum for totals
const sumMetricValue = (metricData, date, metricIndex) => {
  const countries = Object.keys(metricData);
  return countries.reduce((acc, curr) => {
    return acc + parseFloat(metricData[curr][date][metricIndex].metricValue);
  }, 0);
};
// mutator to update metric data based on date, within the country feature data
const updateFeatureData = (
  countryFeatureData,
  countryMetricData,
  currentDate
) => {
  for (let x = 0; x < countryFeatureData.length; x++) {
    const country = countryFeatureData[x].properties.NAME;
    if (countryMetricData[country]) {
      countryFeatureData[x].metricData =
        countryMetricData[country][currentDate];
    } else {
      countryFeatureData[x].metricData = [
        {
          metricName: "tre",
          metricValue: 0,
        },
        {
          metricName: "risk_rating",
          metricValue: 0,
        },
        {
          metricName: "utilized",
          metricValue: 0,
        },
      ];
    }
  }
  return countryFeatureData;
};

const WorldDashboard = () => {
  const [countryFeatureData, setCountryFeatureData] = useState([]);
  const [countryMetricData, setCountryMetricData] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState();
  const [dates, setDates] = useState([]);
  const [sliderVal, setSliderVal] = useState(0);
  const [sliderMax, setSliderMax] = useState(0);
  const [sliderDisabled, setSliderDisabled] = useState("disabled");
  const [selectedMetric, setSelectedMetric] = useState(METRICS[0]);
  const [selectedMetricName, setSelectedMetricName] = useState("tre");
  const [totalUtilized, setTotalUtilized] = useState(0.0);
  const [playBtnText, setPlayBtnTxt] = useState("Play");
  const [intervalId, setIntervalId] = useState();

  // need responsive width and height of the screen
  const size = useWindowSize();

  const getColorScale = (feature) => {
    return colorScale(getVal(feature, selectedMetric));
  };

  useEffect(() => {
    const fetchData = async () => {
      // get feature/country metric data
      const countryData = await request(COUNTRY_FEATURE_DATA);
      /* missing metric data for: 
      bahamas
      czechia
      dominican republic
      belize
      bosnia and her
      macedonia
      turkmenistan
      tajikistan
      yemen
      somaliland
      myanmar
      s. sudan
      dem rep congo
      w. sahara
      mali
      guinea bissau
      sierra leone
      central african rep
      eq guinea
      cote d’ovaire
      botswana
      malawi
      swaziland
      fr s. antarctic lands
      lesotho
      north korea
      solomon islands
      vanuatu */
      const metricData = await request(COUNTRY_METRIC_DATA);
      // extract dates
      const dates = Object.keys(metricData.China);
      // extract totals
      const total = sumMetricValue(metricData, dates[dates.length - 1], 2);
      // set slider
      setSliderMax(dates.length - 1);
      setSliderVal(dates.length - 1);
      setSliderDisabled("");
      //set data
      setCountryMetricData(metricData);
      setCountryFeatureData(countryData.features);
      setDates(Object.keys(metricData.China));
      setCurrentDate(dates[dates.length - 1]);
      setDataLoading(false);
      setTotalUtilized(total.toFixed(2));
    };

    fetchData();
  }, []);

  const polygonLabel = useCallback(
    ({ properties: d, metricData }) => {
      let flagName;
      if (d.ADMIN === "France") {
        flagName = "fr";
      } else if (d.ADMIN === "Norway") {
        flagName = "no";
      } else {
        flagName = d.ISO_A2.toLowerCase();
      }
      let metricHTML = "";
      for (let i = 0; i < metricData.length; i++) {
        const metricName = metricData[i].metricName;
        const metricVal = metricData[i].metricValue;
        if (metricName === selectedMetricName) {
          metricHTML =
            `<span class='card-selected-metric'>${metricName}: ${metricVal}</span><br>` +
            metricHTML;
        } else {
          metricHTML += `<span >${metricName}: ${metricVal}</span><br>`;
        }
      }
      if (metricData) {
        return (
          `
        <div class='card'>
          <img class='card-img' src='${FLAG_ENDPOINT}/${flagName}.png' alt='flag' />
          <div class='container'>
            <span class='card-title'><b>${d.NAME}</b></span> <br />
            <div class='card-spacer'></div>
            <hr />
            <div class='card-spacer'></div>
            <span>Population: ${d3.format(".3s")(d.POP_EST)}</span><br>
  
        ` + metricHTML
        );
      }
    },
    [selectedMetricName]
  );

  useEffect(() => {
    if (currentDate) {
      // get updated feature data
      const data = updateFeatureData(
        countryFeatureData,
        countryMetricData,
        currentDate
      );
      // get totals
      const total = sumMetricValue(countryMetricData, currentDate, 2);
      // set data
      setTotalUtilized(total.toFixed(2));
      setCountryFeatureData((c) => data);
    }
  }, [
    selectedMetricName,
    dates,
    currentDate,
    countryMetricData,
    countryFeatureData,
  ]);

  useEffect(() => {
    // update selected metric when current metric name is updated
    let metricObj = METRICS.find((m) => m.name === selectedMetricName);
    setSelectedMetric(metricObj);
  }, [selectedMetricName]);

  useEffect(() => {
    // update current date when slider value index is updated
    setCurrentDate(dates[sliderVal]);
  }, [sliderVal, dates]);

  // Move the slider incrementally by an interval
  // and play each date like a frame
  function play(event) {
    const playButton = event.target;
    if (playButton.innerText === "Play") {
      setPlayBtnTxt("Pause");
    } else {
      setPlayBtnTxt("Play");
      clearInterval(intervalId);
      return;
    }

    let sv = sliderVal;
    if (+sv === dates.length - 1) {
      setSliderVal(0);
      sv = 0;
    }
    const id = setInterval(() => {
      sv++;
      setSliderVal(sv);
      if (+sv === dates.length - 1) {
        setPlayBtnTxt("Play");
        clearInterval(intervalId);
      }
    }, 200);

    setIntervalId(id);
  }

  return (
    <>
      <div className="top-info-container">
        <div className="title">Country Metrics</div>
        <div className="title-desc">
          {dataLoading
            ? "Loading country metric data..."
            : "Hover on a country or territory to see risk metrics"}
        </div>
      </div>
      <div className="metrics">
        <span className="metrics-title">
          <p>Selected Metric</p>
        </span>
        <select
          name="name"
          className="metric-select"
          value={selectedMetricName}
          onChange={(event) => {
            setSelectedMetricName(event.target.value);
          }}
        >
          {getMetricItems()}
        </select>
      </div>
      <World
        width={size.width}
        height={size.height}
        globalImageUrl={GLOBAL_IMAGE_URL}
        getColorScale={getColorScale}
        backgroundColor={"#fff"}
        countryFeatureData={countryFeatureData}
        startingPointOfView={STARTING_POV_USA}
        selectedMetric={selectedMetric}
        polygonLabel={polygonLabel}
      />
      <div className="bottom-info-container">
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div className="timeline-container">
            <button className="play-button" onClick={play}>
              {playBtnText}
            </button>
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
              }}
            />
            <span className="slider-date">
              <p>{dates[sliderVal]}</p>
            </span>
          </div>
        </div>
        <div className="metric-totals">
          Total Metrics{" "}
          <span className="updated">as of {formatDate(dates[sliderVal])}</span>
        </div>
        <table className="metric-total-table">
          <thead>
            <tr>
              <th className="table-header">Utilized</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <span className="table-cell">{totalUtilized}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};

export default WorldDashboard;
