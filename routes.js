const currencyRatesRepo = require('./currencyRates/repository');
const getWMA = require('./services/getWMA');
const groupWMADataPoints = require('./services/groupWMADataPoints');
const calculateWMAs = require('./services/calculateWMAs');


module.exports = (app) => {
  /**
   *
   */
  app.get('/currency/:currency/wma-data-points/:count', async (req, res) => {
    console.log('WMA data points !!');

    const currency = req.params.currency;
    const currencyPairAbbrev = `${currency}/USD`;
    const count = parseInt(req.params.count);

    console.log('count >>')
    console.log(count)

    /* get rates */
    let currencyRates;
    try {
      currencyRates = await currencyRatesRepo.GetCurrencyLatestRates(
                             currencyPairAbbrev,
                             count,
                             0
                           );
    } catch (err) {
      return res.status(500).send(`Error getting currency rates >> ${err}`);
    }

    historicalWMACount = count - 1;

    let shortWMADataPoints;
    try {
      shortWMADataPoints = await getWMA(currencyPairAbbrev, 12, historicalWMACount);
    } catch (err) {
      console.log('catch short WMA')
      console.log(err)
      return res.status(500).send(err);
    }

    console.log('short wma length >>>> '  + shortWMADataPoints.length);

    let longWMADataPoints;
    try {
      longWMADataPoints = await getWMA(currencyPairAbbrev, 36, historicalWMACount);
    } catch (err) {
      return res.status(500).send(err);
    }

    const dataPoints = groupWMADataPoints(currencyRates, shortWMADataPoints, longWMADataPoints);

    return res.send(dataPoints);

    /* group */
  })

  /**
   *
   */
  app.get('/currency/:currency/weighted_moving_average/:movingAverageLength',
    async (req, res) =>
  {
    const currency = req.params.currency;
    const currencyPairAbbrev = `${currency}/USD`
    const movingAverageLength = parseInt(req.params.movingAverageLength, 10);
    const historical = parseInt(req.query.historical, 10) || 0;

    let currencyRates;
    try {
      currencyRates = await currencyRatesRepo.GetCurrencyLatestRates(
                             currencyPairAbbrev,
                             movingAverageLength,
                             historical
                           );
    } catch (err) {
      return res.status(500).send(err);
    }

    let wmaDataPoints = calculateWMAs(currencyRates, movingAverageLength, historical);

    return res.send({
      abbrev: currencyPairAbbrev,
      baseCurrency: currency,
      weightWMADataPoints: wmaDataPoints
    });
  });


}
