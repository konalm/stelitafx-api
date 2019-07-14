const config = require('../config');
const tradeRepo = require('../trade/repository.js');
const currencyRatesRepo = require('../currencyRates/repository');
const calculateWMAs = require('../services/calculateWMAs');
const oandaService = require('../services/oanda');


const shortWMALength = 12;
const longWMALength = 26;
const majorCurrencies = config.MAJOR_CURRENCIES;
const quoteCurrency = config.QUOTE_CURRENCY;

module.exports = () => {
  majorCurrencies.forEach((currency) => {
    prototype(currency)
      .catch(err => {
        throw new Error('Prototype failed for currency ' + err)
      })
  });
}

/**
 *
 */
const prototype = async (currency) => {
  const abbrev = `${currency}/${quoteCurrency}`;
  console.log(`prototype for >>> ${abbrev}`)

  let shortWMADataPoints;
  try {
    shortWMADataPoints = await getShortWMADataPoints(abbrev);
  } catch (err) {
    throw new Error('getting short WMA data points');
  }

  let longWMADataPoints;
  try {
    longWMADataPoints = await getLongWMADataPoints(abbrev);
  } catch (err) {
    throw new Error('getting long WMA data points');
  }

  const shortWMADataPoint = shortWMADataPoints[shortWMADataPoints.length - 1];
  const longWMADataPoint = longWMADataPoints[longWMADataPoints.length - 1];

  const shortWMA = shortWMADataPoint.weightedMovingAverage;
  let prevShortWMA = shortWMADataPoints[shortWMADataPoints.length - 2].weightedMovingAverage;
  const longWMA = longWMADataPoint.weightedMovingAverage;
  let prevLongWMA = longWMADataPoints[longWMADataPoints.length - 2].weightedMovingAverage;

  if (prevShortWMA === shortWMA) prevShortWMA = getLastWMADiffer(shortWMA, shortWMADataPoints);
  if (prevLongWMA === longWMA) prevLongWMA = getLastWMADiffer(longWMA, longWMADataPoints);


  /* short WMA has moved above long WMA */
  if (shortWMA > longWMA && prevShortWMA < prevLongWMA) {
    console.log('>> BUY TRADE <<')
    tradeRepo.insertBuyTrade(abbrev, shortWMADataPoint.rate, 1);
    oandaService.placeBuyOrder(currency);
    return;
  }

  /* short WMA has moved below long WMA */
  if (shortWMA < longWMA && prevShortWMA > prevLongWMA) {
    console.log('>> SELL TRADE <<')
    tradeRepo.insertSellTrade(abbrev, longWMADataPoint.rate, 1);
    oandaService.placeSellOrder(currency);
  }
}


/**
 * get the last WMA that was not the same as the current WMA
 */
const getLastWMADiffer = (WMA, WMADataPoints) => {
  let i = WMADataPoints.length - 3;

  let prevWMA;
  while (WMA === prevWMA) {
    prevWMA = WMADataPoints[i].weightedMovingAverage;
    i --;
  };

  return prevWMA;
}


/**
 *
 */
const getWMADataPoints = (WMALength, abbrev) => async (abbrev) => {
  const historical = 5;

  let currencyRates = [];
  try {
    currencyRates = await currencyRatesRepo.GetCurrencyLatestRates(
                            abbrev,
                            WMALength,
                            historical,
                          );
  } catch (err) {
    throw new Error('Getting WMA Data points');
  }

  return wmaDataPoints = calculateWMAs(currencyRates, WMALength, historical);
}
const getShortWMADataPoints = getWMADataPoints(12);
const getLongWMADataPoints = getWMADataPoints(26);
