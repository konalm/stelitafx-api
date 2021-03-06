const _ = require("lodash");
const stageProceededPoint = require("./stageProceededPoint");

/**
 * Loop stage one bombs & verify PA has exceeded the low point & not exceeded PA
 * of the impulse wave. For Bomb to progress to stage two
 **/
module.exports = (stageOne, candles) => {
  // console.log("STAGE TWO SCAN");
  // console.log();

  const stageTwo = [];

  stageOne.forEach((stageOneItem) => {
    const log =
      stageOneItem.impulseWave.date.start === "2019-10-15T14:00:00.000Z";
    // const log = false;

    if (log) {
      console.log("STAGE ONE ITEM !!");
      console.log(stageOneItem.impulseWave.candles);
      console.log();
    }

    // console.log('stage one item START -->')
    // console.log(stageOneItem.impulseWave.date.start)

    // console.log(`retrace start .. ${stageOneItem.retraceWave.candles[0].date}`)
    // console.log(`retrace end .. ${stageOneItem.retraceWave.candles[stageOneItem.retraceWave.candles.length - 1].date}`)

    const relevantCandles = candles.filter(
      (x) => new Date(x.date) > new Date(stageOneItem.retraceWave.date.end)
    );

    // const log = stageOneItem.impulseWave.date.start === '2019-08-01T13:00:00.000Z'
    // const log = false

    const secondaryPeriodCandles = [];

    for (const [i, candle] of relevantCandles.entries()) {
      /* If PA exceeded high point. Bomb is no longer valid */
      if (stageProceededPoint.highPoint(stageOneItem, candle)) {
        if (log) {
          console.log("PA exceeded high point !!");
          console.log(candle);
          console.log(`high point .. ${stageOneItem.highPoint}`);
          console.log();
        }
        break;
      }

      /* If PA exceeded start of impluse. Bomb no longer valid */
      if (stageProceededPoint.startOfImpulse(stageOneItem, candle, log)) {
        if (log) {
          console.log("PA exceeded start of impulse !!");
          console.log(`trend`);
          console.log(candle);
          console.log();
          console.log(`IMPULSE CANDLES --->`);
          console.log(stageOneItem.impulseWave.candles);
          console.log();
          console.log(`start point -->  ${stageOneItem.startPoint}`);
          console.log();
        }
        break;
      }

      /* Want collection of candles between retrace and exceeding low point */
      secondaryPeriodCandles.push(candle);

      /* Stage two valid if candle exceeds low point without breaching impulse PA */
      if (stageProceededPoint.lowPoint(stageOneItem, candle)) {
        if (log) console.log("PA exceeded low point !!");

        const secondHighPointCandle = getHighestCandle(
          stageOneItem.impulseWave.trend,
          secondaryPeriodCandles
        );

        const continuationWave = getContinuationWave(
          secondaryPeriodCandles,
          secondHighPointCandle.date
        );

        const secondRetraceWave = getSecondRetraceWave(
          secondaryPeriodCandles,
          secondHighPointCandle.date
        );

        stageTwo.push({
          ...stageOneItem,
          exceededLow: candle,
          secondHighPoint:
            stageOneItem.impulseWave.trend === "up"
              ? secondHighPointCandle.high
              : secondHighPointCandle.low,
          continuationWave,
          secondRetraceWave,
        });
        break;
      }
    }
  });

  return stageTwo;
};

/**
 *
 */
const getHighestCandle = (trend, candles) =>
  trend === "up"
    ? candles.reduce((a, b) => (a.high > b.high ? a : b), 0)
    : candles.reduce((a, b) => (a.low < b.low ? a : b), 0);

/***
 *
 */
const getContinuationWave = (candles, highPointDate) => {
  const waveCandles = candles.filter(
    (x) => new Date(x.date) <= new Date(highPointDate)
  );

  return {
    date: {
      start: waveCandles[0].date,
      end: waveCandles[waveCandles.length - 1].date,
    },
    candles: waveCandles,
  };
};

/**
 *
 */
const getSecondRetraceWave = (candles, highPointDate) => {
  const waveCandles = candles.filter(
    (x) => new Date(x.date) >= new Date(highPointDate)
  );

  return {
    date: {
      start: waveCandles[0].date,
      end: waveCandles[waveCandles.length - 1].date,
    },
    candles: waveCandles,
  };
};
