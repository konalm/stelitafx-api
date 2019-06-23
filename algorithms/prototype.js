const config = require('../config');
const tradeRepo = require('../trade/repository.js');
const currencyRatesRepo = require('../currencyRates/repository');
const calculateWMAs = require('../services/calculateWMAs');

const shortWMALength = 12;
const longWMALength = 26;
const majorCurrencies = config.MAJOR_CURRENCIES;
const quoteCurrency = config.QUOTE_CURRENCY;

module.exports = () => {
  console.log('prototype #1 !!!');

  majorCurrencies.forEach((currency) => {
    const currencyPairAbbrev = `${currency}/${quoteCurrency}`;
    prototype(currencyPairAbbrev)
      .catch(err => {
        throw new Error('Prototype failed for currency ' + err)
      })
  });
}

/**
 *
 */
const prototype = async (abbrev) => {
  console.log(`prototype observing >>> ${abbrev}`)

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
    tradeRepo.insertBuyTrade(abbrev, shortWMADataPoint.exchange_rate, 1);
    return;
  } else {
    console.log(`${abbrev} --> short WMA not moved above`);
  }

  /* short WMA has moved below long WMA */
  if (shortWMA < longWMA && prevShortWMA > prevLongWMA) {
    tradeRepo.insertSellTrade(abbrev, longWMADataPoint.exchange_rate, 1);
  } else {
    console.log(`${abbrev} -->long WMA not moved below`);
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
