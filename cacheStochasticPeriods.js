require('module-alias/register')


const sinceDate = '2019-12-04T00:00:00.000Z';
const interval = 5;
const abbrev= 'GBP/USD';


(async () => {
  /* Get currency rates from the DB */
  let currencyRates;
  try {
    currencyRates = await getCurrencyRatesSinceDate(interval, abbrev, sinceDate);
  } catch (e) {
    return res.status(500).send('Failed to get currency rates');
  }

  let stochastics
  currencyRates.forEach((x) => {
    // TODO .. calculate stochastic for each rate 



  })




})