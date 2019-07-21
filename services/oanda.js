const axios = require('axios');
const env = require('../env.js');
const apiSecret = env.OANDA_API_SECRET;
const apiUrl = 'https://api-fxpractice.oanda.com/v3'
const demoAccountUrl = `${apiUrl}/accounts/101-004-11651761-001`

/**
 *
 */
const placeOrder = (units, currency) => (currency) => {
  console.log('place order');
  console.log(units)

  const options = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiSecret}`
    }
  };
  const instrument = `${currency}_USD`;
  const payload = {
    order: {
      units,
      instrument,
      timeInForce: "FOK",
      type: "MARKET",
      positionFill: "DEFAULT"
    }
  }
  const payloadJSON = JSON.stringify(payload);

  axios.post(`${demoAccountUrl}/orders`, payload, options)
    .then((res) => {
      // console.log('>>>>> Placed order to OANDA <<<<<<<');
    })
    .catch(err => {
      // console.log('>>>>>> ERROR placing order to OANDA <<<<<<<');
      // console.log(err)
    });
}

exports.placeBuyOrder = placeOrder(100);
exports.placeSellOrder = placeOrder(-100);
