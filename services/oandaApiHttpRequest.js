const axios = require('axios')
const env = require('../env.js');
const apiSecret = env.OANDA_API_SECRET;
const demoAccountUrl = 'accounts/101-004-11651761-001'
const apiDemoUrl = `https://api-fxpractice.oanda.com/v3/${demoAccountUrl}/`
const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${apiSecret}`
}


const httpRequest = (method, path, payload = null) => (path, payload = null) =>
  new Promise((resolve) => 
{
  const request = {
    method,
    headers,
    url: apiDemoUrl + path,
    data: payload
  }

  axios(request)
    .then(res => {
      resolve(res.data)
    })
    .catch(err => {
      console.error(err)
    })
})

exports.get = httpRequest('get')
exports.update = httpRequest('put')