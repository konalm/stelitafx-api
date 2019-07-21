const config = require('../config');
const wmaRepo = require('../wma/repository')
const tradeRepo = require('../trade/repository');
const currencyRateRepo = require('../currencyRates/repository');
const calculatePip = require('../services/calculatePip');

const majorCurrencies = config.MAJOR_CURRENCIES;
const quoteCurrency = config.QUOTE_CURRENCY;

module.exports = () => {
  console.log('prototype #2');

  majorCurrencies.forEach((currency) => {
    prototype(currency)
      .catch(err => {
        throw new Error('Prototype#2 failed for currency ' + err)
      })
  })
}


/**
 *
 */
const prototype = async (currency) => {
  console.log('prototype #2')
  const abbrev = `${currency}/${quoteCurrency}`;
  let wmaDataPoints;
  try {
    wmaDataPoints = await wmaRepo.getWMAs(abbrev, 2);
  } catch (err) {
    throw new Error('could not get WMAs:' + err);
  }

  const WMA = wmaDataPoints[0];
  const prevWMA = wmaDataPoints[1];

  /* Open when short WMA has moved above long WMA */
  if (WMA.shortWMA >= WMA.longWMA && prevWMA.shortWMA < prevWMA.longWMA) {
    console.log('Prototype#2 >> Open Trade for ' + currency);

    try {
      await tradeRepo.insertBuyTrade(abbrev, WMA.rate, 2);
    } catch (err) {
      throw new Error('Could not insert buy trade');
    }
  }

  closeTrade(abbrev, currency);
}


/**
 *
 */
const closeTrade = async (currencyPairAbbrev, currencyAbbrev) => {
  let lastTrade;
  try {
    lastTrade = await tradeRepo.getLastTrade(2, currencyPairAbbrev);
  } catch (err) {
    throw new Error('error getting last trade: ' + err);
  }

  /* only proceed on open trades (can only close open trades) */
  if (!lastTrade || lastTrade.transaction === 'sell') return;

  const openTradeRate = lastTrade.rate;

  let currentRate;
  try {
    currencyRate = await currencyRateRepo.getCurrencyRate(currencyPairAbbrev);
  } catch(err) {
    throw new Error('Could not get currency rate: ' + err);
  }
  currencyRate = currencyRate.rate;

  pip = calculatePip(openTradeRate, currencyRate);

  /* if pip moves 1 or more than close trade */
  if (pip <= -1 || pip >= 1) {
    console.log('Prototype#2 >> close trade for >> ' + currencyAbbrev);
    try {
      await tradeRepo.insertSellTrade(currencyPairAbbrev, currencyRate, 2)
    } catch (err) {
      throw new Error('Could not insert sell trade: ' + err);
    }
  }
}
