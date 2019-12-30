const axios = require('axios')

const token = '6055be6e312a7e1c1b81bea7112be439-654862adcd6dfa22e70cb90b4ce9ab78'
const authHeader = `Bearer ${token}`
const url = 'https://api-fxtrade.oanda.com/v3/'

const headers = {Authorization: authHeader}


const httpRequest = (method, path, payload = null) =>  (path, payload = null) => 
  new Promise((resolve) => 
{
  const request = {
    method,
    headers,
    url: url + path,
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