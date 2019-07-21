const config = require('../config');
const tradeRepo = require('../trade/repository.js');
const currencyRatesRepo = require('../currencyRates/repository');
const calculateWMAs = require('../services/calculateWMAs');
const oandaService = require('../services/oanda');
const wmaRepo = require('../wma/repository')

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
  let wmaDataPoints;
  try {
    wmaDataPoints = await wmaRepo.getWMAs(abbrev, 2)
  } catch (err) {
    throw new Error('could not get WMAs:' + err);
  }

  const WMA = wmaDataPoints[0];
  const prevWMA  = wmaDataPoints[1];

  /* short WMA has moved above long WMA */
  if (WMA.shortWMA >= WMA.longWMA && prevWMA.shortWMA < prevWMA.longWMA) {
    tradeRepo.insertBuyTrade(abbrev, WMA.rate, 1);
    oandaService.placeBuyOrder(currency);
    return;
  }

  /* short WMA has moved below long WMA */
  if (WMA.shortWMA <= WMA.longWMA && prevWMA.shortWMA > prevWMA.longWMA) {
    tradeRepo.insertSellTrade(abbrev, WMA.rate, 1);
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
