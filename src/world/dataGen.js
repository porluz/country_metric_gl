const oldData = require('../../public/datasets/metricData.json');
const fs = require('fs');

function exportFile(data) {
    const filename = 'data.json';
    const jsonStr = JSON.stringify(data);

    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(jsonStr));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
    // .toFixed(3)
}

function getTre(country, dates, metricData) {
    let start = Math.floor(Math.random() * 11);
    if(start == 0) {
        start == 0.1;
    } else {
        start = start / 10;
    }
    for (let i = 0; i < dates.length; i++) {
        let dir = getRndInteger(1,2);
        let changePercent = getRndInteger(1,20) / 100;
        let next;

        console.log('start: ' + start);
        console.log('dir: ' + dir);
        console.log('changePercent: ' + changePercent);
        if(dir == 1) {
            // positive
            start += start * changePercent;
        } else {
            // negative
            start -=  start * changePercent;
        }

        console.log('start: ' + start);
        start = parseFloat(start.toFixed(3));
        start = clamp(start, 0.1, 0.99);


        console.log('next: ' + start);
        let rr = parseInt(setRiskRating(start).toFixed());
        // store next
        metricData[country][dates[i]] = [
            {
                metricName: 'tre',
                metricValue: start,
                min: 0.0,
                max: 1.0
            },
            {
                metricName: 'risk_rating',
                metricValue: rr,
                min: 1,
                max: 5
            },
            {
                metricName: 'utilized',
                metricValue: 0,
                min: 1,
                max: 50000000
            }
        ]
    }
}

function setRiskRating(tre) {
    let rr;

    console.log('tre: ' + tre);
    if (tre >= 0 && tre <= 0.2) {
        rr = 1;
    }
    if (tre > 0.2 && tre <= 0.4) {
        rr = 2;
    }
    if (tre > 0.4 && tre <= 0.6) {
        rr = 3;
    }
    if (tre > 0.6 && tre <= 0.8) {
        rr = 4
    }
    if (tre > 0.8 && tre <= 1.0) {
        rr = 5;
    }
    return rr;
}

function setUtilized(country, dates, metricData) {
    let start = getRndInteger(1, 50000000);

    for (let i = 0; i < dates.length; i++) {
        let dir = getRndInteger(1,2);
        let changePercent = getRndInteger(1,20) / 100;
        if(dir == 1) {
            // positive
            start +=  (start * changePercent);
        } else {
            // negative
            start -=  (start * changePercent);
        }
        start = clamp(start, 1, 50000000);

        start = parseFloat(start.toFixed(2));
        metricData[country][dates[i]][2].metricValue = start;

    }   
}

function generateCountryMetricData() {
    let countries = Object.keys(oldData);

    const dates = Object.keys(oldData.China);

    countries.forEach(c => {
        getTre(c, dates, oldData);
        setUtilized(c, dates, oldData);
    })


    let data = JSON.stringify(oldData);
    fs.writeFileSync('newData.json', data);

}

function clamp(num, min, max) {
    return num <= min ? min : num >= max ? max : num;
  }

generateCountryMetricData();