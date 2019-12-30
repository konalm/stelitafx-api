/**
 * Calculate the weighted moving average of a currency rate
 */
exports.calcWeightedMovingAverage = (currencyRates) => {
  const movingAverage = currencyRates.length;
  const weightFactor = calcWeightFactor(movingAverage);

  let weightedRates = [];
  let weightIndex = movingAverage;
  currencyRates.forEach((rate) => {
    const weightedRate = calcRateByWeight(rate.exchange_rate, weightIndex, weightFactor);
    weightedRates.push(weightedRate);
    weightIndex--;
  });

  /* sum of all weighted rates */
  return weightedRates.reduce((x, y) => x + y, 0)
}

/**
 * Calculate weight strength and multiple it by the rate
 */
const calcRateByWeight = (rate, weightIndex, weightFactor) => {
  const weightPower = weightIndex / weightFactor;

  return rate * weightPower;
}

/**
 * Sum up moving average number and all numbers less to calculate the weight
 * factor for the moving average
 */
const calcWeightFactor = (movingAverage) => {
  let weightFactor = 0;
  for (let i=movingAverage; i > 0; i--) {
    weightFactor += i;
  }

  return weightFactor;
}