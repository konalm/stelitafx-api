/**
 *
 */
module.exports = (rates, shortWMAs, longWMAs) => {
  dataPoints = [];
  for (i=0; i<rates.length; i++) {
    const dataPoint = {
      date: rates[i].date,
      rate: rates[i].exchange_rate,
      shortWMA: shortWMAs[i].weightedMovingAverage,
      longWMA: longWMAs[i].weightedMovingAverage
    };

    dataPoints.push(dataPoint);
  }

  return dataPoints;
}
