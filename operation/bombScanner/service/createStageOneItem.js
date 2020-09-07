module.exports = (impulseWave, retraceWave) => {
  let highPoint,
    lowPoint = null;
  const lastImpulseCandle = impulseWave.candles[impulseWave.candles.length - 1];
  const lastRetraceCandle = retraceWave.candles[retraceWave.candles.length - 1];

  const log = impulseWave.date.start === "2019-10-15T14:00:00.000Z";

  if (impulseWave.trend === "up") {
    highPoint = lastImpulseCandle.high;
    lowPoint = lastRetraceCandle.low;
  } else {
    highPoint = lastImpulseCandle.low;
    lowPoint = lastRetraceCandle.high;
  }

  const firstImpulseCandle = impulseWave.candles[0];

  if (log) {
    console.log(`CREATE STAGE ONE ITEM`);
    console.log();
    console.log("first impulse candle -->");
    console.log(firstImpulseCandle);
    console.log(`impulse wave type ---> ${impulseWave.type}`);
    console.log();
  }

  return {
    impulseWave,
    retraceWave,
    highPoint,
    lowPoint,
    startPoint:
      impulseWave.trend === "up"
        ? firstImpulseCandle.low
        : firstImpulseCandle.high,
    processing: true,
    trend: impulseWave.trend,
  };
};
