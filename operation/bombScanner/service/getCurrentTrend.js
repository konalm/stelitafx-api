module.exports = (candle, priorCandle) => {
  // const log = candle.date === "2019-05-05T22:00:00.000Z";
  const log = false;

  if (candle.date === "2019-05-05T22:00:00.000Z") {
    console.log("Observing 05:22");
    console.log(candle);

    console.log("prior candle --->");
    console.log(priorCandle);

    //   if (candle.low < priorCandle.low) {
    //     console.log('Lower Low')
    //   }

    //   console.log(candle.high)
    //   console.log(priorCandle.high)
  }

  if (candle.high > priorCandle.high && candle.low >= priorCandle.low) {
    if (log) console.log("UP");
    return "up";
  }
  if (candle.low < priorCandle.low && candle.high <= priorCandle.high) {
    if (log) console.log("DOWN");
    return "down";
  }

  /* broke high and low */
  if (candle.high > priorCandle.high && candle.low < priorCandle.low) {
    if (log) console.log("brake high and low");

    const highBrakeHeight = candle.high - priorCandle.high;
    const lowBrakeHeight = priorCandle.low - candle.low;

    if (highBrakeHeight >= lowBrakeHeight) return "up";
    else return "down";
  }
};
