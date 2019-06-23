const currencyRatesService = require('../currencyRates/service');


/********
  calculate current and previous weight moving averages
**********/

module.exports = (currencyRates, movingAverageLength, historical) => {
  let wmaDataPoints = [];
  for (let i=0;  i< historical+1; i++) {
    const startIndex = currencyRates.length - movingAverageLength - i;
    const endIndex = currencyRates.length - 1 - i;
    const wmaCurrencyRates = currencyRates.slice(startIndex, endIndex);
    const wma = currencyRatesService.calcWeightedMovingAverage(currencyRates);
    const WMADataPoint = {
      date: currencyRates[endIndex].date,
      rate: currencyRates[endIndex].exchange_rate,
      weightedMovingAverage: wma
    }
    wmaDataPoints.push(WMADataPoint);
  }

  return wmaDataPoints;
}
