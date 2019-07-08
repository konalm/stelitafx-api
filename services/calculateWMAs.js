const currencyRatesService = require('../currencyRates/service');


/********
  calculate current and previous weight moving averages
**********/

module.exports = (currencyRates, movingAverageLength, historical) => {
  let wmaDataPoints = [];
  for (let i=0;  i<historical+1; i++) {
    const startIndex = i;
    const endIndex = startIndex + movingAverageLength;
    const wmaCurrencyRates = currencyRates.slice(startIndex, endIndex);
    const wma = currencyRatesService.calcWeightedMovingAverage(wmaCurrencyRates);

    const WMADataPoint = {
      date: currencyRates[startIndex].date,
      rate: currencyRates[startIndex].exchange_rate,
      weightedMovingAverage: wma
    }

    wmaDataPoints.push(WMADataPoint);
  }

  return wmaDataPoints;
}
