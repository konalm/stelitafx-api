/**
 *
 */
module.exports = (rates, shortWMAs, longWMAs) => {
  console.log(rates[0].date)
  console.log(shortWMAs[0].date)
  console.log(longWMAs[0].date)


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
