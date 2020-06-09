require('module-alias/register');
const fs = require('fs');

const getCandlesSinceDate = require('@/candle/service/getCandlesSinceDate');
const fetchCachedCandles = require('@/operation/service/fetchCachedCandles.js');
const getPerformance = require('../service/getPerformance');
const { daysBetweenDates } = require('@/services/utils');
const symbolToAbbrev = require('@/services/symbolToAbbrev');
const getHeikenAshiCandles = require('@/candle/service/heikenAshiCandles.js');
const { bullCandle, bearCandle } = require('@/simulateTradeHistory/service/conditions');

const gran = 'M5'
const symbol = 'GBPUSD'
const abbrev = symbolToAbbrev(symbol)
const sinceDate = '2020-01-01T00:00:00.000Z';

const algos = [
  {
    open: (p, c) => bullCandle(c),
    close: (p, c) => bearCandle(c),
    algo: 'heikenAshi'
  }
];

(async () => {
  const candles = await fetchCachedCandles(gran, symbol, sinceDate)
  const heikenAshiCandles = getHeikenAshiCandles(candles)
  const daysOfPeriods = daysBetweenDates(heikenAshiCandles[0].date)(new Date())

  algos.forEach((algo) => {
    const performance = getPerformance(heikenAshiCandles)(algo)(null)(null)
      (daysOfPeriods)
      (symbol)
      ()
    performance.algo = algo.algo

    console.log('performance -->')
    console.log(performance)
  })
})();