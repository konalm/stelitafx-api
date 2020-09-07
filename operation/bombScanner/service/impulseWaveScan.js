const firstWave = require("./firstWave");
const measureWaveHeight = require("./measureWaveHeight");
const getCurrentTrend = require("./getCurrentTrend");
const getCandleDir = require("../../service/getCandleDir");

const MIN_HEIGHT = 25;

module.exports = (candles, abbrev) => {
  const waves = [];

  candles.forEach((candle, i) => {
    if (i === 0) {
      waves.push(firstWave(candle));
      return;
    }

    const wave = waves[waves.length - 1];
    const trend = getCurrentTrend(candle, candles[i - 1]);

    const log = candle.date === "2019-10-15T16:00:00.000Z";

    /* trend terminated */
    if (trend && trend !== wave.trend) {
      if (log) {
        console.log("TREND TERMINATED");
        console.log(wave);
        console.log();
      }

      /* remove all candles post impulse high */
      wave.candles.splice(
        getHighestCandleIndex(wave.candles, wave.trend) + 1,
        wave.candles.length
      );

      wave.date.end = wave.candles[wave.candles.length - 1].date;
      wave.height = measureWaveHeight(wave.trend, wave.candles, abbrev);

      /* wave height include new high or low if broken by candle before trend change */
      const priorCandle = candles[i - 1];
      if (
        (trend === "down" && candle.low < priorCandle.low) ||
        (trend === "up" && candle.high > priorCandle.high)
      ) {
        wave.height = measureWaveHeight(wave.trend, wave.candles, abbrev);
      } else {
        wave.height = measureWaveHeight(
          wave.trend,
          [...wave.candles, candle],
          abbrev
        );
      }

      /* start new wave */
      const priorCandleDir = getCandleDir(priorCandle);
      const trendStartDate =
        priorCandleDir === trend ? priorCandle.date : candle.date;
      const trendIniCandles =
        priorCandleDir === trend ? [priorCandle, candle] : [candle];
      waves.push({
        trend,
        date: { start: trendStartDate },
        candles: trendIniCandles,
      });
    } else {
      /* trend continued */
      wave.candles.push(candle);
    }
  });

  return waves.filter((x) => x.height >= MIN_HEIGHT);
};

const getHighestCandleIndex = (candles, trend) => {
  if (trend === "up") {
    const highestHigh = candles.reduce((a, b) => (a.high > b.high ? a : b), 0)
      .high;
    return candles.findIndex((x) => x.high === highestHigh);
  } else {
    const lowestLow = candles.reduce((a, b) => (a.low < b.low ? a : b), 0).low;
    return candles.findIndex((x) => x.low === lowestLow);
  }
};
