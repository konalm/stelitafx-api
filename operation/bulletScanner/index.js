require('module-alias/register');
const getCandles = require('./service/getCandles');
const constructWaves = require('./service/constructWaves');

const ABBREV = 'EURUSD';
const GRAN = 'H1';
const SINCEDATE = '2019-01-01T00:00:00.000Z';
const ENDDATE = '2019-02-01T00:00:00.000Z';

(async () => {
  const candles = await getCandles(GRAN, ABBREV, SINCEDATE, ENDDATE)
  
  const waves = constructWaves(candles)

  console.log('data points ---->')
  console.log(waves.map((x) => ({
    start: x.start, 
    end: x.end,
    direction: x.direction,
    candles: x.candles.length
  })))
})();