const paRetracing = require("./PARetracing");
const paInCandleRange = require("./isPAInCandleRange");
const firstRetracePAInCandleRange = require("./firstRetracePAInCandleRange");
const measureWaveHeight = require("./measureWaveHeight");
const createStageOneItem = require("./createStageOneItem");

/**
 * Loop impulse waves to find ones with a valid retrace to pass as stage one setup
 **/

module.exports = (impulseWaves, candles, abbrev) => {
  // console.log(`STAGE ONE SCAN`);
  // console.log();

  const stageOne = [];

  impulseWaves.forEach((impulseWave) => {
    const log = impulseWave.date.start === "2019-10-15T14:00:00.000Z";
    // const log = false;

    if (log) {
      console.log(`observe impulse wave for stage one scan`);
      console.log(`impulse wave height .. ${impulseWave.height}`);
      console.log();
    }

    /* Abstract the retrace of the impulse wave */
    const relevantCandles = candles.filter(
      (x) => new Date(x.date) > new Date(impulseWave.date.end)
    );

    const retraceCandles = [];
    for (const [i, candle] of relevantCandles.entries()) {
      if (log) console.log(`retrace candle .. ${candle.date}`);

      /* First candle can not breach in same direction as trend */
      if (i === 0) {
        if (
          !firstRetracePAInCandleRange(
            candle,
            impulseWave.candles,
            impulseWave.trend
          )
        ) {
          break;
        }
      } else {
        /* If candle breaches impulse PA. No longer valid. */
        if (!paInCandleRange(candle, impulseWave.candles)) {
          if (log) console.log(`candle breached impulse PA`);
          break;
        }
      }

      /* First candle after impulse is always a retrace */
      if (i === 0) {
        retraceCandles.push(candle);
        continue;
      }

      /* Stopped retracing without exceeding impulse PA? valid stage one setup */
      if (
        !paRetracing(candle, relevantCandles[i - 1], impulseWave.trend, log)
      ) {
        if (log) {
          console.log("PA STOPPED RETRACING");
        }

        const retraceWave = createRetraceWave(
          impulseWave.trend,
          retraceCandles,
          impulseWave.candles[impulseWave.candles.length - 1],
          abbrev,
          log
        );

        if (log) {
          console.log("CREATED STAGE ONE ITEM");
          console.log(impulseWave.date.start);
          console.log();

          console.log("Impulse wave --->");
          console.log(impulseWave);

          console.log("retrace wave --->");
          console.log(retraceWave);
          console.log();
          console.log();
        }

        stageOne.push(createStageOneItem(impulseWave, retraceWave));

        break;
      }

      if (log) {
        console.log(`CANDLE DID RETRACE .. ${candle.date}`);
        console.log();
      }

      retraceCandles.push(candle);
    }
  });

  return stageOne;
};

const createRetraceWave = (
  impulseWaveTrend,
  candles,
  impulseWaveLastCandle,
  abbrev,
  log = false
) => {
  const trend = impulseWaveTrend === "up" ? "down" : "up";

  if (log) {
    console.log(`create retrace wave`);
    console.log(`trend .. ${trend}`);
    console.log(`height .. ${measureWaveHeight(trend, candles, abbrev)}`);
  }

  return {
    trend,
    date: {
      start: candles[0].date,
      end: candles[candles.length - 1].date,
    },
    candles: [impulseWaveLastCandle, ...candles],
    height: measureWaveHeight(trend, candles, abbrev),
  };
};
